'use client';

import { useEffect, useMemo, useState } from 'react';
import { Wallet, Plus, Edit2, Trash2, Search, CheckCircle, AlertTriangle, User, Calendar } from 'lucide-react';

interface Sale {
  id: number;
  data_venda: string;
  cliente_id?: number | null;
  cliente: string;
  item_nome: string;
  product_id?: number | null;
  cupom_id?: number | null;
  desconto_percentual?: number;
  valor_venda: number;
  valor_devido: number;
  tipo_pagamento: string;
  vendedor?: { nome: string };
  observacoes: string;
}

interface ProductOption {
  id: number;
  nome: string;
  preco_venda: number;
}

interface CouponOption {
  id: number;
  codigo: string;
  tipo_desconto: 'percentual' | 'fixo';
  valor_desconto: number;
  ativo: boolean;
  data_validade?: string | null;
}

interface ClientOption {
  id: number;
  nome: string;
  whatsapp?: string;
  email?: string;
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, paid, pending
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [coupons, setCoupons] = useState<CouponOption[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [productQuery, setProductQuery] = useState('');
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const initialForm = {
    cliente: '', cliente_id: '', item_nome: '', product_id: '', cupom_id: '', desconto_percentual: 0, valor_venda: 0, valor_devido: 0,
    tipo_pagamento: 'PIX', parcelas: 1, quantidade: 1, preco_unitario: 0, observacoes: '', data_venda: new Date().toISOString().slice(0, 16)
  };
  const [formData, setFormData] = useState<any>(initialForm);

  const normalizeText = (value: string) => value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  const suggestedProducts = useMemo(() => {
    const query = normalizeText(productQuery);
    if (!query) return products.slice(0, 8);

    const queryTokens = query.split(/\s+/).filter(Boolean);
    return [...products]
      .map((product) => {
        const name = normalizeText(product.nome);
        const startsWith = name.startsWith(query) ? 1 : 0;
        const contains = name.includes(query) ? 1 : 0;
        const tokenMatches = queryTokens.reduce((acc, token) => (name.includes(token) ? acc + 1 : acc), 0);
        return { product, score: (startsWith * 5) + (contains * 3) + tokenMatches };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((entry) => entry.product);
  }, [productQuery, products]);

  const suggestedClients = useMemo(() => {
    const query = normalizeText(formData.cliente || '');
    if (!query) return clients.slice(0, 8);

    const queryTokens = query.split(/\s+/).filter(Boolean);
    return [...clients]
      .map((client) => {
        const name = normalizeText(client.nome || '');
        const startsWith = name.startsWith(query) ? 1 : 0;
        const contains = name.includes(query) ? 1 : 0;
        const tokenMatches = queryTokens.reduce((acc, token) => (name.includes(token) ? acc + 1 : acc), 0);
        return { client, score: (startsWith * 5) + (contains * 3) + tokenMatches };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((entry) => entry.client);
  }, [clients, formData.cliente]);

  useEffect(() => {
    loadSales();
  }, [search, statusFilter]);

  useEffect(() => {
    loadAuxiliaryData();
  }, []);

  const loadAuxiliaryData = async () => {
    try {
      const [productsRes, couponsRes, clientsRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/coupons'),
        fetch('/api/admin/clients')
      ]);

      const productsData = await productsRes.json();
      const couponsData = await couponsRes.json();
      const clientsData = await clientsRes.json();

      if (Array.isArray(productsData)) {
        setProducts(productsData);
      }

      if (Array.isArray(couponsData)) {
        setCoupons(couponsData.filter((c: CouponOption) => c.ativo));
      }

      if (Array.isArray(clientsData)) {
        setClients(clientsData);
      }
    } catch (error) {
      console.error('Falha ao carregar produtos/cupons/clientes', error);
    }
  };

  const loadSales = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/sales?search=${search}&status=${statusFilter}`);
      const data = await res.json();
      setSales(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = async (sale?: Sale) => {
    if (sale) {
      const quantityMatch = String(sale.item_nome || '').match(/\s+x(\d+)$/i);
      const parsedQuantity = quantityMatch ? Math.max(1, Number(quantityMatch[1]) || 1) : 1;
      const unitPrice = parsedQuantity > 0 ? Number((Number(sale.valor_venda || 0) / parsedQuantity).toFixed(2)) : Number(sale.valor_venda || 0);
      setEditingId(sale.id);
      setFormData({
        ...sale,
        cliente_id: sale.cliente_id || '',
        product_id: sale.product_id || '',
        cupom_id: sale.cupom_id || '',
        quantidade: parsedQuantity,
        preco_unitario: unitPrice,
        data_venda: new Date(sale.data_venda).toISOString().slice(0, 16)
      });
      setProductQuery(sale.item_nome || '');
    } else {
      setEditingId(null);
      setFormData(initialForm);
      setProductQuery('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setShowClientSuggestions(false);
    setShowProductSuggestions(false);
    setIsModalOpen(false);
  };

  const selectClient = (client: ClientOption) => {
    setFormData((prev: any) => ({
      ...prev,
      cliente: client.nome,
      cliente_id: client.id
    }));
    setShowClientSuggestions(false);
  };

  const applyCouponPreview = (baseValue: number, couponId: string | number) => {
    const coupon = coupons.find(c => c.id === Number(couponId));
    if (!coupon) {
      return { valor_venda: baseValue, desconto_percentual: 0 };
    }

    const isExpired = coupon.data_validade ? new Date(coupon.data_validade) < new Date() : false;
    if (isExpired) {
      return { valor_venda: baseValue, desconto_percentual: 0 };
    }

    if (coupon.tipo_desconto === 'percentual') {
      const finalValue = Math.max(0, baseValue - ((baseValue * coupon.valor_desconto) / 100));
      return {
        valor_venda: Number(finalValue.toFixed(2)),
        desconto_percentual: Number(coupon.valor_desconto) || 0
      };
    }

    const fixedDiscount = Number(coupon.valor_desconto) || 0;
    const finalValue = Math.max(0, baseValue - fixedDiscount);
    const discountPercent = baseValue > 0 ? Number(((fixedDiscount / baseValue) * 100).toFixed(2)) : 0;
    return {
      valor_venda: Number(finalValue.toFixed(2)),
      desconto_percentual: discountPercent
    };
  };

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === Number(productId));
    if (!product) {
      setFormData((prev: any) => ({
        ...prev,
        product_id: '',
        item_nome: '',
        preco_unitario: 0,
        quantidade: prev.quantidade || 1,
        valor_venda: 0,
        desconto_percentual: 0
      }));
      return;
    }

    const quantity = Math.max(1, Number(formData.quantidade) || 1);
    const baseValue = (Number(product.preco_venda) || 0) * quantity;
    const next = applyCouponPreview(baseValue, formData.cupom_id);
    setFormData((prev: any) => ({
      ...prev,
      product_id: product.id,
      item_nome: product.nome,
      preco_unitario: Number(product.preco_venda) || 0,
      valor_venda: next.valor_venda,
      desconto_percentual: next.desconto_percentual
    }));
    setProductQuery(product.nome);
    setShowProductSuggestions(false);
  };

  const handleQuantityChange = (value: number) => {
    const quantity = Math.max(1, Number(value) || 1);
    const unitPrice = Number(formData.preco_unitario) || Number(formData.valor_venda) || 0;
    const baseValue = unitPrice * quantity;
    const next = applyCouponPreview(baseValue, formData.cupom_id);

    setFormData((prev: any) => ({
      ...prev,
      quantidade: quantity,
      valor_venda: next.valor_venda,
      desconto_percentual: next.desconto_percentual
    }));
  };

  const handleCouponChange = (couponId: string) => {
    const quantity = Math.max(1, Number(formData.quantidade) || 1);
    const linkedProduct = products.find(p => p.id === Number(formData.product_id));
    const unitPrice = linkedProduct ? Number(linkedProduct.preco_venda) || 0 : Number(formData.preco_unitario) || Number(formData.valor_venda) || 0;
    const baseValue = unitPrice * quantity;
    const next = couponId ? applyCouponPreview(baseValue, couponId) : { valor_venda: baseValue, desconto_percentual: 0 };

    setFormData((prev: any) => ({
      ...prev,
      cupom_id: couponId ? Number(couponId) : '',
      valor_venda: next.valor_venda,
      desconto_percentual: next.desconto_percentual
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/admin/sales/${editingId}` : '/api/admin/sales';
    const method = editingId ? 'PUT' : 'POST';

    try {
      // Send only fields supported by the sales API/table.
      const payload = {
        cliente_id: formData.cliente_id ? Number(formData.cliente_id) : null,
        cliente: String(formData.cliente || ''),
        item_nome: String(formData.item_nome || ''),
        product_id: formData.product_id ? Number(formData.product_id) : null,
        cupom_id: formData.cupom_id ? Number(formData.cupom_id) : null,
        desconto_percentual: Number(formData.desconto_percentual) || 0,
        valor_venda: Number(formData.valor_venda) || 0,
        valor_devido: Number(formData.valor_devido) || 0,
        tipo_pagamento: String(formData.tipo_pagamento || 'PIX'),
        parcelas: Math.max(1, Number(formData.parcelas) || 1),
        observacoes: formData.observacoes ? String(formData.observacoes) : null,
        quantidade: Math.max(1, Number(formData.quantidade) || 1),
        preco_unitario: Number(formData.preco_unitario) || 0,
        data_venda: new Date(formData.data_venda).toISOString()
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error((await res.json()).error);
      
      closeModal();
      loadSales();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir esta venda? Ela será movida para a lixeira.')) return;
    try {
      const res = await fetch(`/api/admin/sales/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error);
      loadSales();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const formatMoney = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  return (
    <div className="section active">
      <div className="section-header">
        <h1><Wallet /> Vendas</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={16} /> Nova Venda
        </button>
      </div>

      {/* Toolbar */}
      <div className="page-toolbar">
        <div className="toolbar-search">
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Buscar por cliente ou item..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className={`btn ${statusFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setStatusFilter('all')}>Todas</button>
          <button className={`btn ${statusFilter === 'paid' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setStatusFilter('paid')}>Pagas</button>
          <button className={`btn ${statusFilter === 'pending' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setStatusFilter('pending')}>Com Débito</button>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th className="hide-mobile">ID</th>
              <th>Data / Cliente</th>
              <th>Item / Pedido</th>
              <th className="hide-tablet">Vendedor</th>
              <th className="hide-tablet">Pagamento</th>
              <th>Valor Total</th>
              <th className="hide-mobile">Status</th>
              <th style={{ textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>Carregando...</td></tr>
            ) : sales.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>Nenhuma venda encontrada.</td></tr>
            ) : sales.map(sale => {
              const date = new Date(sale.data_venda);
              const isPending = sale.valor_devido > 0;
              return (
                <tr key={sale.id}>
                  <td className="hide-mobile">
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>#{sale.id}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <div className="hide-mobile" style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        <User size={12} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <strong style={{ fontSize: '0.85rem' }}>{sale.cliente}</strong>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          <Calendar size={10} style={{ display: 'inline', marginRight: '3px', marginBottom: '1px' }}/>
                          {date.toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{sale.item_nome}</td>
                  <td className="hide-tablet"><span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{sale.vendedor?.nome || 'Sistema'}</span></td>
                  <td className="hide-tablet">
                    <span className="status-badge badge-neutral">
                      {sale.tipo_pagamento}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong style={{ fontSize: '0.85rem' }}>{formatMoney(sale.valor_venda)}</strong>
                      {isPending && (
                        <span className="status-badge badge-warning" style={{ fontSize: '0.65rem', padding: '1px 4px', marginTop: '4px' }}>
                          Faltam {formatMoney(sale.valor_devido)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="hide-mobile">
                    {isPending ? (
                      <span className="status-badge badge-warning">
                        <AlertTriangle size={12}/> Pendente
                      </span>
                    ) : (
                      <span className="status-badge badge-success">
                        <CheckCircle size={12}/> Pago
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="action-btns">
                      <button className="btn btn-secondary" style={{ padding: '0.4rem' }} onClick={() => openModal(sale)}><Edit2 size={14} /></button>
                      <button className="btn btn-danger-ghost" style={{ padding: '0.4rem' }} onClick={() => handleDelete(sale.id)}><Trash2 size={14} /></button>
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
          <div className="modal" style={{ maxWidth: '700px', width: '95%' }}>
            <div className="modal-header">
              <h3>{editingId ? 'Editar Venda' : 'Registrar Venda'}</h3>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>
            
            <div className="modal-body">
              <form id="sale-form" onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) minmax(250px, 1fr)', gap: '1.5rem' }}>
                  
                  {/* Left Column: Data */}
                  <div>
                    <h4 className="form-section">Detalhes do Pedido</h4>
                    
                    <div className="form-group">
                      <label>Cliente (Nome completo) *</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          value={formData.cliente}
                          onFocus={() => setShowClientSuggestions(true)}
                          onChange={e => setFormData({ ...formData, cliente: e.target.value, cliente_id: '' })}
                          required
                          placeholder="Ex: João Silva"
                        />
                        {showClientSuggestions && suggestedClients.length > 0 && (
                          <div className="catalog-suggestions" style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 25 }}>
                            {suggestedClients.map((client) => (
                              <button
                                key={client.id}
                                type="button"
                                className="catalog-suggestion-item"
                                onClick={() => selectClient(client)}
                              >
                                <span>{client.nome}</span>
                                <strong>{client.whatsapp || client.email || `ID ${client.id}`}</strong>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <small style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Será salvo na base de clientes auto.</small>
                    </div>
                    
                    <div className="form-group">
                      <label>Produto Cadastrado (busca inteligente)</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          placeholder="Digite para pesquisar no catálogo"
                          value={productQuery}
                          onFocus={() => setShowProductSuggestions(true)}
                          onChange={(e) => {
                            const value = e.target.value;
                            setProductQuery(value);
                            setShowProductSuggestions(true);

                            if (!value.trim()) {
                              setFormData((prev: any) => ({
                                ...prev,
                                product_id: '',
                                item_nome: '',
                                preco_unitario: 0,
                                valor_venda: 0,
                                desconto_percentual: 0
                              }));
                            } else {
                              setFormData((prev: any) => ({ ...prev, item_nome: value, product_id: '' }));
                            }
                          }}
                        />
                        {showProductSuggestions && suggestedProducts.length > 0 && (
                          <div className="catalog-suggestions" style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 25 }}>
                            {suggestedProducts.map(product => (
                              <button
                                key={product.id}
                                type="button"
                                className="catalog-suggestion-item"
                                onClick={() => handleProductChange(String(product.id))}
                              >
                                <span>{product.nome}</span>
                                <strong>{formatMoney(product.preco_venda)}</strong>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <small style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                        Escreva parte do nome para receber sugestões. Se não selecionar, será venda avulsa.
                      </small>
                    </div>

                    <div className="form-group">
                      <label>Nome do Item / Produto *</label>
                      <input type="text" value={formData.item_nome} onChange={e => setFormData({...formData, item_nome: e.target.value})} required placeholder="O que foi vendido?" />
                    </div>

                    <div className="form-group">
                      <label>Quantidade vendida *</label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={formData.quantidade}
                        onChange={e => handleQuantityChange(parseInt(e.target.value || '1', 10))}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Data da Venda</label>
                      <input type="datetime-local" value={formData.data_venda} onChange={e => setFormData({...formData, data_venda: e.target.value})} required />
                    </div>
                    
                    <div className="form-group">
                      <label>Observações</label>
                      <textarea rows={3} value={formData.observacoes || ''} onChange={e => setFormData({...formData, observacoes: e.target.value})} placeholder="Medidas, cor, prazo..."></textarea>
                    </div>
                  </div>

                  {/* Right Column: Values */}
                  <div>
                    <h4 className="form-section">Valores e Pagamento</h4>
                    
                    <div className="form-group">
                      <label>Valor Total da Venda (R$) *</label>
                      <input type="number" step="0.01" value={formData.valor_venda} onChange={e => setFormData({...formData, valor_venda: parseFloat(e.target.value)})} required style={{ fontSize: '1.2rem', fontWeight: 'bold' }} />
                      {Number(formData.preco_unitario) > 0 && Number(formData.quantidade) > 0 && (
                        <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          {Number(formData.quantidade)} x {formatMoney(Number(formData.preco_unitario) || 0)} = {formatMoney((Number(formData.preco_unitario) || 0) * Number(formData.quantidade || 1))}
                        </small>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Cupom Aplicado (opcional)</label>
                      <select value={formData.cupom_id || ''} onChange={e => handleCouponChange(e.target.value)}>
                        <option value="">Sem cupom</option>
                        {coupons.map(coupon => (
                          <option key={coupon.id} value={coupon.id}>
                            {coupon.codigo} ({coupon.tipo_desconto === 'percentual' ? `${coupon.valor_desconto}%` : formatMoney(coupon.valor_desconto)})
                          </option>
                        ))}
                      </select>
                      {Number(formData.desconto_percentual) > 0 && (
                        <small style={{ color: 'var(--success)', fontSize: '0.75rem' }}>
                          Desconto aplicado: {Number(formData.desconto_percentual).toFixed(2)}%
                        </small>
                      )}
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Forma de Pag.</label>
                        <select value={formData.tipo_pagamento} onChange={e => setFormData({...formData, tipo_pagamento: e.target.value})}>
                          <option value="PIX">PIX</option>
                          <option value="Cartão de Crédito">Cartão de Crédito</option>
                          <option value="Cartão de Débito">Cartão de Débito</option>
                          <option value="Dinheiro">Dinheiro</option>
                          <option value="Link de Pagamento">Link de Pagamento</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Parcelas</label>
                        <input type="number" min="1" value={formData.parcelas} onChange={e => setFormData({...formData, parcelas: parseInt(e.target.value)})} />
                      </div>
                    </div>

                    <div className="form-group" style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--warning-light)' }}>
                      <label style={{ color: 'var(--warning)' }}>Valor Faltante / Devido (R$)</label>
                      <input type="number" step="0.01" value={formData.valor_devido} onChange={e => setFormData({...formData, valor_devido: parseFloat(e.target.value)})} style={{ borderColor: 'var(--warning-light)' }} />
                      <small style={{ color: 'var(--text-muted)', fontSize: '0.7rem', display: 'block', marginTop: '0.5rem' }}>Coloque 0 se foi pago integralmente.</small>
                    </div>

                  </div>

                </div>
              </form>
            </div>
            
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancelar</button>
              <button type="submit" form="sale-form" className="btn btn-primary">Salvar Venda</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
