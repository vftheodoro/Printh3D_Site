/* ========================================
   PRINTH3D — APP.JS
   Inicialização geral, menu, animações
   ======================================== */

const App = (() => {

  /**
   * Inicialização geral (chamado em todas as páginas)
   */
  function init() {
    initHeader();
    initMobileMenu();
    initScrollAnimations();
    initPageRouter();
  }

  // ── HEADER ──
  function initHeader() {
    const header = document.querySelector('.header');
    if (!header) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // ── MENU MOBILE ──
  function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    if (!hamburger || !navMenu) return;

    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('open');
      document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
    });

    // Fechar ao clicar em um link
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ── ANIMAÇÕES ON SCROLL ──
  function initScrollAnimations() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    if (elements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    elements.forEach(el => observer.observe(el));
  }

  // ── ROTEAMENTO POR PÁGINA ──
  function initPageRouter() {
    const page = document.body.dataset.page;

    switch (page) {
      case 'home':
        // Home não precisa de init específico
        break;
      case 'catalog':
        Products.initCatalog();
        break;
      case 'product-detail':
        Products.initDetail();
        break;
      case 'budget':
        Budget.init();
        break;
    }
  }

  // ── TOAST / NOTIFICAÇÃO ──
  function showToast(message, type = 'success') {
    // Remover toast existente
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Mostrar
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Esconder após 3 segundos
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ── API PÚBLICA ──
  return {
    init,
    showToast
  };

})();

// ── AUTO-INIT ──
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
