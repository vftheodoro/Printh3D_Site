/* ========================================
   PRINTH3D — STORAGE.JS
   Gerenciamento de dados locais
   Usuários, Sessão, Orçamentos, Histórico
   ======================================== */

const Storage = (() => {

  // ── CHAVES DO LOCALSTORAGE ──
  const KEYS = {
    USERS: 'printh3d_users',
    SESSION: 'printh3d_session',
    BUDGETS: 'printh3d_budgets',
    ORDERS: 'printh3d_orders',
    PRODUCT_HISTORY: 'printh3d_product_history'
  };

  // ── HELPERS ──
  function _get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Storage._get error:', e);
      return null;
    }
  }

  function _set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage._set error:', e);
    }
  }

  function _sessionGet(key) {
    try {
      const data = sessionStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  function _sessionSet(key, value) {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage._sessionSet error:', e);
    }
  }

  // ── HASH SHA-256 ──
  async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // ══════════════════════════════════════
  // USUÁRIOS
  // TODO: Substituir por chamada à API quando houver área de cliente
  // ══════════════════════════════════════

  function getUsers() {
    return _get(KEYS.USERS) || [];
  }

  function findUserByEmail(email) {
    const users = getUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  async function registerUser({ name, email, phone, password }) {
    const users = getUsers();

    if (findUserByEmail(email)) {
      return { success: false, message: 'Este e-mail já está cadastrado.' };
    }

    const hashedPassword = await hashPassword(password);

    const user = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      name,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    users.push(user);
    _set(KEYS.USERS, users);

    return { success: true, user: { id: user.id, name: user.name, email: user.email, phone: user.phone } };
  }

  async function loginUser(email, password) {
    const user = findUserByEmail(email);
    if (!user) {
      return { success: false, message: 'E-mail ou senha incorretos.' };
    }

    const hashedPassword = await hashPassword(password);
    if (user.password !== hashedPassword) {
      return { success: false, message: 'E-mail ou senha incorretos.' };
    }

    // Criar sessão
    const session = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      loggedAt: new Date().toISOString()
    };

    _sessionSet(KEYS.SESSION, session);
    return { success: true, user: session };
  }

  function logout() {
    sessionStorage.removeItem(KEYS.SESSION);
  }

  function getLoggedUser() {
    return _sessionGet(KEYS.SESSION);
  }

  function isAuthenticated() {
    return getLoggedUser() !== null;
  }

  function updateUser(updatedData) {
    // TODO: Substituir por chamada à API — PUT /api/users/:id
    const users = getUsers();
    const session = getLoggedUser();
    if (!session) return { success: false, message: 'Não autenticado.' };

    const index = users.findIndex(u => u.id === session.id);
    if (index === -1) return { success: false, message: 'Usuário não encontrado.' };

    if (updatedData.name) users[index].name = updatedData.name;
    if (updatedData.phone) users[index].phone = updatedData.phone;

    _set(KEYS.USERS, users);

    // Atualizar sessão
    const newSession = { ...session, ...updatedData };
    _sessionSet(KEYS.SESSION, newSession);

    return { success: true };
  }

  // ══════════════════════════════════════
  // ORÇAMENTOS
  // TODO: Substituir por chamada à API — POST /api/budgets, GET /api/budgets?userId=
  // ══════════════════════════════════════

  function saveBudget(budget) {
    const budgets = getBudgets();
    const budgetData = {
      id: 'ORC-' + Date.now().toString(36).toUpperCase(),
      ...budget,
      userId: getLoggedUser()?.id || 'guest',
      date: new Date().toISOString(),
      status: 'Enviado'
    };
    budgets.push(budgetData);
    _set(KEYS.BUDGETS, budgets);
    return budgetData;
  }

  function getBudgets() {
    return _get(KEYS.BUDGETS) || [];
  }

  function getUserBudgets() {
    const user = getLoggedUser();
    if (!user) return [];
    return getBudgets().filter(b => b.userId === user.id);
  }

  // ══════════════════════════════════════
  // PEDIDOS (estrutura para futura integração)
  // TODO: Substituir por chamada à API — GET /api/orders?userId=, PATCH /api/orders/:id/status
  // ══════════════════════════════════════

  function saveOrder(order) {
    const orders = getOrders();
    const orderData = {
      id: 'PED-' + Date.now().toString(36).toUpperCase(),
      ...order,
      userId: getLoggedUser()?.id || 'guest',
      date: new Date().toISOString(),
      status: 'Enviado'
    };
    orders.push(orderData);
    _set(KEYS.ORDERS, orders);
    return orderData;
  }

  function getOrders() {
    return _get(KEYS.ORDERS) || [];
  }

  function getUserOrders() {
    const user = getLoggedUser();
    if (!user) return [];
    return getOrders().filter(o => o.userId === user.id);
  }

  // ══════════════════════════════════════
  // HISTÓRICO DE PRODUTOS CONSULTADOS
  // TODO: Substituir por chamada à API — POST /api/history, GET /api/history?userId=
  // ══════════════════════════════════════

  function saveProductView(product) {
    const history = getProductHistory();
    // Evitar duplicatas consecutivas
    if (history.length > 0 && history[history.length - 1].productId === product.id) return;

    history.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      userId: getLoggedUser()?.id || 'guest',
      date: new Date().toISOString()
    });

    // Manter apenas últimos 20
    if (history.length > 20) history.splice(0, history.length - 20);

    _set(KEYS.PRODUCT_HISTORY, history);
  }

  function getProductHistory() {
    return _get(KEYS.PRODUCT_HISTORY) || [];
  }

  function getUserProductHistory() {
    const user = getLoggedUser();
    if (!user) return [];
    return getProductHistory().filter(h => h.userId === user.id);
  }

  // ── API PÚBLICA ──
  return {
    hashPassword,
    // Usuários
    registerUser,
    loginUser,
    logout,
    getLoggedUser,
    isAuthenticated,
    updateUser,
    // Orçamentos
    saveBudget,
    getBudgets,
    getUserBudgets,
    // Pedidos
    saveOrder,
    getOrders,
    getUserOrders,
    // Histórico
    saveProductView,
    getProductHistory,
    getUserProductHistory
  };

})();
