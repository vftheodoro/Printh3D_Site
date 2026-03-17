'use client';

import { useState, useEffect } from 'react';
import { Package, Plus, Edit2, Trash2, Search, Filter, Image as ImageIcon, CheckCircle, XCircle, Upload, Star } from 'lucide-react';

interface Category {
  id: number;
  nome: string;
  cor: string;
}

interface Product {
  id: number;
  codigo_sku: string;
  nome: string;
  category_id?: number | null;
  descricao?: string;
  peso_g?: number;
  tempo_h?: number;
  tempo_min?: number;
  material?: string;
  cor?: string;
  resolucao_camada?: number | string;
  dimensoes?: { largura?: number; altura?: number; profundidade?: number };
  custo_total?: number;
  margem?: number;
  custos_adicionais?: { material_extra?: number };
  custo_detalhado?: any;
  descricoes_social?: { geral?: string; instagram?: string; facebook?: string; whatsapp?: string; tiktok?: string };
  tags?: string[] | string;
  is_variation?: boolean;
  parent_product_id?: number | null;
  variation_label?: string;
  calculation_mode?: 'basic' | 'detailed';
  estoque_minimo?: number;
  preco_promocional?: number;
  preco_venda: number;
  quantidade_estoque: number;
  ativo: boolean;
  cover_file_id?: number | null;
  product_files?: ProductFile[];
  category?: Category;
}

interface ProductFile {
  id: number;
  nome_arquivo: string;
  tipo: string;
  mime_type: string;
  tamanho_bytes: number;
  storage_path: string;
}

interface SettingsData {
  margem_padrao: number;
  custo_kg: number;
  custo_hora_maquina: number;
  custo_kwh: number;
  consumo_maquina_w: number;
  percentual_falha: number;
  depreciacao_percentual: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [productFiles, setProductFiles] = useState<ProductFile[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);

  const initialForm = {
    nome: '', category_id: '', codigo_sku: '', descricao: '',
    is_variation: false,
    parent_product_id: '',
    variation_label: '',
    peso_g: 0,
    tempo_h: 0,
    tempo_min: 0,
    preco_venda: 0,
    preco_promocional: 0,
    custo_total: 0,
    margem: 0,
    calculation_mode: 'basic',
    custos_adicionais: { material_extra: 0 },
    custo_detalhado: {},
    descricoes_social: { geral: '' },
    dimensoes: { largura: 0, altura: 0, profundidade: 0 },
    quantidade_estoque: 0,
    estoque_minimo: 0,
    ativo: true,
    material: 'PLA',
    cor: '',
    resolucao_camada: '',
    tags: ''
  };
  const [formData, setFormData] = useState<any>(initialForm);

