# Documentação Completa — Printh3D Site

## 1) Objetivo do projeto

O Printh3D Site é um front-end estático para divulgação de serviços de impressão 3D, captura de interesse comercial e pré-orçamento automatizado com encaminhamento para WhatsApp.

Objetivos de negócio atendidos:

- Exibir marca e proposta de valor
- Exibir catálogo com intenção de compra rápida
- Coletar briefing simples de projetos personalizados
- Gerar estimativa inicial automática para reduzir atrito comercial
- Encaminhar leads qualificados via WhatsApp

---

## 2) Arquitetura geral

### 2.1 Tipo de aplicação

- Front-end estático
- Sem build step
- Sem dependências NPM
- Sem backend

### 2.2 Organização de pastas

```text
Printh3D_Site/
├─ index.html
├─ views/
│  └─ public/
│     ├─ produtos.html
│     ├─ produto.html
│     └─ orcamento.html
├─ css/
│  └─ style.css
├─ js/
│  ├─ app.js
│  ├─ products.js
│  ├─ budget.js
│  ├─ whatsapp.js
│  └─ storage.js
├─ assets/
│  ├─ imagens/
│  └─ logos/
└─ README.md / DOCUMENTACAO_COMPLETA.md
```

### 2.3 Páginas ativas e roteamento

A inicialização é feita por `js/app.js`, usando `data-page` no `<body>`.

Mapeamento:

- `data-page="home"` → Home (`index.html`)
- `data-page="catalog"` → Catálogo (`views/public/produtos.html`)
- `data-page="product-detail"` → Detalhe (`views/public/produto.html`)
- `data-page="budget"` → Orçamento (`views/public/orcamento.html`)

Router simplificado (`App.initPageRouter`) aciona:

- `Products.initCatalog()`
- `Products.initDetail()`
- `Budget.init()`

---

## 3) Módulos JavaScript

## 3.1 `app.js`

### Responsabilidades

- Setup global da interface
- Header com comportamento em scroll
- Menu mobile (abre/fecha + lock de scroll)
- Animações por `IntersectionObserver`
- Router por página
- Toasts globais

### API pública

- `App.init()`
- `App.showToast(message, type)`

---

## 3.2 `products.js`

### Responsabilidades

- Manter catálogo local (`catalog`)
- Expor métodos de consulta por ID/categoria
- Renderizar card e página de detalhe
- Implementar busca inteligente com ranking
- Implementar sugestões com navegação por teclado
- Acionar compra via WhatsApp e salvar pedido local

### Estrutura do produto

```js
{
  id: Number,
  name: String,
  shortDesc: String,
  fullDesc: String,
  material: String,
  price: Number,
  image: String,
  colors: String[],
  finishes: String[],
  category: String
}
```

### Busca inteligente

Pipeline:

1. Normalização (`normalizeText`) com remoção de acentos
2. Cálculo de score (`getSearchScore`) por regras:
   - match exato no nome
   - prefixo no nome
   - match em categoria/material
   - match parcial no nome
   - score por tokens
3. Ordenação por score e nome
4. Renderização do grid filtrado
5. Sugestões em dropdown (`getSuggestions`) com threshold de score

### API pública

- `getAll()`
- `getById(id)`
- `getByCategory(category)`
- `getCategories()`
- `renderCard(product)`
- `renderDetail(product)`
- `buyViaWhatsApp(productId)`
- `initCatalog()`
- `initDetail()`

---

## 3.3 `budget.js`

### Responsabilidades

- Controlar formulário de orçamento simplificado
- Exibir etapas conforme preenchimento
- Atualizar preview visual (cubo)
- Calcular faixa estimada de preço
- Persistir orçamento/pedido localmente
- Enviar estimativa via WhatsApp

### Entradas principais

