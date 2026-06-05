'use client'
import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Save, BookOpen, ArrowRight, Move } from 'lucide-react'

interface Etapa {
  id: string
  nome: string
  descricao: string
  responsavel: string
  tempoEstimado: string
  cor: string
}

interface Fluxo {
  id: string
  nome: string
  descricao: string
  etapas: Etapa[]
  createdAt: string
}

const COLORS = ['#1a3a5c', '#0d9488', '#16a34a', '#ca8a04', '#7c3aed', '#dc2626', '#ea580c', '#0284c7']

const STORAGE_KEY = 'artfix-fluxos-processo'

const DEFAULT_FLUXOS: Fluxo[] = [
  {
    id: '1',
    nome: 'Processo de Vendas',
    descricao: 'Fluxo padrão para conversão de leads em clientes',
    createdAt: new Date().toISOString(),
    etapas: [
      { id: '1a', nome: 'Prospecção', descricao: 'Identificar e contatar potenciais clientes', responsavel: 'SDR', tempoEstimado: '1-2 dias', cor: '#0284c7' },
      { id: '1b', nome: 'Qualificação', descricao: 'Validar necessidade, orçamento e decisão', responsavel: 'Consultor', tempoEstimado: '1 dia', cor: '#7c3aed' },
      { id: '1c', nome: 'Apresentação', descricao: 'Demo ou apresentação da solução', responsavel: 'Consultor', tempoEstimado: '1-3 dias', cor: '#0d9488' },
      { id: '1d', nome: 'Proposta', descricao: 'Envio e negociação da proposta comercial', responsavel: 'Consultor', tempoEstimado: '3-7 dias', cor: '#ca8a04' },
      { id: '1e', nome: 'Fechamento', descricao: 'Assinatura e onboarding do cliente', responsavel: 'Gerente', tempoEstimado: '1-2 dias', cor: '#16a34a' },
    ]
  },
  {
    id: '2',
    nome: 'Onboarding de Clientes',
    descricao: 'Processo de integração de novos clientes',
    createdAt: new Date().toISOString(),
    etapas: [
      { id: '2a', nome: 'Boas-vindas', descricao: 'E-mail e call de boas-vindas', responsavel: 'CS', tempoEstimado: 'Dia 1', cor: '#0d9488' },
      { id: '2b', nome: 'Setup', descricao: 'Configuração inicial da conta', responsavel: 'Técnico', tempoEstimado: 'Dias 2-3', cor: '#1a3a5c' },
      { id: '2c', nome: 'Treinamento', descricao: 'Capacitação do time do cliente', responsavel: 'CS', tempoEstimado: 'Dias 4-7', cor: '#7c3aed' },
      { id: '2d', nome: 'Go-live', descricao: 'Ativação e acompanhamento', responsavel: 'CS', tempoEstimado: 'Dia 8', cor: '#16a34a' },
    ]
  }
]

