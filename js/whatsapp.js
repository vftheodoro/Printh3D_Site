/* ========================================
   PRINTH3D — WHATSAPP.JS
   Geração automática de links para WhatsApp
   ======================================== */

const WhatsApp = (() => {

  // Número fixo do WhatsApp da Printh3D
  const PHONE_NUMBER = '5513997553465';

  /**
   * Gera URL formatada para o WhatsApp Web/App
   * @param {string} message — Mensagem a ser enviada
   * @returns {string} — URL completa do wa.me
   */
  function generateLink(message) {
    const encoded = encodeURIComponent(message);
    return `https://wa.me/${PHONE_NUMBER}?text=${encoded}`;
  }

  /**
   * Abre o WhatsApp com a mensagem fornecida
   * @param {string} message — Mensagem formatada
   */
  function open(message) {
    const url = generateLink(message);
    window.open(url, '_blank');
  }

  /**
   * Gera mensagem formatada para compra de produto
   */
  function productMessage({ name, price, material, color, finish }) {
    let msg = `Olá! Tenho interesse no produto:\n`;
    msg += `*${name}*\n\n`;
    msg += `Preço: R$ ${price.toFixed(2)}\n`;
    msg += `Material: ${material}\n`;
    if (color) msg += `Cor: ${color}\n`;
    if (finish) msg += `Acabamento: ${finish}\n`;
    msg += `\nGostaria de comprar.`;
    return msg;
  }

  /**
   * Gera mensagem formatada para orçamento personalizado
   */
  function budgetMessage(data) {
    if ('weight' in data || 'time' in data || 'material' in data) {
      const { weight, time, material, finish, quantity, deadline, notes, estimatedValue } = data;
      let msg = `Olá! Gostaria de solicitar um orçamento:\n\n`;
      msg += `*Orçamento Personalizado*\n\n`;
      msg += `Peso estimado: ${weight}g\n`;
      msg += `Tempo de impressão: ${time} min\n`;
      msg += `Material: ${material}\n`;
      msg += `Acabamento: ${finish}\n`;
      msg += `Quantidade: ${quantity}\n`;
      msg += `Prazo desejado: ${deadline}\n`;
      if (notes) msg += `Observações: ${notes}\n`;
      msg += `\n*Valor estimado: R$ ${estimatedValue.toFixed(2)}*\n`;
      msg += `\nAguardo confirmação do valor final. Obrigado!`;
      return msg;
    }

    const {
      useCaseLabel,
      width,
      height,
      depth,
      infill,
      finish,
      detailLevel,
      quantity,
      urgency,
      shapeComplexity,
      notes,
      estimatedMin,
      estimatedMax
    } = data;

    let msg = `Olá! Gostaria de solicitar um orçamento:\n\n`;
    msg += `*Orçamento simplificado (estimativa inicial)*\n\n`;
    msg += `Objetivo da peça: ${useCaseLabel}\n`;
    msg += `Dimensões (cm): ${width} x ${height} x ${depth}\n`;
    msg += `Preenchimento interno: ${infill}%\n`;
    msg += `Acabamento: ${finish}\n`;
    msg += `Nível de detalhe: ${detailLevel}\n`;
    msg += `Complexidade da forma: ${shapeComplexity}\n`;
    msg += `Quantidade: ${quantity}\n`;
    msg += `Prazo: ${urgency}\n`;
    if (notes) msg += `Observações: ${notes}\n`;
    msg += `\n*Faixa estimada: R$ ${estimatedMin.toFixed(2)} até R$ ${estimatedMax.toFixed(2)}*\n`;
    msg += `⚠️ Entendo que esta é uma estimativa inicial e o valor final pode variar após análise detalhada.\n`;
    msg += `\nAguardo confirmação do valor final. Obrigado!`;
    return msg;
  }

  /**
   * Gera mensagem genérica de contato
   */
  function contactMessage() {
    return `Olá! Vim pelo site Printh3D e gostaria de mais informações.`;
  }

  // ── API PÚBLICA ──
  return {
    generateLink,
    open,
    productMessage,
    budgetMessage,
    contactMessage
  };

})();
