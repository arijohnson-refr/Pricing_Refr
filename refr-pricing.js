// Refr Sports

document.addEventListener('DOMContentLoaded', () => {
  const DISCOUNT_RATE = 0.65;

  // Always show 2 decimals when there are cents (e.g. 0.50, 1.20)
  const formatCurrency = (value) => {
    const rounded = Math.round(value * 100) / 100;
    const isWhole = Number.isInteger(rounded);

    return rounded.toLocaleString(undefined, {
      minimumFractionDigits: isWhole ? 0 : 2,
      maximumFractionDigits: isWhole ? 0 : 2
    });
  };

  // Original (pre-discount) pricing — UPDATED BASE PRICES
  const plans = [
    {
      className: 'pricing-plan-card-starter',
      basePrice: 240,     // 20/mo → 240 yearly
      included: 200,
      extraPrice: 1.25
    },
    {
      className: 'pricing-plan-card-professional',
      basePrice: 720,     // 60/mo → 720 yearly
      included: 1000,
      extraPrice: 0.75
    },
    {
      className: 'pricing-plan-card-commercial',
      basePrice: 2400,    // 200/mo → 2400 yearly
      included: 5000,
      extraPrice: 0.50
    }
  ];

  plans.forEach(plan => {
    const card = document.querySelector(`.${plan.className}`);
    if (!card) return;

    const dropdown = card.querySelector('.pricing-plan-dropdown');
    const dropdownToggle = dropdown.querySelector('.w-dropdown-toggle');
    const dropdownList = dropdown.querySelector('.w-dropdown-list');
    const dropdownLinks = dropdownList.querySelectorAll('a');
    const priceHeader = card.querySelector('.pricing-plan-price');
    const toggleLabel = dropdown.querySelector('.pricing-plan-dropdown-text');
    const priceNote = card.querySelector('.pricing-plan-price-note');

    const includedGames = card.querySelector('.pricing-plan-included-games');
    const extraGames = card.querySelector('.pricing-plan-extra-games');
    const totalGames = card.querySelector('.pricing-plan-total-games');
    const basePrice = card.querySelector('.pricing-plan-base-price');
    const additionalCost = card.querySelector('.pricing-plan-additional-cost');
    const annualTotal = card.querySelector('.pricing-plan-annual-total');
    const effectiveCost = card.querySelector('.pricing-plan-effective-cost');

    const setRow = (el, label, value, highlight = false, divider = false) => {
      if (!el) return;
      el.innerHTML = `
        <span class="pricing-plan-totals-label">${label}</span>
        <span class="pricing-plan-totals-value ${highlight ? 'highlight' : ''}">${value}</span>
      `;
      if (divider) el.classList.add('divider');
    };

    const flash = (el) => {
      if (!el) return;
      el.classList.add('changed');
      setTimeout(() => el.classList.remove('changed'), 650);
    };

    // Display monthly price (annual ÷ 12) in header
    const setPriceHeader = (originalTotal, discountedTotal) => {
      if (!priceHeader) return;

      const originalMonthly = originalTotal / 12;
      const discountedMonthly = discountedTotal / 12;

      priceHeader.innerHTML = `
        <span class="pricing-price-original">$${formatCurrency(originalMonthly)}</span>
        <span class="pricing-price-discount">$${formatCurrency(discountedMonthly)}</span>
      `;
    };

    // ---------- Default setup (0 extra games) ----------
    const defaultOption = dropdown.querySelector('a[data-extra-games="0"]') || dropdownLinks[0];
    if (defaultOption) toggleLabel.textContent = defaultOption.textContent.trim();

    const defaultOriginalTotal = plan.basePrice;
    const defaultDiscountedTotal = defaultOriginalTotal * DISCOUNT_RATE;

    setPriceHeader(defaultOriginalTotal, defaultDiscountedTotal);

    if (priceNote) {
      priceNote.textContent =
        `Black Friday 35% off – was $${formatCurrency(defaultOriginalTotal)}, now $${formatCurrency(defaultDiscountedTotal)}.`;
    }

    setRow(includedGames, 'Included games:', plan.included.toLocaleString());
    setRow(extraGames, 'Extra games:', '+0');
    setRow(totalGames, 'Total games:', plan.included.toLocaleString(), true);
    setRow(basePrice, 'Base price (pre-discount):', `$${formatCurrency(plan.basePrice)}`);
    setRow(additionalCost, 'Additional cost (pre-discount):', '+$0');
    setRow(
      annualTotal,
      'Total:',
      `$${formatCurrency(defaultDiscountedTotal)} (was $${formatCurrency(defaultOriginalTotal)})`,
      true,
      true
    );
    setRow(
      effectiveCost,
      'Effective cost per game (BF):',
      `$${(defaultDiscountedTotal / plan.included).toFixed(2)}`
    );

    // ---------- Toggle dropdown ----------
    dropdownToggle.addEventListener('click', e => {
      e.preventDefault();
      dropdown.classList.toggle('w--open');
      dropdownList.style.display = dropdown.classList.contains('w--open') ? 'block' : 'none';
    });

    // ---------- Update logic on selection ----------
    dropdownLinks.forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();

        const extra = parseInt(link.getAttribute('data-extra-games')) || 0;
        const totalExtraCost = extra * plan.extraPrice;

        // original totals (pre-discount)
        const originalTotalCost = plan.basePrice + totalExtraCost;
        const totalGameCount = plan.included + extra;

        // discounted totals
        const discountedTotalCost = originalTotalCost * DISCOUNT_RATE;
        const costPerGame = (discountedTotalCost / totalGameCount).toFixed(2);

        const includedFormatted = plan.included.toLocaleString();
        const extraFormatted = `+${extra.toLocaleString()}`;
        const totalFormatted = totalGameCount.toLocaleString();

        setRow(includedGames, 'Included games:', includedFormatted);
        setRow(extraGames, 'Extra games:', extraFormatted);
        setRow(totalGames, 'Total games:', totalFormatted, true);
        setRow(basePrice, 'Base price (pre-discount):', `$${formatCurrency(plan.basePrice)}`);
        setRow(
          additionalCost,
          'Additional cost (pre-discount):',
          `+$${formatCurrency(totalExtraCost)}`
        );
        setRow(
          annualTotal,
          'Total:',
          `$${formatCurrency(discountedTotalCost)} (was $${formatCurrency(originalTotalCost)})`,
          true,
          true
        );
        setRow(
          effectiveCost,
          'Effective cost per game (BF):',
          `$${costPerGame}`
        );

        // Header still uses annual totals internally, but displays monthly
        setPriceHeader(originalTotalCost, discountedTotalCost);
        toggleLabel.textContent = link.textContent.trim();

        if (priceNote) {
          priceNote.textContent =
            `Black Friday 35% off – was $${formatCurrency(originalTotalCost)}, now $${formatCurrency(discountedTotalCost)} for ${totalFormatted} games.`;
        }

        flash(priceHeader);
        flash(annualTotal);
        flash(totalGames);
        flash(additionalCost);

        dropdown.classList.remove('w--open');
        dropdownList.style.display = 'none';
      });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', e => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('w--open');
        dropdownList.style.display = 'none';
      }
    });
  });
});

