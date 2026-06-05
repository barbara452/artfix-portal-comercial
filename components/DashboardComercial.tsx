'use client'
import { DataRow } from './PortalComercial'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { UploadCloud } from 'lucide-react'

interface Props {
  data: DataRow[]
  headers: string[]
}

const formatCurrency = (val: number) => {
  if (val >= 1000000) return `R$${(val/1000000).toFixed(1)}M`
  if (val >= 1000) return `R$${(val/1000).toFixed(0)}K`
  return `R$${val.toFixed(0)}`
}

const formatNumber = (val: number) => {
  if (val >= 1000) return val.toLocaleString('pt-BR')
  return val.toString()
}

const COLORS = ['#1a3a5c', '#0d9488', '#16a34a', '#ca8a04', '#7c3aed', '#dc2626', '#ea580c', '#0284c7']

export default function DashboardComercial({ data, headers }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <UploadCloud size={64} className="text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-500 mb-2">Nenhuma base carregada</h2>
        <p className="text-gray-400 text-sm max-w-md">
          Clique em <strong>Importar Base</strong> no canto superior direito para fazer o upload de um arquivo CSV com seus dados comerciais.
        </p>
        <div className="mt-6 bg-blue-50 rounded-xl p-4 text-sm text-blue-700 max-w-md">
          <p className="font-semibold mb-1">Formato esperado do CSV:</p>
          <p className="font-mono text-xs">Data;Cliente;Valor;Status;Consultor;Origem</p>
        </div>
      </div>
    )
  }

  // Calculate stats from data
  const numericCols = headers.filter(h => data.some(r => typeof r[h] === 'number' && r[h] !== 0))
  const stringCols = headers.filter(h => data.some(r => typeof r[h] === 'string' && r[h] !== ''))

  // Find value column
  const valueCol = numericCols.find(h => h.toLowerCase().includes('valor') || h.toLowerCase().includes('receita') || h.toLowerCase().includes('venda')) || numericCols[0]
  const statusCol = stringCols.find(h => h.toLowerCase().includes('status') || h.toLowerCase().includes('situacao') || h.toLowerCase().includes('etapa'))
  const consultorCol = stringCols.find(h => h.toLowerCase().includes('consultor') || h.toLowerCase().includes('vendedor') || h.toLowerCase().includes('responsavel'))
  const dataCol = headers.find(h => h.toLowerCase().includes('data') || h.toLowerCase().includes('mes') || h.toLowerCase().includes('periodo'))

  const totalEntradas = data.length
  const totalReceita = valueCol ? data.reduce((sum, r) => sum + (typeof r[valueCol] === 'number' ? r[valueCol] as number : 0), 0) : 0
  const ticketMedio = totalEntradas > 0 && totalReceita > 0 ? totalReceita / totalEntradas : 0

  // Status breakdown
  const statusCounts: Record<string, { count: number; value: number }> = {}
  if (statusCol) {
    data.forEach(r => {
      const s = String(r[statusCol] || 'Sem Status')
      if (!statusCounts[s]) statusCounts[s] = { count: 0, value: 0 }
      statusCounts[s].count++
      if (valueCol) statusCounts[s].value += typeof r[valueCol] === 'number' ? r[valueCol] as number : 0
    })
  }
  const statusData = Object.entries(statusCounts).map(([name, d]) => ({ name, count: d.count, value: d.value })).sort((a,b) => b.count - a.count).slice(0, 8)
  
  // Vendidos (fechados)
  const vendidosEntry = Object.entries(statusCounts).find(([k]) => k.toLowerCase().includes('vend') || k.toLowerCase().includes('fech') || k.toLowerCase().includes('ganho') || k.toLowerCase().includes('aprovad'))
  const totalVendidos = vendidosEntry ? vendidosEntry[1].count : 0
  const receitaFaturada = vendidosEntry ? vendidosEntry[1].value : totalReceita
  const taxaConversao = totalEntradas > 0 && totalVendidos > 0 ? ((totalVendidos / totalEntradas) * 100) : 0

  // Consultor breakdown
  const consultorData: Record<string, number> = {}
  if (consultorCol) {
    data.forEach(r => {
      const c = String(r[consultorCol] || 'N/A')
      consultorData[c] = (consultorData[c] || 0) + 1
    })
  }
  const consultorChartData = Object.entries(consultorData).map(([name, count]) => ({ name: name.split(' ')[0], count })).sort((a,b) => b.count - a.count).slice(0, 8)

  // Time series if date column exists
  let timeData: {name: string; valor: number; count: number}[] = []
  if (dataCol) {
    const byPeriod: Record<string, {valor: number; count: number}> = {}
    data.forEach(r => {
      const d = String(r[dataCol] || '')
      const key = d.length >= 7 ? d.substring(0, 7) : d.substring(0, 4)
      if (key && key.length > 2) {
        if (!byPeriod[key]) byPeriod[key] = { valor: 0, count: 0 }
        byPeriod[key].count++
        if (valueCol) byPeriod[key].valor += typeof r[valueCol] === 'number' ? r[valueCol] as number : 0
      }
    })
    timeData = Object.entries(byPeriod).sort(([a],[b]) => a.localeCompare(b)).slice(-12).map(([name, d]) => ({ name, ...d }))
  }

  const cards = [
    { label: 'Entradas no Funil', value: formatNumber(totalEntradas), sub: 'Total de oportunidades', color: 'border-blue-900', bg: 'bg-blue-900' },
    { label: 'Receita Total', value: formatCurrency(receitaFaturada), sub: totalVendidos > 0 ? `${totalVendidos} fechamentos` : 'em negociações', color: 'border-teal-600', bg: 'bg-teal-600' },
    { label: 'Taxa de Conversão', value: taxaConversao > 0 ? `${taxaConversao.toFixed(1)}%` : 'N/A', sub: totalVendidos > 0 ? `${totalVendidos} vendidos` : 'sem dados de venda', color: 'border-purple-700', bg: 'bg-purple-700' },
    { label: 'Ticket Médio', value: ticketMedio > 0 ? formatCurrency(ticketMedio) : 'N/A', sub: 'Média por oportunidade', color: 'border-yellow-600', bg: 'bg-yellow-600' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-gray-400 tracking-wider uppercase">Resultado Consolidado</h2>
        <span className="text-xs text-gray-400">{totalEntradas.toLocaleString('pt-BR')} registros importados</span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <div key={i} className={`bg-white rounded-xl p-5 shadow-sm border-l-4 ${card.color}`}>
            <p className="text-sm text-gray-500 mb-1">{card.label}</p>
            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Chart */}
        {statusData.length > 0 && (
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Distribuição por Status</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={statusData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={90} />
                <Tooltip formatter={(v: number) => [v, 'Qtd']} />
                <Bar dataKey="count" radius={[0,4,4,0]}>
                  {statusData.map((_,i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Consultor Chart */}
        {consultorChartData.length > 0 && (
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Oportunidades por Consultor</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={consultorChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [v, 'Qtd']} />
                <Bar dataKey="count" fill="#0d9488" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Time series */}
        {timeData.length > 1 && valueCol && (
          <div className="bg-white rounded-xl p-5 shadow-sm lg:col-span-2">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Evolução Temporal · {valueCol}</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={timeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => formatCurrency(v)} />
                <Tooltip formatter={(v: number) => [formatCurrency(v), valueCol]} />
                <Line type="monotone" dataKey="valor" stroke="#1a3a5c" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Pie by status value */}
        {statusData.length > 0 && valueCol && statusData.some(s => s.value > 0) && (
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Valor por Status</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={statusData.filter(s => s.value > 0)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({name, percent}) => `${name.substring(0,8)} ${(percent*100).toFixed(0)}%`}>
                  {statusData.map((_,i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Data table preview */}
        <div className="bg-white rounded-xl p-5 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Prévia dos Dados ({Math.min(10, data.length)} de {data.length.toLocaleString('pt-BR')} registros)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50">
                  {headers.slice(0, 8).map(h => (
                    <th key={h} className="px-3 py-2 text-left text-gray-600 font-medium border-b">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 10).map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 border-b border-gray-100">
                    {headers.slice(0, 8).map(h => (
                      <td key={h} className="px-3 py-2 text-gray-700">
                        {typeof row[h] === 'number' ? (row[h] as number).toLocaleString('pt-BR') : String(row[h] || '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