  useEffect(() => {
    loadData();
  }, [search, categoryFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, allProdRes, settingsRes] = await Promise.all([
        fetch(`/api/admin/products?search=${search}&category_id=${categoryFilter}`),
        fetch('/api/admin/categories'),
        fetch('/api/admin/products'),
        fetch('/api/admin/settings')
      ]);
      const prodData = await prodRes.json();
      const catData = await catRes.json();
      const allProdData = await allProdRes.json();
      const settingsData = await settingsRes.json();
      
      setProducts(Array.isArray(prodData) ? prodData : []);
      setCategories(Array.isArray(catData) ? catData : []);
      setAllProducts(Array.isArray(allProdData) ? allProdData : []);
      setSettings(settingsData?.error ? null : settingsData);
      
      if (prodData.error) console.error('Products API Error:', prodData.error);
      if (catData.error) console.error('Categories API Error:', catData.error);
    } catch (err) {
      console.error(err);
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const openModal = async (prod?: Product) => {
    setActiveTab('basic');
    if (prod) {
      setEditingId(prod.id);
      try {
        // Fetch full product details by id to avoid wrong search matches
        const res = await fetch(`/api/admin/products/${prod.id}`);
        const fullProd = await res.json();
        if (fullProd.error) throw new Error(fullProd.error);

          const normalizedTags = Array.isArray(fullProd.tags) ? fullProd.tags.join(', ') : (fullProd.tags || '');
          const socialGeral = fullProd?.descricoes_social?.geral
            || fullProd?.descricoes_social?.instagram
            || fullProd?.descricoes_social?.facebook
            || fullProd?.descricoes_social?.whatsapp
            || fullProd?.descricoes_social?.tiktok
            || '';
          setFormData({
              ...initialForm,
              ...fullProd,
              category_id: fullProd.category_id || '',
              parent_product_id: fullProd.parent_product_id || '',
              dimensoes: fullProd.dimensoes || { largura: 0, altura: 0, profundidade: 0 },
              custos_adicionais: fullProd.custos_adicionais || { material_extra: 0 },
              descricoes_social: { geral: socialGeral },
              calculation_mode: fullProd.calculation_mode === 'detailed' ? 'detailed' : 'basic',
              tags: normalizedTags
        });
        await loadProductFiles(prod.id);
      } catch (e) {
        console.error(e);
      }
    } else {
      setEditingId(null);
      setFormData(initialForm);
      setProductFiles([]);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setProductFiles([]);
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (!formData.is_variation || !formData.parent_product_id) return;

    const parent = allProducts.find(product => product.id === Number(formData.parent_product_id));
    if (!parent) return;

    if (parent.category_id && Number(formData.category_id) !== Number(parent.category_id)) {
      setFormData((prev: any) => ({ ...prev, category_id: parent.category_id }));
    }
  }, [formData.is_variation, formData.parent_product_id, allProducts, formData.category_id]);

  const handleCreateVariationFromCurrent = () => {
    const baseId = editingId ? (Number(formData.parent_product_id) || editingId) : null;
    if (!baseId) return;

    setEditingId(null);
    setActiveTab('basic');
    setProductFiles([]);
    setFormData({
      ...initialForm,
      is_variation: true,
      parent_product_id: baseId,
      category_id: formData.category_id || '',
    });
  };

  const getEffectiveTempoMin = () => {
    const inputTempoMin = Number(formData.tempo_min) || 0;
    const inputTempoH = Number(formData.tempo_h) || 0;
    return inputTempoMin > 0 ? inputTempoMin : Math.round(inputTempoH * 60);
  };

  const calculateCost = () => {
    if (!settings) {
      return {
        custoTotal: Number(formData.custo_total) || 0,
        precoCalculado: Number(formData.preco_venda) || 0,
        margemReal: Number(formData.margem) || 0,
        custoMaterial: 0,
        custoMaquina: 0,
        custoEnergia: 0,
      };
    }

    const peso = Math.max(0, Number(formData.peso_g) || 0);
    const tempoMin = Math.max(0, getEffectiveTempoMin());
    const horasTotais = tempoMin / 60;
    const materialExtra = Math.max(0, Number(formData.custos_adicionais?.material_extra) || 0);

    const pesoComFalha = peso * (1 + ((Number(settings.percentual_falha) || 0) / 100));
    const custoMaterialBase = (pesoComFalha / 1000) * (Number(settings.custo_kg) || 0);
    const custoMaterial = custoMaterialBase + materialExtra;
    const custoEnergia = horasTotais * ((Number(settings.consumo_maquina_w) || 0) / 1000) * (Number(settings.custo_kwh) || 0);
    const custoMaquinaBase = horasTotais * (Number(settings.custo_hora_maquina) || 0);
    const custoDepreciacao = custoMaquinaBase * ((Number(settings.depreciacao_percentual) || 0) / 100);
    const custoMaquina = custoMaquinaBase + custoDepreciacao;

    const custoTotal = Number((custoMaterial + custoEnergia + custoMaquina).toFixed(2));
    const margemPercent = Number(formData.margem) > 0 ? Number(formData.margem) : Number(settings.margem_padrao || 50);
    const precoCalculado = Number((custoTotal * (1 + (margemPercent / 100))).toFixed(2));
    const precoAtual = Number(formData.preco_venda) || 0;
    const margemReal = precoAtual > 0 ? Number((((precoAtual - custoTotal) / precoAtual) * 100).toFixed(1)) : 0;

    return {
      custoTotal,
      precoCalculado,
      margemReal,
      custoMaterial,
      custoMaquina,
      custoEnergia,
    };
  };

  const loadProductFiles = async (productId: number) => {
    const res = await fetch(`/api/admin/files?entity=product&entity_id=${productId}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    setProductFiles(Array.isArray(data) ? data : []);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingId || !event.target.files || event.target.files.length === 0) return;

    setUploadingFile(true);
    try {
      const pendingFiles = Array.from(event.target.files);
      for (const file of pendingFiles) {
        const body = new FormData();
        body.append('entity', 'product');
        body.append('entity_id', String(editingId));
        body.append('file', file);

        const res = await fetch('/api/admin/files', {
          method: 'POST',
          body,
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Erro ao enviar arquivo.');
      }

      await loadProductFiles(editingId);
      await loadData();
      event.target.value = '';
    } catch (error: any) {
      alert(error.message || 'Falha ao enviar arquivo.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    if (!confirm('Remover este arquivo do produto?')) return;

    try {
      const res = await fetch(`/api/admin/files/${fileId}?entity=product`, {
        method: 'DELETE',
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Erro ao remover arquivo.');

      if (editingId) {
        await loadProductFiles(editingId);
        await loadData();
      }
    } catch (error: any) {
      alert(error.message || 'Falha ao remover arquivo.');
    }
  };

  const handleSetCover = async (fileId: number) => {
    if (!editingId) return;

    try {
      const res = await fetch(`/api/admin/products/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cover_file_id: fileId }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Erro ao definir capa.');

      setFormData({ ...formData, cover_file_id: fileId });
      await loadData();
    } catch (error: any) {
      alert(error.message || 'Falha ao definir capa.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/admin/products/${editingId}` : '/api/admin/products';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const payload = { ...formData };
      const calc = calculateCost();
      if (!payload.category_id) payload.category_id = null;
      if (!payload.codigo_sku) payload.codigo_sku = null;
      if (!payload.preco_venda || Number(payload.preco_venda) <= 0) {
        payload.preco_venda = calc.precoCalculado;
      }
      payload.custo_total = calc.custoTotal;
      payload.tempo_min = getEffectiveTempoMin();
      payload.tempo_h = Number((payload.tempo_min / 60).toFixed(2));

      payload.is_variation = !!payload.is_variation;
      payload.parent_product_id = payload.is_variation ? Number(payload.parent_product_id) || null : null;
      payload.variation_label = payload.is_variation ? String(payload.variation_label || '').trim() : '';

      if (payload.is_variation && payload.parent_product_id) {
        const parentProduct = allProducts.find(product => product.id === Number(payload.parent_product_id));
        if (parentProduct?.category_id) {
          payload.category_id = parentProduct.category_id;
        }
      }

      payload.dimensoes = {
        largura: Number(payload.dimensoes?.largura) || 0,
        altura: Number(payload.dimensoes?.altura) || 0,
        profundidade: Number(payload.dimensoes?.profundidade) || 0,
      };

      payload.custos_adicionais = {
        material_extra: Number(payload.custos_adicionais?.material_extra) || 0,
      };

      payload.custo_detalhado = {
        ...(payload.custo_detalhado || {}),
        custoMaterial: calc.custoMaterial,
        custoMaquina: calc.custoMaquina,
        custoEnergia: calc.custoEnergia,
        custoTotal: calc.custoTotal,
        margemReal: calc.margemReal,
      };

      const socialGeral = String(payload.descricoes_social?.geral || '').trim();
      payload.descricoes_social = {
        geral: socialGeral,
        instagram: socialGeral,
        facebook: socialGeral,
        whatsapp: socialGeral,
        tiktok: socialGeral,
      };

      if (typeof payload.tags === 'string') {
        payload.tags = payload.tags
          .split(',')
          .map((tag: string) => tag.trim())
          .filter(Boolean);
      }
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error((await res.json()).error);
      
      closeModal();
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir este produto? Ele será movido para a lixeira.')) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const formatMoney = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  const calcPreview = calculateCost();
  const baseProducts = allProducts.filter(product => !product.is_variation && product.id !== editingId);

  return (
    <div className="section active products-redesign">
      <div className="section-header products-header-row">
        <h1><Package /> Produtos</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={16} /> Novo Produto
        </button>
      </div>

      {/* Toolbar */}
      <div className="card products-toolbar-card">
        <div className="products-search">
          <Search size={16} className="products-search-icon" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou SKU..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="products-search-input"
          />
        </div>
        
        <div className="products-filter">
          <Filter size={16} className="products-filter-icon" />
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value="">Todas as Categorias</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
          </select>
        </div>
      </div>

      <div className="table-container products-table-shell">
        <table>
          <thead>
            <tr>
              <th className="hide-mobile" style={{ width: '40px' }}>ID</th>
              <th style={{ width: '60px' }}>Foto</th>
              <th>Produto</th>
              <th className="hide-tablet">Categoria</th>
              <th className="hide-mobile">Estoque</th>
              <th>Preço</th>
              <th className="hide-tablet">Promo</th>
              <th className="hide-tablet">Status</th>
              <th style={{ width: '80px', textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: '2rem' }}>Carregando...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: '2rem' }}>Nenhum produto encontrado.</td></tr>
            ) : products.map(prod => (
              <tr key={prod.id} style={{ opacity: prod.ativo ? 1 : 0.5 }}>
                <td className="hide-mobile" style={{ color: 'var(--text-muted)' }}>#{prod.id}</td>
                <td>
                  {/* ... (image logic) ... */}
                  {(() => {
                    const ownFiles = prod.product_files ?? [];
                    const thumbFile = ownFiles.length > 0
                      ? (ownFiles.find(f => f.id === prod.cover_file_id) || ownFiles[0])
                      : (prod.is_variation && prod.parent_product_id
                          ? (() => {
                              const parent = allProducts.find(p => p.id === prod.parent_product_id);
                              const pFiles = parent?.product_files ?? [];
                              return pFiles.length > 0 ? (pFiles.find(f => f.id === parent?.cover_file_id) || pFiles[0]) : null;
                            })()
                          : null);
                    return (
                      <div style={{ width: '36px', height: '36px', background: 'var(--bg-input)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', overflow: 'hidden' }}>
                        {thumbFile
                          ? <img src={thumbFile.storage_path} alt={prod.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <ImageIcon size={18} />}
                      </div>
                    );
                  })()}
                </td>
                <td>
                  <strong style={{ display: 'block', fontSize: '0.85rem' }}>
                    {prod.nome}
                    {prod.is_variation && <span className="variation-badge">VAR</span>}
                  </strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{prod.codigo_sku}</span>
                </td>
                <td className="hide-tablet">
                  {prod.category ? (
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'var(--bg-sidebar)', borderRadius: '4px', borderLeft: `2px solid ${prod.category.cor}` }}>
                      {prod.category.nome}
                    </span>
                  ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                </td>
                <td className="hide-mobile">
                  <span style={{ fontWeight: 600, color: prod.quantidade_estoque <= 0 ? 'var(--danger)' : 'var(--text)' }}>
                    {prod.quantidade_estoque}
                  </span>
                </td>
                <td style={{ fontWeight: 600, fontSize: '0.85rem' }}>{formatMoney(prod.preco_venda)}</td>
                <td className="hide-tablet" style={{ fontWeight: 600, color: (prod as any).preco_promocional ? 'var(--success)' : 'var(--text-muted)' }}>
                  {(prod as any).preco_promocional ? formatMoney(Number((prod as any).preco_promocional)) : '—'}
                </td>
                <td className="hide-tablet">
                  {prod.ativo ? 
                    <span className="status-badge badge-success"><CheckCircle size={12}/> Ativo</span> : 
                    <span className="status-badge badge-danger"><XCircle size={12}/> Inativo</span>
                  }
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div className="action-btns">
                    <button className="btn btn-secondary" style={{ padding: '0.4rem' }} onClick={() => openModal(prod)}><Edit2 size={14} /></button>
                    <button className="btn btn-danger-ghost" style={{ padding: '0.4rem' }} onClick={() => handleDelete(prod.id)}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay product-editor-overlay" style={{ display: 'flex' }}>
          <div className="modal modal-wide product-editor-modal">
            <div className="modal-header product-editor-header">
              <h3>{editingId ? 'Editar Produto' : 'Novo Produto'}</h3>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>
            
            <div className="modal-tabs product-editor-tabs">
              <button type="button" className={`modal-tab ${activeTab === 'basic' ? 'active' : ''}`} onClick={() => setActiveTab('basic')}>Básico</button>
              <button type="button" className={`modal-tab ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>Detalhes</button>
              {formData.calculation_mode === 'detailed' && (
                <button type="button" className={`modal-tab ${activeTab === 'advanced' ? 'active' : ''}`} onClick={() => setActiveTab('advanced')}>Cálculo Avançado</button>
              )}
              <button type="button" className={`modal-tab ${activeTab === 'stock' ? 'active' : ''}`} onClick={() => setActiveTab('stock')}>Estoque</button>
              {editingId && <button type="button" className={`modal-tab ${activeTab === 'files' ? 'active' : ''}`} onClick={() => setActiveTab('files')}>Arquivos</button>}
              <button type="button" className={`modal-tab ${activeTab === 'social' ? 'active' : ''}`} onClick={() => setActiveTab('social')}>Redes Sociais</button>
            </div>

            <div className="modal-body product-editor-body">
              <form id="product-form" onSubmit={handleSubmit}>
                
                {activeTab === 'basic' && (
                  <div className="tab-content default-active">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Categoria</label>
                        <select value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} required>
                          <option value="">Selecione...</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Código SKU</label>
                        <input type="text" value={formData.codigo_sku || ''} onChange={e => setFormData({...formData, codigo_sku: e.target.value.toUpperCase()})} placeholder="Auto-gerado se vazio" />
                        <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Auto-gerado ao criar se ficar vazio.</small>
                      </div>
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label>Nome do Produto *</label>
                        <input type="text" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} required />
                      </div>
                      <div className="form-group" style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input type="checkbox" id="prod-is-variation" checked={!!formData.is_variation} onChange={e => setFormData({ ...formData, is_variation: e.target.checked })} style={{ width: 'auto' }} />
                        <label htmlFor="prod-is-variation" style={{ margin: 0 }}>Este item é uma variação de um produto base</label>
                      </div>

                      {formData.is_variation && (
                        <>
                          <div className="form-group">
                            <label>Produto Base</label>
                            <select value={formData.parent_product_id || ''} onChange={e => setFormData({ ...formData, parent_product_id: e.target.value })} required>
                              <option value="">— Selecione o produto base —</option>
                              {baseProducts.map(product => (
                                <option key={product.id} value={product.id}>{product.nome} ({product.codigo_sku || '—'})</option>
                              ))}
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Rótulo da Variação</label>
                            <input type="text" value={formData.variation_label || ''} onChange={e => setFormData({ ...formData, variation_label: e.target.value })} required />
                            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Use um nome curto para diferenciar esta versão do produto base.</small>
                          </div>
                        </>
                      )}

                      <div className="form-group">
                        <label>Peso (g)</label>
                        <input type="number" step="0.1" value={formData.peso_g || 0} onChange={e => setFormData({...formData, peso_g: parseFloat(e.target.value) || 0})} />
                      </div>
                      <div className="form-group">
                        <label>Tempo (min)</label>
                        <input type="number" step="1" value={getEffectiveTempoMin()} onChange={e => setFormData({...formData, tempo_min: parseInt(e.target.value, 10) || 0, tempo_h: 0})} />
                      </div>
                      <div className="form-group">
                        <label>Material Extra (R$)</label>
                        <input type="number" step="0.01" value={formData.custos_adicionais?.material_extra || 0} onChange={e => setFormData({...formData, custos_adicionais: { ...(formData.custos_adicionais || {}), material_extra: parseFloat(e.target.value) || 0 }})} />
                      </div>
                      <div className="form-group">
                        <label>Preço (R$) *</label>
                        <input type="number" step="0.01" value={formData.preco_venda || 0} onChange={e => setFormData({...formData, preco_venda: parseFloat(e.target.value) || 0})} required />
                        <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Deixe 0 para usar o cálculo automático.</small>
                      </div>
                      <div className="form-group">
                        <label>Modo de Cálculo</label>
                        <select value={formData.calculation_mode || 'basic'} onChange={e => setFormData({...formData, calculation_mode: e.target.value === 'detailed' ? 'detailed' : 'basic'})}>
                          <option value="basic">Simplificado</option>
                          <option value="detailed">Avançado (igual calculadora)</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Margem (%)</label>
                        <input type="number" step="0.1" value={formData.margem || 0} onChange={e => setFormData({...formData, margem: parseFloat(e.target.value) || 0})} />
                      </div>
                      <div className="form-group" style={{ gridColumn: 'span 2', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.9rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem' }}>
                          <div><small style={{ color: 'var(--text-muted)' }}>Material</small><div>{formatMoney(calcPreview.custoMaterial)}</div></div>
                          <div><small style={{ color: 'var(--text-muted)' }}>Máquina</small><div>{formatMoney(calcPreview.custoMaquina)}</div></div>
                          <div><small style={{ color: 'var(--text-muted)' }}>Energia</small><div>{formatMoney(calcPreview.custoEnergia)}</div></div>
                          <div><small style={{ color: 'var(--text-muted)' }}>Custo Total</small><div style={{ color: 'var(--warning)', fontWeight: 700 }}>{formatMoney(calcPreview.custoTotal)}</div></div>
                          <div><small style={{ color: 'var(--text-muted)' }}>Preço Calculado</small><div style={{ color: 'var(--success)', fontWeight: 700 }}>{formatMoney(calcPreview.precoCalculado)}</div></div>
                          <div><small style={{ color: 'var(--text-muted)' }}>Margem Real</small><div>{Number.isFinite(calcPreview.margemReal) ? `${calcPreview.margemReal.toFixed(1)}%` : '0%'}</div></div>
                        </div>
                      </div>
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label>Tags</label>
                        <input type="text" value={formData.tags || ''} onChange={e => setFormData({...formData, tags: e.target.value})} placeholder="separe por vírgula" />
                      </div>
                      <div className="form-group">
                        <label>Preço Promocional (R$)</label>
                        <input type="number" step="0.01" value={formData.preco_promocional || 0} onChange={e => setFormData({...formData, preco_promocional: parseFloat(e.target.value) || 0})} />
                      </div>
                      <div className="form-group" style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input type="checkbox" id="ativo" checked={formData.ativo} onChange={e => setFormData({...formData, ativo: e.target.checked})} style={{ width: 'auto' }} />
                        <label htmlFor="ativo" style={{ margin: 0 }}>Produto Ativo no Catálogo</label>
                      </div>
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label>Descrição para a Loja</label>
                        <textarea rows={4} value={formData.descricao || ''} onChange={e => setFormData({...formData, descricao: e.target.value})}></textarea>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'details' && (
                  <div className="tab-content default-active">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Material de Impressão</label>
                        <select value={formData.material} onChange={e => setFormData({...formData, material: e.target.value})}>
                          <option value="PLA">PLA</option>
                          <option value="PETG">PETG</option>
                          <option value="ABS">ABS</option>
                          <option value="TPU">TPU</option>
                          <option value="RESINA">Resina</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Cor (Padrão)</label>
                        <input type="text" value={formData.cor || ''} onChange={e => setFormData({...formData, cor: e.target.value})} placeholder="Ex: Preto, Branco, Sortido" />
                      </div>
                      <div className="form-group">
                        <label>Resolução da Camada (mm)</label>
                        <input type="number" step="0.01" value={formData.resolucao_camada || 0.2} onChange={e => setFormData({...formData, resolucao_camada: parseFloat(e.target.value) || 0.2})} />
                      </div>
                      <div className="form-group">
                        <label>Largura (mm)</label>
                        <input type="number" step="0.1" value={formData.dimensoes?.largura || 0} onChange={e => setFormData({...formData, dimensoes: { ...(formData.dimensoes || {}), largura: parseFloat(e.target.value) || 0 }})} />
                      </div>
                      <div className="form-group">
                        <label>Altura (mm)</label>
                        <input type="number" step="0.1" value={formData.dimensoes?.altura || 0} onChange={e => setFormData({...formData, dimensoes: { ...(formData.dimensoes || {}), altura: parseFloat(e.target.value) || 0 }})} />
                      </div>
                      <div className="form-group">
                        <label>Profundidade (mm)</label>
                        <input type="number" step="0.1" value={formData.dimensoes?.profundidade || 0} onChange={e => setFormData({...formData, dimensoes: { ...(formData.dimensoes || {}), profundidade: parseFloat(e.target.value) || 0 }})} />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'advanced' && formData.calculation_mode === 'detailed' && (
                  <div className="tab-content default-active">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Custo Kg (R$)</label>
                        <input type="number" step="0.01" value={settings?.custo_kg || 0} disabled />
                      </div>
                      <div className="form-group">
                        <label>Custo Hora Máquina (R$)</label>
                        <input type="number" step="0.01" value={settings?.custo_hora_maquina || 0} disabled />
                      </div>
                      <div className="form-group">
                        <label>Custo Energia (kWh)</label>
                        <input type="number" step="0.01" value={settings?.custo_kwh || 0} disabled />
                      </div>
                      <div className="form-group">
                        <label>Consumo Máquina (W)</label>
                        <input type="number" step="1" value={settings?.consumo_maquina_w || 0} disabled />
                      </div>
                      <div className="form-group" style={{ gridColumn: 'span 2', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.9rem' }}>
                        <small style={{ color: 'var(--text-muted)' }}>Resumo do cálculo avançado</small>
                        <div style={{ marginTop: '0.4rem' }}>
                          Custo total estimado: <strong>{formatMoney(calcPreview.custoTotal)}</strong>
                        </div>
                        <div>
                          Preço calculado: <strong>{formatMoney(calcPreview.precoCalculado)}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'stock' && (
                  <div className="tab-content default-active">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Quantidade em Estoque</label>
                        <input type="number" value={formData.quantidade_estoque} onChange={e => setFormData({...formData, quantidade_estoque: parseInt(e.target.value, 10) || 0})} />
                      </div>
                      <div className="form-group">
                        <label>Estoque Mínimo</label>
                        <input type="number" value={formData.estoque_minimo || 0} onChange={e => setFormData({...formData, estoque_minimo: parseInt(e.target.value, 10) || 0})} />
                        <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>0 = sem alerta</small>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'files' && editingId && (
                  <div className="tab-content default-active">
                    {formData.is_variation && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
                        Arquivos desta variação são compartilhados com o produto base. Uploads e capa atualizam ambos.
                      </p>
                    )}
                    <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
                      <label className="btn btn-secondary" style={{ cursor: uploadingFile ? 'wait' : 'pointer', opacity: uploadingFile ? 0.7 : 1 }}>
                        <Upload size={14} /> {uploadingFile ? 'Enviando...' : 'Enviar arquivos'}
                        <input
                          type="file"
                          multiple
                          onChange={handleFileUpload}
                          disabled={uploadingFile}
                          style={{ display: 'none' }}
                        />
                      </label>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Tipos suportados: imagens, modelos 3D e documentos (limite 50MB por arquivo).
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.8rem' }}>
                      {productFiles.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1', color: 'var(--text-muted)', padding: '0.5rem 0' }}>
                          Nenhum arquivo enviado para este produto.
                        </div>
                      ) : (
                        productFiles.map(file => {
                          const isCover = formData.cover_file_id === file.id;
                          const isImage = (file.tipo || '').toLowerCase() === 'image';

                          return (
                            <div key={file.id} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '0.7rem', background: 'var(--bg-card)' }}>
                              <div style={{ height: '90px', borderRadius: '6px', background: 'var(--bg-input)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {isImage ? (
                                  <img src={file.storage_path} alt={file.nome_arquivo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  <ImageIcon size={20} style={{ color: 'var(--text-muted)' }} />
                                )}
                              </div>

                              <div style={{ marginTop: '0.6rem' }}>
                                <div title={file.nome_arquivo} style={{ fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {file.nome_arquivo}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                  {(file.tamanho_bytes / 1024).toFixed(1)} KB
                                </div>
                              </div>

                              <div style={{ marginTop: '0.6rem', display: 'flex', gap: '0.4rem' }}>
                                <button
                                  type="button"
                                  className="btn btn-secondary"
                                  style={{ flex: 1, padding: '0.35rem 0.4rem', fontSize: '0.72rem' }}
                                  disabled={isCover}
                                  onClick={() => handleSetCover(file.id)}
                                >
                                  <Star size={12} /> {isCover ? 'Capa' : 'Definir capa'}
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-danger"
                                  style={{ padding: '0.35rem 0.45rem', background: 'transparent', color: 'var(--danger)', border: '1px solid var(--danger-light)' }}
                                  onClick={() => handleDeleteFile(file.id)}
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'social' && (
                  <div className="tab-content default-active">
                    <div className="form-group">
                      <label>Descrição Geral para Redes Sociais</label>
                      <textarea
                        rows={6}
                        maxLength={5000}
                        value={formData.descricoes_social?.geral || ''}
                        onChange={e => setFormData({ ...formData, descricoes_social: { ...(formData.descricoes_social || {}), geral: e.target.value } })}
                        placeholder="Descrição única para Instagram, Facebook, WhatsApp, TikTok e marketplace..."
                      />
                      <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{(formData.descricoes_social?.geral || '').length}/5000</small>
                    </div>
                  </div>
                )}

              </form>
            </div>
            
            <div className="modal-header product-editor-footer">
              <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancelar</button>
              {editingId && (
                <button type="button" className="btn btn-secondary" onClick={handleCreateVariationFromCurrent}>
                  <Plus size={14} /> Adicionar Variação
                </button>
              )}
              <button type="submit" form="product-form" className="btn btn-primary">Salvar Produto</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
