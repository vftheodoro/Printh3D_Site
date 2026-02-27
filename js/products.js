/* ========================================
   PRINTH3D — PRODUCTS.JS
   Catálogo de produtos (JSON local)
   Renderização de cards e detalhes
   ======================================== */

const Products = (() => {

  // ══════════════════════════════════════
  // BASE DE DADOS LOCAL DE PRODUTOS
  // TODO: Substituir por chamada à API — GET /api/products
  // ══════════════════════════════════════
  const catalog = [
    {
      id: 1,
      name: 'Suporte para Celular Articulado',
      shortDesc: 'Suporte ajustável para celular, ideal para mesa ou bancada. Design ergonômico e resistente.',
      fullDesc: 'Suporte articulado impresso em 3D com design moderno e funcional. Permite ajuste de ângulo para melhor visualização. Compatível com a maioria dos smartphones. Acabamento premium com toque suave. Ideal para home office, estúdio ou uso diário.',
      material: 'PLA',
      price: 35.00,
      image: '',
      colors: ['Preto', 'Branco', 'Azul', 'Vermelho', 'Verde'],
      finishes: ['Padrão', 'Lixado', 'Pintado'],
      category: 'Acessórios'
    },
    {
      id: 2,
      name: 'Vaso Decorativo Geométrico',
      shortDesc: 'Vaso com design geométrico moderno para decoração de interiores.',
      fullDesc: 'Vaso decorativo com padrão geométrico exclusivo, perfeito para suculentas ou flores secas. Impresso com alta precisão em camadas de 0.12mm para acabamento refinado. Design moderno que combina com qualquer ambiente. Disponível em diversas cores.',
      material: 'PLA',
      price: 45.00,
      image: '',
      colors: ['Branco', 'Preto', 'Dourado', 'Prata', 'Rosa'],
      finishes: ['Padrão', 'Lixado', 'Pintado', 'Envernizado'],
      category: 'Decoração'
    },
    {
      id: 3,
      name: 'Engrenagem Mecânica Personalizada',
      shortDesc: 'Engrenagem sob medida para projetos mecânicos e protótipos.',
      fullDesc: 'Engrenagem mecânica impressa em PETG para maior resistência e durabilidade. Ideal para protótipos, projetos de robótica e reposição de peças. Fabricada com precisão dimensional de ±0.1mm. Resistente a temperaturas de até 80°C.',
      material: 'PETG',
      price: 28.00,
      image: '',
      colors: ['Preto', 'Cinza', 'Natural'],
      finishes: ['Padrão', 'Lixado'],
      category: 'Peças Técnicas'
    },
    {
      id: 4,
      name: 'Luminária de Mesa Moderna',
      shortDesc: 'Luminária decorativa com design exclusivo para ambientes modernos.',
      fullDesc: 'Luminária de mesa com design exclusivo impresso em 3D. Padrão de sombras único quando acesa. Compatível com lâmpadas LED E27. Estrutura leve e durável. Perfeita para quartos, salas ou escritórios. Cria uma atmosfera acolhedora e moderna.',
      material: 'PLA',
      price: 89.00,
      image: '',
      colors: ['Branco', 'Bege', 'Cinza Claro'],
      finishes: ['Padrão', 'Lixado', 'Pintado'],
      category: 'Decoração'
    },
    {
      id: 5,
      name: 'Organizador de Escritório',
      shortDesc: 'Organizador modular para canetas, clips e acessórios de escritório.',
      fullDesc: 'Organizador de escritório modular com compartimentos para canetas, clips, cartões e pequenos objetos. Design minimalista e funcional. Pode ser combinado com módulos adicionais. Base antiderrapante. Otimize seu espaço de trabalho com estilo.',
      material: 'PLA',
      price: 42.00,
      image: '',
      colors: ['Preto', 'Branco', 'Azul', 'Cinza'],
      finishes: ['Padrão', 'Lixado'],
      category: 'Acessórios'
    },
    {
      id: 6,
      name: 'Case Protetora para Arduino',
      shortDesc: 'Case de proteção personalizada para placas Arduino UNO e Mega.',
      fullDesc: 'Case protetora feita sob medida para placas Arduino UNO e Mega. Impressa em PETG para maior resistência a impactos. Furos para ventilação e acesso a todas as portas. Encaixe por pressão, sem necessidade de parafusos. Ideal para projetos de eletrônica e IoT.',
      material: 'PETG',
      price: 32.00,
      image: '',
      colors: ['Preto', 'Azul', 'Transparente'],
      finishes: ['Padrão', 'Lixado'],
      category: 'Peças Técnicas'
    },
    {
      id: 7,
      name: 'Miniatura Personalizada',
      shortDesc: 'Miniaturas personalizadas para coleção, RPG ou decoração.',
      fullDesc: 'Miniaturas detalhadas impressas com alta resolução (0.08mm). Perfeitas para jogos de RPG, colecionáveis ou decoração. Podem ser personalizadas conforme seu modelo 3D. Acabamento refinado com opção de pintura profissional. Cada peça é única.',
      material: 'PLA',
      price: 55.00,
      image: '',
      colors: ['Cinza (para pintura)', 'Branco', 'Preto'],
      finishes: ['Padrão', 'Lixado', 'Pintado'],
      category: 'Miniaturas'
    },
    {
      id: 8,
      name: 'Peça de Reposição Industrial',
      shortDesc: 'Peças de reposição sob demanda para máquinas e equipamentos.',
      fullDesc: 'Fabricação de peças de reposição sob demanda em ABS, material resistente a altas temperaturas e impactos. Ideal para substituição de peças descontinuadas ou protótipos industriais. Precisão dimensional garantida. Consulte-nos com seu modelo 3D ou desenho técnico.',
      material: 'ABS',
      price: 65.00,
      image: '',
      colors: ['Preto', 'Branco', 'Cinza'],
      finishes: ['Padrão', 'Lixado', 'Acetona (vapor smoothing)'],
      category: 'Peças Técnicas'
    }
  ];

  /**
   * Retorna todos os produtos
   * TODO: Substituir por fetch('/api/products')
   */
  function getAll() {
    return [...catalog];
  }

  /**
   * Retorna um produto pelo ID
   * TODO: Substituir por fetch(`/api/products/${id}`)
   */
  function getById(id) {
    return catalog.find(p => p.id === parseInt(id)) || null;
  }

  /**
   * Retorna produtos filtrados por categoria
   */
  function getByCategory(category) {
    return catalog.filter(p => p.category === category);
  }

  /**
   * Retorna todas as categorias disponíveis
   */
  function getCategories() {
    return [...new Set(catalog.map(p => p.category))];
  }

  /**
   * Gera o SVG placeholder para produtos sem imagem
   */
  function getPlaceholderSVG(name) {
    const initials = name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    return `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
      <rect width="300" height="300" fill="#1a1a1a"/>
      <text x="150" y="140" text-anchor="middle" fill="#333" font-family="Poppins,sans-serif" font-size="80" font-weight="700">${initials}</text>
      <text x="150" y="180" text-anchor="middle" fill="#555" font-family="Poppins,sans-serif" font-size="14">Imagem ilustrativa</text>
    </svg>`;
  }

  function getPublicPath(fileName) {
    return window.location.pathname.includes('/views/public/')
      ? fileName
      : `views/public/${fileName}`;
  }

  function normalizeText(text) {
    return (text || '')
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function buildSearchText(product) {
    return normalizeText([
      product.name,
      product.shortDesc,
      product.fullDesc,
      product.category,
      product.material
    ].join(' '));
  }

  function getSearchScore(product, query) {
    const normalizedQuery = normalizeText(query);
    if (!normalizedQuery) return 1;

    const name = normalizeText(product.name);
    const category = normalizeText(product.category);
    const material = normalizeText(product.material);
    const combined = buildSearchText(product);

    if (name === normalizedQuery) return 120;
    if (name.startsWith(normalizedQuery)) return 100;
    if (category === normalizedQuery || material === normalizedQuery) return 85;
    if (name.includes(normalizedQuery)) return 70;

    const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
    let tokenMatches = 0;
    tokens.forEach(token => {
      if (combined.includes(token)) tokenMatches += 1;
    });

    if (tokenMatches === 0) return 0;
    return 40 + (tokenMatches * 10);
  }

  function filterProducts(products, category, query) {
    const normalizedQuery = normalizeText(query);
    const byCategory = category === 'all'
      ? products
      : products.filter(p => p.category === category);

    if (!normalizedQuery) return byCategory;

    return byCategory
      .map(product => ({ product, score: getSearchScore(product, normalizedQuery) }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name))
      .map(item => item.product);
  }

  function getSuggestions(products, query, limit = 5) {
    const normalizedQuery = normalizeText(query);
    if (!normalizedQuery) return [];

    return products
      .map(product => ({ product, score: getSearchScore(product, normalizedQuery) }))
      .filter(item => item.score >= 60)
      .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name))
      .slice(0, limit)
      .map(item => item.product);
  }

  /**
   * Renderiza um card de produto para o catálogo
   */
  function renderCard(product) {
    const placeholderDataURI = 'data:image/svg+xml,' + encodeURIComponent(getPlaceholderSVG(product.name));
    const imgSrc = product.image || placeholderDataURI;

    return `
      <div class="product-card" onclick="window.location.href='${getPublicPath('produto.html')}?id=${product.id}'" role="button" tabindex="0">
        <div class="product-card-image">
          <img src="${imgSrc}" alt="${product.name}" loading="lazy">
        </div>
        <div class="product-card-body">
          <h3>${product.name}</h3>
          <p class="product-desc">${product.shortDesc}</p>
          <div class="product-meta">
            <span class="product-material">${product.material}</span>
            <span class="product-price">R$ ${product.price.toFixed(2)} <small>a partir de</small></span>
          </div>
          <button class="btn btn-whatsapp btn-block btn-sm" onclick="event.stopPropagation(); Products.buyViaWhatsApp(${product.id})">
            <i class="bi bi-whatsapp"></i> Comprar pelo WhatsApp
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Renderiza o detalhe completo de um produto
   */
  function renderDetail(product) {
    const placeholderDataURI = 'data:image/svg+xml,' + encodeURIComponent(getPlaceholderSVG(product.name));
    const imgSrc = product.image || placeholderDataURI;

    const colorsHTML = product.colors.map(c => `<option value="${c}">${c}</option>`).join('');
    const finishesHTML = product.finishes.map(f => `<option value="${f}">${f}</option>`).join('');

    return `
      <div class="product-detail-grid">
        <div class="product-detail-image">
          <img src="${imgSrc}" alt="${product.name}">
        </div>
        <div class="product-detail-info">
          <h1>${product.name}</h1>
          <p class="price">R$ ${product.price.toFixed(2)} <small style="color: var(--text-muted); font-size: 0.8rem;">a partir de</small></p>
          <p class="description">${product.fullDesc}</p>

          <div class="product-meta" style="margin-bottom: 20px;">
            <span class="product-material">${product.material}</span>
            <span class="text-muted" style="font-size: 0.85rem;">${product.category}</span>
          </div>

          <div class="product-options">
            <div class="option-group">
              <label><i class="bi bi-palette"></i> Cor</label>
              <select id="product-color" class="form-control">
                ${colorsHTML}
              </select>
            </div>
            <div class="option-group">
              <label><i class="bi bi-stars"></i> Acabamento</label>
              <select id="product-finish" class="form-control">
                ${finishesHTML}
              </select>
            </div>
          </div>

          <button class="btn btn-whatsapp btn-lg btn-block" onclick="Products.buyViaWhatsApp(${product.id})">
            <i class="bi bi-whatsapp"></i> Comprar pelo WhatsApp
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Aciona a compra via WhatsApp para um produto
   */
  function buyViaWhatsApp(productId) {
    const product = getById(productId);
    if (!product) return;

    const color = document.getElementById('product-color')?.value || product.colors[0];
    const finish = document.getElementById('product-finish')?.value || product.finishes[0];

    const message = WhatsApp.productMessage({
      name: product.name,
      price: product.price,
      material: product.material,
      color,
      finish
    });

    Storage.saveOrder({
      productId: product.id,
      productName: product.name,
      price: product.price,
      material: product.material,
      color,
      finish,
      type: 'product'
    });

    WhatsApp.open(message);
  }

  /**
   * Inicializa a página de catálogo
   */
  function initCatalog() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    const products = getAll();
    const categories = getCategories();
    const searchInput = document.getElementById('product-search');
    const suggestionsEl = document.getElementById('search-suggestions');
    const clearBtn = document.getElementById('search-clear');

    let activeCategory = 'all';
    let highlightedSuggestion = -1;
    let currentSuggestions = [];

    function hideSuggestions() {
      if (!suggestionsEl) return;
      suggestionsEl.innerHTML = '';
      suggestionsEl.classList.add('hidden');
      highlightedSuggestion = -1;
    }

    function renderSuggestions(query) {
      if (!suggestionsEl) return;
      currentSuggestions = getSuggestions(products, query);

      if (currentSuggestions.length === 0) {
        hideSuggestions();
        return;
      }

      suggestionsEl.innerHTML = currentSuggestions.map((product, index) => `
        <button type="button" class="suggestion-item${index === highlightedSuggestion ? ' active' : ''}" data-id="${product.id}" data-index="${index}">
          <span class="suggestion-name">${product.name}</span>
          <span class="suggestion-meta">${product.material} • ${product.category}</span>
        </button>
      `).join('');

      suggestionsEl.classList.remove('hidden');
    }

    function applyFilters() {
      const query = searchInput ? searchInput.value : '';
      const filtered = filterProducts(products, activeCategory, query);
      renderGrid(grid, filtered);

      if (searchInput && query.trim()) {
        renderSuggestions(query);
      } else {
        hideSuggestions();
      }
    }

    function selectSuggestionByIndex(index) {
      const selected = currentSuggestions[index];
      if (!selected || !searchInput) return;

      searchInput.value = selected.name;
      hideSuggestions();
      applyFilters();
    }

    // Renderizar filtros de categoria
    const filterContainer = document.getElementById('category-filter');
    if (filterContainer) {
      let filterHTML = '<button class="btn btn-primary btn-sm category-btn active" data-category="all">Todos</button>';
      categories.forEach(cat => {
        filterHTML += `<button class="btn btn-secondary btn-sm category-btn" data-category="${cat}">${cat}</button>`;
      });
      filterContainer.innerHTML = filterHTML;

      filterContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('category-btn')) {
          // Atualizar botão ativo
          filterContainer.querySelectorAll('.category-btn').forEach(b => {
            b.classList.remove('active', 'btn-primary');
            b.classList.add('btn-secondary');
          });
          e.target.classList.add('active', 'btn-primary');
          e.target.classList.remove('btn-secondary');

          activeCategory = e.target.dataset.category;
          applyFilters();
        }
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        highlightedSuggestion = -1;
        applyFilters();
      });

      searchInput.addEventListener('focus', () => {
        if (searchInput.value.trim()) renderSuggestions(searchInput.value);
      });

      searchInput.addEventListener('keydown', (e) => {
        if (currentSuggestions.length === 0) return;

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          highlightedSuggestion = (highlightedSuggestion + 1) % currentSuggestions.length;
          renderSuggestions(searchInput.value);
          return;
        }

        if (e.key === 'ArrowUp') {
          e.preventDefault();
          highlightedSuggestion = highlightedSuggestion <= 0
            ? currentSuggestions.length - 1
            : highlightedSuggestion - 1;
          renderSuggestions(searchInput.value);
          return;
        }

        if (e.key === 'Enter' && highlightedSuggestion >= 0) {
          e.preventDefault();
          selectSuggestionByIndex(highlightedSuggestion);
        }
      });
    }

    if (clearBtn && searchInput) {
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        highlightedSuggestion = -1;
        applyFilters();
        searchInput.focus();
      });
    }

    if (suggestionsEl) {
      suggestionsEl.addEventListener('click', (e) => {
        const item = e.target.closest('.suggestion-item');
        if (!item) return;

        const index = Number(item.dataset.index);
        selectSuggestionByIndex(index);
      });
    }

    document.addEventListener('click', (e) => {
      if (!searchInput || !suggestionsEl) return;
      if (searchInput.contains(e.target) || suggestionsEl.contains(e.target)) return;
      hideSuggestions();
    });

    renderGrid(grid, products);
  }

  /**
   * Renderiza o grid de produtos
   */
  function renderGrid(container, products) {
    if (products.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1;">
          <div class="empty-icon"><i class="bi bi-box-seam"></i></div>
          <h3>Nenhum produto encontrado</h3>
          <p>Tente selecionar outra categoria.</p>
        </div>
      `;
      return;
    }
    container.innerHTML = products.map(p => renderCard(p)).join('');
  }

  /**
   * Inicializa a página de detalhe do produto
   */
  function initDetail() {
    const container = document.getElementById('product-detail');
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
      container.innerHTML = `<div class="empty-state"><h3>Produto não encontrado</h3><p><a href="${getPublicPath('produtos.html')}">Voltar ao catálogo</a></p></div>`;
      return;
    }

    const product = getById(id);
    if (!product) {
      container.innerHTML = `<div class="empty-state"><h3>Produto não encontrado</h3><p><a href="${getPublicPath('produtos.html')}">Voltar ao catálogo</a></p></div>`;
      return;
    }

    // Atualizar breadcrumb
    const breadcrumb = document.getElementById('breadcrumb-product');
    if (breadcrumb) breadcrumb.textContent = product.name;

    // Atualizar título da página
    document.title = `${product.name} — Printh3D`;

    // Renderizar detalhe
    container.innerHTML = renderDetail(product);

    // Salvar no histórico
    Storage.saveProductView(product);
  }

  // ── API PÚBLICA ──
  return {
    getAll,
    getById,
    getByCategory,
    getCategories,
    renderCard,
    renderDetail,
    buyViaWhatsApp,
    initCatalog,
    initDetail
  };

})();
