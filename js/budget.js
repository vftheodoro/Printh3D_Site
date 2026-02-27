/* ========================================
   PRINTH3D — BUDGET.JS
   Orçamento simplificado e adaptativo
   ======================================== */

const Budget = (() => {

  const USE_CASES = {
    decoracao: {
      label: 'Decoração',
      description: 'Perfil recomendado para foco visual e acabamento agradável.',
      multiplier: 0.88,
      recommendation: 'Perfil sugerido: acabamento bonito com resistência moderada.'
    },
    resistente: {
      label: 'Resistente',
      description: 'Perfil recomendado para uso frequente e maior durabilidade.',
      multiplier: 1.06,
      recommendation: 'Perfil sugerido: estrutura mais firme e maior durabilidade.'
    },
    funcional: {
      label: 'Funcional',
      description: 'Perfil equilibrado para peças utilitárias do dia a dia.',
      multiplier: 0.95,
      recommendation: 'Perfil sugerido: equilíbrio entre custo e resistência.'
    },
    detalhado: {
      label: 'Detalhado',
      description: 'Perfil para peças com detalhes finos e acabamento refinado.',
      multiplier: 1.0,
      recommendation: 'Perfil sugerido: mais foco em definição e acabamento.'
    }
  };

  const FINISH_MULTIPLIERS = {
    Basico: 1.0,
    Liso: 1.08,
    Premium: 1.16
  };

  const DETAIL_MULTIPLIERS = {
    Economico: 0.88,
    Padrao: 0.95,
    Fino: 1.04
  };

  const URGENCY_MULTIPLIERS = {
    Normal: 1.0,
    Rapido: 1.08
  };

  const SHAPE_MULTIPLIERS = {
    Simples: 0.95,
    Media: 1.0,
    Complexa: 1.08
  };

  const SHAPE_OCCUPANCY = {
    Simples: 0.42,
    Media: 0.31,
    Complexa: 0.24
  };

  const BASE_FEE = 6.5;
  const COST_PER_CM3 = 0.095;

  function toNumber(value, fallback = 0) {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function getState() {
    const width = clamp(toNumber(document.getElementById('width')?.value), 0, 120);
    const height = clamp(toNumber(document.getElementById('height')?.value), 0, 120);
    const depth = clamp(toNumber(document.getElementById('depth')?.value), 0, 120);

    return {
      useCase: document.getElementById('use-case')?.value || '',
      width,
      height,
      depth,
      infill: clamp(toNumber(document.getElementById('infill')?.value, 20), 10, 100),
      finish: document.getElementById('finish')?.value || 'Basico',
      detailLevel: document.getElementById('detail-level')?.value || 'Padrao',
      quantity: Math.max(1, parseInt(document.getElementById('quantity')?.value, 10) || 1),
      urgency: document.getElementById('urgency')?.value || 'Normal',
      shapeComplexity: document.getElementById('shape-complexity')?.value || 'Simples',
      notes: document.getElementById('notes')?.value?.trim() || ''
    };
  }

  function hasMinimumData(state) {
    return Boolean(
      state.useCase
      && state.width > 0
      && state.height > 0
      && state.depth > 0
    );
  }

  function formatCurrency(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function calculateEstimate(state) {
    const useCaseData = USE_CASES[state.useCase] || USE_CASES.funcional;

    const geometricVolume = state.width * state.height * state.depth;
    const occupancyFactor = SHAPE_OCCUPANCY[state.shapeComplexity] || SHAPE_OCCUPANCY.Media;
    const infillFactor = 0.11 + ((state.infill / 100) * 0.30);
    const effectiveVolume = geometricVolume * occupancyFactor * infillFactor;

    const finishMult = FINISH_MULTIPLIERS[state.finish] || 1;
    const detailMult = DETAIL_MULTIPLIERS[state.detailLevel] || 1;
    const urgencyMult = URGENCY_MULTIPLIERS[state.urgency] || 1;
    const shapeMult = SHAPE_MULTIPLIERS[state.shapeComplexity] || 1;

    const supportAndPostFactor = state.shapeComplexity === 'Complexa' ? 1.06 : (state.shapeComplexity === 'Media' ? 1.03 : 1);
    const unitPrice = (((effectiveVolume * COST_PER_CM3) * supportAndPostFactor) + BASE_FEE)
      * useCaseData.multiplier * detailMult * shapeMult;
    const quantityDiscount = state.quantity > 1
      ? Math.max(0.72, 1 - ((state.quantity - 1) * 0.04))
      : 1;

    const total = unitPrice * state.quantity * quantityDiscount * finishMult * urgencyMult;

    const estimatedMin = total * 0.90;
    const estimatedMax = total * 1.15;

    return {
      geometricVolume,
      effectiveVolume,
      estimatedMin,
      estimatedMax,
      estimatedMid: (estimatedMin + estimatedMax) / 2,
      useCaseLabel: useCaseData.label,
      profileDescription: useCaseData.description,
      recommendation: useCaseData.recommendation,
      quantityDiscount
    };
  }

  function updateSteps(state) {
    const stepDimensions = document.getElementById('step-dimensions');
    const stepPreferences = document.getElementById('step-preferences');

    if (!stepDimensions || !stepPreferences) return;

    if (state.useCase) {
      stepDimensions.classList.remove('hidden');
    } else {
      stepDimensions.classList.add('hidden');
      stepPreferences.classList.add('hidden');
      return;
    }

    const hasDimensions = state.width > 0 && state.height > 0 && state.depth > 0;
    if (hasDimensions) {
      stepPreferences.classList.remove('hidden');
    } else {
      stepPreferences.classList.add('hidden');
    }
  }

  function updateInfillLabel(value) {
    const infillValue = document.getElementById('infill-value');
    if (infillValue) infillValue.textContent = `${Math.round(value)}%`;
  }

  function updateUseCaseCards(selected) {
    document.querySelectorAll('.usecase-card').forEach(card => {
      const active = card.dataset.useCase === selected;
      card.classList.toggle('active', active);
    });
  }

  function updatePreview(state, estimate) {
    const cube = document.getElementById('project-cube');
    const readout = document.getElementById('dimension-readout');
    const chip = document.getElementById('profile-chip');
    const profileDescription = document.getElementById('profile-description');

    if (readout) {
      readout.textContent = `L ${state.width || 0} × A ${state.height || 0} × P ${state.depth || 0} cm`;
    }

    if (chip) {
      chip.textContent = estimate ? `${estimate.useCaseLabel} • ${state.finish}` : 'Selecione o objetivo da peça';
    }

    if (profileDescription) {
      profileDescription.textContent = estimate
        ? estimate.recommendation
        : 'Com base no uso escolhido, vamos indicar o perfil ideal de resistência e acabamento.';
    }

    if (!cube) return;

    const maxDimension = Math.max(state.width || 1, state.height || 1, state.depth || 1);
    const scaleX = Math.max(0.35, (state.width || 1) / maxDimension);
    const scaleY = Math.max(0.35, (state.height || 1) / maxDimension);
    const scaleZ = Math.max(0.35, (state.depth || 1) / maxDimension);

    cube.style.setProperty('--cube-x', scaleX.toFixed(2));
    cube.style.setProperty('--cube-y', scaleY.toFixed(2));
    cube.style.setProperty('--cube-z', scaleZ.toFixed(2));
    cube.classList.toggle('formed', hasMinimumData(state));
  }

  function updateEstimate(state) {
    const resultEl = document.getElementById('budget-result');
    const valueEl = document.getElementById('estimated-value');
    const noteEl = document.getElementById('estimate-note');
    const hintEl = document.getElementById('calculate-hint');

    updateSteps(state);

    if (!hasMinimumData(state)) {
      if (resultEl) resultEl.classList.remove('show');
      if (hintEl) hintEl.classList.remove('hidden');
      if (hintEl) hintEl.innerHTML = '<p class="text-muted" style="font-size: 0.88rem;">Selecione o uso da peça e informe largura, altura e profundidade para ver a estimativa.</p>';
      updatePreview(state, null);
      return null;
    }

    const estimate = calculateEstimate(state);

    if (valueEl) {
      valueEl.textContent = `${formatCurrency(estimate.estimatedMin)} — ${formatCurrency(estimate.estimatedMax)}`;
    }

    if (noteEl) {
      noteEl.textContent = '⚠️ Estimativa inicial baseada em volume, preenchimento, complexidade e acabamento. O preço final pode variar após análise detalhada.';
    }

    if (resultEl) resultEl.classList.add('show');
    if (hintEl) hintEl.classList.add('hidden');

    updatePreview(state, estimate);
    return estimate;
  }

  function handleSubmit(event) {
    event.preventDefault();

    const state = getState();
    const estimate = updateEstimate(state);

    if (!estimate) {
      App.showToast('Selecione o uso da peça e informe as dimensões para estimar.', 'error');
      return;
    }

    const budgetData = {
      useCase: state.useCase,
      width: state.width,
      height: state.height,
      depth: state.depth,
      infill: state.infill,
      finish: state.finish,
      detailLevel: state.detailLevel,
      quantity: state.quantity,
      urgency: state.urgency,
      shapeComplexity: state.shapeComplexity,
      notes: state.notes,
      estimatedMin: Number(estimate.estimatedMin.toFixed(2)),
      estimatedMax: Number(estimate.estimatedMax.toFixed(2)),
      estimatedValue: Number(estimate.estimatedMid.toFixed(2)),
      type: 'budget'
    };

    Storage.saveBudget(budgetData);
    Storage.saveOrder(budgetData);

    const message = WhatsApp.budgetMessage({
      useCaseLabel: estimate.useCaseLabel,
      width: state.width,
      height: state.height,
      depth: state.depth,
      infill: state.infill,
      finish: state.finish,
      detailLevel: state.detailLevel,
      quantity: state.quantity,
      urgency: state.urgency,
      shapeComplexity: state.shapeComplexity,
      notes: state.notes,
      estimatedMin: estimate.estimatedMin,
      estimatedMax: estimate.estimatedMax
    });

    WhatsApp.open(message);
    App.showToast('Estimativa enviada! Abrindo WhatsApp...', 'success');
  }

  function bindEvents(form) {
    const useCaseInput = document.getElementById('use-case');
    const useCaseGrid = document.getElementById('usecase-grid');
    const infill = document.getElementById('infill');
    const toggleAdvanced = document.getElementById('toggle-advanced');
    const advancedPanel = document.getElementById('advanced-panel');

    if (useCaseGrid && useCaseInput) {
      useCaseGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.usecase-card');
        if (!card) return;

        useCaseInput.value = card.dataset.useCase;
        updateUseCaseCards(useCaseInput.value);
        updateEstimate(getState());
      });
    }

    if (infill) {
      updateInfillLabel(infill.value);
      infill.addEventListener('input', () => {
        updateInfillLabel(infill.value);
        updateEstimate(getState());
      });
    }

    if (toggleAdvanced && advancedPanel) {
      toggleAdvanced.addEventListener('click', () => {
        const open = advancedPanel.classList.toggle('hidden');
        toggleAdvanced.innerHTML = open
          ? '<i class="bi bi-gear"></i> Modo avançado (opcional)'
          : '<i class="bi bi-chevron-up"></i> Fechar modo avançado';
      });
    }

    ['width', 'height', 'depth', 'finish', 'detail-level', 'quantity', 'urgency', 'shape-complexity', 'notes']
      .forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('input', () => updateEstimate(getState()));
        el.addEventListener('change', () => updateEstimate(getState()));
      });

    form.addEventListener('submit', handleSubmit);
  }

  function init() {
    const form = document.getElementById('budget-form');
    if (!form) return;

    bindEvents(form);
    updateEstimate(getState());
  }

  return {
    init,
    calculateEstimate
  };

})();
