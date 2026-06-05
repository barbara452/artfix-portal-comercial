'use client'
import { useState, useCallback, useRef } from 'react'
import { UploadCloud, BarChart2, GitBranch, CheckSquare, BookOpen, X } from 'lucide-react'
import DashboardComercial from './DashboardComercial'
import PipelineNegociacao from './PipelineNegociacao'
import PlanoAcao from './PlanoAcao'
import FluxosProcesso from './FluxosProcesso'

export type DataRow = Record<string, string | number>

export default function PortalComercial() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [data, setData] = useState<DataRow[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [uploadDate, setUploadDate] = useState<string>('')
  const [isDragging, setIsDragging] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processCSV = (text: string) => {
    const lines = text.split('\n').filter(l => l.trim())
    if (lines.length < 2) { setUploadError('Arquivo CSV inválido'); return }
    const sep = lines[0].includes(';') ? ';' : ','
    const hdrs = lines[0].split(sep).map(h => h.trim().replace(/^"|"$/g, ''))
    const rows: DataRow[] = lines.slice(1).map(line => {
      const vals = line.split(sep).map(v => v.trim().replace(/^"|"$/g, ''))
      const row: DataRow = {}
      hdrs.forEach((h, i) => { row[h] = isNaN(Number(vals[i])) || vals[i] === '' ? vals[i] || '' : Number(vals[i]) })
      return row
    }).filter(r => Object.values(r).some(v => v !== '' && v !== 0))
    setHeaders(hdrs)
    setData(rows)
    setUploadDate(new Date().toLocaleDateString('pt-BR'))
    setUploadError('')
  }

  const handleFile = useCallback((file: File) => {
    setUploadError('')
    if (file.name.endsWith('.csv')) {
      const reader = new FileReader()
      reader.onload = (e) => processCSV(e.target?.result as string)
      reader.readAsText(file, 'UTF-8')
    } else {
      setUploadError('Por favor envie um arquivo .csv')
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const tabs = [
    { id: 'dashboard', label: 'Dashboard Comercial', icon: BarChart2, color: '#1a3a5c' },
    { id: 'pipeline', label: 'Pipeline em Negociação', icon: GitBranch, color: '#0d9488' },
    { id: 'plano', label: 'Plano de Ação', icon: CheckSquare, color: '#16a34a' },
    { id: 'fluxos', label: 'Fluxos de Processo', icon: BookOpen, color: '#7c3aed' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-blue-900">Artfix</span>
          <span className="text-gray-400">|</span>
          <span className="text-gray-600 text-sm">Portal Comercial 2026 · PWR Gestão</span>
        </div>
        <div className="flex items-center gap-3">
          {uploadDate && (
            <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-full border">
              Base: {uploadDate}
            </span>
          )}
          {data.length > 0 && (
            <span className="bg-green-50 text-green-700 text-xs px-3 py-1.5 rounded-full border border-green-200">
              {data.length.toLocaleString('pt-BR')} entradas · 2026
            </span>
          )}
          <label
            className="flex items-center gap-2 bg-blue-900 text-white text-xs px-3 py-1.5 rounded-lg cursor-pointer hover:bg-blue-800 transition-colors"
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <UploadCloud size={14} />
            <span>Importar Base</span>
            <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </label>
        </div>
      </header>
      {uploadError && (
        <div className="mx-6 mt-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm flex items-center justify-between">
          {uploadError}
          <button onClick={() => setUploadError('')}><X size={14} /></button>
        </div>
      )}
      {isDragging && (
        <div className="fixed inset-0 bg-blue-500/20 border-4 border-dashed border-blue-400 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
            <UploadCloud size={48} className="mx-auto text-blue-500 mb-3" />
            <p className="text-xl font-semibold text-blue-700">Solte o arquivo aqui</p>
          </div>
        </div>
      )}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex gap-0">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-medium transition-all border-b-2 ${isActive ? 'border-blue-900 text-blue-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                <Icon size={15} style={{ color: isActive ? tab.color : undefined }} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>
      <main className="p-6">
        {activeTab === 'dashboard' && <DashboardComercial data={data} headers={headers} />}
        {activeTab === 'pipeline' && <PipelineNegociacao data={data} headers={headers} />}
        {activeTab === 'plano' && <PlanoAcao />}
        {activeTab === 'fluxos' && <FluxosProcesso />}
      </main>
    </div>
  )
}