- Objetivo da peça (`useCase`)
- Dimensões em cm (`width`, `height`, `depth`)
- Preenchimento (`infill`)
- Acabamento (`finish`)
- Nível de detalhe (`detailLevel`)
- Quantidade (`quantity`)
- Urgência (`urgency`)
- Complexidade geométrica (`shapeComplexity`)
- Observações (`notes`)

### Modelo de cálculo

Componentes:

- Volume geométrico: `width * height * depth`
- Fator de ocupação: depende da complexidade (`SHAPE_OCCUPANCY`)
- Fator de preenchimento: função do `infill`
- Volume efetivo: `geometricVolume * occupancyFactor * infillFactor`
- Custo unitário baseado em volume + taxa fixa
- Multiplicadores por uso, detalhe, acabamento, urgência e complexidade
- Desconto por quantidade
- Faixa final:
  - mínimo = `total * 0.90`
  - máximo = `total * 1.15`

### Constantes de calibração atuais

- `BASE_FEE = 6.5`
- `COST_PER_CM3 = 0.095`
- `SHAPE_OCCUPANCY = { Simples: 0.42, Media: 0.31, Complexa: 0.24 }`
- `infillFactor = 0.11 + ((infill/100) * 0.30)`

### API pública

- `init()`
- `calculateEstimate(state)`

---

## 3.4 `whatsapp.js`

### Responsabilidades

- Centralizar geração de links e mensagens WhatsApp

### Mensagens disponíveis

- `contactMessage()`
- `productMessage({ ... })`
- `budgetMessage(data)`

### Compatibilidade de orçamento

`budgetMessage` suporta:

- Payload novo (simplificado por dimensões)
- Payload legado (peso/tempo/material)

### Configuração crítica

```js
const PHONE_NUMBER = '5513997553465';
```

---

## 3.5 `storage.js`

### Responsabilidades

- Persistência local de dados
- Gerenciamento de sessão e usuários (legado)
- Histórico de orçamentos/pedidos/produtos visualizados

### Chaves utilizadas

- `printh3d_users`
- `printh3d_session`
- `printh3d_budgets`
- `printh3d_orders`
- `printh3d_product_history`

### Observação importante

Mesmo sem tela de login ativa, o módulo mantém métodos de autenticação para possível reuso futuro. Dados não vinculados a usuário autenticado usam `userId: 'guest'`.

---

## 4) Telas e IDs importantes

## 4.1 Home (`index.html`)

Elementos relevantes:

- Navegação principal (Home, Produtos, Orçamento, Contato)
- Hero com animação 3D (`tower-loader`)
- Seções institucionais e CTA WhatsApp

Dependências JS carregadas:

- `storage.js`
- `whatsapp.js`
- `products.js`
- `budget.js`
- `app.js`

## 4.2 Catálogo (`views/public/produtos.html`)

IDs relevantes:

- `#product-search`
- `#search-suggestions`
- `#search-clear`
- `#category-filter`
- `#products-grid`

## 4.3 Detalhe (`views/public/produto.html`)

IDs relevantes:

- `#breadcrumb-product`
- `#product-detail`

Parâmetro obrigatório de query string:

- `?id=<produto>`

## 4.4 Orçamento (`views/public/orcamento.html`)

IDs relevantes do fluxo:

- Etapas: `#step-use-case`, `#step-dimensions`, `#step-preferences`
- Uso: `#usecase-grid`, `#use-case`
- Dimensões: `#width`, `#height`, `#depth`
- Preferências: `#infill`, `#finish`, `#detail-level`, `#quantity`, `#urgency`
- Avançado: `#toggle-advanced`, `#advanced-panel`, `#shape-complexity`
- Observações: `#notes`
- Preview: `#project-cube`, `#dimension-readout`, `#profile-chip`, `#profile-description`
- Resultado: `#budget-result`, `#estimated-value`, `#estimate-note`
- Formulário: `#budget-form`

---

## 5) Fluxo de dados

## 5.1 Catálogo

