// Refr Sports

document.addEventListener('DOMContentLoaded', () => {
  const DISCOUNT_RATE = 0.65;

  // ✅ Updated: always show 2 decimals when there are cents (e.g. 0.50, 1.20)
  const formatCurrency = (value) => {
    const rounded = Math.round(value * 100) / 100;
    const isWhole = Number.isInteger(rounded);

    return rounded.toLocaleString(undefined, {
      minimumFractionDigits: isWhole ? 0 : 2,
      maximumFractionDigits: isWhole ? 0 : 2
    });
  };

  // Original (pre-discount) pricing
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

    // ✅ Updated: display monthly price (annual ÷ 12) in the top header
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

        // ✅ Header still uses annual totals internally, but displays monthly
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
