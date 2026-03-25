'use client';

import { useState, useEffect } from 'react';
import { Contact, Plus, Edit2, Trash2, Search, User, MapPin, Phone, Instagram, AlertTriangle, TrendingUp, Save } from 'lucide-react';

interface Client {
  id: number;
  nome: string;
  instagram: string;
  whatsapp: string;
  cidade: string;
  email: string;
  observacoes: string;
  purchases: number;
  total_spent: number;
  total_debt: number;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const initialForm = {
    nome: '', instagram: '', whatsapp: '', cidade: '', email: '', observacoes: ''
  };
  const [formData, setFormData] = useState<any>(initialForm);

  useEffect(() => {
    loadClients();
  }, [search]);

  const loadClients = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/clients?search=${search}`);
      const data = await res.json();
      // Sort by total spent, descending (VIP ranking)
      const sorted = data.sort((a: Client, b: Client) => b.total_spent - a.total_spent);
      setClients(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = async (client?: Client) => {
    if (client) {
      setEditingId(client.id);
      setFormData({
        nome: client.nome,
        instagram: client.instagram,
        whatsapp: client.whatsapp,
        cidade: client.cidade,
        email: client.email,
        observacoes: client.observacoes
      });
    } else {
      setEditingId(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const url = editingId ? `/api/admin/clients/${editingId}` : '/api/admin/clients';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error((await res.json()).error);
      
      closeModal();
      loadClients();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Atenção: Apenas clientes SEM vendas cadastradas podem ser excluídos. Excluir?')) return;
    setIsDeletingId(id);
    try {
      const res = await fetch(`/api/admin/clients/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      loadClients();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsDeletingId(null);
    }
  };

  const formatMoney = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  return (
    <div className="section active">
      <div className="section-header">
        <h1><Contact /> Clientes & Ranking VIP</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={16} /> Cadastrar Cliente
        </button>
      </div>

      <div className="page-toolbar">
        <div className="toolbar-search">
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou WhatsApp..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {loading ? (
             <div className="p-4 text-[var(--text-muted)]">Carregando...</div>
        ) : clients.length === 0 ? (
           <div className="p-4 text-[var(--text-muted)] w-full block">Nenhum cliente encontrado.</div>
        ) : clients.map((client, index) => (
          <div key={client.id} className="card" style={{ position: 'relative', marginBottom: 0, padding: '1rem' }}>
            
            {/* VIP Ranking Badge */}
            {index < 3 && !search && (
              <div style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'var(--accent)', color: '#000', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem', boxShadow: '0 4px 10px var(--accent-glow)' }}>
                #{index + 1}
              </div>
            )}
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <User size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text)' }}>{client.nome}</h3>
                <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.3rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {client.cidade && <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><MapPin size={12}/> {client.cidade}</span>}
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              {client.whatsapp && <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={14} style={{ color: 'var(--success)' }}/> {client.whatsapp}</div>}
              {client.instagram && <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Instagram size={14} style={{ color: '#E1306C' }}/> {client.instagram}</div>}
              {client.email && <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>&#9993; {client.email}</div>}
            </div>
            
            {/* Stats calculated dynamically via left join query */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: 'var(--bg-input)', padding: '0.8rem', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>LTV (Compras)</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--success)' }}><TrendingUp size={12}/> {formatMoney(client.total_spent)}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{client.purchases} pedido(s)</span>
              </div>
              
              <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '0.8rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Débitos Pendentes</span>
                 {client.total_debt > 0 ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--danger)' }}><AlertTriangle size={12}/> {formatMoney(client.total_debt)}</span>
                 ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sem pendências</span>
                 )}
              </div>
            </div>

            <div className="action-btns" style={{ marginTop: '1rem' }}>
             <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => openModal(client)} disabled={isDeletingId === client.id}>
               <Edit2 size={14} /> Editar
             </button>
             <button className="btn btn-danger-ghost" style={{ padding: '0.4rem' }} onClick={() => handleDelete(client.id)} disabled={isDeletingId === client.id}>
               {isDeletingId === client.id ? <span style={{fontSize:'10px'}}>...</span> : <Trash2 size={14} />}
             </button>
            </div>
            
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" style={{ display: 'flex' }}>
          <div className="modal" style={{ maxWidth: '600px', width: '95%' }}>
            <div className="modal-header">
              <h3>{editingId ? 'Editar Cliente' : 'Novo Cliente'}</h3>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>
            
            <div className="modal-body">
              <form id="client-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Nome Completo *</label>
                  <input type="text" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} required />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>WhatsApp</label>
                    <input type="text" value={formData.whatsapp || ''} onChange={e => setFormData({...formData, whatsapp: e.target.value})} placeholder="(11) 99999-9999" />
                  </div>
                  <div className="form-group">
                    <label>Instagram / Social</label>
                    <input type="text" value={formData.instagram || ''} onChange={e => setFormData({...formData, instagram: e.target.value})} placeholder="@user" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>E-mail</label>
                    <input type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Cidade / UF / Bairro</label>
                    <input type="text" value={formData.cidade || ''} onChange={e => setFormData({...formData, cidade: e.target.value})} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Observações / Preferências</label>
                  <textarea rows={3} value={formData.observacoes || ''} onChange={e => setFormData({...formData, observacoes: e.target.value})}></textarea>
                </div>

              </form>
            </div>
            
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={isSaving}>Cancelar</button>
              <button type="submit" form="client-form" className="btn btn-primary" disabled={isSaving}>
                <Save size={16} /> {isSaving ? 'Salvando...' : 'Salvar Cliente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
