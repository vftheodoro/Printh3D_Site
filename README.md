# Printh3D Site

Site institucional/comercial para impressão 3D, com catálogo local de produtos, orçamento inteligente simplificado e envio direto para WhatsApp.

## Visão geral

Este projeto é um site estático (HTML, CSS e JavaScript puro), sem backend, com foco em:

- Apresentação da marca Printh3D
- Catálogo de produtos com busca inteligente e sugestões
- Simulador de orçamento adaptativo para usuários leigos
- Conversão direta para contato e fechamento via WhatsApp

## Stack

- HTML5
- CSS3 (arquivo único em `css/style.css`)
- JavaScript Vanilla modular (IIFE)
- Bootstrap Icons (CDN)

## Estrutura principal

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
└─ assets/
   └─ imagens/logos/
```

## Páginas em uso

- `index.html` → Home
- `views/public/produtos.html` → Catálogo
- `views/public/produto.html` → Detalhe do produto
- `views/public/orcamento.html` → Orçamento simplificado

## Como executar

Como é um projeto estático, há duas opções:

1. Abrir `index.html` direto no navegador
2. Rodar com servidor local (recomendado para navegação mais estável de paths)

Exemplo com VS Code + Live Server:

- Clique com botão direito em `index.html`
- Selecione **Open with Live Server**

## Fluxo funcional resumido

1. Usuário entra na Home e acessa Produtos ou Orçamento
2. No catálogo, pode buscar por nome/categoria/material com sugestões em tempo real
3. No detalhe, seleciona cor/acabamento e envia intenção de compra por WhatsApp
4. No orçamento, informa uso da peça + dimensões + preferências e recebe faixa estimada
5. O pedido/orçamento é salvo localmente e enviado por WhatsApp com dados estruturados

## Módulos JavaScript

- `js/app.js`
  - Inicialização global
  - Menu mobile
  - Animações on-scroll
  - Router por `data-page`
  - Toasts

- `js/products.js`
  - Catálogo local (`catalog`)
  - Busca inteligente com score
  - Sugestões com teclado
  - Renderização de cards e detalhe
  - Disparo de compra via WhatsApp

- `js/budget.js`
  - Fluxo adaptativo de orçamento
  - Cálculo por dimensão/uso/preenchimento/complexidade/acabamento
  - Preview visual da peça
  - Envio de estimativa via WhatsApp

- `js/whatsapp.js`
  - Montagem de mensagens (produto/orçamento/contato)
  - Geração de link `wa.me`

- `js/storage.js`
  - Persistência em `localStorage` e `sessionStorage`
  - Histórico de orçamento/pedidos/visualização
  - Estrutura de usuário/sessão (legado para futura área de cliente)

## Configurações rápidas

### Número do WhatsApp

Arquivo: `js/whatsapp.js`

```js
const PHONE_NUMBER = '5513997553465';
```

Troque para o número desejado no formato internacional sem `+`.

### Catálogo de produtos

Arquivo: `js/products.js` na constante `catalog`.

Cada item possui campos como:

- `id`
- `name`
- `shortDesc`
- `fullDesc`
- `material`
- `price`
- `colors`
- `finishes`
- `category`

### Fórmula de orçamento

Arquivo: `js/budget.js`.

Principais constantes de calibração:

- `BASE_FEE`
- `COST_PER_CM3`
- `USE_CASES`
- `FINISH_MULTIPLIERS`
- `DETAIL_MULTIPLIERS`
- `URGENCY_MULTIPLIERS`
- `SHAPE_MULTIPLIERS`
- `SHAPE_OCCUPANCY`

## Persistência local (browser)

Chaves utilizadas (`storage.js`):

- `printh3d_users`
- `printh3d_session`
- `printh3d_budgets`
- `printh3d_orders`
- `printh3d_product_history`

## Próximos passos recomendados

- Criar backend/API para persistência real e painel administrativo
- Substituir catálogo local por endpoint externo
- Adicionar testes de regressão para cálculo de orçamento

## Autor

- Victor Theodoro
- Jacupiranga, SP — Brasil
- E-mail: printh3d@outlook.com