export default function FluxosProcesso() {
  const [fluxos, setFluxos] = useState<Fluxo[]>([])
  const [selectedFluxo, setSelectedFluxo] = useState<string | null>(null)
  const [editingFluxo, setEditingFluxo] = useState<string | null>(null)
  const [editingEtapa, setEditingEtapa] = useState<string | null>(null)
  const [showNewFluxo, setShowNewFluxo] = useState(false)
  const [showNewEtapa, setShowNewEtapa] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newFluxo, setNewFluxo] = useState({ nome: '', descricao: '' })
  const [newEtapa, setNewEtapa] = useState({ nome: '', descricao: '', responsavel: '', tempoEstimado: '', cor: '#1a3a5c' })

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setFluxos(parsed)
        if (parsed.length > 0) setSelectedFluxo(parsed[0].id)
      } catch { 
        setFluxos(DEFAULT_FLUXOS)
        setSelectedFluxo(DEFAULT_FLUXOS[0].id)
      }
    } else {
      setFluxos(DEFAULT_FLUXOS)
      setSelectedFluxo(DEFAULT_FLUXOS[0].id)
    }
  }, [])

  const saveFluxos = (newFluxos: Fluxo[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newFluxos))
    setFluxos(newFluxos)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const addFluxo = () => {
    if (!newFluxo.nome.trim()) return
    const fluxo: Fluxo = { id: Date.now().toString(), ...newFluxo, etapas: [], createdAt: new Date().toISOString() }
    const updated = [...fluxos, fluxo]
    saveFluxos(updated)
    setSelectedFluxo(fluxo.id)
    setNewFluxo({ nome: '', descricao: '' })
    setShowNewFluxo(false)
  }

  const deleteFluxo = (id: string) => {
    if (!confirm('Remover este fluxo?')) return
    const updated = fluxos.filter(f => f.id !== id)
    saveFluxos(updated)
    setSelectedFluxo(updated.length > 0 ? updated[0].id : null)
  }

  const addEtapa = (fluxoId: string) => {
    if (!newEtapa.nome.trim()) return
    const etapa: Etapa = { id: Date.now().toString(), ...newEtapa }
    const updated = fluxos.map(f => f.id === fluxoId ? { ...f, etapas: [...f.etapas, etapa] } : f)
    saveFluxos(updated)
    setNewEtapa({ nome: '', descricao: '', responsavel: '', tempoEstimado: '', cor: '#1a3a5c' })
    setShowNewEtapa(false)
  }

  const deleteEtapa = (fluxoId: string, etapaId: string) => {
    const updated = fluxos.map(f => f.id === fluxoId ? { ...f, etapas: f.etapas.filter(e => e.id !== etapaId) } : f)
    saveFluxos(updated)
  }

  const updateEtapa = (fluxoId: string, etapaId: string, changes: Partial<Etapa>) => {
    const updated = fluxos.map(f => f.id === fluxoId ? { ...f, etapas: f.etapas.map(e => e.id === etapaId ? { ...e, ...changes } : e) } : f)
    saveFluxos(updated)
    setEditingEtapa(null)
  }

  const moveEtapa = (fluxoId: string, etapaId: string, direction: 'up' | 'down') => {
    const fluxo = fluxos.find(f => f.id === fluxoId)
    if (!fluxo) return
    const idx = fluxo.etapas.findIndex(e => e.id === etapaId)
    if (direction === 'up' && idx === 0) return
    if (direction === 'down' && idx === fluxo.etapas.length - 1) return
    const newEtapas = [...fluxo.etapas]
    const newIdx = direction === 'up' ? idx - 1 : idx + 1
    ;[newEtapas[idx], newEtapas[newIdx]] = [newEtapas[newIdx], newEtapas[idx]]
    saveFluxos(fluxos.map(f => f.id === fluxoId ? { ...f, etapas: newEtapas } : f))
  }

  const currentFluxo = fluxos.find(f => f.id === selectedFluxo)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-semibold text-gray-400 tracking-wider uppercase">Fluxos de Processo</h2>
          <p className="text-xs text-gray-400 mt-0.5">Crie e edite fluxos diretamente no sistema · salvo automaticamente</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-xs text-green-600 flex items-center gap-1"><Save size={12} /> Salvo!</span>}
          <button onClick={() => setShowNewFluxo(true)} className="flex items-center gap-2 bg-purple-700 text-white text-xs px-3 py-2 rounded-lg hover:bg-purple-800 transition-colors">
            <Plus size={14} /> Novo Fluxo
          </button>
        </div>
      </div>

      {/* New Fluxo form */}
      {showNewFluxo && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-purple-800 mb-3">Novo Fluxo de Processo</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <input value={newFluxo.nome} onChange={e => setNewFluxo({...newFluxo, nome: e.target.value})} placeholder="Nome do fluxo *" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
            </div>
            <div className="col-span-2">
              <input value={newFluxo.descricao} onChange={e => setNewFluxo({...newFluxo, descricao: e.target.value})} placeholder="Descrição do fluxo" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={addFluxo} className="bg-purple-700 text-white text-xs px-4 py-2 rounded-lg hover:bg-purple-800">Criar</button>
            <button onClick={() => setShowNewFluxo(false)} className="bg-gray-200 text-gray-700 text-xs px-4 py-2 rounded-lg hover:bg-gray-300">Cancelar</button>
          </div>
        </div>
      )}

      <div className="flex gap-6">
        {/* Sidebar - list of fluxos */}
        <div className="w-56 flex-shrink-0">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Fluxos ({fluxos.length})</h3>
          <div className="space-y-1">
            {fluxos.map(f => (
              <div key={f.id} className={`flex items-center justify-between group rounded-lg px-3 py-2 cursor-pointer transition-colors ${selectedFluxo === f.id ? 'bg-purple-100 text-purple-800' : 'hover:bg-gray-100 text-gray-700'}`} onClick={() => setSelectedFluxo(f.id)}>
                <div className="flex items-center gap-2 min-w-0">
                  <BookOpen size={14} className="flex-shrink-0" />
                  <span className="text-sm truncate">{f.nome}</span>
                </div>
                <button onClick={(e) => { e.stopPropagation(); deleteFluxo(f.id) }} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 p-0.5">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Main content - etapas */}
        <div className="flex-1">
          {currentFluxo ? (
            <div className="space-y-4">
              {/* Fluxo header */}
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{currentFluxo.nome}</h3>
                    {currentFluxo.descricao && <p className="text-sm text-gray-500 mt-0.5">{currentFluxo.descricao}</p>}
                    <p className="text-xs text-gray-400 mt-1">{currentFluxo.etapas.length} etapas</p>
                  </div>
                  <button onClick={() => setShowNewEtapa(!showNewEtapa)} className="flex items-center gap-2 bg-gray-100 text-gray-700 text-xs px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                    <Plus size={12} /> Adicionar Etapa
                  </button>
                </div>

                {/* New Etapa form */}
                {showNewEtapa && (
                  <div className="mt-4 border-t pt-4 grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <input value={newEtapa.nome} onChange={e => setNewEtapa({...newEtapa, nome: e.target.value})} placeholder="Nome da etapa *" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                    </div>
                    <input value={newEtapa.responsavel} onChange={e => setNewEtapa({...newEtapa, responsavel: e.target.value})} placeholder="Responsável" className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                    <input value={newEtapa.tempoEstimado} onChange={e => setNewEtapa({...newEtapa, tempoEstimado: e.target.value})} placeholder="Tempo estimado" className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                    <div className="col-span-2">
                      <textarea value={newEtapa.descricao} onChange={e => setNewEtapa({...newEtapa, descricao: e.target.value})} placeholder="Descrição da etapa" rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none" />
                    </div>
                    <div className="col-span-2 flex items-center gap-3">
                      <div className="flex gap-1">
                        {COLORS.map(c => (
                          <button key={c} onClick={() => setNewEtapa({...newEtapa, cor: c})} className={`w-5 h-5 rounded-full border-2 ${newEtapa.cor === c ? 'border-gray-600 scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                        ))}
                      </div>
                      <button onClick={() => addEtapa(currentFluxo.id)} className="ml-auto bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-700">Adicionar</button>
                      <button onClick={() => setShowNewEtapa(false)} className="bg-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded-lg hover:bg-gray-300">Cancelar</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Visual flow */}
              {currentFluxo.etapas.length > 0 && (
                <div className="overflow-x-auto pb-2">
                  <div className="flex items-stretch gap-2" style={{ minWidth: `${currentFluxo.etapas.length * 200}px` }}>
                    {currentFluxo.etapas.map((etapa, idx) => (
                      <div key={etapa.id} className="flex items-center gap-2">
                        <div className="flex-1 min-w-[180px] bg-white rounded-xl shadow-sm overflow-hidden" style={{ borderTop: `3px solid ${etapa.cor}` }}>
                          {editingEtapa === etapa.id ? (
                            <div className="p-3 space-y-2">
                              <input defaultValue={etapa.nome} id={`nome-${etapa.id}`} className="w-full border rounded px-2 py-1 text-sm font-semibold" />
                              <input defaultValue={etapa.responsavel} id={`resp-${etapa.id}`} placeholder="Responsável" className="w-full border rounded px-2 py-1 text-xs" />
                              <input defaultValue={etapa.tempoEstimado} id={`tempo-${etapa.id}`} placeholder="Tempo" className="w-full border rounded px-2 py-1 text-xs" />
                              <textarea defaultValue={etapa.descricao} id={`desc-${etapa.id}`} rows={2} className="w-full border rounded px-2 py-1 text-xs resize-none" />
                              <div className="flex gap-1">
                                {COLORS.map(c => (
                                  <button key={c} onClick={() => { const el = document.getElementById(`nome-${etapa.id}`) as HTMLInputElement; updateEtapa(currentFluxo.id, etapa.id, { cor: c, nome: el?.value || etapa.nome, responsavel: (document.getElementById(`resp-${etapa.id}`) as HTMLInputElement)?.value || etapa.responsavel, tempoEstimado: (document.getElementById(`tempo-${etapa.id}`) as HTMLInputElement)?.value || etapa.tempoEstimado, descricao: (document.getElementById(`desc-${etapa.id}`) as HTMLTextAreaElement)?.value || etapa.descricao }); }} className={`w-4 h-4 rounded-full border ${etapa.cor === c ? 'border-gray-600 scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                                ))}
                              </div>
                              <div className="flex gap-1">
                                <button onClick={() => { const nome = (document.getElementById(`nome-${etapa.id}`) as HTMLInputElement)?.value || etapa.nome; const resp = (document.getElementById(`resp-${etapa.id}`) as HTMLInputElement)?.value || etapa.responsavel; const tempo = (document.getElementById(`tempo-${etapa.id}`) as HTMLInputElement)?.value || etapa.tempoEstimado; const desc = (document.getElementById(`desc-${etapa.id}`) as HTMLTextAreaElement)?.value || etapa.descricao; updateEtapa(currentFluxo.id, etapa.id, { nome, responsavel: resp, tempoEstimado: tempo, descricao: desc }); }} className="bg-blue-600 text-white text-xs px-2 py-1 rounded">OK</button>
                                <button onClick={() => setEditingEtapa(null)} className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">×</button>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3">
                              <div className="flex items-start justify-between gap-1">
                                <span className="text-sm font-semibold text-gray-800 leading-tight">{etapa.nome}</span>
                                <div className="flex gap-0.5 flex-shrink-0">
                                  <button onClick={() => moveEtapa(currentFluxo.id, etapa.id, 'up')} className="p-0.5 text-gray-300 hover:text-gray-500" title="Mover esquerda">←</button>
                                  <button onClick={() => moveEtapa(currentFluxo.id, etapa.id, 'down')} className="p-0.5 text-gray-300 hover:text-gray-500" title="Mover direita">→</button>
                                  <button onClick={() => setEditingEtapa(etapa.id)} className="p-0.5 text-gray-300 hover:text-blue-500"><Edit2 size={10} /></button>
                                  <button onClick={() => deleteEtapa(currentFluxo.id, etapa.id)} className="p-0.5 text-gray-300 hover:text-red-500"><Trash2 size={10} /></button>
                                </div>
                              </div>
                              {etapa.descricao && <p className="text-xs text-gray-500 mt-1 leading-tight">{etapa.descricao}</p>}
                              <div className="mt-2 space-y-0.5">
                                {etapa.responsavel && <p className="text-xs text-gray-400">👤 {etapa.responsavel}</p>}
                                {etapa.tempoEstimado && <p className="text-xs text-gray-400">⏱ {etapa.tempoEstimado}</p>}
                              </div>
                              <div className="mt-2 flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: etapa.cor }} />
                                <span className="text-xs text-gray-400">Etapa {idx + 1}</span>
                              </div>
                            </div>
                          )}
                        </div>
                        {idx < currentFluxo.etapas.length - 1 && (
                          <ArrowRight size={16} className="text-gray-300 flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentFluxo.etapas.length === 0 && (
                <div className="bg-white rounded-xl p-12 text-center text-gray-400 shadow-sm">
                  <Move size={32} className="mx-auto mb-3 opacity-30" />
                  <p>Nenhuma etapa criada. Clique em <strong>Adicionar Etapa</strong> para começar.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-12 text-center text-gray-400 shadow-sm">
              <BookOpen size={48} className="mx-auto mb-3 opacity-30" />
              <p>Selecione ou crie um fluxo de processo.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
