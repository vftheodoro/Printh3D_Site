'use client';

import { useState, useEffect } from 'react';
import { Receipt, Plus, Edit2, Trash2, Filter } from 'lucide-react';

interface Expense {
  id: number;
  descricao: string;
  categoria: string;
  fornecedor: string;
  tipo_pagamento: string;
  valor_total: number;
  data_gasto: string;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [categoryFilter, setCategoryFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const initialForm = {
    descricao: '', categoria: 'Outros', fornecedor: '', 
    tipo_pagamento: 'PIX', quantidade: 1, valor_unitario: 0, valor_total: 0, 
    observacoes: '', data_gasto: new Date().toISOString().split('T')[0]
  };
  const [formData, setFormData] = useState<any>(initialForm);

  useEffect(() => {
    loadExpenses();
  }, [categoryFilter, monthFilter]);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (categoryFilter) qs.append('category', categoryFilter);
      if (monthFilter) qs.append('month', monthFilter);
      
      const res = await fetch(`/api/admin/expenses?${qs.toString()}`);
      const data = await res.json();
      setExpenses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = async (exp?: Expense) => {
    if (exp) {
      setEditingId(exp.id);
      try {
        const res = await fetch(`/api/admin/expenses`); // In real app, /api/admin/expenses/id
        const all = await res.json();
        const fullExp = all.find((e: any) => e.id === exp.id);
        if (fullExp) {
           setFormData({
            ...fullExp,
            data_gasto: fullExp.data_gasto ? fullExp.data_gasto.split('T')[0] : ''
           });
        }
      } catch (e) {
        setFormData(exp);
      }
    } else {
      setEditingId(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const calculateTotal = (qtd: number, unit: number) => {
    return Number((qtd * unit).toFixed(2));
  };

  const handleUnitChange = (val: number) => {
    setFormData((prev: any) => ({ ...prev, valor_unitario: val, valor_total: calculateTotal(prev.quantidade, val) }));
  };

  const handleQtdChange = (val: number) => {
     setFormData((prev: any) => ({ ...prev, quantidade: val, valor_total: calculateTotal(val, prev.valor_unitario) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/admin/expenses/${editingId}` : '/api/admin/expenses';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error((await res.json()).error);
      
      closeModal();
      loadExpenses();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir este gasto? Ele será movido para a lixeira.')) return;
    try {
      const res = await fetch(`/api/admin/expenses/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error);
      loadExpenses();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const formatMoney = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  const totalGastoMes = expenses.reduce((acc, curr) => acc + Number(curr.valor_total), 0);

  return (
    <div className="section active">
      <div className="section-header">
        <h1><Receipt /> Gestão de Gastos</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={16} /> Registrar Gasto
        </button>
      </div>

      <div className="card" style={{ padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} style={{ color: 'var(--text-muted)' }} />
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ width: 'auto', minWidth: '150px' }}>
              <option value="">Todas as Categorias</option>
              <option value="Materia Prima">Matéria Prima (Filamento/Resina)</option>
              <option value="Embalagens">Embalagens / Envios</option>
              <option value="Manutenção">Manutenção / Peças</option>
              <option value="Marketing">Marketing / Tráfego</option>
              <option value="Infraestrutura">Infraestrutura (Luz, Net)</option>
              <option value="Serviços">Serviços / Ferramentas</option>
              <option value="Outros">Outros</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input 
              type="month" 
              value={monthFilter} 
              onChange={e => setMonthFilter(e.target.value)}
              style={{ padding: '0.4rem 0.8rem', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xs)', color: 'var(--text)' }}
            />
          </div>
        </div>

        <div style={{ background: 'var(--danger-light)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-xs)', border: '1px solid rgba(248, 113, 113, 0.2)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginRight: '10px' }}>Total do Período:</span>
          <strong style={{ color: 'var(--danger)', fontSize: '1.2rem' }}>{formatMoney(totalGastoMes)}</strong>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th className="hide-mobile">Data</th>
              <th>Descrição</th>
              <th className="hide-tablet">Categoria</th>
              <th className="hide-tablet">Fornecedor</th>
              <th className="hide-tablet">Pagamento</th>
              <th>Valor Total</th>
              <th style={{ textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>Carregando...</td></tr>
            ) : expenses.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>Nenhum gasto registrado neste período.</td></tr>
            ) : expenses.map(exp => {
              const date = exp.data_gasto ? new Date(exp.data_gasto).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '';
              return (
                <tr key={exp.id}>
                  <td className="hide-mobile">{date}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <strong style={{ fontSize: '0.85rem' }}>{exp.descricao}</strong>
                        <span className="hide-mobile" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{exp.categoria}</span>
                        <span className="show-mobile-inline" style={{ display: 'none', fontSize: '10px', color: 'var(--text-muted)' }}>{date}</span>
                    </div>
                  </td>
                  <td className="hide-tablet">
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'var(--bg-input)', borderRadius: '4px', color: 'var(--info)' }}>
                      {exp.categoria}
                    </span>
                  </td>
                  <td className="hide-tablet">{exp.fornecedor || '-'}</td>
                  <td className="hide-tablet">{exp.tipo_pagamento}</td>
                  <td style={{ fontWeight: 600, color: 'var(--danger)', fontSize: '0.85rem' }}>{formatMoney(exp.valor_total)}</td>
                  <td style={{ textAlign: 'right' }}>
                      <div className="action-btns">
                      <button className="btn btn-secondary" style={{ padding: '0.35rem' }} onClick={() => openModal(exp)}><Edit2 size={13} /></button>
                      <button className="btn btn-danger-ghost" style={{ padding: '0.35rem' }} onClick={() => handleDelete(exp.id)}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" style={{ display: 'flex' }}>
          <div className="modal" style={{ maxWidth: '600px', width: '95%' }}>
            <div className="modal-header">
              <h3>{editingId ? 'Editar Gasto' : 'Registrar Gasto'}</h3>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>
            
            <div className="modal-body">
              <form id="expense-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Descrição do Gasto *</label>
                  <input type="text" value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} required placeholder="Ex: Bobinas PLA Preto" />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Categoria</label>
                    <select value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})}>
                      <option value="Materia Prima">Matéria Prima (Filamento/Resina)</option>
                      <option value="Embalagens">Embalagens / Envios</option>
                      <option value="Manutenção">Manutenção / Peças</option>
                      <option value="Marketing">Marketing / Tráfego</option>
                      <option value="Infraestrutura">Infraestrutura (Luz, Net)</option>
                      <option value="Serviços">Serviços / Ferramentas</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Data</label>
                    <input type="date" value={formData.data_gasto} onChange={e => setFormData({...formData, data_gasto: e.target.value})} required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Fornecedor</label>
                    <input type="text" value={formData.fornecedor || ''} onChange={e => setFormData({...formData, fornecedor: e.target.value})} placeholder="Nome da Loja/Site" />
                  </div>
                  <div className="form-group">
                    <label>Forma de Pagamento</label>
                    <select value={formData.tipo_pagamento} onChange={e => setFormData({...formData, tipo_pagamento: e.target.value})}>
                      <option value="PIX">PIX</option>
                      <option value="Cartão de Crédito">Cartão de Crédito</option>
                      <option value="Boleto">Boleto</option>
                      <option value="Dinheiro">Dinheiro</option>
                    </select>
                  </div>
                </div>

                <div className="form-row" style={{ alignItems: 'end', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginBottom: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Quantidade</label>
                    <input type="number" min="1" step="any" value={formData.quantidade} onChange={e => handleQtdChange(parseFloat(e.target.value))} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Valor Unitário (R$)</label>
                    <input type="number" step="0.01" value={formData.valor_unitario} onChange={e => handleUnitChange(parseFloat(e.target.value))} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ color: 'var(--danger)' }}>Valor Total</label>
                    <input type="number" step="0.01" value={formData.valor_total} onChange={e => setFormData({...formData, valor_total: parseFloat(e.target.value)})} required style={{ fontWeight: 'bold', borderColor: 'var(--danger-light)' }} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Observações</label>
                  <textarea rows={2} value={formData.observacoes || ''} onChange={e => setFormData({...formData, observacoes: e.target.value})}></textarea>
                </div>

              </form>
            </div>
            
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancelar</button>
              <button type="submit" form="expense-form" className="btn btn-primary">Salvar Gasto</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
