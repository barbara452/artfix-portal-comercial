'use client'
import { useState, useEffect } from 'react'
import { Plus, Trash2, Save, Edit2, CheckCircle, Circle, AlertCircle, Clock } from 'lucide-react'

interface AcaoItem {
  id: string
  titulo: string
  responsavel: string
  prazo: string
  prioridade: 'Alta' | 'Média' | 'Baixa'
  status: 'Pendente' | 'Em Andamento' | 'Concluído' | 'Atrasado'
  descricao: string
}

const PRIORITY_COLORS = {
  'Alta': 'bg-red-100 text-red-800 border-red-200',
  'Média': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Baixa': 'bg-green-100 text-green-800 border-green-200',
}

const STATUS_ICONS = {
  'Concluído': CheckCircle,
  'Em Andamento': Clock,
  'Atrasado': AlertCircle,
  'Pendente': Circle,
}

const STATUS_COLORS = {
  'Concluído': 'text-green-600',
  'Em Andamento': 'text-blue-600',
  'Atrasado': 'text-red-600',
  'Pendente': 'text-gray-400',
}

const STORAGE_KEY = 'artfix-plano-acao'

const DEFAULT_ITEMS: AcaoItem[] = [
  { id: '1', titulo: 'Qualificar leads da base atual', responsavel: 'Time Comercial', prazo: '2026-06-30', prioridade: 'Alta', status: 'Em Andamento', descricao: 'Revisar e qualificar todos os leads da base de dados importada' },
  { id: '2', titulo: 'Reunião de alinhamento semanal', responsavel: 'Gestão', prazo: '2026-06-07', prioridade: 'Média', status: 'Pendente', descricao: 'Alinhar metas e resultados com o time de vendas' },
  { id: '3', titulo: 'Atualizar proposta comercial', responsavel: 'Diretoria', prazo: '2026-06-15', prioridade: 'Alta', status: 'Pendente', descricao: 'Revisar tabela de preços e condições comerciais para 2026' },
]

