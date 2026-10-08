(() => {
  const telegramUrl = 'https://t.me/svetaserm';
  const requestEndpoint = 'https://shiny-smoke-e2b6.moiseevasveta990.workers.dev/';

  document.querySelectorAll('[data-telegram]').forEach((link) => {
    link.href = telegramUrl;
  });

  if (window.lucide) {
    window.lucide.createIcons();
  }

  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#site-nav');
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
    });
    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Открыть меню');
    }));
  }

  const calculator = document.querySelector('.calculator');
  const calculatorRows = document.querySelector('[data-calculator-rows]');
  const calculatorRowTemplate = document.querySelector('[data-calculator-row-template]');
  const addCalculatorRow = document.querySelector('[data-add-calculator-row]');
  const total = document.querySelector('[data-order-total]');
  const orderSummary = document.querySelector('[data-order-summary]');
  const serviceCards = document.querySelectorAll('[data-platform-target]');

  const normalizeCount = (input) => {
    const parsed = Number.parseInt(input?.value || '5', 10);
    return Math.min(1000, Math.max(5, Number.isFinite(parsed) ? parsed : 5));
  };
  const formatRubles = (value) => `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;
  const pluralize = (value, one, few, many) => {
    const remainder = value % 100;
    if (remainder >= 11 && remainder <= 14) return many;
    const lastDigit = value % 10;
    if (lastDigit === 1) return one;
    if (lastDigit >= 2 && lastDigit <= 4) return few;
    return many;
  };
  const getCalculatorRows = () => [...(calculatorRows?.querySelectorAll('[data-calculator-row]') || [])];

  const syncCalculatorRowControls = () => {
    const rows = getCalculatorRows();
    rows.forEach((row) => {
      const removeButton = row.querySelector('[data-remove-calculator-row]');
      if (removeButton) removeButton.hidden = rows.length === 1;
    });
  };

  const updateCalculator = () => {
    const rows = getCalculatorRows();
    if (!rows.length || !total) return;
    let totalPrice = 0;
    let totalReviews = 0;
    const selectedPlatforms = new Set();

    rows.forEach((row) => {
      const select = row.querySelector('[data-platform-select]');
      const input = row.querySelector('[data-review-count]');
      const count = normalizeCount(input);
      const price = Number(select?.selectedOptions[0]?.dataset.price || 0);
      if (input) input.value = String(count);
      totalPrice += price * count;
      totalReviews += count;
      if (select?.value) selectedPlatforms.add(select.value);
    });

    total.textContent = formatRubles(totalPrice);
    if (orderSummary) orderSummary.textContent = `${rows.length} ${pluralize(rows.length, 'площадка', 'площадки', 'площадок')} · ${totalReviews} ${pluralize(totalReviews, 'отзыв', 'отзыва', 'отзывов')}`;
    serviceCards.forEach((card) => card.classList.toggle('is-selected', selectedPlatforms.has(card.dataset.platformTarget)));
  };

  const addPlatformRow = () => {
    if (!calculatorRows || !calculatorRowTemplate) return;
    const primarySelect = calculatorRows.querySelector('[data-platform-select]');
    const rowFragment = calculatorRowTemplate.content.cloneNode(true);
    const select = rowFragment.querySelector('[data-platform-select]');
    if (select && primarySelect) select.innerHTML = primarySelect.innerHTML;
    calculatorRows.append(rowFragment);
    if (window.lucide) window.lucide.createIcons({ nodes: [calculatorRows.lastElementChild] });
    syncCalculatorRowControls();
    updateCalculator();
  };

  calculator?.addEventListener('input', (event) => {
    if (event.target.matches('[data-review-count]')) updateCalculator();
  });
  calculator?.addEventListener('change', (event) => {
    if (event.target.matches('[data-platform-select]')) updateCalculator();
  });
  calculator?.addEventListener('click', (event) => {
    const countButton = event.target.closest('[data-count-change]');
    if (countButton) {
      const input = countButton.closest('[data-calculator-row]')?.querySelector('[data-review-count]');
      if (input) input.value = String(normalizeCount(input) + Number(countButton.dataset.countChange));
      updateCalculator();
      return;
    }
    if (event.target.closest('[data-add-calculator-row]')) {
      addPlatformRow();
      return;
    }
    const removeButton = event.target.closest('[data-remove-calculator-row]');
    if (removeButton) {
      removeButton.closest('[data-calculator-row]')?.remove();
      syncCalculatorRowControls();
      updateCalculator();
    }
  });
  serviceCards.forEach((card) => card.addEventListener('click', () => {
    const platformSelect = calculatorRows?.querySelector('[data-calculator-row]:first-child [data-platform-select]');
    if (!platformSelect || !card.dataset.platformTarget) return;
    platformSelect.value = card.dataset.platformTarget;
    updateCalculator();
    document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }));
  syncCalculatorRowControls();
  updateCalculator();

  const platformGrid = document.querySelector('[data-platform-grid]');
  const showPlatforms = document.querySelector('[data-show-platforms]');
  showPlatforms?.addEventListener('click', () => {
    const expanded = platformGrid?.classList.toggle('is-expanded');
    showPlatforms.innerHTML = expanded
      ? 'Скрыть дополнительные площадки <i data-lucide="arrow-up" aria-hidden="true"></i>'
      : 'Посмотреть все площадки <i data-lucide="arrow-right" aria-hidden="true"></i>';
    if (window.lucide) window.lucide.createIcons({ nodes: [showPlatforms] });
  });

  document.querySelectorAll('.faq-item button').forEach((button) => button.addEventListener('click', () => {
    const item = button.closest('.faq-item');
    const wasOpen = item?.classList.contains('is-open');
    document.querySelectorAll('.faq-item').forEach((faq) => {
      faq.classList.remove('is-open');
      faq.querySelector('button')?.setAttribute('aria-expanded', 'false');
    });
    if (!wasOpen && item) {
      item.classList.add('is-open');
      button.setAttribute('aria-expanded', 'true');
    }
  }));

  const form = document.querySelector('[data-stepper-form]');
  if (form) {
    let activeStep = 1;
    const steps = [...form.querySelectorAll('[data-form-step]')];
    const dots = [...form.querySelectorAll('[data-step-dot]')];
    const back = form.querySelector('[data-form-back]');
    const next = form.querySelector('[data-form-next]');
    const submit = form.querySelector('[data-form-submit]');
    const maxPhone = form.elements.max_phone;
    const telegramUsername = form.elements.telegram;
    const primaryPlatform = form.querySelector('[data-primary-platform]');
    const additionalPlatformList = form.querySelector('[data-additional-platform-list]');
    const platformTemplate = form.querySelector('[data-platform-template]');
    const addPlatform = form.querySelector('[data-add-platform]');
    const formStatus = form.querySelector('[data-form-status]');

    const renderStep = () => {
      steps.forEach((step) => step.classList.toggle('is-active', Number(step.dataset.formStep) === activeStep));
      dots.forEach((dot) => dot.classList.toggle('is-active', Number(dot.dataset.stepDot) === activeStep));
      if (back) back.hidden = activeStep === 1;
      if (next) next.hidden = activeStep === steps.length;
      if (submit) submit.hidden = activeStep !== steps.length;
    };
    const validateCurrent = () => {
      const current = steps.find((step) => Number(step.dataset.formStep) === activeStep);
      if (activeStep === 1 && maxPhone && telegramUsername) {
        const hasContact = Boolean(maxPhone.value.trim() || telegramUsername.value.trim());
        telegramUsername.setCustomValidity(hasContact ? '' : 'Укажите номер в MAX или username в Telegram.');
        if (!hasContact) {
          telegramUsername.reportValidity();
          return false;
        }
      }
      const required = current?.querySelectorAll('[required]') || [];
      return [...required].every((input) => input.reportValidity());
    };

    [maxPhone, telegramUsername].filter(Boolean).forEach((input) => input.addEventListener('input', () => {
      if (maxPhone?.value.trim() || telegramUsername?.value.trim()) telegramUsername?.setCustomValidity('');
    }));
    primaryPlatform?.addEventListener('change', () => {
      if (addPlatform) addPlatform.hidden = !primaryPlatform.value;
    });
    addPlatform?.addEventListener('click', () => {
      if (!additionalPlatformList || !platformTemplate) return;
      const platformRow = platformTemplate.content.cloneNode(true);
      additionalPlatformList.append(platformRow);
      if (window.lucide) window.lucide.createIcons({ nodes: [additionalPlatformList.lastElementChild] });
    });
    additionalPlatformList?.addEventListener('click', (event) => {
      const removeButton = event.target.closest('[data-remove-platform]');
      if (!removeButton) return;
      removeButton.closest('.additional-platform')?.remove();
    });
    next?.addEventListener('click', () => {
      if (!validateCurrent()) return;
      activeStep = Math.min(steps.length, activeStep + 1);
      renderStep();
    });
    back?.addEventListener('click', () => {
      activeStep = Math.max(1, activeStep - 1);
      renderStep();
    });
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!validateCurrent()) return;
      const data = new FormData(form);
      const payload = {
        max_phone: data.get('max_phone')?.trim() || '',
        telegram: data.get('telegram')?.trim() || '',
        volume: data.get('volume')?.trim() || '',
        platforms: data.getAll('platforms[]').filter(Boolean),
        message: data.get('message')?.trim() || '',
        page: window.location.href,
      };

      if (formStatus) {
        formStatus.hidden = false;
        formStatus.textContent = requestEndpoint
          ? 'Отправляем заявку...'
          : 'Отправка в Telegram почти готова. Осталось подключить URL Cloudflare Worker.';
      }
      if (!requestEndpoint) return;

      submit.disabled = true;
      try {
        const response = await fetch(requestEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('Request failed');
        form.reset();
        additionalPlatformList?.replaceChildren();
        activeStep = 1;
        renderStep();
        if (formStatus) {
          formStatus.hidden = false;
          formStatus.textContent = 'Заявка отправлена. Скоро свяжемся с вами.';
        }
      } catch (error) {
        if (formStatus) {
          formStatus.hidden = false;
          formStatus.textContent = 'Не удалось отправить заявку. Напишите нам в Telegram.';
        }
      } finally {
        submit.disabled = false;
      }
    });
    renderStep();
  }

  const lightbox = document.querySelector('[data-lightbox]');
  const lightboxImage = document.querySelector('[data-lightbox-content]');
  const closeLightbox = () => {
    lightbox?.setAttribute('hidden', '');
    document.body.style.overflow = '';
  };
  document.querySelectorAll('[data-lightbox-image]').forEach((button) => button.addEventListener('click', () => {
    if (!lightbox || !lightboxImage) return;
    lightboxImage.src = button.dataset.lightboxImage || '';
    lightboxImage.alt = button.dataset.lightboxTitle || 'Кейс NetProfit';
    lightbox.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
  }));
  lightbox?.querySelector('.lightbox__close')?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (event) => { if (event.target === lightbox) closeLightbox(); });
  window.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeLightbox(); });

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }), { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach((item) => observer.observe(item));
  } else {
    document.querySelectorAll('.reveal').forEach((item) => item.classList.add('is-visible'));
  }
})();
