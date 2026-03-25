'use client';

import { useState, useEffect } from 'react';
import { Folder, Plus, Edit2, Trash2, Save } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface Category {
  id: number;
  nome: string;
  prefixo: string;
  cor: string;
  icone: string;
  descricao: string | null;
}

const AVAILABLE_ICONS = [
  'Folder', 'Box', 'Cpu', 'Zap', 'Star', 'Heart', 'Shield', 'Tool',
  'Code', 'Package', 'ShoppingBag', 'Tag', 'Bookmark', 'Gem', 
  'Gift', 'Database', 'Wrench', 'Lightbulb', 'Music', 'Camera',
  'PenTool', 'Monitor', 'Smartphone', 'Watch', 'Mouse', 'Keyboard',
  'Printer', 'Ghost', 'Rocket', 'Swords', 'Crown', 'Trophy', 'Coffee'
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ nome: '', prefixo: '', cor: '#00BCFF', icone: 'Folder', descricao: '' });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (category?: Category) => {
    if (category) {
      setEditingId(category.id);
      setFormData({
        nome: category.nome,
        prefixo: category.prefixo,
        cor: category.cor || '#00BCFF',
        icone: category.icone || 'Folder',
        descricao: category.descricao || ''
      });
    } else {
      setEditingId(null);
      setFormData({ nome: '', prefixo: '', cor: '#00BCFF', icone: 'Folder', descricao: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const url = editingId ? `/api/admin/categories/${editingId}` : '/api/admin/categories';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      closeModal();
      loadCategories();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;
    setIsDeletingId(id);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      loadCategories();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsDeletingId(null);
    }
  };

  const IconComponent = (iconName: string) => {
    // Basic dynamic icon rendering for Lucide
    const name = iconName.charAt(0).toUpperCase() + iconName.slice(1);
    const Icon = (LucideIcons as any)[name] || LucideIcons.Folder;
    return <Icon size={24} />;
  };

  return (
    <div className="section active">
      <div className="section-header">
        <h1><Folder /> Categorias</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={16} /> Nova Categoria
        </button>
      </div>

      {loading ? (
        <div className="p-4 text-[var(--text-muted)]">Carregando...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.85rem' }}>
          {categories.map(cat => (
            <div key={cat.id} className="card" style={{ borderLeft: `4px solid ${cat.cor}`, position: 'relative', marginBottom: 0, padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{ padding: '0.7rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', color: cat.cor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {IconComponent(cat.icone)}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, marginBottom: '0.2rem', fontSize: '1rem', fontWeight: 700 }}>{cat.nome}</h3>
                    <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', background: 'var(--bg-sidebar)', borderRadius: '4px', border: '1px solid var(--border)' }}>
                      SKU: {cat.prefixo}
                    </span>
                  </div>
                </div>
                <div className="action-btns" style={{ display: 'flex', gap: '0.35rem' }}>
                  <button className="btn btn-secondary" style={{ padding: '0.35rem' }} onClick={() => openModal(cat)} disabled={isDeletingId === cat.id}>
                    <Edit2 size={13} />
                  </button>
                  <button className="btn btn-danger-ghost" style={{ padding: '0.35rem' }} onClick={() => handleDelete(cat.id)} disabled={isDeletingId === cat.id}>
                    {isDeletingId === cat.id ? <span style={{fontSize:'10px'}}>...</span> : <Trash2 size={13} />}
                  </button>
                </div>
              </div>
              {cat.descricao && <p style={{ marginTop: '0.85rem', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{cat.descricao}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Modal Genérico */}
      {isModalOpen && (
        <div className="modal-overlay" style={{ display: 'flex' }}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editingId ? 'Editar Categoria' : 'Nova Categoria'}</h3>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Nome da Categoria</label>
                  <input type="text" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Prefixo SKU (Ex: PLA)</label>
                    <input type="text" value={formData.prefixo} onChange={e => setFormData({...formData, prefixo: e.target.value})} maxLength={4} required style={{ textTransform: 'uppercase' }} />
                  </div>
                  <div className="form-group">
                    <label>Cor de Identificação</label>
                    <input type="color" value={formData.cor} onChange={e => setFormData({...formData, cor: e.target.value})} style={{ height: '38px', padding: '0.2rem' }} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Ícone da Categoria</label>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem', maxHeight: '160px', overflowY: 'auto', padding: '0.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    {AVAILABLE_ICONS.map(iconName => {
                      const Icon = (LucideIcons as any)[iconName] || LucideIcons.Folder;
                      const isSelected = formData.icone.toLowerCase() === iconName.toLowerCase();
                      return (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => setFormData({...formData, icone: iconName})}
                          style={{
                            padding: '0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            border: `2px solid ${isSelected ? formData.cor || 'var(--primary)' : 'transparent'}`,
                            background: isSelected ? 'var(--bg-input)' : 'transparent',
                            color: isSelected ? formData.cor || 'var(--primary)' : 'var(--text-muted)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                          }}
                          title={iconName}
                        >
                          <Icon size={20} />
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="form-group" style={{ marginTop: '0.85rem' }}>
                  <label>Descrição (opcional)</label>
                  <textarea 
                    value={formData.descricao || ''} 
                    onChange={e => setFormData({...formData, descricao: e.target.value})} 
                    placeholder="Detalhes sobre os tipos de produtos desta categoria..."
                    rows={2}
                  />
                </div>
                <div className="form-actions" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={isSaving}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" disabled={isSaving}>
                    <Save size={16} /> {isSaving ? 'Salvando...' : 'Salvar Categoria'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
