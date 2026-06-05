'use client'
import { DataRow } from './PortalComercial'
import { UploadCloud, TrendingUp, DollarSign, Users } from 'lucide-react'

interface Props {
  data: DataRow[]
  headers: string[]
}

const formatCurrency = (val: number) => {
  if (val >= 1000000) return `R$${(val/1000000).toFixed(1)}M`
  if (val >= 1000) return `R$${(val/1000).toFixed(0)}K`
  return `R$${val.toFixed(0)}`
}

const STATUS_COLORS: Record<string, string> = {
  'proposta': 'bg-blue-100 text-blue-800',
  'negociação': 'bg-yellow-100 text-yellow-800',
  'negociacao': 'bg-yellow-100 text-yellow-800',
  'aprovado': 'bg-green-100 text-green-800',
  'aprovada': 'bg-green-100 text-green-800',
  'ganho': 'bg-green-100 text-green-800',
  'perdido': 'bg-red-100 text-red-800',
  'perdida': 'bg-red-100 text-red-800',
  'qualificação': 'bg-purple-100 text-purple-800',
  'qualificacao': 'bg-purple-100 text-purple-800',
  'apresentação': 'bg-orange-100 text-orange-800',
  'apresentacao': 'bg-orange-100 text-orange-800',
}

function getStatusColor(status: string): string {
  const lower = status.toLowerCase()
  for (const [key, cls] of Object.entries(STATUS_COLORS)) {
    if (lower.includes(key)) return cls
  }
  return 'bg-gray-100 text-gray-800'
}

export default function PipelineNegociacao({ data, headers }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <UploadCloud size={64} className="text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-500 mb-2">Nenhuma base carregada</h2>
        <p className="text-gray-400 text-sm">Importe uma base de dados para visualizar o pipeline de negociações.</p>
      </div>
    )
  }

  const statusCol = headers.find(h => h.toLowerCase().includes('status') || h.toLowerCase().includes('etapa') || h.toLowerCase().includes('fase'))
  const valueCol = headers.find(h => h.toLowerCase().includes('valor') || h.toLowerCase().includes('receita'))
  const clienteCol = headers.find(h => h.toLowerCase().includes('cliente') || h.toLowerCase().includes('empresa') || h.toLowerCase().includes('razao'))
  const consultorCol = headers.find(h => h.toLowerCase().includes('consultor') || h.toLowerCase().includes('vendedor'))
  const dataCol = headers.find(h => h.toLowerCase().includes('data') || h.toLowerCase().includes('criacao'))

  // Filter pipeline - NOT closed (won or lost)
  const pipelineData = data.filter(r => {
    if (!statusCol) return true
    const s = String(r[statusCol] || '').toLowerCase()
    return !s.includes('ganho') && !s.includes('perdido') && !s.includes('perdida') && !s.includes('fatura') && !s.includes('conclu')
  })

  // Group by status
  const byStatus: Record<string, DataRow[]> = {}
  if (statusCol) {
    pipelineData.forEach(r => {
      const s = String(r[statusCol] || 'Sem Status')
      if (!byStatus[s]) byStatus[s] = []
      byStatus[s].push(r)
    })
  } else {
    byStatus['Todos'] = pipelineData
  }

  const totalPipeline = valueCol ? pipelineData.reduce((sum, r) => sum + (typeof r[valueCol] === 'number' ? r[valueCol] as number : 0), 0) : 0
  const stagesCount = Object.keys(byStatus).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-gray-400 tracking-wider uppercase">Pipeline em Negociação</h2>
        <span className="text-xs text-gray-400">{pipelineData.length} oportunidades ativas</span>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-teal-500">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-teal-500" />
            <span className="text-xs text-gray-500">Oportunidades Ativas</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{pipelineData.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-600">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={16} className="text-blue-600" />
            <span className="text-xs text-gray-500">Valor Total Pipeline</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{valueCol ? formatCurrency(totalPipeline) : 'N/A'}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-purple-600">
          <div className="flex items-center gap-2 mb-1">
            <Users size={16} className="text-purple-600" />
            <span className="text-xs text-gray-500">Etapas no Funil</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{stagesCount}</p>
        </div>
      </div>

      {/* Kanban-style pipeline */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4" style={{ minWidth: `${Math.max(stagesCount * 280, 800)}px` }}>
          {Object.entries(byStatus).sort(([,a],[,b]) => b.length - a.length).map(([stage, rows]) => {
            const stageValue = valueCol ? rows.reduce((sum, r) => sum + (typeof r[valueCol] === 'number' ? r[valueCol] as number : 0), 0) : 0
            return (
              <div key={stage} className="flex-1 min-w-[260px]">
                <div className="bg-gray-100 rounded-t-lg px-3 py-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700 truncate">{stage}</span>
                  <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full ml-2">{rows.length}</span>
                </div>
                {valueCol && stageValue > 0 && (
                  <div className="bg-gray-50 px-3 py-1 text-xs text-gray-500 border-b border-gray-200">
                    {formatCurrency(stageValue)}
                  </div>
                )}
                <div className="bg-gray-50 rounded-b-lg p-2 space-y-2 max-h-[500px] overflow-y-auto">
                  {rows.slice(0, 20).map((row, i) => (
                    <div key={i} className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      {clienteCol && <p className="text-sm font-medium text-gray-800 truncate">{String(row[clienteCol] || 'Cliente N/A')}</p>}
                      {valueCol && typeof row[valueCol] === 'number' && row[valueCol] !== 0 && (
                        <p className="text-sm font-bold text-teal-600 mt-1">{formatCurrency(row[valueCol] as number)}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        {consultorCol && <span className="text-xs text-gray-400 truncate max-w-[120px]">{String(row[consultorCol] || '').split(' ')[0]}</span>}
                        {dataCol && <span className="text-xs text-gray-400">{String(row[dataCol] || '').substring(0, 10)}</span>}
                      </div>
                      {statusCol && (
                        <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${getStatusColor(String(row[statusCol] || ''))}`}>
                          {String(row[statusCol] || '')}
                        </span>
                      )}
                    </div>
                  ))}
                  {rows.length > 20 && (
                    <p className="text-xs text-center text-gray-400 py-2">+{rows.length - 20} mais</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Table view */}
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Lista do Pipeline ({pipelineData.length} oportunidades)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50">
                {headers.slice(0, 7).map(h => (
                  <th key={h} className="px-3 py-2 text-left text-gray-600 font-medium border-b">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pipelineData.slice(0, 50).map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 border-b border-gray-100">
                  {headers.slice(0, 7).map(h => (
                    <td key={h} className="px-3 py-2 text-gray-700">
                      {statusCol && h === statusCol ? (
                        <span className={`px-2 py-0.5 rounded-full ${getStatusColor(String(row[h] || ''))}`}>
                          {String(row[h] || '')}
                        </span>
                      ) : (
                        typeof row[h] === 'number' ? (h.toLowerCase().includes('valor') ? formatCurrency(row[h] as number) : (row[h] as number).toLocaleString('pt-BR')) : String(row[h] || '')
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {pipelineData.length > 50 && <p className="text-xs text-center text-gray-400 py-3">Mostrando 50 de {pipelineData.length} registros</p>}
        </div>
      </div>
    </div>
  )
}