1. `Products.initCatalog()` carrega `catalog`
2. Renderiza categorias e grid
3. Entrada de busca ativa ranking + sugestões
4. Clique no card abre detalhe com `?id=`

## 5.2 Compra de produto

1. Usuário escolhe cor/acabamento
2. `Products.buyViaWhatsApp()` monta payload
3. `Storage.saveOrder()` salva local
4. `WhatsApp.open(WhatsApp.productMessage(...))`

## 5.3 Orçamento

1. Usuário preenche dados mínimos
2. `Budget.updateEstimate()` calcula e mostra faixa
3. Submit salva orçamento/pedido
4. `WhatsApp.budgetMessage(...)` envia briefing + faixa

---

## 6) Padrões de desenvolvimento adotados

- Módulos com IIFE para encapsulamento
- API pública explícita por módulo
- Guard clauses para elementos inexistentes
- Fallbacks para campos opcionais
- Renderização HTML por template string
- Persistência local para prototipagem rápida

---

## 7) Segurança e limitações

## 7.1 Limitações atuais

- Sem autenticação real de servidor
- Sem banco de dados remoto
- Sem validação server-side
- Fácil manipulação de `localStorage` pelo cliente

## 7.2 Implicações

- Dados salvos são apenas referência local
- Não usar para dados sensíveis/produção crítica sem backend

## 7.3 Recomendações para produção

- Migrar armazenamento para API autenticada
- Implementar rate limit no backend de contato
- Sanitizar entradas no servidor
- Implementar logs e auditoria

---

## 8) Manutenção e customização

## 8.1 Atualizar catálogo

Arquivo: `js/products.js` → constante `catalog`.

Boas práticas:

- IDs únicos e estáveis
- Preço em número decimal
- Categoria padronizada para filtros consistentes
- Inserir imagem real quando disponível

## 8.2 Ajustar cálculo de orçamento

Arquivo: `js/budget.js`.

Estratégia de calibração:

1. Ajuste `BASE_FEE` e `COST_PER_CM3`
2. Ajuste multiplicadores por perfil
3. Valide 5 cenários padrão (pequeno/médio/grande, simples/complexo)
4. Compare com preço comercial alvo

## 8.3 Trocar identidade visual

Arquivos principais:

- Logo: `assets/imagens/logos/logo_printh_padrão.png`
- Tema/estilos: `css/style.css`

---

## 9) Estrutura consolidada

A raiz do projeto mantém apenas a página principal (`index.html`) e arquivos de apoio.

As telas funcionais de navegação pública ficam centralizadas em `views/public`, reduzindo duplicidade e risco de rotas desatualizadas.

---

## 10) Guia de troubleshooting

## 10.1 Catálogo vazio

Verificar:

- Presença do elemento `#products-grid`
- Erros de JS no console
- Integridade da constante `catalog`

## 10.2 Detalhe não carrega

Verificar:

- URL com `?id=` válido
- Se o `id` existe no `catalog`

## 10.3 WhatsApp não abre

Verificar:

- Bloqueio de pop-up do navegador
- Formato do número em `PHONE_NUMBER`

## 10.4 Estimativa não aparece no orçamento

Verificar:

- `use-case` selecionado
- `width`, `height`, `depth` maiores que zero

---

## 11) Roadmap sugerido

Curto prazo:

- Adicionar imagens reais no catálogo
- Revisar SEO técnico (meta tags, OG, sitemap)

Médio prazo:

- Backend para pedidos/orçamentos
- Dashboard administrativo
- Controle de status de pedido

Longo prazo:

- Login real de cliente
- Histórico de pedidos sincronizado em nuvem
- Simulação mais precisa por material e máquina

---

## 12) Informações institucionais atuais

- Marca: Printh3D
- Responsável: Victor Theodoro
- E-mail: `printh3d@outlook.com`
- Telefone/WhatsApp: `(13) 99755-3465`
- Localidade: Jacupiranga, SP — Brasil
- Copyright: `© 2026 Victor Theodoro`