// ===== START FREE TRIAL MODAL — Webflow + Customer.io =====
document.addEventListener('DOMContentLoaded', () => {
  const overlay  = document.getElementById('trial-modal-overlay');
  const form     = document.getElementById('trial-modal-form');
  const errorEl  = document.getElementById('trial-modal-error');
  const closeBtn = document.querySelector('.trial-modal-close');

  const TRIAL_URL = 'https://app.refrsports.com/signup';

  if (!overlay || !form) {
    console.warn('[Trial Modal] Overlay or form not found in DOM – modal JS skipped.');
    return;
  }

  // ------- Modal open / close -------
  const openModal = () => {
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');

    const firstInput = document.getElementById('trial-first-name');
    if (firstInput) firstInput.focus();
  };

  const closeModal = () => {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    if (errorEl) errorEl.textContent = '';
    form.reset();
  };

  // Attach to all Start Free Trial buttons
  const trialButtons = document.querySelectorAll('[data-trial-btn="true"]');
  trialButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openModal();
    });
  });

  // Close button
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
    });
  }

  // Click outside modal
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeModal();
    }
  });

  // ESC key closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
      closeModal();
    }
  });

  // ------- Customer.io helper (role_id included) -------
  const sendToCustomerIO = ({ email, firstName, lastName, roleId }) => {
    const traits = {
      email: email,
      first_name: firstName,
      last_name: lastName,
      role_id: roleId
    };

    const doSend = () => {
      try {
        // New JS client (cioanalytics)
        if (window.cioanalytics && typeof window.cioanalytics.identify === 'function') {
          console.log('[Customer.io] identify via cioanalytics', { email, traits });

          // email as id
          window.cioanalytics.identify(email, traits);

          if (typeof window.cioanalytics.track === 'function') {
            window.cioanalytics.track('pricing_start_free_trial', {
              source: 'pricing_page_modal',
              role_id: roleId
            });
          }
        }
        // Legacy client (_cio) fallback
        else if (window._cio && typeof window._cio.identify === 'function') {
          console.log('[Customer.io] identify via _cio', { email, traits });

          window._cio.identify({
            id: email,
            email: email,
            first_name: firstName,
            last_name: lastName,
            role_id: roleId,
            created_at: Math.floor(Date.now() / 1000)
          });

          if (typeof window._cio.track === 'function') {
            window._cio.track('pricing_start_free_trial', {
              source: 'pricing_page_modal',
              role_id: roleId
            });
          }
        } else {
          console.warn('[Customer.io] client not detected (cioanalytics / _cio missing).');
        }
      } catch (err) {
        console.error('[Customer.io] Error sending data', err);
      }
    };

    // If available, wait for cioanalytics to be fully ready
    if (window.cioanalytics && typeof window.cioanalytics.ready === 'function') {
      window.cioanalytics.ready(() => {
        console.log('[Customer.io] ready() fired – sending identify/track');
        doSend();
      });
    } else {
      doSend();
    }
  };

  // ------- Form submit handler -------
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const firstName  = (document.getElementById('trial-first-name')?.value || '').trim();
    const lastName   = (document.getElementById('trial-last-name')?.value || '').trim();
    const email      = (document.getElementById('trial-email')?.value || '').trim();
    const accountType = (document.getElementById('trial-account-type')?.value || '').trim();

    // Validation
    if (!firstName || !lastName || !email || !accountType) {
      if (errorEl) errorEl.textContent = 'Please fill out all fields before continuing.';
      return;
    }

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      if (errorEl) errorEl.textContent = 'Please enter a valid email address.';
      return;
    }

    if (errorEl) errorEl.textContent = '';

    // 1) Send to Customer.io with role_id
    sendToCustomerIO({
      email,
      firstName,
      lastName,
      roleId: accountType   // "referee" / "assignor" / "sports_organization"
    });

    // 2) Open signup in a new tab
    window.open(TRIAL_URL, '_blank', 'noopener');

    // 3) Let Webflow store the submission
    form.submit();

    // 4) Close modal
    closeModal();
  });
});
