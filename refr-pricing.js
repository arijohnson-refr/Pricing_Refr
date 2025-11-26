// Refr Sports

document.addEventListener('DOMContentLoaded', () => {
  const DISCOUNT_RATE = 0.65; // 35% off
  const MONTHS_IN_YEAR = 12;

  const formatCurrency = (value) => {
    // Normalize to 2 decimal places to avoid float weirdness
    const rounded = Math.round(value * 100) / 100;
    const isWhole = Number.isInteger(rounded);

    return rounded.toLocaleString(undefined, {
      minimumFractionDigits: isWhole ? 0 : 2,
      maximumFractionDigits: isWhole ? 0 : 2
    });
  };

  const formatMoney = (value) => `$${formatCurrency(value)}`;

  // Original (pre-discount) annual pricing
  const plans = [
    {
      className: 'pricing-plan-card-starter',
      basePrice: 250,
      included: 200,
      extraPrice: 1.25
    },
    {
      className: 'pricing-plan-card-professional',
      basePrice: 750,
      included: 1000,
      extraPrice: 0.75
    },
    {
      className: 'pricing-plan-card-commercial',
      basePrice: 2500,
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

    const setPriceHeader = (originalAnnual, discountedAnnual) => {
      if (!priceHeader) return;

      const originalMonthly = originalAnnual / MONTHS_IN_YEAR;
      const discountedMonthly = discountedAnnual / MONTHS_IN_YEAR;

      priceHeader.innerHTML = `
        <span class="pricing-price-original">${formatMoney(originalMonthly)}/mo</span>
        <span class="pricing-price-discount">${formatMoney(discountedMonthly)}/mo</span>
      `;
    };

    // ---------- Default setup (0 extra games) ----------
    const defaultOption = dropdown.querySelector('a[data-extra-games="0"]') || dropdownLinks[0];
    if (defaultOption) toggleLabel.textContent = defaultOption.textContent.trim();

    const defaultOriginalAnnual = plan.basePrice;
    const defaultDiscountedAnnual = defaultOriginalAnnual * DISCOUNT_RATE;

    const defaultOriginalMonthly = defaultOriginalAnnual / MONTHS_IN_YEAR;
    const defaultDiscountedMonthly = defaultDiscountedAnnual / MONTHS_IN_YEAR;

    setPriceHeader(defaultOriginalAnnual, defaultDiscountedAnnual);

    if (priceNote) {
      priceNote.textContent =
        `Black Friday 35% off – was ${formatMoney(defaultOriginalMonthly)}/mo, now ${formatMoney(defaultDiscountedMonthly)}/mo.`;
    }

    setRow(includedGames, 'Included games:', plan.included.toLocaleString());
    setRow(extraGames, 'Extra games:', '+0');
    setRow(totalGames, 'Total games:', plan.included.toLocaleString(), true);

    setRow(
      basePrice,
      'Base price (pre-discount, per month):',
      `${formatMoney(defaultOriginalMonthly)}/mo`
    );
    setRow(
      additionalCost,
      'Additional cost (pre-discount, per month):',
      '+$0/mo'
    );
    setRow(
      annualTotal,
      'Total per month:',
      `${formatMoney(defaultDiscountedMonthly)}/mo (was ${formatMoney(defaultOriginalMonthly)}/mo)`,
      true,
      true
    );

    const defaultCostPerGameMonthly = defaultDiscountedMonthly / plan.included;
    setRow(
      effectiveCost,
      'Effective cost per game (BF, per month):',
      formatMoney(defaultCostPerGameMonthly)
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

        // Annual math (source of truth)
        const totalExtraCostAnnual = extra * plan.extraPrice;
        const originalAnnualTotal = plan.basePrice + totalExtraCostAnnual;
        const discountedAnnualTotal = originalAnnualTotal * DISCOUNT_RATE;
        const totalGameCount = plan.included + extra;

        // Monthly values for display
        const baseMonthly = plan.basePrice / MONTHS_IN_YEAR;
        const extraMonthly = totalExtraCostAnnual / MONTHS_IN_YEAR;
        const originalMonthlyTotal = originalAnnualTotal / MONTHS_IN_YEAR;
        const discountedMonthlyTotal = discountedAnnualTotal / MONTHS_IN_YEAR;
        const costPerGameMonthly = discountedMonthlyTotal / totalGameCount;

        const includedFormatted = plan.included.toLocaleString();
        const extraFormatted = `+${extra.toLocaleString()}`;
        const totalFormatted = totalGameCount.toLocaleString();

        setRow(includedGames, 'Included games:', includedFormatted);
        setRow(extraGames, 'Extra games:', extraFormatted);
        setRow(totalGames, 'Total games:', totalFormatted, true);

        setRow(
          basePrice,
          'Base price (pre-discount, per month):',
          `${formatMoney(baseMonthly)}/mo`
        );
        setRow(
          additionalCost,
          'Additional cost (pre-discount, per month):',
          extra > 0 ? `+${formatMoney(extraMonthly)}/mo` : '+$0/mo'
        );
        setRow(
          annualTotal,
          'Total per month:',
          `${formatMoney(discountedMonthlyTotal)}/mo (was ${formatMoney(originalMonthlyTotal)}/mo)`,
          true,
          true
        );
        setRow(
          effectiveCost,
          'Effective cost per game (BF, per month):',
          formatMoney(costPerGameMonthly)
        );

        setPriceHeader(originalAnnualTotal, discountedAnnualTotal);
        toggleLabel.textContent = link.textContent.trim();

        if (priceNote) {
          priceNote.textContent =
            `Black Friday 35% off – was ${formatMoney(originalMonthlyTotal)}/mo, now ${formatMoney(discountedMonthlyTotal)}/mo for ${totalFormatted} games.`;
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