export default function PlanoAcao() {
  const [items, setItems] = useState<AcaoItem[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newItem, setNewItem] = useState<Omit<AcaoItem, 'id'>>({
    titulo: '', responsavel: '', prazo: '', prioridade: 'Média', status: 'Pendente', descricao: ''
  })

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try { setItems(JSON.parse(stored)) } catch { setItems(DEFAULT_ITEMS) }
    } else {
      setItems(DEFAULT_ITEMS)
    }
  }, [])

  const save = (newItems: AcaoItem[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems))
    setItems(newItems)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const addItem = () => {
    if (!newItem.titulo.trim()) return
    const item: AcaoItem = { ...newItem, id: Date.now().toString() }
    save([...items, item])
    setNewItem({ titulo: '', responsavel: '', prazo: '', prioridade: 'Média', status: 'Pendente', descricao: '' })
    setShowForm(false)
  }

  const updateItem = (id: string, changes: Partial<AcaoItem>) => {
    save(items.map(i => i.id === id ? { ...i, ...changes } : i))
    setEditingId(null)
  }

  const deleteItem = (id: string) => {
    if (confirm('Remover esta ação?')) save(items.filter(i => i.id !== id))
  }

  const statusOrder = ['Em Andamento', 'Atrasado', 'Pendente', 'Concluído']
  const sorted = [...items].sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status))
  const stats = { total: items.length, done: items.filter(i => i.status === 'Concluído').length, inProgress: items.filter(i => i.status === 'Em Andamento').length, late: items.filter(i => i.status === 'Atrasado').length }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-semibold text-gray-400 tracking-wider uppercase">Plano de Ação</h2>
          <p className="text-xs text-gray-400 mt-0.5">Editável diretamente no sistema · salvo automaticamente</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-xs text-green-600 flex items-center gap-1"><Save size={12} /> Salvo!</span>}
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-green-600 text-white text-xs px-3 py-2 rounded-lg hover:bg-green-700 transition-colors">
            <Plus size={14} /> Nova Ação
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'border-gray-300', text: 'text-gray-700' },
          { label: 'Em Andamento', value: stats.inProgress, color: 'border-blue-400', text: 'text-blue-700' },
          { label: 'Concluídas', value: stats.done, color: 'border-green-400', text: 'text-green-700' },
          { label: 'Atrasadas', value: stats.late, color: 'border-red-400', text: 'text-red-700' },
        ].map((s, i) => (
          <div key={i} className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${s.color}`}>
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Progress */}
      {stats.total > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-600">Progresso Geral</span>
            <span className="text-xs font-semibold text-gray-700">{Math.round((stats.done / stats.total) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${(stats.done / stats.total) * 100}%` }} />
          </div>
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-blue-800 mb-4">Nova Ação</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs text-gray-600 mb-1">Título *</label>
              <input value={newItem.titulo} onChange={e => setNewItem({...newItem, titulo: e.target.value})} placeholder="Descreva a ação..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Responsável</label>
              <input value={newItem.responsavel} onChange={e => setNewItem({...newItem, responsavel: e.target.value})} placeholder="Nome ou equipe" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Prazo</label>
              <input type="date" value={newItem.prazo} onChange={e => setNewItem({...newItem, prazo: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Prioridade</label>
              <select value={newItem.prioridade} onChange={e => setNewItem({...newItem, prioridade: e.target.value as AcaoItem['prioridade']})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
                <option>Alta</option><option>Média</option><option>Baixa</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Status</label>
              <select value={newItem.status} onChange={e => setNewItem({...newItem, status: e.target.value as AcaoItem['status']})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
                <option>Pendente</option><option>Em Andamento</option><option>Concluído</option><option>Atrasado</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-600 mb-1">Descrição</label>
              <textarea value={newItem.descricao} onChange={e => setNewItem({...newItem, descricao: e.target.value})} placeholder="Detalhes adicionais..." rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={addItem} className="bg-green-600 text-white text-xs px-4 py-2 rounded-lg hover:bg-green-700">Adicionar</button>
            <button onClick={() => setShowForm(false)} className="bg-gray-200 text-gray-700 text-xs px-4 py-2 rounded-lg hover:bg-gray-300">Cancelar</button>
          </div>
        </div>
      )}

      {/* Items list */}
      <div className="space-y-3">
        {sorted.map(item => {
          const StatusIcon = STATUS_ICONS[item.status]
          const isEditing = editingId === item.id
          return (
            <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              {isEditing ? (
                <EditForm item={item} onSave={(changes) => updateItem(item.id, changes)} onCancel={() => setEditingId(null)} />
              ) : (
                <div className="flex items-start gap-3">
                  <button onClick={() => updateItem(item.id, { status: item.status === 'Concluído' ? 'Pendente' : 'Concluído' })} className="mt-0.5 flex-shrink-0">
                    <StatusIcon size={18} className={STATUS_COLORS[item.status]} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-medium ${item.status === 'Concluído' ? 'line-through text-gray-400' : 'text-gray-800'}`}>{item.titulo}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${PRIORITY_COLORS[item.prioridade]}`}>{item.prioridade}</span>
                    </div>
                    {item.descricao && <p className="text-xs text-gray-500 mt-1">{item.descricao}</p>}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      {item.responsavel && <span>👤 {item.responsavel}</span>}
                      {item.prazo && <span>📅 {new Date(item.prazo + 'T00:00:00').toLocaleDateString('pt-BR')}</span>}
                      <span className={`${STATUS_COLORS[item.status]} font-medium`}>{item.status}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => setEditingId(item.id)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => deleteItem(item.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
        {items.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <CheckCircle size={48} className="mx-auto mb-3 opacity-30" />
            <p>Nenhuma ação cadastrada. Clique em <strong>Nova Ação</strong> para começar.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function EditForm({ item, onSave, onCancel }: { item: AcaoItem; onSave: (changes: Partial<AcaoItem>) => void; onCancel: () => void }) {
  const [form, setForm] = useState({ ...item })
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="col-span-2">
        <input value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} className="w-full border border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 font-medium" />
      </div>
      <input value={form.responsavel} onChange={e => setForm({...form, responsavel: e.target.value})} placeholder="Responsável" className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
      <input type="date" value={form.prazo} onChange={e => setForm({...form, prazo: e.target.value})} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
      <select value={form.prioridade} onChange={e => setForm({...form, prioridade: e.target.value as AcaoItem['prioridade']})} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
        <option>Alta</option><option>Média</option><option>Baixa</option>
      </select>
      <select value={form.status} onChange={e => setForm({...form, status: e.target.value as AcaoItem['status']})} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
        <option>Pendente</option><option>Em Andamento</option><option>Concluído</option><option>Atrasado</option>
      </select>
      <div className="col-span-2">
        <textarea value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none" />
      </div>
      <div className="col-span-2 flex gap-2">
        <button onClick={() => onSave(form)} className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-700">Salvar</button>
        <button onClick={onCancel} className="bg-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded-lg hover:bg-gray-300">Cancelar</button>
      </div>
    </div>
  )
}
