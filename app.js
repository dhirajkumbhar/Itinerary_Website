/* ==========================================================================
   THE ULTIMATE NORTH INDIAN TRAVEL BOOK - APP LOGIC CONTROLLER
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // --- STATE MANAGEMENT ---
  let expenses = JSON.parse(localStorage.getItem("north_india_expenses")) || [
    {
      id: 1,
      title: "Pune to Gaya Train (3A Ticket x2)",
      amount: 4800,
      category: "Transport",
      city: "Gaya",
    },
    {
      id: 2,
      title: "Hotel Vishnu Vihar Gaya (2 Days Stay)",
      amount: 3600,
      category: "Stay",
      city: "Gaya",
    },
    {
      id: 3,
      title: "Kashi Vishwanath Sugam Darshan Pass",
      amount: 600,
      category: "Puja",
      city: "Varanasi",
    },
    {
      id: 4,
      title: "Varanasi Ganges VIP Boat Ride (Aarti)",
      amount: 1500,
      category: "Puja",
      city: "Varanasi",
    },
    {
      id: 5,
      title: "Hotel Kashi Residency (3 Days Stay)",
      amount: 7500,
      category: "Stay",
      city: "Varanasi",
    },
    {
      id: 6,
      title: "Triveni Sangam Special Boat & Snan",
      amount: 800,
      category: "Puja",
      city: "Prayagraj",
    },
    {
      id: 7,
      title: "Famous Banarasi Chat & Litti Chokha",
      amount: 1200,
      category: "Food",
      city: "Varanasi",
    },
  ];

  const ESTIMATED_BUDGET = 35000;

  // --- DOM ELEMENTS ---
  const sidebar = document.getElementById("sidebar");
  const sidebarToggle = document.getElementById("sidebarToggle");
  const mobileNavToggle = document.getElementById("mobileNavToggle");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const navItems = document.querySelectorAll(".nav-item");
  const viewSections = document.querySelectorAll(".view-section");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const attractionCards = document.querySelectorAll(".attraction-card");

  // Expense Tracker DOM
  const expenseForm = document.getElementById("expenseForm");
  const expTitle = document.getElementById("expTitle");
  const expAmount = document.getElementById("expAmount");
  const expCategory = document.getElementById("expCategory");
  const expCity = document.getElementById("expCity");
  const expenseList = document.getElementById("expenseList");
  const expAdults = document.getElementById("expAdults");
  const expChildren = document.getElementById("expChildren");
  const expTransportType = document.getElementById("expTransportType");
  const expPujaType = document.getElementById("expPujaType");
  const catAllocHint = document.getElementById("catAllocHint");
  const totalExpenseDisplay = document.getElementById("totalExpenseDisplay");

  // Budget KPI DOM
  const kpiEstBudget = document.getElementById("kpiEstBudget");
  const kpiActualSpent = document.getElementById("kpiActualSpent");
  const kpiRemaining = document.getElementById("kpiRemaining");
  const printItineraryBtn = document.getElementById("printItineraryBtn");

  // --- 1. NAVIGATION & AUTO-HIDE SIDEBAR LOGIC ---

  // Sidebar Manual Toggle
  sidebarToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    sidebar.classList.toggle("collapsed");
  });

  // Mobile / tablet nav drawer (<= 992px): one open/close pair, so it can never fight itself
  let drawerOpenedAt = 0;
  function openDrawer() {
    drawerOpenedAt = Date.now();
    sidebar.classList.add("mobile-open");
    sidebarOverlay.classList.add("active");
    document.body.classList.add("nav-open");
    mobileNavToggle.setAttribute("aria-expanded", "true");
  }
  function closeDrawer() {
    sidebar.classList.remove("mobile-open");
    sidebarOverlay.classList.remove("active");
    document.body.classList.remove("nav-open");
    mobileNavToggle.setAttribute("aria-expanded", "false");
  }

  mobileNavToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    if (sidebar.classList.contains("mobile-open")) closeDrawer();
    else openDrawer();
  });

  sidebarOverlay.addEventListener("click", () => {
    if (Date.now() - drawerOpenedAt < 350) return; // ignore the touch that just opened it (ghost click)
    closeDrawer();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 992) closeDrawer();
  });

  // Auto-hide feature when mouse leaves sidebar area or on scroll
  let idleTimeout;
  function triggerSidebarAutoHide() {
    clearTimeout(idleTimeout);
    idleTimeout = setTimeout(() => {
      if (window.innerWidth > 992) {
        sidebar.classList.add("collapsed");
      }
    }, 4000); // Collapse after 4s idle
  }

  sidebar.addEventListener("mouseleave", triggerSidebarAutoHide);

  // Switch View Section Function
  window.switchView = function (targetViewId) {
    // Update Active Nav Link
    navItems.forEach((item) => {
      if (item.getAttribute("data-view") === targetViewId) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    // Update Active View Section
    viewSections.forEach((section) => {
      if (section.id === `view-${targetViewId}`) {
        section.classList.add("active");
      } else {
        section.classList.remove("active");
      }
    });

    // Close Mobile Drawer if open
    closeDrawer();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Attach click listener to nav links
  navItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const viewId = item.getAttribute("data-view");
      switchView(viewId);
      window.location.hash = viewId;
    });
  });

  // Handle URL Hash on Initial Load
  const initialHash = window.location.hash.replace("#", "");
  if (initialHash && document.getElementById(`view-${initialHash}`)) {
    switchView(initialHash);
  }

  // --- 2. SACRED ATTRACTIONS FILTER LOGIC ---
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.getAttribute("data-filter");

      attractionCards.forEach((card) => {
        const city = card.getAttribute("data-city");
        if (filter === "all" || city === filter) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      });
    });
  });

  // --- TRAIN SCHEDULE LEG FILTER LOGIC ---
  const trainLegBtns = document.querySelectorAll(
    "#view-train-details .train-leg-btn",
  );
  const trainScheduleCards = document.querySelectorAll(
    "#view-train-details .train-card",
  );

  function filterTrainLeg(selectedLeg) {
    if (!selectedLeg) return;
    trainLegBtns.forEach((btn) => {
      if (btn.getAttribute("data-train-leg") === selectedLeg) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    trainScheduleCards.forEach((card) => {
      if (card.getAttribute("data-train-leg") === selectedLeg) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  }

  // Set default view on load to Pune -> Gaya
  filterTrainLeg("pune-gaya");

  trainLegBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const leg = btn.getAttribute("data-train-leg");
      if (leg) filterTrainLeg(leg);
    });
  });

  // --- HOTEL CITY FILTER LOGIC ---
  const hotelCityBtns = document.querySelectorAll(
    "#view-hotel-details .train-leg-btn",
  );
  const hotelCards = document.querySelectorAll(
    "#view-hotel-details .train-card",
  );

  function filterHotelCity(selectedCity) {
    if (!selectedCity) return;
    hotelCityBtns.forEach((btn) => {
      if (btn.getAttribute("data-hotel-city") === selectedCity) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    hotelCards.forEach((card) => {
      if (card.getAttribute("data-hotel-city") === selectedCity) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  }

  // Set default hotel tab on load to Gaya
  filterHotelCity("gaya");

  hotelCityBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const city = btn.getAttribute("data-hotel-city");
      if (city) filterHotelCity(city);
    });
  });

  // --- RESTAURANT CITY FILTER LOGIC ---
  const restCityBtns = document.querySelectorAll(
    "#view-restaurant-details .train-leg-btn",
  );
  const restCards = document.querySelectorAll(
    "#view-restaurant-details .train-card",
  );

  function filterRestaurantCity(selectedCity) {
    if (!selectedCity) return;
    restCityBtns.forEach((btn) => {
      if (btn.getAttribute("data-rest-city") === selectedCity) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    restCards.forEach((card) => {
      if (card.getAttribute("data-rest-city") === selectedCity) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  }

  // Set default restaurant tab on load to Gaya
  filterRestaurantCity("gaya");

  restCityBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const city = btn.getAttribute("data-rest-city");
      if (city) filterRestaurantCity(city);
    });
  });

  // --- 3. INTERACTIVE EXPENSE TRACKER & BUDGET LOGIC ---
  const CITIES_CONFIG = [
    { key: "Gaya", name: "Gaya", marathi: "गया", icon: "fa-landmark" },
    { key: "Rajgir", name: "Rajgir", marathi: "राजगीर", icon: "fa-mountain" },
    { key: "Varanasi", name: "Varanasi", marathi: "वाराणसी", icon: "fa-om" },
    {
      key: "Prayagraj",
      name: "Prayagraj",
      marathi: "प्रयागराज",
      icon: "fa-water",
    },
    { key: "Ayodhya", name: "Ayodhya", marathi: "अयोध्या", icon: "fa-sun" },
    { key: "General", name: "General", marathi: "सामान्य", icon: "fa-ticket" },
  ];

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // "Stay • 2 Adults + 1 Child", "Transport • Taxi", "Puja • Darshan Ticket"
  function expenseTagText(item) {
    let tag = escapeHtml(item.category);
    if (item.category === "Stay" && item.adults) {
      const a = `${item.adults} Adult${item.adults > 1 ? "s" : ""}`;
      const c = item.children
        ? ` + ${item.children} Child${item.children > 1 ? "ren" : ""}`
        : "";
      tag += ` • ${a}${c}`;
    } else if (item.subType) {
      tag += ` • ${escapeHtml(item.subType)}`;
    }
    return tag;
  }

  function renderExpenses() {
    let grandTotal = 0;
    const totalCount = expenses.length;

    let columnsHtml = "";

    CITIES_CONFIG.forEach((cityObj) => {
      // Find expenses for this city
      const cityExpenses = expenses.filter((item) => {
        const itemCity = (item.city || "General").trim();
        return itemCity.toLowerCase() === cityObj.key.toLowerCase();
      });

      const cityTotal = cityExpenses.reduce(
        (sum, item) => sum + (Number(item.amount) || 0),
        0,
      );
      grandTotal += cityTotal;

      let itemsHtml = "";
      if (cityExpenses.length === 0) {
        itemsHtml = `
          <div class="city-empty">
            <i class="fa-regular fa-folder-open"></i> कोणताही खर्च नोंदवलेला नाही
          </div>
        `;
      } else {
        itemsHtml = cityExpenses
          .map(
            (item) => `
          <div class="exp-item">
            <div class="exp-left">
              <h4 title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</h4>
              <span class="category-tag"><i class="fa-solid fa-tag"></i> ${expenseTagText(item)}</span>
            </div>
            <div class="exp-right">
              <span class="exp-amount">₹ ${Number(item.amount).toLocaleString("en-IN")}</span>
              <button class="btn-delete" onclick="deleteExpense(${item.id})" title="Delete Expense">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>
        `,
          )
          .join("");
      }

      columnsHtml += `
        <div class="city-col-card" data-city="${cityObj.key}">
          <div class="city-col-header">
            <div class="city-col-title">
              <i class="fa-solid ${cityObj.icon} gold-icon"></i>
              <span class="city-name">${cityObj.name}</span>
              <span class="city-count-badge">${cityExpenses.length}</span>
            </div>
            <span class="city-total-badge">₹ ${cityTotal.toLocaleString("en-IN")}</span>
          </div>
          <div class="city-col-items">
            ${itemsHtml}
          </div>
        </div>
      `;
    });

    // Check for any custom / other cities outside the default 6
    const standardKeys = CITIES_CONFIG.map((c) => c.key.toLowerCase());
    const otherExpenses = expenses.filter((item) => {
      const itemCity = (item.city || "").trim().toLowerCase();
      return itemCity && !standardKeys.includes(itemCity);
    });

    if (otherExpenses.length > 0) {
      const otherTotal = otherExpenses.reduce(
        (sum, item) => sum + (Number(item.amount) || 0),
        0,
      );
      grandTotal += otherTotal;
      const otherItemsHtml = otherExpenses
        .map(
          (item) => `
        <div class="exp-item">
          <div class="exp-left">
            <h4 title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</h4>
            <span class="category-tag"><i class="fa-solid fa-tag"></i> ${expenseTagText(item)} • ${escapeHtml(item.city)}</span>
          </div>
          <div class="exp-right">
            <span class="exp-amount">₹ ${Number(item.amount).toLocaleString("en-IN")}</span>
            <button class="btn-delete" onclick="deleteExpense(${item.id})" title="Delete Expense">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      `,
        )
        .join("");

      columnsHtml += `
        <div class="city-col-card" data-city="Other">
          <div class="city-col-header">
            <div class="city-col-title">
              <i class="fa-solid fa-location-dot gold-icon"></i>
              <span class="city-name">इतर (Other)</span>
              <span class="city-count-badge">${otherExpenses.length}</span>
            </div>
            <span class="city-total-badge">₹ ${otherTotal.toLocaleString("en-IN")}</span>
          </div>
          <div class="city-col-items">
            ${otherItemsHtml}
          </div>
        </div>
      `;
    }

    if (expenseList) {
      expenseList.innerHTML = columnsHtml;
    }

    // Update Display Totals
    if (totalExpenseDisplay) {
      totalExpenseDisplay.textContent = `Total: ₹ ${grandTotal.toLocaleString("en-IN")}`;
    }

    const grandTotalAmount = document.getElementById("grandTotalAmount");
    const grandTotalCount = document.getElementById("grandTotalCount");
    if (grandTotalAmount) {
      grandTotalAmount.textContent = `₹ ${grandTotal.toLocaleString("en-IN")}`;
    }
    if (grandTotalCount) {
      grandTotalCount.textContent = `${totalCount} नोंदी (${totalCount} records)`;
    }

    // Save to LocalStorage
    localStorage.setItem("north_india_expenses", JSON.stringify(expenses));

    // Update Budget Summary (category-wise, from the real data)
    updateBudgetKPIs();
  }

  // ---------- BUDGET SUMMARY: built from the REAL Expense Tracker data ----------
  // The total budget is split into category allocations. Every category only ever counts
  // its own expenses against its own allocation (Stay money never covers Food, etc.).
  const BUDGET_KEY = "north_india_budget_total";
  const BUDGET_CATEGORIES = [
    {
      key: "Transport",
      label: "रेल्वे व स्थानिक वाहतूक (Transport)",
      icon: "fa-train",
      fill: "fill-transport",
      share: 34,
      match: ["Transport", "Travel"],
    },
    {
      key: "Stay",
      label: "हॉटेल मुक्काम (Hotels)",
      icon: "fa-hotel",
      fill: "fill-stay",
      share: 31,
      match: ["Stay"],
    },
    {
      key: "Food",
      label: "अन्न व जेवण (Food & Snacks)",
      icon: "fa-utensils",
      fill: "fill-food",
      share: 20,
      match: ["Food"],
    },
    {
      key: "Puja",
      label: "पूजा, दर्शन व बोट प्रवास (Puja & Entry)",
      icon: "fa-hands-praying",
      fill: "fill-puja",
      share: 9,
      match: ["Puja"],
    },
    {
      key: "Misc",
      label: "आपत्कालीन व इतर खर्च (Misc)",
      icon: "fa-box-open",
      fill: "fill-misc",
      share: 6,
      match: ["Misc"],
    },
  ];
  const inr = (n) => `₹ ${Math.round(n).toLocaleString("en-IN")}`;

  function getBudgetTotal() {
    const v = Number(localStorage.getItem(BUDGET_KEY));
    return v > 0 ? v : ESTIMATED_BUDGET;
  }

  function bucketOf(category) {
    // which budget category an expense belongs to
    const c = (category || "").trim().toLowerCase();
    const b = BUDGET_CATEGORIES.find((x) =>
      x.match.some((m) => m.toLowerCase() === c),
    );
    return b ? b.key : "Misc";
  }

  function computeBudget() {
    const total = getBudgetTotal();
    let used = 0;
    const rows = BUDGET_CATEGORIES.map((b, i) => {
      const allocated =
        i === BUDGET_CATEGORIES.length - 1
          ? total - used
          : Math.round((total * b.share) / 100);
      used += allocated;
      const spent = expenses
        .filter((x) => bucketOf(x.category) === b.key)
        .reduce((s, x) => s + (Number(x.amount) || 0), 0);
      return Object.assign({}, b, {
        allocated,
        spent,
        left: allocated - spent,
      });
    });
    const actual = rows.reduce((s, r) => s + r.spent, 0);
    return { total, rows, actual };
  }

  function updateBudgetKPIs() {
    const { total, rows, actual } = computeBudget();
    const remaining = total - actual;

    if (kpiEstBudget) kpiEstBudget.textContent = inr(total);
    if (kpiActualSpent) kpiActualSpent.textContent = inr(actual);
    if (kpiRemaining) {
      kpiRemaining.textContent = inr(remaining);
      kpiRemaining.style.color = remaining < 0 ? "#EF4444" : "#34D399";
    }

    const list = document.getElementById("budgetCategoryList");
    if (list) {
      list.innerHTML = rows
        .map((r) => {
          const pctOfBudget = Math.round(r.share);
          const used =
            r.allocated > 0 ? Math.min(100, (r.spent / r.allocated) * 100) : 0;
          const over = r.left < 0;
          return `
          <div class="progress-bar-group ${over ? "is-over" : ""}">
            <div class="progress-label">
              <span><i class="fa-solid ${r.icon}"></i> ${r.label}</span>
              <span>${inr(r.spent)} / ${inr(r.allocated)} <small>(${pctOfBudget}% of budget)</small></span>
            </div>
            <div class="progress-track">
              <div class="progress-fill ${r.fill}" style="width: ${used.toFixed(1)}%;"></div>
            </div>
            <div class="budget-row-note ${over ? "over" : ""}">
              ${
                over
                  ? `<i class="fa-solid fa-triangle-exclamation"></i> Over this category's amount by ${inr(-r.left)}`
                  : `<i class="fa-solid fa-circle-check"></i> ${inr(r.left)} left in this category`
              }
            </div>
          </div>`;
        })
        .join("");
    }

    const input = document.getElementById("budgetTotalInput");
    if (input && document.activeElement !== input) input.value = total;
    updateCategoryHint();
  }

  // Category chip under the Add-Expense form: "Stay holds ₹10,850 · spent · left"
  function updateCategoryHint() {
    if (!catAllocHint || !expCategory) return;
    const { rows } = computeBudget();
    const row = rows.find((r) => r.key === bucketOf(expCategory.value));
    if (!row) return;
    const over = row.left < 0;
    catAllocHint.className = "cat-alloc-hint" + (over ? " over" : "");
    catAllocHint.innerHTML = `<i class="fa-solid fa-wallet"></i> <strong>${row.key}</strong> holds <strong>${inr(row.allocated)}</strong>
      · Spent <strong>${inr(row.spent)}</strong> · ${over ? `Over by <strong>${inr(-row.left)}</strong>` : `Left <strong>${inr(row.left)}</strong>`}`;
  }

  const budgetTotalInput = document.getElementById("budgetTotalInput");
  if (budgetTotalInput) {
    budgetTotalInput.addEventListener("change", () => {
      const v = Number(budgetTotalInput.value);
      if (v > 0) localStorage.setItem(BUDGET_KEY, String(Math.round(v)));
      updateBudgetKPIs();
    });
  }

  // Extra options for the chosen category (Stay / Transport / Temple)
  function toggleCategoryExtras() {
    const c = expCategory ? expCategory.value : "";
    const show = (id, on) => {
      const el = document.getElementById(id);
      if (el) el.hidden = !on;
    };
    show("extraStayAdults", c === "Stay");
    show("extraStayChildren", c === "Stay");
    show("extraTransport", c === "Transport");
    show("extraPuja", c === "Puja");
    const row = document.getElementById("catExtraRow");
    if (row) row.hidden = !["Stay", "Transport", "Puja"].includes(c);
    updateCategoryHint();
  }
  if (expCategory) expCategory.addEventListener("change", toggleCategoryExtras);

  // Delete Expense Handler
  window.deleteExpense = function (id) {
    expenses = expenses.filter((item) => item.id !== id);
    renderExpenses();
  };

  // Add New Expense
  if (expenseForm) {
    expenseForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const titleVal = expTitle.value.trim();
      const amountVal = parseFloat(expAmount.value);
      const categoryVal = expCategory.value;
      const cityVal = expCity.value;

      if (!titleVal || isNaN(amountVal) || amountVal <= 0) return;

      const newExp = {
        id: Date.now(),
        title: titleVal,
        amount: amountVal,
        category: categoryVal,
        city: cityVal,
      };
      if (categoryVal === "Stay") {
        newExp.adults = Number(expAdults.value) || 1;
        newExp.children = Number(expChildren.value) || 0;
      } else if (categoryVal === "Transport") {
        newExp.subType = expTransportType.value;
      } else if (categoryVal === "Puja") {
        newExp.subType = expPujaType.value;
      }

      expenses.unshift(newExp);
      renderExpenses();

      // this category holds only its own allocated amount: say so when it is exceeded
      const row = computeBudget().rows.find(
        (r) => r.key === bucketOf(categoryVal),
      );
      if (row && row.left < 0 && window.showModernModal) {
        window.showModernModal({
          variant: "error",
          emoji: "⚠️",
          title: `${row.key} amount exceeded`,
          html: `${row.key} holds only <strong>${inr(row.allocated)}</strong> of the budget. You have spent <strong>${inr(row.spent)}</strong>, which is <strong>${inr(-row.left)}</strong> over this category.`,
          buttonText: "OK",
        });
      }

      // Reset Form
      expenseForm.reset();
      toggleCategoryExtras();
    });
  }

  // --- 4. PRINT / EXPORT ITINERARY & EXPENSES ---
  const printCityExpensesBtn = document.getElementById("printCityExpensesBtn");
  if (printCityExpensesBtn) {
    printCityExpensesBtn.addEventListener("click", () => {
      printCityWiseExpenses();
    });
  }

  function printCityWiseExpenses() {
    let grandTotal = 0;
    let citiesSectionHtml = "";

    CITIES_CONFIG.forEach((cityObj) => {
      const cityExpenses = expenses.filter((item) => {
        const itemCity = (item.city || "General").trim();
        return itemCity.toLowerCase() === cityObj.key.toLowerCase();
      });

      const cityTotal = cityExpenses.reduce(
        (sum, item) => sum + (Number(item.amount) || 0),
        0,
      );
      grandTotal += cityTotal;

      let rowsHtml = "";
      if (cityExpenses.length === 0) {
        rowsHtml = `<tr><td colspan="3" style="text-align:center; color:#94a3b8; font-style:italic; padding:10px;">कोणताही खर्च नोंदवलेला नाही (No expenses logged)</td></tr>`;
      } else {
        rowsHtml = cityExpenses
          .map(
            (item) => `
          <tr>
            <td style="padding:10px 14px; border-bottom:1px solid #e2e8f0; font-weight:500;">${escapeHtml(item.title)}</td>
            <td style="padding:10px 14px; border-bottom:1px solid #e2e8f0; color:#64748b;"><span style="background:#f1f5f9; padding:3px 8px; border-radius:4px; font-size:12px;">${escapeHtml(item.category)}</span></td>
            <td style="padding:10px 14px; border-bottom:1px solid #e2e8f0; text-align:right; font-weight:700; color:#b45309;">₹ ${Number(item.amount).toLocaleString("en-IN")}</td>
          </tr>
        `,
          )
          .join("");
      }

      citiesSectionHtml += `
        <div style="margin-bottom: 22px; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; page-break-inside: avoid; background:#fff;">
          <div style="background: #f8fafc; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0;">
            <div style="font-size: 16px; font-weight: 700; color: #1e293b; display:flex; align-items:center; gap:8px;">
              <span>📍 ${cityObj.name} (${cityObj.marathi})</span>
              <span style="font-size:12px; font-weight:600; color:#64748b; background:#e2e8f0; padding:2px 8px; border-radius:10px;">${cityExpenses.length} नोंदी</span>
            </div>
            <span style="font-weight: 800; font-size: 15px; color: #b45309; background:#fef3c7; padding:3px 12px; border-radius:12px; border:1px solid #fde68a;">₹ ${cityTotal.toLocaleString("en-IN")}</span>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 13.5px;">
            <thead>
              <tr style="background: #f1f5f9; color: #475569; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing:0.5px;">
                <th style="padding: 9px 14px; border-bottom: 1px solid #cbd5e1;">खर्च तपशील (Description)</th>
                <th style="padding: 9px 14px; border-bottom: 1px solid #cbd5e1; width:25%;">प्रवर्ग (Category)</th>
                <th style="padding: 9px 14px; border-bottom: 1px solid #cbd5e1; text-align: right; width:25%;">रक्कम (Amount)</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      `;
    });

    const printWindow = window.open("", "_blank", "width=950,height=800");
    if (!printWindow) {
      window.print();
      return;
    }

    const printDate = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="mr">
      <head>
        <meta charset="UTF-8">
        <title>शहरनिहाय प्रवास खर्च अहवाल - The Ultimate North Indian Travel Book</title>
        <style>
          @page { margin: 15mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #1e293b; margin: 25px; background: #fff; line-height: 1.5; }
          .header { text-align: center; border-bottom: 3px solid #f59e0b; padding-bottom: 16px; margin-bottom: 24px; }
          .header h1 { margin: 0 0 6px 0; font-size: 24px; color: #b45309; }
          .header p { margin: 0; color: #64748b; font-size: 13px; }
          .grand-total-box { background: #fffbeb; border: 2px solid #f59e0b; border-radius: 10px; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; margin-top: 24px; page-break-inside: avoid; }
          .grand-total-title { font-size: 18px; font-weight: 700; color: #92400e; }
          .grand-total-amount { font-size: 26px; font-weight: 900; color: #b45309; }
          .footer { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #e2e8f0; font-size: 11.5px; color: #94a3b8; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🚩 उत्तर भारत यात्रा - शहरनिहाय प्रवास खर्च अहवाल</h1>
          <p>The Ultimate North Indian Travel Book (Gaya • Rajgir • Varanasi • Prayagraj • Ayodhya) • ${printDate}</p>
        </div>

        <div class="cities-container">
          ${citiesSectionHtml}
        </div>

        <div class="grand-total-box">
          <div class="grand-total-title">एकूण सर्व खर्च (Overall Grand Total):</div>
          <div class="grand-total-amount">₹ ${grandTotal.toLocaleString("en-IN")}</div>
        </div>

        <div class="footer">
          <p>Generated from The Ultimate North Indian Travel Book Web Application</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }

  if (printItineraryBtn) {
    printItineraryBtn.addEventListener("click", () => {
      window.print();
    });
  }

  // --- MODERN DIALOG MODAL POPUP ---
  let modalTimer = null;

  function closeModernModal() {
    clearTimeout(modalTimer);
    const o = document.getElementById("customModernModalOverlay");
    if (o) o.classList.remove("active");
  }

  // Options: variant ('' | 'error' | 'success'), emoji or icon, title, text (plain) or html (trusted markup),
  // buttonText, autoClose (ms, default 5000; 0 = stay open until closed)
  window.showModernModal = function ({
    icon = "fa-lock",
    emoji = "",
    variant = "",
    title = "Destination Locked",
    text = "",
    html = "",
    buttonText = "Understand & Continue",
    autoClose = 5000,
  }) {
    let modalOverlay = document.getElementById("customModernModalOverlay");
    if (!modalOverlay) {
      modalOverlay = document.createElement("div");
      modalOverlay.id = "customModernModalOverlay";
      modalOverlay.className = "custom-modal-overlay";
      modalOverlay.innerHTML = `
        <div class="custom-modal-box" role="dialog" aria-modal="true" aria-labelledby="modalTitleText">
          <div class="modal-icon-badge" id="modalIconBadge"></div>
          <h3 class="modal-title" id="modalTitleText"></h3>
          <p class="modal-body-text" id="modalBodyText"></p>
          <button class="modal-close-btn" id="modalCloseBtn"></button>
          <div class="modal-timer" id="modalTimer"></div>
        </div>
      `;
      document.body.appendChild(modalOverlay);

      modalOverlay.addEventListener("click", (e) => {
        if (e.target === modalOverlay || e.target.id === "modalCloseBtn")
          closeModernModal();
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeModernModal();
      });
    }

    // variant: '' (default), 'error' or 'success'
    modalOverlay.querySelector(".custom-modal-box").className =
      "custom-modal-box" + (variant ? " modal-" + variant : "");
    document.getElementById("modalIconBadge").innerHTML = emoji
      ? `<span class="modal-emoji">${emoji}</span>`
      : `<i class="fa-solid ${icon}"></i>`;
    document.getElementById("modalTitleText").textContent = title;
    const body = document.getElementById("modalBodyText");
    if (html) body.innerHTML = html;
    else body.textContent = text;
    document.getElementById("modalCloseBtn").textContent = buttonText;

    // auto-close countdown bar + timer
    const bar = document.getElementById("modalTimer");
    clearTimeout(modalTimer);
    bar.style.animation = "none";
    void bar.offsetWidth; // restart the animation
    if (autoClose > 0) {
      bar.style.display = "";
      bar.style.animation = `modalTimerShrink ${autoClose}ms linear forwards`;
      modalTimer = setTimeout(closeModernModal, autoClose);
    } else {
      bar.style.display = "none";
    }

    modalOverlay.classList.add("active");
    document.getElementById("modalCloseBtn").focus();
  };

  // --- HOTEL RESERVATION TICKET MODAL LOGIC ---
  const HOTEL_TICKETS = {
    gaya: {
      hotelName: "Hotel Vishnu Vihar / Delta International",
      city: "Gaya, Bihar",
      address: "Near Vishnupad Mandir Road, Gaya, Bihar - 823001",
      bookingId: "HTL-GYA-98241",
      primaryGuest: "Mr. Niraj & Family",
      checkIn: "Day 2 (Sat) • 10:00 AM",
      checkOut: "Day 4 (Mon) • 07:00 AM",
      duration: "2 Nights / 3 Days",
      roomType: "AC Deluxe Double Room (2 Adults)",
      amount: "₹ 4,200 (₹2,100 / Night)",
      status: "Confirmed & Guaranteed",
      contact: "+91 94312 88210 / info@hotelvishnuvihar.com",
      perks: [
        "Free High-Speed WiFi",
        "Pure Veg Sattvik Restaurant",
        "Near Vishnupad Temple",
        "Hot & Cold Water",
        "Room Service",
      ],
    },
    rajgir: {
      hotelName: "Hotel Nalanda Regency / Rajgir Residency",
      city: "Rajgir, Bihar",
      address: "Main Road, Near Kund Market & Ropeway, Rajgir, Bihar - 803116",
      bookingId: "HTL-RGD-44182",
      primaryGuest: "Mr. Niraj & Family",
      checkIn: "Day 4 (Mon) • 11:30 AM",
      checkOut: "Day 5 (Tue) • 08:30 PM (Late Checkout)",
      duration: "1 Night / 2 Days",
      roomType: "Standard AC Double Room (2 Adults)",
      amount: "₹ 1,600 / Night",
      status: "Confirmed & Guaranteed",
      contact: "+91 93041 55219 / booking@rajgirresidency.com",
      perks: [
        "Free Parking",
        "Pure Veg Dining",
        "Near Hot Springs & Ropeway",
        "24x7 Desk Support",
      ],
    },
    varanasi: {
      hotelName: "Hotel Kashi Residency / BrijRama Palace",
      city: "Varanasi, Uttar Pradesh",
      address: "Dashashwamedh Ghat Road, Godowlia, Varanasi, UP - 221001",
      bookingId: "HTL-VNS-77190",
      primaryGuest: "Mr. Niraj & Family",
      checkIn: "Day 6 (Wed) • 08:00 AM",
      checkOut: "Day 12 (Tue) • 06:00 AM",
      duration: "6 Nights / 7 Days",
      roomType: "Deluxe AC River View Room (2 Adults)",
      amount: "₹ 16,800 (₹2,800 / Night)",
      status: "Confirmed & Guaranteed",
      contact: "+91 98390 12345 / stay@kashiresidency.com",
      perks: [
        "Station Pickup Included",
        "5 Min Walk to Ganga Aarti",
        "Kashi Vishwanath Corridor Access",
        "Pure Sattvik Dining",
        "Free High-Speed WiFi",
      ],
    },
    prayagraj: {
      hotelName: "Hotel Kanha Shyam / Sangam View Guest House",
      city: "Prayagraj, Uttar Pradesh",
      address: "Civil Lines, Near Sangam Confluence, Prayagraj, UP - 211001",
      bookingId: "HTL-PRY-33019",
      primaryGuest: "Mr. Niraj & Family",
      checkIn: "Day 9 (Sat) • 11:00 AM",
      checkOut: "Day 11 (Mon) • 04:00 PM",
      duration: "1 Night / 2 Days",
      roomType: "Clean AC Deluxe Room (2 Adults)",
      amount: "₹ 2,350 / Night",
      status: "Confirmed & Guaranteed",
      contact: "+91 94152 77890 / info@kanhashyam.com",
      perks: [
        "Free Safe Parking",
        "Sangam View",
        "Near Bade Hanuman Mandir",
        "Veg Restaurant",
        "AC Double Bed",
      ],
    },
    ayodhya: {
      hotelName: "Ramayana Hotel / Hotel Shane Avadh",
      city: "Ayodhya, Uttar Pradesh",
      address:
        "Ram Path, Near Ram Janmabhoomi Gate No. 3, Ayodhya, UP - 224123",
      bookingId: "HTL-AYD-10928",
      primaryGuest: "Mr. Niraj & Family",
      checkIn: "Day 11 (Mon) • 09:00 PM",
      checkOut: "Day 13 (Wed) • 08:00 AM",
      duration: "1 Night / 2 Days",
      roomType: "Modern AC Deluxe Double Room (2 Adults)",
      amount: "₹ 3,250 / Night",
      status: "Confirmed & Guaranteed",
      contact: "+91 94500 66321 / reservation@ramayanahotel.com",
      perks: [
        "Walking Distance to Ram Mandir",
        "Pure Veg Sattvik Thali Included",
        "Free WiFi",
        "24x7 Room Service",
        "Travel Assistance",
      ],
    },
  };

  window.openHotelTicketModal = function (cityKey) {
    const data = HOTEL_TICKETS[cityKey] || HOTEL_TICKETS["gaya"];
    let modalOverlay = document.getElementById("hotelTicketModalOverlay");

    if (!modalOverlay) {
      modalOverlay = document.createElement("div");
      modalOverlay.id = "hotelTicketModalOverlay";
      modalOverlay.className = "hotel-modal-overlay";
      document.body.appendChild(modalOverlay);

      modalOverlay.addEventListener("click", (e) => {
        if (
          e.target === modalOverlay ||
          e.target.closest(".voucher-close-btn") ||
          e.target.closest(".btn-v-close")
        ) {
          modalOverlay.classList.remove("active");
        }
      });
    }

    const perksHtml = data.perks
      .map(
        (p) => `
      <span class="v-perk-pill"><i class="fa-solid fa-circle-check"></i> ${p}</span>
    `,
      )
      .join("");

    modalOverlay.innerHTML = `
      <div class="hotel-ticket-voucher">
        <div class="voucher-header">
          <div class="voucher-brand">
            <i class="fa-solid fa-hotel"></i>
            <div>
              <h3>Hotel Reservation Voucher</h3>
              <span>The Ultimate North Indian Travel Book</span>
            </div>
          </div>
          <button class="voucher-close-btn" title="Close Voucher"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <div class="voucher-body">
          <div class="voucher-status-strip">
            <span class="v-status-badge"><i class="fa-solid fa-circle-check"></i> ${data.status}</span>
            <span class="v-booking-id">Booking ID: <strong>${data.bookingId}</strong></span>
          </div>

          <div class="voucher-hotel-hero">
            <h2 class="v-hotel-name">${data.hotelName}</h2>
            <p class="v-hotel-address"><i class="fa-solid fa-location-dot gold-icon"></i> ${data.address}</p>
          </div>

          <div class="voucher-grid">
            <div class="v-box">
              <span class="v-box-label"><i class="fa-solid fa-user"></i> Primary Guest</span>
              <div class="v-box-val">${data.primaryGuest}</div>
              <span class="v-box-sub">${data.roomType}</span>
            </div>

            <div class="v-box">
              <span class="v-box-label"><i class="fa-solid fa-calendar-check"></i> Stay Duration</span>
              <div class="v-box-val">${data.duration}</div>
              <span class="v-box-sub">${data.amount}</span>
            </div>

            <div class="v-box">
              <span class="v-box-label"><i class="fa-solid fa-right-to-bracket"></i> Check-in</span>
              <div class="v-box-val">${data.checkIn}</div>
            </div>

            <div class="v-box">
              <span class="v-box-label"><i class="fa-solid fa-right-from-bracket"></i> Check-out</span>
              <div class="v-box-val">${data.checkOut}</div>
            </div>
          </div>

          <div class="voucher-perks-list">
            <div class="v-perks-title"><i class="fa-solid fa-sparkles"></i> Included Inclusions & Amenities:</div>
            <div class="v-perks-tags">
              ${perksHtml}
            </div>
          </div>

          <div style="font-size:12px; color:#94A3B8; margin-bottom:16px;">
            <i class="fa-solid fa-phone gold-icon"></i> <strong>Hotel Contact:</strong> ${data.contact}
          </div>

          <div class="voucher-footer-actions">
            <button type="button" class="btn-v-print" onclick="printHotelTicket('${cityKey}')">
              <i class="fa-solid fa-print"></i> Print Hotel Ticket
            </button>
            <button type="button" class="btn-v-close">
              Close (बंद करा)
            </button>
          </div>
        </div>
      </div>
    `;

    modalOverlay.classList.add("active");
  };

  window.printHotelTicket = function (cityKey) {
    const data = HOTEL_TICKETS[cityKey] || HOTEL_TICKETS["gaya"];
    const printWindow = window.open("", "_blank", "width=800,height=750");
    if (!printWindow) {
      window.print();
      return;
    }

    const perksHtml = data.perks
      .map((p) => `<li style="margin-bottom:6px;">✓ ${p}</li>`)
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Hotel Reservation Voucher - ${data.hotelName}</title>
        <style>
          @page { margin: 15mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #1e293b; margin: 25px; background: #fff; line-height: 1.5; }
          .voucher-box { border: 2px solid #f59e0b; border-radius: 12px; padding: 24px; max-width: 700px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 20px; }
          .header h1 { margin: 0 0 6px; color: #b45309; font-size: 22px; }
          .header p { margin: 0; color: #64748b; font-size: 13px; }
          .badge-confirmed { display: inline-block; background: #ecfdf5; border: 1px solid #10b981; color: #047857; font-weight: 700; padding: 4px 12px; border-radius: 20px; font-size: 13px; margin-top: 8px; }
          .hotel-title { font-size: 18px; font-weight: 700; color: #0f172a; margin: 12px 0 4px; }
          .hotel-addr { font-size: 13px; color: #64748b; margin-bottom: 18px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px; }
          .info-item { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
          .info-label { font-size: 11px; text-transform: uppercase; color: #b45309; font-weight: 700; }
          .info-val { font-size: 14px; font-weight: 700; color: #1e293b; margin-top: 3px; }
          .perks { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px; }
          .footer { font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 14px; }
        </style>
      </head>
      <body>
        <div class="voucher-box">
          <div class="header">
            <h1>🏨 HOTEL RESERVATION CONFIRMATION VOUCHER</h1>
            <p>The Ultimate North Indian Travel Book (Gaya • Rajgir • Varanasi • Prayagraj • Ayodhya)</p>
            <div class="badge-confirmed">✓ STATUS: CONFIRMED & GUARANTEED</div>
          </div>

          <div class="hotel-title">${data.hotelName}</div>
          <div class="hotel-addr">📍 ${data.address}</div>

          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Booking Reference ID</div>
              <div class="info-val">${data.bookingId}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Primary Guest</div>
              <div class="info-val">${data.primaryGuest}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Check-in Date & Time</div>
              <div class="info-val">${data.checkIn}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Check-out Date & Time</div>
              <div class="info-val">${data.checkOut}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Room Type & Guests</div>
              <div class="info-val">${data.roomType}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Estimated Total Amount</div>
              <div class="info-val">${data.amount}</div>
            </div>
          </div>

          <div class="perks">
            <strong style="color:#92400e; font-size:13px;">Inclusions & Amenities:</strong>
            <ul style="margin:8px 0 0 0; padding-left:20px; font-size:13px; color:#475569;">
              ${perksHtml}
            </ul>
          </div>

          <div style="font-size:12.5px; color:#475569; margin-bottom:18px;">
            📞 <strong>Hotel Contact / Desk Helpline:</strong> ${data.contact}
          </div>

          <div class="footer">
            <p>Please present this confirmation voucher and a valid photo ID upon arrival at the hotel reception.</p>
          </div>
        </div>

        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  // --- RESTAURANT DINING VOUCHER & MENU MODAL LOGIC ---
  const RESTAURANT_DATA = {
    gaya: {
      spotName: "Pramod Laddu Bhandar & Gaya Litti Corner",
      city: "Gaya, Bihar",
      address: "Tower Chowk & GB Road, Gaya, Bihar - 823001",
      voucherId: "FOOD-GYA-51920",
      diet: "100% Pure Vegetarian / Sattvik",
      timings: "07:00 AM – 10:30 PM (All 7 Days)",
      avgCost: "₹ 120 – ₹ 250 per person",
      highlights: [
        "Authentic Desi Ghee Litti Chokha",
        "Famous Gaya Tilkut & Anarsa",
        "Sattvik Bihari Thali",
        "Traditional Kesaria Kulhad Chai",
      ],
      contact: "+91 94310 99881 / dining@pramodgaya.com",
      menuItems: [
        {
          name: "Desi Ghee Litti Chokha (2 Pcs)",
          price: "₹ 80",
          desc: "Baked wheat balls stuffed with sattu & spices, dipped in pure ghee, served with baingan chokha & chutney.",
        },
        {
          name: "Famous Gaya Tilkut (250g)",
          price: "₹ 120",
          desc: "Crispy sesame seed & jaggery wafer sweet, traditional specialty of Gaya.",
        },
        {
          name: "Anarsa & Khaja Pack (250g)",
          price: "₹ 100",
          desc: "Rice flour & jaggery sweet coated with white sesame seeds.",
        },
        {
          name: "Special Bihari Sattvik Thali",
          price: "₹ 200",
          desc: "Rice, Dal Tadka, Seasonal Sabzi, Bharta, Roti, Salad & Kheer.",
        },
      ],
    },
    rajgir: {
      spotName: "Silao Khaja Corner & Nalanda Green Restaurant",
      city: "Rajgir, Bihar",
      address: "Main Road, Near Kund Market & Ropeway, Rajgir, Bihar - 803116",
      voucherId: "FOOD-RGD-33180",
      diet: "100% Pure Vegetarian / Sattvik",
      timings: "08:00 AM – 10:00 PM (All 7 Days)",
      avgCost: "₹ 100 – ₹ 220 per person",
      highlights: [
        "GI Tagged Silao Ka Khaja",
        "Chilled Sattu Namkeen Sharbat",
        "Rajgir Special Veg Thali",
        "Makhana Kheer",
      ],
      contact: "+91 93040 77122 / support@silaokhaja.com",
      menuItems: [
        {
          name: "GI Tagged Silao Ka Khaja (500g)",
          price: "₹ 120",
          desc: "Famous crisp multi-layered sweet delicacy patented to the ancient Nalanda-Rajgir region.",
        },
        {
          name: "Chilled Sattu Namkeen Sharbat",
          price: "₹ 40",
          desc: "Refreshing protein drink prepared with roasted gram flour, lemon, green chili & mint.",
        },
        {
          name: "Makhana Kheer (Foxnut Pudding)",
          price: "₹ 70",
          desc: "Creamy milk pudding slow-cooked with fresh Mithila lotus seeds, dry fruits & cardamom.",
        },
        {
          name: "Rajgir Special Veg Thali",
          price: "₹ 160",
          desc: "Phulkas, Dal Fry, Mixed Veg, Paneer Sabzi, Jeera Rice, Papad & Sweet.",
        },
      ],
    },
    varanasi: {
      spotName: "Kashi Chat Bhandar, Deena Chat & Shree Ram Bhandar",
      city: "Varanasi, Uttar Pradesh",
      address:
        "Godowlia Chowk, Chowk & Dashashwamedh Ghat Road, Varanasi, UP - 221001",
      voucherId: "FOOD-VNS-98104",
      diet: "100% Pure Vegetarian / Sattvik",
      timings: "06:30 AM – 11:00 PM (All 7 Days)",
      avgCost: "₹ 150 – ₹ 350 per person",
      highlights: [
        "Hot Desi Ghee Tamatar Chaat",
        "Crispy Palak Patta Chaat",
        "Morning Kachori Sabzi & Jalebi",
        "Banarasi Saffron Malaiyyo",
        "Banarasi Maghai Paan",
      ],
      contact: "+91 98391 44556 / eat@kashichat.com",
      menuItems: [
        {
          name: "Hot Desi Ghee Tamatar Chaat (Kulhad)",
          price: "₹ 60",
          desc: "Simmered spiced tomatoes with mashed potatoes, roasted spices, ghee & sugar syrup.",
        },
        {
          name: "Crispy Palak Patta Chaat",
          price: "₹ 70",
          desc: "Crispy gram-flour coated spinach leaves topped with spiced curd, tamarind & mint chutney.",
        },
        {
          name: "Morning Kachori-Sabzi & Jalebi",
          price: "₹ 60",
          desc: "Crispy urad dal kachoris served with spicy hing aloo sabzi and hot syrupy jalebi.",
        },
        {
          name: "Banarasi Saffron Malaiyyo / Blue Lassi",
          price: "₹ 60",
          desc: "Winter dew-frosted saffron milk foam garnished with pistachios and almonds.",
        },
        {
          name: "Royal Kashi Mahadev Thali",
          price: "₹ 250",
          desc: "Banarasi Dum Aloo, Paneer Lababdar, Dal Makhani, Poori, Pulao, Raita & Gulab Jamun.",
        },
      ],
    },
    prayagraj: {
      spotName: "Netram Moolchand & Sons & Loknath Chaat Galli",
      city: "Prayagraj, Uttar Pradesh",
      address: "Katra & Loknath Chowk, Civil Lines, Prayagraj, UP - 211001",
      voucherId: "FOOD-PRY-66230",
      diet: "100% Pure Vegetarian / Sattvik",
      timings: "07:00 AM – 10:30 PM (All 7 Days)",
      avgCost: "₹ 120 – ₹ 280 per person",
      highlights: [
        "Netram Desi Ghee Kachori & Dam Aloo",
        "Thick Malai Rabdi Jalebi",
        "Dahi Jalebi & Samosa Chaat",
        "Special Sangam Thali",
      ],
      contact: "+91 94150 33412 / orders@netramprayag.com",
      menuItems: [
        {
          name: "Netram Desi Ghee Kachori Thali (4 Pcs)",
          price: "₹ 90",
          desc: "Iconic puri-kachori fried in pure ghee, served with special dry Dam Aloo & pumpkin sabzi.",
        },
        {
          name: "Thick Malai Rabdi Jalebi (Kulhad)",
          price: "₹ 80",
          desc: "Crispy hot thin jalebis topped with rich thick saffron rabdi.",
        },
        {
          name: "Loknath Famous Samosa Chaat",
          price: "₹ 60",
          desc: "Crushed samosa served with spicy chole gravy, chutneys and sev.",
        },
        {
          name: "Special Sangam Deluxe Thali",
          price: "₹ 220",
          desc: "Dal Tadka, Shahi Paneer, Aloo Gobhi, 4 Butter Rotis, Pulao, Gulab Jamun & Salad.",
        },
      ],
    },
    ayodhya: {
      spotName: "Makan-Malai Restaurant & Shri Ram Bhojanalaya",
      city: "Ayodhya, Uttar Pradesh",
      address:
        "Ram Path, Near Hanuman Garhi & Ram Janmabhoomi Gate, Ayodhya, UP - 224123",
      voucherId: "FOOD-AYD-77821",
      diet: "100% Pure Vegetarian / Sattvik",
      timings: "06:00 AM – 10:30 PM (All 7 Days)",
      avgCost: "₹ 150 – ₹ 300 per person",
      highlights: [
        "Sacred Ayodhya Peda Prasad",
        "Crispy Bedmi Puri with Aloo Sabzi",
        "Shri Ram Sattvik Mahaprasad Thali",
        "Makan Malai Rabdi",
      ],
      contact: "+91 94501 88344 / info@makanmalaiayodhya.com",
      menuItems: [
        {
          name: "Sacred Ayodhya Peda Prasad (250g)",
          price: "₹ 100",
          desc: "Traditional brown caramelized mawa peda prepared with pure ghee and cardamom.",
        },
        {
          name: "Crispy Bedmi Puri with Aloo Sabzi",
          price: "₹ 80",
          desc: "Crisp spiced lentil-stuffed pooris served with tangy mathura-style potato curry.",
        },
        {
          name: "Shri Ram Sattvik Mahaprasad Thali",
          price: "₹ 240",
          desc: "Sattvik Dal, Paneer Bhog, Sitaphal Sabzi, 4 Desi Ghee Puris, Rice, Kheer & Ayodhya Peda.",
        },
        {
          name: "Awadhi Kesar Rabdi Malai",
          price: "₹ 70",
          desc: "Slow-simmered rich condensed milk flavoured with real saffron and dry fruit slivers.",
        },
      ],
    },
  };

  window.openRestaurantModal = function (cityKey) {
    const data = RESTAURANT_DATA[cityKey] || RESTAURANT_DATA["gaya"];
    let modalOverlay = document.getElementById("restaurantModalOverlay");

    if (!modalOverlay) {
      modalOverlay = document.createElement("div");
      modalOverlay.id = "restaurantModalOverlay";
      modalOverlay.className = "hotel-modal-overlay";
      document.body.appendChild(modalOverlay);

      modalOverlay.addEventListener("click", (e) => {
        if (
          e.target === modalOverlay ||
          e.target.closest(".voucher-close-btn") ||
          e.target.closest(".btn-v-close")
        ) {
          modalOverlay.classList.remove("active");
        }
      });
    }

    const highlightsHtml = data.highlights
      .map(
        (h) => `
      <span class="v-perk-pill"><i class="fa-solid fa-circle-check"></i> ${h}</span>
    `,
      )
      .join("");

    const menuRowsHtml = data.menuItems
      .map(
        (item) => `
      <div class="fare-card-item" style="background: rgba(15, 23, 42, 0.7); margin-bottom: 8px;">
        <div class="fare-item-left" style="flex-direction:column; align-items:flex-start; gap:2px;">
          <strong style="color:#F8FAFC; font-size:13.5px;">${item.name}</strong>
          <span style="font-size:11.5px; color:#94A3B8;">${item.desc}</span>
        </div>
        <span class="fare-price-val" style="white-space:nowrap; margin-left:12px;">${item.price}</span>
      </div>
    `,
      )
      .join("");

    modalOverlay.innerHTML = `
      <div class="hotel-ticket-voucher">
        <div class="voucher-header">
          <div class="voucher-brand">
            <i class="fa-solid fa-utensils"></i>
            <div>
              <h3>Specialty Dining &amp; Menu Guide</h3>
              <span>The Ultimate North Indian Travel Book</span>
            </div>
          </div>
          <button class="voucher-close-btn" title="Close Menu"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <div class="voucher-body">
          <div class="voucher-status-strip">
            <span class="v-status-badge"><i class="fa-solid fa-leaf"></i> ${data.diet}</span>
            <span class="v-booking-id">Voucher Code: <strong>${data.voucherId}</strong></span>
          </div>

          <div class="voucher-hotel-hero">
            <h2 class="v-hotel-name">${data.spotName}</h2>
            <p class="v-hotel-address"><i class="fa-solid fa-location-dot gold-icon"></i> ${data.address}</p>
          </div>

          <div class="voucher-grid">
            <div class="v-box">
              <span class="v-box-label"><i class="fa-solid fa-clock"></i> Timings</span>
              <div class="v-box-val" style="font-size:12.5px;">${data.timings}</div>
            </div>

            <div class="v-box">
              <span class="v-box-label"><i class="fa-solid fa-wallet"></i> Avg Cost</span>
              <div class="v-box-val">${data.avgCost}</div>
            </div>
          </div>

          <div class="voucher-perks-list">
            <div class="v-perks-title"><i class="fa-solid fa-sparkles"></i> Culinary Highlights &amp; Specialties:</div>
            <div class="v-perks-tags">
              ${highlightsHtml}
            </div>
          </div>

          <div style="margin-bottom: 18px;">
            <div class="v-perks-title" style="margin-bottom: 8px;"><i class="fa-solid fa-bowl-food gold-icon"></i> Recommended Specialty Menu:</div>
            <div class="menu-list-wrapper">
              ${menuRowsHtml}
            </div>
          </div>

          <div style="font-size:12px; color:#94A3B8; margin-bottom:16px;">
            <i class="fa-solid fa-phone gold-icon"></i> <strong>Helpline / Takeaway:</strong> ${data.contact}
          </div>

          <div class="voucher-footer-actions">
            <button type="button" class="btn-v-print" onclick="printRestaurantMenu('${cityKey}')">
              <i class="fa-solid fa-print"></i> Print Dining Guide
            </button>
            <button type="button" class="btn-v-close">
              Close (बंद करा)
            </button>
          </div>
        </div>
      </div>
    `;

    modalOverlay.classList.add("active");
  };

  window.printRestaurantMenu = function (cityKey) {
    const data = RESTAURANT_DATA[cityKey] || RESTAURANT_DATA["gaya"];
    const printWindow = window.open("", "_blank", "width=800,height=750");
    if (!printWindow) {
      window.print();
      return;
    }

    const itemsHtml = data.menuItems
      .map(
        (item) => `
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:10px 14px;">
          <strong style="color:#0f172a; font-size:14px;">${item.name}</strong><br>
          <span style="font-size:12px; color:#64748b;">${item.desc}</span>
        </td>
        <td style="padding:10px 14px; text-align:right; font-weight:700; color:#b45309; font-size:14px; white-space:nowrap;">${item.price}</td>
      </tr>
    `,
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Specialty Dining Guide - ${data.spotName}</title>
        <style>
          @page { margin: 15mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #1e293b; margin: 25px; background: #fff; line-height: 1.5; }
          .voucher-box { border: 2px solid #f59e0b; border-radius: 12px; padding: 24px; max-width: 700px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 20px; }
          .header h1 { margin: 0 0 6px; color: #b45309; font-size: 22px; }
          .header p { margin: 0; color: #64748b; font-size: 13px; }
          .badge-pureveg { display: inline-block; background: #ecfdf5; border: 1px solid #10b981; color: #047857; font-weight: 700; padding: 4px 12px; border-radius: 20px; font-size: 13px; margin-top: 8px; }
          .hotel-title { font-size: 18px; font-weight: 700; color: #0f172a; margin: 12px 0 4px; }
          .hotel-addr { font-size: 13px; color: #64748b; margin-bottom: 18px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px; }
          .info-item { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
          .info-label { font-size: 11px; text-transform: uppercase; color: #b45309; font-weight: 700; }
          .info-val { font-size: 14px; font-weight: 700; color: #1e293b; margin-top: 3px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .footer { font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 14px; }
        </style>
      </head>
      <body>
        <div class="voucher-box">
          <div class="header">
            <h1>🍴 उत्तर भारत यात्रा - प्रसिद्ध खाद्यसंस्कृती व उपाहारगृह माहिती</h1>
            <p>The Ultimate North Indian Travel Book (Gaya • Rajgir • Varanasi • Prayagraj • Ayodhya)</p>
            <div class="badge-pureveg">✓ 100% PURE VEGETARIAN / SATTVIK CUISINE</div>
          </div>

          <div class="hotel-title">${data.spotName}</div>
          <div class="hotel-addr">📍 ${data.address}</div>

          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Timings</div>
              <div class="info-val">${data.timings}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Average Cost</div>
              <div class="info-val">${data.avgCost}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr style="background:#f1f5f9; text-align:left;">
                <th style="padding:10px 14px; font-size:12px; color:#475569; text-transform:uppercase;">प्रसिद्ध खाद्यपदार्थ (Signature Dish)</th>
                <th style="padding:10px 14px; font-size:12px; color:#475569; text-align:right; text-transform:uppercase;">अंदाजित दर (Rate)</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="font-size:12.5px; color:#475569; margin-bottom:18px;">
            📞 <strong>Contact Helpline:</strong> ${data.contact}
          </div>

          <div class="footer">
            <p>Pure vegetarian &amp; sattvik culinary recommendations curated for pilgrims and travelers.</p>
          </div>
        </div>

        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  // --- 5. SACRED DESTINATIONS CITY TAB SWITCHER ---
  window.switchDestCity = function (cityId, btnElement) {
    if (!window.__destAutoRedirect && window.cancelDestRedirect)
      window.cancelDestRedirect();
    const targetBtn =
      btnElement ||
      document.querySelector(`.dest-tab-btn[data-city="${cityId}"]`);
    // A real click on a locked part explains why; the page's own start-up call (on every refresh)
    // must stay silent, so only a genuine user click shows the message.
    if (targetBtn && targetBtn.classList.contains("date-locked")) {
      const ev = window.event;
      if (
        ev &&
        ev.type === "click" &&
        ev.isTrusted &&
        window.showScheduleLockedMessage
      ) {
        window.showScheduleLockedMessage(targetBtn);
        return;
      }
    }
    if (targetBtn && targetBtn.classList.contains("is-locked")) {
      const cityNames = {
        gaya: "Gaya",
        rajgir: "Rajgir & Nalanda",
        varanasi: "Varanasi",
        prayagraj: "Prayagraj",
        ayodhya: "Ayodhya",
      };
      const cityOrder = ["gaya", "rajgir", "varanasi", "prayagraj", "ayodhya"];
      const targetIdx = cityOrder.indexOf(cityId);
      const prevCityId =
        targetIdx > 0 ? cityOrder[targetIdx - 1] : "previous city";
      const prevCityName = cityNames[prevCityId] || prevCityId;
      const targetCityName = cityNames[cityId] || cityId;

      showModernModal({
        icon: "fa-lock",
        emoji: "🗓️",
        title: "As per itinerary schedule",
        text: `You can see ${targetCityName} as per the itinerary schedule. Don't worry about that! (Pick your trip start date at the top and the parts will open automatically on time.)`,
        buttonText: "Got it",
      });
      return;
    }

    document.querySelectorAll(".dest-tab-btn").forEach((btn) => {
      btn.classList.remove("active");
    });

    if (targetBtn) {
      targetBtn.classList.add("active");
    }

    document.querySelectorAll(".dest-city-block").forEach((block) => {
      if (block.getAttribute("data-city") === cityId) {
        block.style.display = "block";
      } else {
        block.style.display = "none";
      }
    });
  };

  // --- CLEAR CITY VISITED PLACES FUNCTION ---
  window.clearCityVisited = function (cityId) {
    if (window.cancelDestRedirect) window.cancelDestRedirect();
    const cityBlock = document.querySelector(
      `.dest-city-block[data-city="${cityId}"]`,
    );
    if (!cityBlock) return;

    let savedVisited =
      JSON.parse(localStorage.getItem("sacred_visited_places")) || [];
    const placeItems = cityBlock.querySelectorAll(".dest-place-item");

    placeItems.forEach((item) => {
      const placeName = item.getAttribute("data-place-id");
      const checkbox = item.querySelector(".visited-checkbox");
      if (checkbox) checkbox.checked = false;
      item.classList.remove("is-visited");
      savedVisited = savedVisited.filter((p) => p !== placeName);
    });

    localStorage.setItem("sacred_visited_places", JSON.stringify(savedVisited));
    if (typeof window.updateTrackerProgress === "function") {
      window.updateTrackerProgress();
    }
  };

  // "View" on a completed city tile: open that city and scroll to its attractions
  document.addEventListener("click", (e) => {
    const v =
      e.target.closest && e.target.closest(".city-tracker-card .leg-view-btn");
    if (!v) return;
    const id = v.closest(".city-tracker-card").dataset.city;
    setTimeout(() => {
      const block = document.querySelector(
        `.dest-city-block[data-city="${id}"]`,
      );
      if (block) block.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  });

  // Set Gaya as default active tab on load
  switchDestCity("gaya");

  // --- 6. VISITED PLACES TRACKER, PROGRESSIVE UNLOCK & COMPLETION ---
  function initVisitedTracker() {
    const placesSection = document.getElementById("view-places-visited");
    if (!placesSection) return;

    // The Visited Places Tracker card (progress + city tiles) is written directly in index.html.

    let savedVisited =
      JSON.parse(localStorage.getItem("sacred_visited_places")) || [];
    const placeItems = document.querySelectorAll(".dest-place-item");
    const totalPlaces = placeItems.length;

    placeItems.forEach((item, index) => {
      const placeNameEl = item.querySelector(".dest-place-name");
      const placeName = placeNameEl
        ? placeNameEl.textContent.trim()
        : `place-${index}`;
      item.setAttribute("data-place-id", placeName);

      if (!item.querySelector(".visited-checkbox-wrap")) {
        const wrap = document.createElement("div");
        wrap.className = "visited-checkbox-wrap";
        wrap.innerHTML = `
          <input type="checkbox" class="visited-checkbox" ${savedVisited.includes(placeName) ? "checked" : ""} tabindex="-1">
          <span class="visited-custom-check"><i class="fa-solid fa-check"></i></span>
          <span class="visited-check-text">Visited</span>
        `;
        item.appendChild(wrap);
      }

      if (savedVisited.includes(placeName)) {
        item.classList.add("is-visited");
      } else {
        item.classList.remove("is-visited");
      }

      item.onclick = function (e) {
        const checkbox = item.querySelector(".visited-checkbox");
        if (!checkbox) return;

        const willBeChecked = !checkbox.checked;
        checkbox.checked = willBeChecked;

        if (willBeChecked) {
          item.classList.add("is-visited");
          if (!savedVisited.includes(placeName)) savedVisited.push(placeName);
        } else {
          item.classList.remove("is-visited");
          savedVisited = savedVisited.filter((p) => p !== placeName);
          cancelPendingRedirect();
        }

        localStorage.setItem(
          "sacred_visited_places",
          JSON.stringify(savedVisited),
        );
        updateTrackerProgress();

        // ALL PLACES OF THIS CITY VISITED -> paper blast inside the Destinations card
        if (willBeChecked) {
          const parentCityBlock = item.closest(".dest-city-block");
          if (parentCityBlock) {
            const totalCityPlaces =
              parentCityBlock.querySelectorAll(".dest-place-item").length;
            const visitedCityPlaces = parentCityBlock.querySelectorAll(
              ".dest-place-item.is-visited",
            ).length;
            if (totalCityPlaces > 0 && visitedCityPlaces === totalCityPlaces) {
              const doneCityId = parentCityBlock.getAttribute("data-city");
              celebrateCityComplete(doneCityId);
            }
          }
        }
      };
    });

    // ---- Sequence: city completed -> popup "Your Next Destination Is ..." with a paper blast in its
    //      background -> automatically open the next city card ----
    let redirectTimer = null;
    let blastRaf = null;
    let modalGoBtnHandler = null;

    const esc = (s) =>
      String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    function clearGoHandler() {
      const btn = document.getElementById("modalCloseBtn");
      if (btn && modalGoBtnHandler)
        btn.removeEventListener("click", modalGoBtnHandler);
      modalGoBtnHandler = null;
    }

    function stopBlast() {
      cancelAnimationFrame(blastRaf);
      blastRaf = null;
      document
        .querySelectorAll(".paper-blast-canvas")
        .forEach((c) => c.remove());
    }

    function cancelPendingRedirect() {
      clearTimeout(redirectTimer);
      redirectTimer = null;
      stopBlast();
      clearGoHandler();
    }
    window.cancelDestRedirect = cancelPendingRedirect;

    // Paper blast drawn on a canvas INSIDE the popup overlay, behind the popup box
    function launchPaperBlast(durationMs) {
      const overlay = document.getElementById("customModernModalOverlay");
      if (
        !overlay ||
        (window.matchMedia &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      )
        return;
      stopBlast();

      const W = overlay.clientWidth,
        H = overlay.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      const canvas = document.createElement("canvas");
      canvas.className = "paper-blast-canvas";
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      overlay.insertBefore(canvas, overlay.firstChild); // first child: the popup box stays on top
      const ctx = canvas.getContext("2d");
      ctx.scale(dpr, dpr);

      const colors = [
        "#F59E0B",
        "#FA7E1E",
        "#10B981",
        "#3B82F6",
        "#D62976",
        "#962FBF",
        "#FEDA75",
        "#EF4444",
      ];
      const pieces = [];
      // cannons: bottom-left, bottom-right and centre, fired in several waves
      const cannons = [
        { x: W * 0.12, y: H * 0.95, a: -Math.PI * 0.36 },
        { x: W * 0.88, y: H * 0.95, a: -Math.PI * 0.64 },
        { x: W * 0.5, y: H * 0.8, a: -Math.PI / 2 },
      ];
      const burst = (c, count, delay) => {
        for (let k = 0; k < count; k++) {
          const angle = c.a + (Math.random() - 0.5) * 1.1;
          const speed = 16 + Math.random() * 16;
          pieces.push({
            x: c.x,
            y: c.y,
            delay,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            w: 6 + Math.random() * 8,
            h: 4 + Math.random() * 7,
            rot: Math.random() * Math.PI * 2,
            vr: (Math.random() - 0.5) * 0.4,
            tilt: Math.random() * Math.PI * 2,
            color: colors[(Math.random() * colors.length) | 0],
            life: 0,
          });
        }
      };
      [0, 25, 55, 85].forEach((d) => cannons.forEach((c) => burst(c, 46, d)));

      const MAX_LIFE = 150;
      const stopAt = performance.now() + durationMs;
      let frame = 0;
      (function tick() {
        ctx.clearRect(0, 0, W, H);
        let alive = 0;
        pieces.forEach((p) => {
          if (frame < p.delay) {
            alive++;
            return;
          }
          p.life++;
          p.vy += 0.34;
          p.vx *= 0.99;
          p.vy *= 0.99;
          p.x += p.vx;
          p.y += p.vy;
          p.rot += p.vr;
          p.tilt += 0.18;
          if (p.life > MAX_LIFE || p.y > H + 20) return;
          alive++;
          ctx.save();
          ctx.globalAlpha = Math.max(0, Math.min(1, (MAX_LIFE - p.life) / 40));
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.scale(1, Math.cos(p.tilt)); // flutter like paper
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        });
        frame++;
        if (alive > 0 && performance.now() < stopAt + 1500)
          blastRaf = requestAnimationFrame(tick);
        else canvas.remove();
      })();
    }

    function cityLabel(id) {
      const t = document.querySelector(
        `.dest-tab-btn[data-city="${id}"] .city-tracker-name`,
      );
      return t
        ? t.textContent.trim()
        : id.charAt(0).toUpperCase() + id.slice(1);
    }

    function celebrateCityComplete(cityId) {
      cancelPendingRedirect();
      if (!window.showModernModal) return;

      const order = ["gaya", "rajgir", "varanasi", "prayagraj", "ayodhya"];
      const next = order[order.indexOf(cityId) + 1];
      const doneName = cityLabel(cityId);
      const POPUP_MS = 3500;

      // last city: no next destination, just a final celebration popup
      if (!next) {
        window.showModernModal({
          emoji: "🙏",
          variant: "success",
          title: "Your Sacred Journey Is Complete!",
          html: `<strong>${esc(doneName)}</strong> is complete! 🎉 You have visited all the sacred destinations.`,
          buttonText: "Har Har Mahadev",
          autoClose: 6000,
        });
        launchPaperBlast(6000);
        return;
      }

      const tile = document.querySelector(`.dest-tab-btn[data-city="${next}"]`);
      if (!tile) return;
      const nextName = cityLabel(next);

      // next card is not open yet (itinerary schedule / progressive lock): tell the user, stay here
      if (
        tile.classList.contains("date-locked") ||
        tile.classList.contains("is-locked")
      ) {
        const when = tile.dataset.unlock;
        window.showModernModal({
          emoji: "🚩",
          variant: "success",
          title: `Your Next Destination Is ${nextName}`,
          html: `<strong>${esc(doneName)}</strong> is complete! 🎉 ${esc(nextName)} opens as per ${when ? "the itinerary schedule: <strong>" + esc(when) + "</strong>" : "your itinerary schedule"}.`,
          buttonText: "Got it",
          autoClose: 5000,
        });
        launchPaperBlast(5000);
        return;
      }

      const go = () => {
        clearTimeout(redirectTimer);
        redirectTimer = null;
        clearGoHandler();
        stopBlast();
        window.__destAutoRedirect = true;
        try {
          window.switchDestCity(next, tile);
        } finally {
          window.__destAutoRedirect = false;
        }
        const block = document.querySelector(
          `.dest-city-block[data-city="${next}"]`,
        );
        if (block) block.scrollIntoView({ behavior: "smooth", block: "start" });
      };

      window.showModernModal({
        emoji: "🚩",
        variant: "success",
        title: `Your Next Destination Is ${nextName}`,
        html: `<strong>${esc(doneName)}</strong> is complete! 🎉 Taking you to <strong>${esc(nextName)}</strong> now…`,
        buttonText: `Go to ${nextName}`,
        autoClose: POPUP_MS,
      });
      launchPaperBlast(POPUP_MS);

      const btn = document.getElementById("modalCloseBtn");
      if (btn) {
        modalGoBtnHandler = go;
        btn.addEventListener("click", go);
      } // tapping the button goes right away
      redirectTimer = setTimeout(go, POPUP_MS + 60); // otherwise automatically
    }

    window.updateTrackerProgress = function () {
      const cityOrder = ["gaya", "rajgir", "varanasi", "prayagraj", "ayodhya"];
      const cityNames = {
        gaya: "Gaya",
        rajgir: "Rajgir & Nalanda",
        varanasi: "Varanasi",
        prayagraj: "Prayagraj",
        ayodhya: "Ayodhya",
      };

      let totalVisitedCount = 0;
      let prevCityCompleted = true; // Gaya is index 0 -> always unlocked!
      let validSavedVisited = [];

      cityOrder.forEach((cityId, index) => {
        const cityBlock = document.querySelector(
          `.dest-city-block[data-city="${cityId}"]`,
        );
        const tabBtn = document.querySelector(
          `.dest-tab-btn[data-city="${cityId}"]`,
        );
        // With a trip date the ITINERARY SCHEDULE decides what is open (see the lock overlay),
        // ticking places is no longer required to move forward.
        const scheduleOn =
          typeof window.itineraryScheduleActive === "function" &&
          window.itineraryScheduleActive();
        const isUnlocked = scheduleOn || index === 0 || prevCityCompleted;

        // Update tab lock state UI
        if (tabBtn) {
          if (isUnlocked) {
            tabBtn.classList.remove("is-locked");
            const lockIcon = tabBtn.querySelector(".tab-lock-icon");
            if (lockIcon) lockIcon.remove();
          } else {
            tabBtn.classList.add("is-locked");
            if (!tabBtn.querySelector(".tab-lock-icon")) {
              const lock = document.createElement("i");
              lock.className = "fa-solid fa-lock tab-lock-icon";
              tabBtn.appendChild(lock);
            }
          }
        }

        if (cityBlock) {
          const cityNameEl = cityBlock.querySelector(".dest-city-name");
          let cityName = cityId.charAt(0).toUpperCase() + cityId.slice(1);
          if (cityNameEl) {
            const clone = cityNameEl.cloneNode(true);
            const icon = clone.querySelector("i");
            const tag = clone.querySelector(".city-completed-tag");
            if (icon) icon.remove();
            if (tag) tag.remove();
            const cleanName = clone.textContent.trim();
            if (cleanName) cityName = cleanName;
          }

          // Add Clear All button to city header if missing
          const cityHeader = cityBlock.querySelector(".dest-city-header");
          if (cityHeader && !cityHeader.querySelector(".btn-clear-city")) {
            const clearBtn = document.createElement("button");
            clearBtn.className = "btn-clear-city";
            clearBtn.title = "Clear visited places for this city";
            clearBtn.innerHTML = `<i class="fa-solid fa-rotate-left"></i> Reset`;
            clearBtn.onclick = function (e) {
              e.stopPropagation();
              window.clearCityVisited(cityId);
            };
            cityHeader.appendChild(clearBtn);
          }

          const cityPlaces = cityBlock.querySelectorAll(".dest-place-item");
          const totalCityPlaces = cityPlaces.length;

          if (!isUnlocked) {
            cityPlaces.forEach((item) => {
              item.classList.remove("is-visited");
              const checkbox = item.querySelector(".visited-checkbox");
              if (checkbox) checkbox.checked = false;
            });
          }

          const visitedCityPlaces = isUnlocked
            ? cityBlock.querySelectorAll(".dest-place-item.is-visited").length
            : 0;

          if (isUnlocked) {
            totalVisitedCount += visitedCityPlaces;
            cityPlaces.forEach((item) => {
              if (item.classList.contains("is-visited")) {
                const placeId = item.getAttribute("data-place-id");
                if (placeId && !validSavedVisited.includes(placeId)) {
                  validSavedVisited.push(placeId);
                }
              }
            });
          }

          // MUST BE UNLOCKED to be marked completed
          const isCurrentCityCompleted =
            isUnlocked &&
            totalCityPlaces > 0 &&
            visitedCityPlaces === totalCityPlaces;

          // Update Top Visited Places Tracker Dashboard City Breakdown Cards
          const countEl = document.getElementById(`count-${cityId}`);
          const barEl = document.getElementById(`bar-${cityId}`);
          const trackerCardEl = document.querySelector(
            `.city-tracker-card[data-city-card="${cityId}"]`,
          );

          if (trackerCardEl) {
            if (isUnlocked) {
              trackerCardEl.classList.remove("is-locked");
              if (countEl)
                countEl.textContent = `${visitedCityPlaces} / ${totalCityPlaces}`;
            } else {
              trackerCardEl.classList.add("is-locked");
              if (countEl)
                countEl.innerHTML = `<i class="fa-solid fa-lock tracker-lock-icon"></i> Locked`;
            }

            if (isCurrentCityCompleted) {
              trackerCardEl.classList.add("is-complete");
            } else {
              trackerCardEl.classList.remove("is-complete");
            }
          }

          if (barEl) {
            const cityPct =
              isUnlocked && totalCityPlaces > 0
                ? Math.round((visitedCityPlaces / totalCityPlaces) * 100)
                : 0;
            barEl.style.width = `${cityPct}%`;
          }

          const cityBody = cityBlock.querySelector(".dest-city-body");
          let cityBanner = cityBlock.querySelector(".city-complete-banner");

          if (isCurrentCityCompleted) {
            if (!cityBanner && cityBody) {
              cityBanner = document.createElement("div");
              cityBanner.className = "city-complete-banner";
              cityBanner.innerHTML = `
                <div class="city-complete-header">
                  <i class="fa-solid fa-circle-check city-complete-icon"></i>
                  <div class="city-complete-info">
                    <h3>🎉 ${cityName} tourist all places are visited!</h3>
                    <p>Congratulations on visiting all attractions in ${cityName}!</p>
                  </div>
                </div>
              `;
              cityBody.insertBefore(cityBanner, cityBody.firstChild);
            } else if (cityBanner) {
              cityBanner.style.display = "flex";
            }

            if (tabBtn && !tabBtn.querySelector(".city-completed-tag")) {
              const tag = document.createElement("span");
              tag.className = "city-completed-tag";
              tag.title = "All places visited";
              tag.innerHTML = `<i class="fa-solid fa-check"></i>`;
              (tabBtn.querySelector(".ctc-progress") || tabBtn).appendChild(
                tag,
              );
            }
          } else {
            if (cityBanner) {
              cityBanner.style.display = "none";
            }
            if (tabBtn) {
              const tag = tabBtn.querySelector(".city-completed-tag");
              if (tag) tag.remove();
            }
          }

          prevCityCompleted = isUnlocked && isCurrentCityCompleted;
        }
      });

      // Update LocalStorage to keep only valid unlocked visited places
      localStorage.setItem(
        "sacred_visited_places",
        JSON.stringify(validSavedVisited),
      );

      // Update Overall Tracker Header KPI
      const percent =
        totalPlaces > 0
          ? Math.round((totalVisitedCount / totalPlaces) * 100)
          : 0;
      const counterText = document.getElementById("visitedCounterText");
      const fillBar = document.getElementById("visitedProgressBarFill");
      const banner = document.getElementById("visitedAllCompleteBanner");

      if (counterText)
        counterText.textContent = `${totalVisitedCount} / ${totalPlaces} Visited (${percent}%)`;
      if (fillBar) fillBar.style.width = `${percent}%`;

      if (totalVisitedCount === totalPlaces && totalPlaces > 0) {
        if (banner) banner.style.display = "flex";
      } else {
        if (banner) banner.style.display = "none";
      }
    };

    window.updateTrackerProgress();
  }

  initVisitedTracker();

  // Initial Render
  renderExpenses();
  toggleCategoryExtras();
});

/* ==========================================================================
   TRIP DATE SELECTOR — applies the chosen start date across the website
   (Day-Wise Route Details, Train Schedule Details, Sacred Destinations)
   ========================================================================== */
(function () {
  "use strict";

  const STORAGE_KEY = "north_india_trip_start";
  const TOTAL_DAYS = 14;

  const EN_DAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const MR_DAYS = [
    "रविवार",
    "सोमवार",
    "मंगळवार",
    "बुधवार",
    "गुरुवार",
    "शुक्रवार",
    "शनिवार",
  ];
  const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Itinerary day numbers (from the Day-Wise plan) for each train leg
  const TRAIN_LEG_DAYS = {
    "pune-gaya": { dep: 1, arr: 2 },
    "gaya-rajgir": { dep: 4, arr: 4 },
    "rajgir-varanasi": { dep: 5, arr: 6 },
    "banaras-prayagraj": { dep: 9, arr: 9 },
    "prayagraj-ayodhya": { dep: 11, arr: 11 },
    "ayodhya-varanasi": { dep: 13, arr: 13 },
    "banaras-hadapsar": { dep: 13, arr: 14 },
  };

  // Trains that do NOT run daily (JS weekday numbers: Sun=0 ... Sat=6)
  const TRAIN_RUN_DAYS = {
    11427: { days: [5], label: "Friday only", route: "Pune → Gaya" },
    14231: {
      days: [1, 2, 3, 5, 6],
      label: "Mon, Tue, Wed, Fri, Sat",
      route: "Prayagraj → Ayodhya",
    },
    22589: { days: [3], label: "Wednesday only", route: "Banaras → Hadapsar" },
  };

  // City stay windows (itinerary day numbers)
  const CITY_DAYS = {
    gaya: [[2, 3]],
    rajgir: [[4, 5]],
    varanasi: [
      [6, 8],
      [13, 13],
    ],
    prayagraj: [[9, 10]],
    ayodhya: [[11, 12]],
  };

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) =>
    Array.from((root || document).querySelectorAll(sel));

  const input = $("#tripStartDate");
  if (!input) return;
  const clearBtn = $("#tripDateClear");
  const rangeEl = $("#tripRange");
  const noticeEl = $("#tripDateNotice");
  const homeDates = $("#homeTripDates");

  // ---------- date helpers ----------
  function parseISO(v) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || "");
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  }
  function dayDate(start, n) {
    return new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate() + n - 1,
    );
  }
  const short = (d) => `${d.getDate()} ${MONTHS[d.getMonth()]}`;
  const full = (d) =>
    `${EN_DAYS[d.getDay()].slice(0, 3)}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

  function remember(el) {
    if (el.dataset.orig === undefined) el.dataset.orig = el.innerHTML;
  }
  function inject(parent, html, mode) {
    const wrap = document.createElement("div");
    wrap.innerHTML = html.trim();
    const node = wrap.firstChild;
    node.classList.add("date-injected");
    if (mode === "prepend") parent.insertBefore(node, parent.firstChild);
    else parent.appendChild(node);
    return node;
  }

  // ---------- reset ----------
  function resetAll() {
    $$(".date-injected").forEach((n) => n.remove());
    $$("[data-orig]").forEach((el) => {
      el.innerHTML = el.dataset.orig;
      delete el.dataset.orig;
    });
    $$(".day-weekday-pill.dated").forEach((el) => el.classList.remove("dated"));
    clearTimeout(flipTimer);
    $$(".date-locked").forEach((el) => {
      el.classList.remove("date-locked");
      delete el.dataset.unlock;
    });
    $$(".leg-done").forEach((el) => {
      el.classList.remove("leg-done");
      if (el.dataset.posSet) {
        el.style.position = "";
        delete el.dataset.posSet;
      }
    });
    $$(".day-clone").forEach((c) => c.remove());
    $$(".day-viewing").forEach((c) => c.classList.remove("day-viewing"));
    $$(".day-card.day-done").forEach((c) => {
      c.classList.remove("day-done", "day-blurred", "day-revealed");
      Array.from(c.children).forEach((ch) => {
        ch.inert = false;
      });
    });
    $$(".live-active").forEach((el) => {
      el.classList.remove("live-active");
      if (el.dataset.posSet) {
        el.style.position = "";
        delete el.dataset.posSet;
      }
    });
    if (noticeEl) noticeEl.hidden = true;
    if (rangeEl) rangeEl.hidden = true;
    if (clearBtn) clearBtn.hidden = true;
    if (homeDates) homeDates.textContent = "Select date in navbar";
  }

  // ---------- 1. Day-Wise Route Details ----------
  function applyDayWise(start) {
    $$("#view-day-wise .day-card:not(.day-clone)").forEach((card) => {
      const num = parseInt(($(".day-num-val", card) || {}).textContent, 10);
      if (!num) return;
      const d = dayDate(start, num);

      const pill = $(".day-weekday-pill", card);
      if (pill) {
        remember(pill);
        pill.innerHTML = `<i class="fa-regular fa-calendar"></i> ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()} • ${MR_DAYS[d.getDay()]} • ${EN_DAYS[d.getDay()]}`;
        pill.classList.add("dated");
      }

      // "(Day 2)" references in arrival stations -> real dates
      $$(".dtrain-station", card).forEach((s) => {
        if (!/\(Day \d+\)/.test(s.textContent)) return;
        remember(s);
        s.innerHTML = s.innerHTML.replace(
          /\(Day (\d+)\)/,
          (_, n) => `(${short(dayDate(start, +n))})`,
        );
      });

      // Fixed-day train warnings
      const warns = [];
      $$(".dtrain-no", card).forEach((t) => {
        const info = TRAIN_RUN_DAYS[t.textContent.trim()];
        if (info && !info.days.includes(d.getDay())) {
          warns.push(
            `Train ${t.textContent.trim()} runs ${info.label} — not on ${EN_DAYS[d.getDay()]}.`,
          );
        }
      });
      if (warns.length) {
        const body = $(".day-body", card);
        if (body)
          inject(
            body,
            `<div class="day-date-warning"><i class="fa-solid fa-triangle-exclamation"></i> ${warns.join(" ")}</div>`,
            "prepend",
          );
      }
    });
  }

  // ---------- 2. Train Schedule Details ----------
  function applyTrains(start) {
    $$("#view-train-details .train-leg-btn[data-train-leg]").forEach((btn) => {
      const leg = TRAIN_LEG_DAYS[btn.dataset.trainLeg];
      if (leg)
        inject(
          btn,
          `<span class="leg-date">${short(dayDate(start, leg.dep))}</span>`,
        );
    });

    $$("#view-train-details .train-card[data-train-leg]").forEach((card) => {
      const leg = TRAIN_LEG_DAYS[card.dataset.trainLeg];
      if (!leg) return;
      const dep = dayDate(start, leg.dep);
      const arr = dayDate(start, leg.arr);

      $$(".train-grid-box", card).forEach((box) => {
        const label = ($(".grid-box-label", box) || {}).textContent || "";
        const sub = $(".grid-box-sub", box);
        if (!sub || !/Day \d+/.test(sub.textContent)) return;
        const date = /DEPARTURE/.test(label)
          ? dep
          : /ARRIVAL/.test(label)
            ? arr
            : null;
        if (!date) return;
        remember(sub);
        sub.textContent = sub.textContent.replace(
          /Day \d+(\s*\(\+1 Day\))?/,
          full(date),
        );
      });

      const trainNo = (($(".train-num-pill", card) || {}).textContent.match(
        /\d{5}/,
      ) || [])[0];
      const badges = $(".header-badge-group", card);
      if (badges) {
        const info = TRAIN_RUN_DAYS[trainNo];
        const wd = EN_DAYS[dep.getDay()];
        if (info && !info.days.includes(dep.getDay())) {
          inject(
            badges,
            `<span class="t-badge run-check bad"><i class="fa-solid fa-triangle-exclamation"></i> Doesn't run on ${wd}</span>`,
          );
        } else {
          inject(
            badges,
            `<span class="t-badge run-check ok"><i class="fa-solid fa-circle-check"></i> Runs on ${wd}</span>`,
          );
        }
      }
    });
  }

  // ---------- 3. Sacred Destinations (+ home cards) ----------
  function cityRangeText(start, key) {
    return CITY_DAYS[key]
      .map((seg, i) => {
        const a = dayDate(start, seg[0]);
        const b = dayDate(start, seg[1]);
        const txt = seg[0] === seg[1] ? short(a) : `${short(a)} – ${short(b)}`;
        return (i > 0 ? "Return: " : "") + txt;
      })
      .join(" · ");
  }

  function applyPlaces(start) {
    const chip = (key) =>
      `<span class="date-chip"><i class="fa-regular fa-calendar"></i> ${cityRangeText(start, key)}</span>`;

    $$("#view-places-visited .dest-city-block[data-city]").forEach((block) => {
      const key = block.dataset.city;
      const target = $(".dest-city-left > div", block);
      if (CITY_DAYS[key] && target) inject(target, chip(key));
    });
    $$("#view-places-visited .dest-tab-btn[data-city]").forEach((btn) => {
      const key = btn.dataset.city;
      if (CITY_DAYS[key]) inject(btn, chip(key));
    });
    $$("#view-home .place-card[data-city] .place-info").forEach((info) => {
      const key = info.closest(".place-card").dataset.city;
      if (CITY_DAYS[key]) inject(info, chip(key));
    });
  }

  // ---------- notice banner ----------
  // Messages are shown in a popup box now (see the date handler below); the inline banner stays hidden.
  function updateNotice() {
    if (noticeEl) noticeEl.hidden = true;
  }

  // ---------- 4. LOCKS (driven by the train schedule, NOT by the calendar date) ----------
  // Every schedule time is an Indian Standard Time (IST, UTC+05:30, no daylight saving) wall-clock time,
  // so a card unlocks at the same real moment for every visitor, wherever their device clock / timezone is.
  const SCHEDULE_TZ_OFFSET_MIN = 330;
  const SCHEDULE_TZ_NAME = "IST";
  const DAY_END_TIME = [23, 59]; // the last day closes at 11:59 PM IST

  // When does each day's card open?  [hour (24h), minute] — taken from the train schedule.
  // Days without an early train open at the default morning time (06:00 AM). Edit freely.
  const DAY_UNLOCK_TIMES = {
    1: [6, 40], // Train 11427 Pune → Gaya departs 06:40 AM  (first train, Friday)
    2: [9, 40], // Train 11427 arrives Gaya 09:40 AM
    3: [6, 0],
    4: [7, 40], // Train 63368 Gaya → Rajgir departs 07:40 AM
    5: [6, 0], // Rajgir sightseeing (night train 15137 leaves 09:30 PM)
    6: [7, 15], // Train 15137 arrives Banaras 07:15 AM
    7: [6, 0],
    8: [6, 0],
    9: [6, 40], // Train 65111 Varanasi → Prayagraj departs 06:40 AM
    10: [6, 0],
    11: [4, 40], // Train 14231 Prayagraj → Ayodhya departs 04:40 AM
    12: [6, 0],
    13: [9, 5], // Train 14214 Ayodhya → Varanasi departs 09:05 AM
    14: [0, 10], // Train 22589 arrives Hadapsar 00:10 AM (a train time, not a calendar rollover)
  };

  // IST wall-clock time on trip day `dayNum` -> real moment (ms since epoch)
  function scheduleMoment(start, dayNum, hm) {
    return (
      Date.UTC(
        start.getFullYear(),
        start.getMonth(),
        start.getDate() + dayNum - 1,
        hm[0],
        hm[1],
      ) -
      SCHEDULE_TZ_OFFSET_MIN * 60000
    );
  }

  function scheduleTimes(start) {
    const unlock = [0];
    for (let n = 1; n <= TOTAL_DAYS; n++) {
      let ms = scheduleMoment(start, n, DAY_UNLOCK_TIMES[n] || [6, 0]);
      if (n > 1 && ms <= unlock[n - 1]) ms = unlock[n - 1] + 60000; // keep the order of the days
      unlock.push(ms);
    }
    return { unlock, end: scheduleMoment(start, TOTAL_DAYS, DAY_END_TIME) };
  }

  const clockText = (hm) =>
    `${String(hm[0] % 12 || 12).padStart(2, "0")}:${String(hm[1]).padStart(2, "0")} ${hm[0] >= 12 ? "PM" : "AM"}`;

  // Newest day whose scheduled time has been reached (0 = the first train has not left yet)
  function activeDayNumber(start) {
    const t = scheduleTimes(start),
      now = Date.now();
    let day = 0;
    for (let n = 1; n <= TOTAL_DAYS; n++) if (now >= t.unlock[n]) day = n;
    return day;
  }

  function tripEnded(start) {
    return Date.now() >= scheduleTimes(start).end;
  }

  // Changes whenever any card has to change its lock state
  function scheduleSignature(start) {
    return activeDayNumber(start) + "|" + tripEnded(start);
  }

  function lockEl(el, unlockText, label) {
    if (!el || el.classList.contains("date-locked")) return;
    el.classList.add("date-locked");
    el.dataset.unlock = unlockText;
    const dn = el.classList.contains("day-card") ? tileDayNo(el) : "";
    inject(
      el,
      '<div class="lock-overlay">' +
        dn +
        '<i class="fa-solid fa-lock"></i><span>' +
        (label || "Locked") +
        "</span></div>",
    );
  }

  // "DAY 05" badge shown on the small completed / locked day tiles
  function tileDayNo(card) {
    const n = parseInt(($(".day-num-val", card) || {}).textContent, 10);
    return n
      ? '<b class="tile-day-badge"><span>DAY</span> ' +
          String(n).padStart(2, "0") +
          "</b>"
      : "";
  }

  // Days that are finished. Remembered per start date, so a completed day never un-completes.
  function completedDays(start) {
    const KEY = "north_india_completed_days";
    const iso = input.value;
    let all = {};
    try {
      all = JSON.parse(localStorage.getItem(KEY) || "{}") || {};
    } catch (e) {
      all = {};
    }
    const set = new Set(all[iso] || []);
    const active = activeDayNumber(start);
    for (let d = 1; d < active; d++) set.add(d); // a day is completed when the NEXT day's scheduled time is reached
    if (tripEnded(start)) set.add(TOTAL_DAYS); // the last day completes when the trip ends
    all[iso] = Array.from(set);
    try {
      localStorage.setItem(KEY, JSON.stringify(all));
    } catch (e) {
      /* ignore */
    }
    return set;
  }

  // Completed day card: green stamp + blurred details + View / Close buttons
  function setCardRevealed(card, show) {
    card.classList.toggle("day-blurred", !show);
    card.classList.toggle("day-revealed", show);
    Array.from(card.children).forEach((ch) => {
      if (!ch.classList.contains("date-injected")) ch.inert = !show; // blurred details can't be read or tabbed into
    });
    layoutDayTiles();
  }

  // Day-Wise layout: small tiles (completed / locked) are 170px high.
  //  - today's card sits on the LEFT and spans as many tile rows as its content needs; locked tiles fill the right side
  //  - a completed day opened with "View Details" becomes a full-width card sized to its content, placed directly
  //    BELOW the row of completed tiles it belongs to (never beside the tiles)
  const TILE_H = 170,
    TILE_GAP = 24,
    TILE_COLS = 4;
  let layoutQueued = false;
  function layoutDayTiles() {
    if (layoutQueued) return;
    layoutQueued = true;
    requestAnimationFrame(() => {
      layoutQueued = false;
      const box = document.querySelector("#view-day-wise .days-container");
      if (!box || box.offsetParent === null) return; // view hidden: measured when it is shown
      const cards = Array.from(
        box.querySelectorAll(":scope > .day-card:not(.day-clone)"),
      );
      const clones = Array.from(box.querySelectorAll(":scope > .day-clone"));
      const isTile = (c) =>
        c.classList.contains("date-locked") || c.classList.contains("day-done");
      const wide = window.innerWidth > 992;
      const hasTiles = wide && cards.some(isTile);
      box.classList.toggle("tile-layout", hasTiles);

      const doneIdx = []; // DOM positions of completed days
      cards.forEach((c, i) => {
        if (c.classList.contains("day-done")) doneIdx.push(i);
      });

      cards.forEach((c, i) => {
        c.style.removeProperty("--row-span");
        c.classList.remove("measuring");
        c.style.order = i * 100; // tiles never change place
        if (!hasTiles || isTile(c)) return;
        c.classList.add("measuring"); // today's card: measure, then span the rows it needs
        const h = c.getBoundingClientRect().height;
        c.classList.remove("measuring");
        c.style.setProperty(
          "--row-span",
          Math.max(1, Math.ceil((h + TILE_GAP) / (TILE_H + TILE_GAP))),
        );
      });

      clones.forEach((cl) => {
        // opened day -> right below the row its tile is in
        const i = cards.findIndex((c) => dayNoOf(c) === +cl.dataset.cloneOf);
        if (i < 0) {
          cl.remove();
          return;
        }
        let at = i;
        if (hasTiles) {
          const p = doneIdx.indexOf(i);
          if (p >= 0)
            at =
              doneIdx[
                Math.min(
                  doneIdx.length - 1,
                  Math.floor(p / TILE_COLS) * TILE_COLS + (TILE_COLS - 1),
                )
              ];
        }
        cl.style.order = at * 100 + +cl.dataset.cloneOf; // unique per day: several opened days sit side by side in day order, never replace each other
      });
    });
  }
  (function watchDayTiles() {
    let t;
    window.addEventListener("resize", () => {
      clearTimeout(t);
      t = setTimeout(layoutDayTiles, 120);
    });
    window.addEventListener("load", layoutDayTiles);
    const sec = document.getElementById("view-day-wise");
    if (sec)
      new MutationObserver(layoutDayTiles).observe(sec, {
        attributes: true,
        attributeFilter: ["class"],
      });
  })();

  // Trip Start date bar: at <= 768px it sits inside the hero banner (under the colourful pill) on the Home page;
  // everywhere else (other pages, wider screens) it stays in the top bar. Same element moves, so all its logic keeps working.
  (function placeTripDate() {
    const picker = document.getElementById("tripDatePicker");
    const home = document.getElementById("view-home");
    const heroContent = document.querySelector(".hero-banner .hero-content");
    if (!picker || !home || !heroContent) return;
    const marker = document.createComment("trip-date-home");
    picker.parentNode.insertBefore(marker, picker); // remembers its place in the top bar
    const mq = window.matchMedia("(max-width: 768px)");
    function place() {
      const inHero = mq.matches && home.classList.contains("active");
      if (inHero && picker.parentNode !== heroContent)
        heroContent.appendChild(picker);
      else if (!inHero && picker.parentNode === heroContent)
        marker.parentNode.insertBefore(picker, marker);
      picker.classList.toggle("in-hero", inHero);
    }
    place();
    if (mq.addEventListener) mq.addEventListener("change", place);
    else mq.addListener(place);
    new MutationObserver(place).observe(home, {
      attributes: true,
      attributeFilter: ["class"],
    });
  })();

  function markCompleted(card) {
    if (card.classList.contains("day-done")) return;
    const header = $(".day-card-header", card);
    if (!header) return;
    card.classList.add("day-done");
    // stamp and top bar go immediately before .day-card-header
    header.insertAdjacentHTML(
      "beforebegin",
      '<div class="day-completed-stamp date-injected" role="img" aria-label="Completed"><span>Completed</span></div>' +
        '<div class="day-done-bar date-injected"><span><i class="fa-solid fa-circle-check"></i> Day completed</span>' +
        '<button type="button" class="day-close-btn"><i class="fa-solid fa-xmark"></i> Close</button></div>',
    );
    inject(
      card,
      '<div class="day-done-veil">' +
        tileDayNo(card) +
        '<button type="button" class="day-view-btn"><i class="fa-solid fa-eye"></i> View Details</button></div>',
    );
    setCardRevealed(card, false);
  }

  // "View Details" on a completed tile: the tile stays exactly where it is; a full-width copy of the day opens
  // directly below that tile's row. "Close" removes the copy again.
  const dayNoOf = (c) => parseInt(($(".day-num-val", c) || {}).textContent, 10);
  const findDayTile = (n) =>
    $$("#view-day-wise .day-card:not(.day-clone)").find(
      (c) => dayNoOf(c) === n,
    );
  const openDayNos = new Set(); // days whose details are open (survives a schedule re-apply)
  const findDayClone = (n) =>
    $$("#view-day-wise .day-clone").find((c) => +c.dataset.cloneOf === n);

  function openDayDetail(tile, silent) {
    const n = dayNoOf(tile);
    const box = tile.parentElement;
    const old = findDayClone(n);
    if (old) {
      old.scrollIntoView({ block: "nearest", behavior: "smooth" });
      return;
    }
    // only ONE day can be open at a time: opening this day closes any other open day first
    $$("#view-day-wise .day-clone").forEach((other) => {
      const on = +other.dataset.cloneOf;
      if (on === n) return;
      const t = findDayTile(on);
      if (t) t.classList.remove("day-viewing");
      openDayNos.delete(on);
      other.remove();
    });
    const clone = tile.cloneNode(true);
    clone.removeAttribute("style");
    clone.classList.remove("day-blurred", "live-active", "day-viewing");
    clone.classList.add("day-clone", "day-done", "day-revealed");
    clone.dataset.cloneOf = n;
    $$(".day-done-veil", clone).forEach((v) => v.remove());
    Array.from(clone.children).forEach((ch) => {
      ch.inert = false;
    });
    box.appendChild(clone);
    openDayNos.clear();
    openDayNos.add(n);
    tile.classList.add("day-viewing");
    layoutDayTiles();
    if (!silent)
      setTimeout(
        () => clone.scrollIntoView({ block: "nearest", behavior: "smooth" }),
        60,
      );
  }

  function closeDayDetail(clone) {
    const tile = findDayTile(+clone.dataset.cloneOf);
    openDayNos.delete(+clone.dataset.cloneOf);
    clone.remove();
    if (tile) {
      tile.classList.remove("day-viewing");
      tile.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
    layoutDayTiles();
  }

  document.addEventListener("click", (e) => {
    const view = e.target.closest && e.target.closest(".day-view-btn");
    const close = e.target.closest && e.target.closest(".day-close-btn");
    if (view) {
      const tile = view.closest("#view-day-wise .day-card:not(.day-clone)");
      if (tile) openDayDetail(tile);
    } else if (!close && e.target.closest) {
      // clicking anywhere on a completed tile does the same as its View Details button
      const tile = e.target.closest(
        "#view-day-wise .day-card.day-done.day-blurred:not(.day-clone)",
      );
      if (tile) openDayDetail(tile);
    }
    if (close) {
      const clone = close.closest(".day-clone");
      if (clone) closeDayDetail(clone);
    }
  });

  // Green blinking light on whatever is open (active) right now.
  // Tabs get a small corner light; cards get the light built into their own header badges.
  function markActive(el) {
    if (
      !el ||
      el.classList.contains("live-active") ||
      el.classList.contains("date-locked")
    )
      return;
    el.classList.add("live-active");

    const isTab =
      el.tagName === "BUTTON" ||
      /(^|\s)[\w-]*(tab|btn)[\w-]*(\s|$)/.test(el.className);
    if (isTab) {
      if (getComputedStyle(el).position === "static") {
        el.style.position = "relative";
        el.dataset.posSet = "1";
      }
      inject(el, '<span class="live-dot" title="Active now"><i></i></span>');
      return;
    }

    const dayTag = $(".day-tag", el); // Day-Wise card: light sits inside the right-hand badge
    const badges = $(".header-badge-group", el); // Train / Hotel / Restaurant card
    const cityInfo = $(".dest-city-left > div", el); // Destinations city block
    if (dayTag) {
      dayTag.insertAdjacentHTML(
        "afterbegin",
        '<i class="live-led live-led-tag date-injected" title="Active now"></i>',
      );
    } else if (badges) {
      inject(
        badges,
        '<span class="live-pill" title="Active now"><i class="live-led"></i>Live</span>',
      );
    } else if (cityInfo) {
      inject(
        cityInfo,
        '<span class="live-pill" title="Active now"><i class="live-led"></i>Live</span>',
      );
    } else {
      if (getComputedStyle(el).position === "static") {
        el.style.position = "relative";
        el.dataset.posSet = "1";
      }
      inject(el, '<span class="live-dot" title="Active now"><i></i></span>');
    }
  }

  // A part stays open from its own day until the NEXT part starts, so the days in between
  // (no train that day) never fall back to a locked screen.
  function openWindows(list) {
    const sorted = list.slice().sort((a, b) => a.s - b.s);
    return sorted.map((w) => {
      const next = sorted.find((x) => x.s > w.s);
      return {
        key: w.key,
        s: w.s,
        e: next ? Math.max(w.s, next.s - 1) : TOTAL_DAYS,
      };
    });
  }
  const CITY_WINDOWS = openWindows(
    Object.keys(CITY_DAYS).flatMap((k) =>
      CITY_DAYS[k].map((seg) => ({ key: k, s: seg[0] })),
    ),
  );
  const LEG_WINDOWS = openWindows(
    Object.keys(TRAIN_LEG_DAYS).map((k) => ({
      key: k,
      s: TRAIN_LEG_DAYS[k].dep,
    })),
  );
  const inWindow = (wins, key, day) =>
    wins.some((w) => w.key === key && day >= w.s && day <= w.e);

  function applyLocks(start) {
    const active = activeDayNumber(start);
    const cityOpen = (k) => !!CITY_DAYS[k] && inWindow(CITY_WINDOWS, k, active);

    // Locks apply ONLY to: Day-Wise Route Details, Train Schedule, Destinations,
    // Hotel Details and Restaurant Details. The Home page is never locked.
    // Open items get a blinking green light; every other tab / card stays locked.

    // 0) Day-Wise Route Details: finished days = Completed stamp + blur, the day whose train time has been reached = open, the rest = locked
    const done = completedDays(start);
    $$("#view-day-wise .day-card:not(.day-clone)").forEach((card) => {
      const num = parseInt(($(".day-num-val", card) || {}).textContent, 10);
      if (!num) return;
      if (done.has(num))
        markCompleted(card); // finished day
      else if (num !== active) {
        // not reached yet: locked until its train time
        const hm = DAY_UNLOCK_TIMES[num] || [6, 0];
        const when = `${full(dayDate(start, num))} at ${clockText(hm)} ${SCHEDULE_TZ_NAME}`;
        lockEl(
          card,
          `Day ${num} • ${when}`,
          `Opens ${short(dayDate(start, num))} • ${clockText(hm)} ${SCHEDULE_TZ_NAME}`,
        );
      } else markActive(card); // today
    });
    layoutDayTiles();

    const ended = tripEnded(start);

    // A part is COMPLETED when its time is over and it does not come back later
    // (Varanasi comes back on day 13, so it is only completed after that).
    const partDone = (wins, k) =>
      ended ||
      (!inWindow(wins, k, active) &&
        wins.some((w) => w.key === k && active > w.e));

    // 1) Train Schedule Details (a leg stays open until the next train journey starts)
    const legOpen = (k) =>
      !!TRAIN_LEG_DAYS[k] && inWindow(LEG_WINDOWS, k, active);
    $$("#view-train-details [data-train-leg]").forEach((el) => {
      const k = el.dataset.trainLeg;
      if (!TRAIN_LEG_DAYS[k]) return;
      if (legOpen(k)) markActive(el);
      else if (partDone(LEG_WINDOWS, k))
        markPartCompleted(el); // finished: badge + View button
      else lockEl(el, full(dayDate(start, TRAIN_LEG_DAYS[k].dep))); // not reached yet
    });

    // 2) Destinations / Attractions, 3) Hotel Details, 4) Restaurant Details
    const cityDone = (k) =>
      ended ||
      CITY_WINDOWS.filter((w) => w.key === k).every((w) => active > w.e);
    const cityGroups = [
      ["#view-places-visited [data-city]", "city", false],
      ["#view-hotel-details [data-hotel-city]", "hotelCity", true],
      ["#view-restaurant-details [data-rest-city]", "restCity", true],
    ];
    cityGroups.forEach(([selector, prop, useBadge]) => {
      $$(selector).forEach((el) => {
        const k = el.dataset[prop];
        if (!CITY_DAYS[k]) return;
        if (cityOpen(k)) markActive(el);
        else if (!useBadge) {
          // Destinations: a city is finished only when ALL its visits are over (Varanasi returns on day 13).
          // A finished city's tile gets the completed badge + View button and its attractions stay readable.
          if (cityDone(k)) {
            if (el.matches(".dest-tab-btn")) markPartCompleted(el);
          } else lockEl(el, cityRangeText(start, k));
        } else if (partDone(CITY_WINDOWS, k))
          markPartCompleted(el); // Hotel / Restaurant: badge + View
        else lockEl(el, cityRangeText(start, k));
      });
    });
  }

  // Finished part (Train / Hotel / Restaurant tab): green tick badge top-right + View button at the bottom
  function markPartCompleted(el) {
    if (
      !el.matches(".train-leg-btn, .dest-tab-btn") ||
      el.classList.contains("leg-done")
    )
      return;
    el.classList.add("leg-done");
    if (getComputedStyle(el).position === "static") {
      el.style.position = "relative";
      el.dataset.posSet = "1";
    }
    inject(
      el,
      '<img class="leg-done-badge" src="completed-badge.png" alt="Completed" title="Completed">',
    );
    inject(
      el,
      '<span class="leg-view-btn" title="See the details of this part"><i class="fa-solid fa-eye"></i> View</span>',
    );
  }

  // Friendly message for any part that is not open yet / not open any more
  window.showScheduleLockedMessage = function (el) {
    if (!window.showModernModal) return;
    window.showModernModal({
      emoji: "🗓️",
      title: "As per itinerary schedule",
      html: `You can see this part as per the itinerary schedule: <strong>${el.dataset.unlock || "its planned time"}</strong>. Don't worry about that! 😊`,
      buttonText: "Got it",
    });
  };

  // Block all clicks on locked items and explain why
  document.addEventListener(
    "click",
    (e) => {
      const locked = e.target.closest && e.target.closest(".date-locked");
      if (!locked) return;
      e.preventDefault();
      e.stopPropagation();
      window.showScheduleLockedMessage(locked);
    },
    true,
  );

  // ---------- 5. TRAIN JOURNEY TIMELINE (driven by the real train schedule times) ----------
  const TIMELINE_LEGS = [
    "pune-gaya",
    "gaya-rajgir",
    "rajgir-varanasi",
    "banaras-prayagraj",
    "prayagraj-ayodhya",
    "ayodhya-varanasi",
    "banaras-hadapsar",
  ];
  const TIMELINE_NAMES = [
    "Pune",
    "Gaya",
    "Rajgir",
    "Varanasi",
    "Prayagraj",
    "Ayodhya",
    "Varanasi",
    "Hadapsar",
  ];
  const TIMELINE_VIEWS = [
    "day-wise",
    "train-details",
    "places-visited",
    "hotel-details",
    "restaurant-details",
  ];

  function parseClock(txt) {
    const m = /(\d{1,2}):(\d{2})\s*(AM|PM)/i.exec(txt || "");
    if (!m) return null;
    return ((+m[1] % 12) + (/pm/i.test(m[3]) ? 12 : 0)) * 60 + +m[2];
  }

  // IST wall-clock minutes on trip day `dayNum` -> real moment
  function atClock(start, dayNum, minutes) {
    return scheduleMoment(start, dayNum, [
      Math.floor(minutes / 60),
      minutes % 60,
    ]);
  }

  // Departure / arrival moments of every train leg, read from the Train Schedule cards
  function buildLegs(start) {
    const legs = [];
    TIMELINE_LEGS.forEach((key, i) => {
      const card = $(
        `#view-train-details .train-card[data-train-leg="${key}"]`,
      );
      const times = card ? $$(".grid-box-time", card) : [];
      const depTxt = (times[0] && times[0].textContent.trim()) || "06:00 AM";
      const arrTxt = (times[1] && times[1].textContent.trim()) || "12:00 PM";
      const no = card
        ? ((($(".train-num-pill", card) || {}).textContent || "").match(
            /\d{5}/,
          ) || [""])[0]
        : "";
      const days = TRAIN_LEG_DAYS[key];
      let dep = atClock(start, days.dep, parseClock(depTxt) ?? 360);
      let arr = atClock(start, days.arr, parseClock(arrTxt) ?? 720);
      if (i > 0 && dep < legs[i - 1].arr) dep = legs[i - 1].arr; // a train can't leave before the previous one arrives
      if (arr <= dep) arr = dep + 5 * 60000;
      legs.push({
        key,
        no,
        from: TIMELINE_NAMES[i],
        to: TIMELINE_NAMES[i + 1],
        dep,
        arr,
        depTxt,
        arrTxt,
      });
    });
    return legs;
  }

  // date parts of a moment as seen on the train's clock (IST)
  const istParts = (ms) => {
    const d = new Date(ms + SCHEDULE_TZ_OFFSET_MIN * 60000);
    return {
      dow: d.getUTCDay(),
      day: d.getUTCDate(),
      mon: d.getUTCMonth(),
      year: d.getUTCFullYear(),
    };
  };
  const dayName = (ms) => EN_DAYS[istParts(ms).dow].slice(0, 3);
  const dateOf = (ms) => {
    const p = istParts(ms);
    return `${p.day} ${MONTHS[p.mon]}`;
  };
  const fullIST = (ms) => {
    const p = istParts(ms);
    return `${EN_DAYS[p.dow].slice(0, 3)}, ${p.day} ${MONTHS[p.mon]} ${p.year}`;
  };

  // Where is the train right now, according to the schedule?
  function timelineModel(start, nowMs) {
    const legs = buildLegs(start);
    const last = legs.length - 1;
    let p = 0,
      text = "";

    if (nowMs <= legs[0].dep) {
      p = 0;
      text = `Trip starts ${fullIST(legs[0].dep)} • First train ${legs[0].no} departs <strong>${legs[0].depTxt}</strong>`;
    } else if (nowMs >= legs[last].arr) {
      p = legs.length;
      text = `<strong>Journey complete at ${TIMELINE_NAMES[legs.length]} 🎉</strong>`;
    } else {
      for (let i = 0; i <= last; i++) {
        const L = legs[i];
        if (nowMs >= L.dep && nowMs < L.arr) {
          p = i + (nowMs - L.dep) / (L.arr - L.dep);
          text = `On the way: <strong>${L.from} → ${L.to}</strong> (Train ${L.no}) • arrives ${L.arrTxt}`;
          break;
        }
        if (i < last && nowMs >= L.arr && nowMs < legs[i + 1].dep) {
          const N = legs[i + 1];
          p = i + 1;
          text = `At <strong>${N.from}</strong> • Next: ${N.from} → ${N.to} departs ${dayName(N.dep)}, ${dateOf(N.dep)} at ${N.depTxt}`;
          break;
        }
      }
    }
    return { legs, p, pct: (p / legs.length) * 100, text };
  }

  function stopState(i, p) {
    if (Math.abs(i - p) < 1e-6) return "current";
    return i < p ? "done" : "todo";
  }

  function timelineStatusHtml(start, m) {
    const active = Math.max(1, activeDayNumber(start));
    return `Day ${active} of ${TOTAL_DAYS} • ${full(dayDate(start, active))} • ${m.text}`;
  }

  // Two panels, like the reference design: Onward (Pune -> Ayodhya) and Return (Varanasi -> Hadapsar)
  const TJ_PANELS = [
    {
      cls: "tj-onward",
      title: "Onward Train Journey",
      sub: "Indicates your journey from Pune to Varanasi",
      from: 0,
      to: 5,
    },
    {
      cls: "tj-return",
      title: "Return Train Journey",
      sub: "Indicates your journey from Varanasi to Hadapsar",
      from: 6,
      to: 7,
    },
  ];

  // 0..1 position of the train inside one panel
  const tjFrac = (panel, p) =>
    Math.min(1, Math.max(0, (p - panel.from) / (panel.to - panel.from)));
  // the train pin shows in the panel the train is in (it waits at the end of Onward while travelling Ayodhya -> Varanasi)
  const tjPinVisible = (panel, p) => (panel.from === 0 ? p < 6 : p >= 6);

  function tjStopHtml(m, i, n) {
    const leg = i === 0 ? m.legs[0] : m.legs[i - 1];
    const when = i === 0 ? leg.dep : leg.arr;
    const clock = i === 0 ? `Dep ${leg.depTxt}` : `Arr ${leg.arrTxt}`;
    const ret = i === 6 ? " <small>(Return)</small>" : "";
    return `<div class="tj-stop ${stopState(i, m.p)}${i === 0 ? " is-first" : ""}">
        <span class="tj-dot"></span>
        <span class="tj-city">${TIMELINE_NAMES[i]}${ret}</span>
        <span class="tj-station"><i class="fa-solid fa-location-dot"></i> ${TIMELINE_NAMES[i]}${ret}</span>
        <span class="tj-date">${dateOf(when)}</span>
        <span class="tj-time">${clock}</span>
      </div>`;
  }

  function tjPanelHtml(panel, m) {
    const n = panel.to - panel.from + 1;
    let stops = "";
    for (let i = panel.from; i <= panel.to; i++) stops += tjStopHtml(m, i, n);
    return `<section class="tj-panel ${panel.cls}" data-from="${panel.from}" data-to="${panel.to}" style="--n:${n}">
      <header class="tj-panel-head">
        <span class="tj-panel-icon"><i class="fa-solid fa-train-subway"></i></span>
        <div><h4>${panel.title}</h4><p>${panel.sub}</p></div>
      </header>
      <div class="tj-scroll"><div class="tj-track">
        <div class="tj-rail"><div class="tj-fill"></div></div>
        <div class="tj-pin"><i class="fa-solid fa-train-subway"></i></div>
        ${stops}
      </div></div>
    </section>`;
  }

  // move the fill + train pin of one timeline to the current position
  function tjPlace(tl, m) {
    TJ_PANELS.forEach((panel) => {
      const box = $(`.${panel.cls}`, tl);
      if (!box) return;
      const n = panel.to - panel.from + 1;
      const f = tjFrac(panel, m.p);
      const fill = $(".tj-fill", box),
        pin = $(".tj-pin", box);
      if (fill) fill.style.width = f * 100 + "%";
      if (pin) {
        pin.style.left = 50 / n + (100 - 100 / n) * f + "%";
        pin.style.display = tjPinVisible(panel, m.p) ? "" : "none";
      }
    });
  }

  function applyTimeline(start) {
    const m = timelineModel(start, Date.now());

    TIMELINE_VIEWS.forEach((v) => {
      const header = $(`#view-${v} .section-header`);
      if (!header) return;
      header.insertAdjacentHTML(
        "afterend",
        `<div class="train-timeline tj date-injected" role="img" aria-label="Train journey progress">
        <div class="tj-top">
          <div class="tj-brand">
            <span class="tj-brand-icon"><i class="fa-solid fa-train-subway"></i></span>
            <div><h3 class="tj-title">Train Journey Timeline</h3><p class="tj-sub">Your journey, mapped and planned</p></div>
          </div>
          <div class="tj-status"><i class="fa-regular fa-calendar-days"></i><span class="tj-status-text">${timelineStatusHtml(start, m)}</span></div>
        </div>
        <div class="tj-card">${TJ_PANELS.map((pn) => tjPanelHtml(pn, m)).join("")}</div>
      </div>`,
      );
      const tl = header.nextElementSibling;
      // start the train at the beginning, then slide it to its scheduled position
      TJ_PANELS.forEach((pn) => {
        const box = $(`.${pn.cls}`, tl),
          n = pn.to - pn.from + 1;
        const pin = box && $(".tj-pin", box);
        if (pin) pin.style.left = 50 / n + "%";
      });
      setTimeout(() => tjPlace(tl, m), 80);
    });
  }

  // Re-read the clock and move the train / update the text in place (no re-render)
  function refreshTimelines(start) {
    const m = timelineModel(start, Date.now());
    $$(".train-timeline").forEach((tl) => {
      const st = $(".tj-status-text", tl);
      if (st) st.innerHTML = timelineStatusHtml(start, m);
      tjPlace(tl, m);
      $$(".tj-stop", tl).forEach((el) => {
        const panel = el.closest(".tj-panel");
        const idx =
          +panel.dataset.from +
          Array.prototype.indexOf.call($$(".tj-stop", panel), el);
        el.classList.remove("done", "current", "todo");
        el.classList.add(stopState(idx, m.p));
      });
    });
  }

  let lastSignature = "";
  let flipTimer = null;

  // true while a valid trip date is set (the itinerary schedule is in charge)
  window.itineraryScheduleActive = function () {
    const d = parseISO(input.value);
    return !!d && d.getDay() === REQUIRED_START_DAY;
  };

  // Show the tab that is open right now (Train / Hotel / Restaurant / Destinations) instead of staying on Gaya
  function autoSelectActiveTabs() {
    [
      "#view-train-details .train-leg-btn[data-train-leg]",
      "#view-hotel-details .train-leg-btn[data-hotel-city]",
      "#view-restaurant-details .train-leg-btn[data-rest-city]",
      "#view-places-visited .dest-tab-btn[data-city]",
    ].forEach((sel) => {
      const tabs = $$(sel);
      let openTabs = tabs.filter((t) => !t.classList.contains("date-locked"));
      if (!openTabs.length) return;
      // finished parts stay unlocked too, so always prefer the tab with the green "active now" light
      const live = openTabs.filter((t) => t.classList.contains("live-active"));
      if (live.length) openTabs = live;
      let open = openTabs[0];
      const start = parseISO(input.value);
      if (openTabs.length > 1 && start && openTabs[0].dataset.trainLeg) {
        // two trains on one day: take the one that has already left
        const dep = {};
        buildLegs(start).forEach((L) => {
          dep[L.key] = L.dep;
        });
        const left = openTabs.filter(
          (t) => dep[t.dataset.trainLeg] <= Date.now(),
        );
        if (left.length) open = left[left.length - 1];
      }
      if (!open.classList.contains("active")) open.click();
    });
  }

  // the page's own tab handlers are attached on DOMContentLoaded, so wait for them
  function afterPageReady(fn) {
    if (document.readyState === "loading")
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    else fn();
  }

  function syncTabsAndTracker() {
    afterPageReady(() => {
      if (typeof window.updateTrackerProgress === "function")
        window.updateTrackerProgress();
      autoSelectActiveTabs();
    });
  }

  // ---------- apply / clear ----------
  function applyDate(value) {
    resetAll();
    const start = parseISO(value);
    if (!start) {
      syncTabsAndTracker();
      return;
    }

    const end = dayDate(start, TOTAL_DAYS);
    if (rangeEl) {
      rangeEl.textContent = `${short(start)} → ${short(end)}`;
      rangeEl.hidden = false;
    }
    if (clearBtn) clearBtn.hidden = false;
    if (homeDates)
      homeDates.textContent = `${short(start)} – ${short(end)} ${end.getFullYear()}`;

    applyDayWise(start);
    applyTrains(start);
    applyPlaces(start);
    updateNotice();
    applyTimeline(start);
    applyLocks(start);
    openDayNos.forEach((n) => {
      // re-open details the person had open
      const t = findDayTile(n);
      if (t && t.classList.contains("day-done") && !findDayClone(n))
        openDayDetail(t, true);
      else if (!t || !t.classList.contains("day-done")) openDayNos.delete(n);
    });
    lastSignature = scheduleSignature(start);
    scheduleNextFlip(start);
    syncTabsAndTracker();
  }

  // The very first train (11427 Pune -> Gaya) runs on Fridays only, so the trip must start on a Friday.
  const REQUIRED_START_DAY = TRAIN_RUN_DAYS["11427"].days[0];
  let lastValid = "";
  let debounce = null;

  function popup(opts) {
    if (window.showModernModal) window.showModernModal(opts);
  }

  function handleDateChange() {
    const d = parseISO(input.value);

    if (!input.value) {
      // date was cleared
      lastValid = "";
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        /* ignore */
      }
      applyDate("");
      return;
    }
    if (!d || d.getFullYear() < 2000) return; // still typing the year

    if (d.getDay() !== REQUIRED_START_DAY) {
      popup({
        variant: "error",
        emoji: "🚫",
        title: "Wrong start day",
        html: `The 1st train schedule is on ${EN_DAYS[REQUIRED_START_DAY]}. Train 11427 (Pune → Gaya) runs only on ${EN_DAYS[REQUIRED_START_DAY]}s, but you picked <strong>${full(d)}</strong>. Please choose a ${EN_DAYS[REQUIRED_START_DAY]} to start your trip.`,
        buttonText: `Choose a ${EN_DAYS[REQUIRED_START_DAY]}`,
      });
      input.value = lastValid; // go back to the last correct date
      return;
    }

    lastValid = input.value;
    try {
      localStorage.setItem(STORAGE_KEY, input.value);
    } catch (e) {
      /* ignore */
    }
    applyDate(input.value);
    popup({
      variant: "success",
      emoji: "🎉",
      title: "Hooray!",
      html: `Your selected day is right & your trip starts now! <strong>${full(d)}</strong> matches the 1st train 11427 (Pune → Gaya). Have a blessed journey!`,
      buttonText: "Let's go!",
    });
  }

  input.addEventListener("change", () => {
    clearTimeout(debounce);
    debounce = setTimeout(handleDateChange, 500); // wait until the user finishes typing the date
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      input.value = "";
      lastValid = "";
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        /* ignore */
      }
      applyDate("");
    });
  }

  // Restore the saved date on load
  let saved = "";
  try {
    saved = localStorage.getItem(STORAGE_KEY) || "";
  } catch (e) {
    /* ignore */
  }
  const savedDate = parseISO(saved);
  if (savedDate && savedDate.getDay() === REQUIRED_START_DAY) {
    input.value = saved;
    lastValid = saved;
    applyDate(saved);
  } else if (saved) {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      /* ignore */
    } // an old non-Friday date is dropped
  }
  // Keep every card in sync with the schedule.
  //  - a card flips exactly when its scheduled time is reached (timer set for the next change)
  //  - a 15-second check and a check when the tab becomes visible again catch anything missed
  //    (sleeping laptop, background tab, changed device clock).
  function refreshLive() {
    const start = parseISO(input.value);
    if (
      !start ||
      start.getDay() !== REQUIRED_START_DAY ||
      !$(".train-timeline")
    )
      return;
    if (scheduleSignature(start) !== lastSignature)
      applyDate(input.value); // re-applies locks, completed stamps, green lights
    else {
      refreshTimelines(start);
      scheduleNextFlip(start);
    }
  }

  function scheduleNextFlip(start) {
    clearTimeout(flipTimer);
    const t = scheduleTimes(start),
      now = Date.now();
    const next = t.unlock
      .slice(1)
      .concat([t.end])
      .find((ms) => ms > now);
    if (next)
      flipTimer = setTimeout(
        refreshLive,
        Math.min(next - now + 300, 2147000000),
      );
  }

  setInterval(refreshLive, 15000);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) refreshLive();
  });

  // ---------- DATE FIELD: dd / mm / yyyy inputs + interactive calendar ----------
  (function dateField() {
    const dIn = $("#dmyDay"),
      mIn = $("#dmyMonth"),
      yIn = $("#dmyYear");
    const calBtn = $("#dmyCalBtn"),
      pop = $("#calPop"),
      wrap = $(".dmy");
    if (!dIn || !mIn || !yIn || !pop) return;

    const pad2 = (n) => String(n).padStart(2, "0");
    const MONTH_LONG = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const iso = (y, m, d) => `${y}-${pad2(m + 1)}-${pad2(d)}`;

    // Whenever any code sets the hidden date value (restore, revert, clear) the visible fields follow.
    const desc = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    );
    Object.defineProperty(input, "value", {
      configurable: true,
      get() {
        return desc.get.call(this);
      },
      set(v) {
        desc.set.call(this, v);
        syncDisplay();
      },
    });

    function syncDisplay() {
      const d = parseISO(input.value);
      if (d) {
        dIn.value = pad2(d.getDate());
        mIn.value = pad2(d.getMonth() + 1);
        yIn.value = String(d.getFullYear());
      } else {
        dIn.value = "";
        mIn.value = "";
        yIn.value = "";
      }
      wrap.classList.remove("invalid");
      if (!pop.hidden) renderCal();
    }

    function setDate(isoStr) {
      // user picked a date: let the normal date logic validate it
      input.value = isoStr;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }

    // ----- typing in dd / mm / yyyy -----
    function tryCommit() {
      const d = +dIn.value,
        m = +mIn.value,
        y = +yIn.value;
      if (
        dIn.value.length < 1 ||
        mIn.value.length < 1 ||
        yIn.value.length < 4
      ) {
        wrap.classList.remove("invalid");
        return;
      }
      const t = new Date(y, m - 1, d);
      const ok =
        y >= 2000 &&
        t.getFullYear() === y &&
        t.getMonth() === m - 1 &&
        t.getDate() === d;
      if (!ok) {
        wrap.classList.remove("invalid");
        void wrap.offsetWidth;
        wrap.classList.add("invalid");
        return;
      }
      wrap.classList.remove("invalid");
      setDate(iso(y, m - 1, d));
    }

    function wire(el, max, next, prev, firstDigitMax) {
      el.addEventListener("input", () => {
        el.value = el.value.replace(/\D/g, "").slice(0, max);
        if (
          firstDigitMax !== undefined &&
          el.value.length === 1 &&
          +el.value > firstDigitMax
        )
          el.value = "0" + el.value; // 5 -> 05
        if (next && el.value.length === max) {
          next.focus();
          next.select();
        }
        tryCommit();
      });
      el.addEventListener("keydown", (e) => {
        if (["/", ".", "-", " "].includes(e.key) && next) {
          e.preventDefault();
          if (el.value.length === 1) el.value = "0" + el.value;
          next.focus();
          next.select();
          tryCommit();
        } else if (e.key === "Backspace" && el.value === "" && prev) {
          e.preventDefault();
          prev.focus();
        } else if (e.key === "ArrowDown" && e.altKey) {
          openCal();
        }
      });
      el.addEventListener("focus", () => el.select());
      el.addEventListener("blur", () => {
        if (el !== yIn && el.value.length === 1) {
          el.value = "0" + el.value;
          tryCommit();
        }
      });
    }
    wire(dIn, 2, mIn, null, 3);
    wire(mIn, 2, yIn, dIn, 1);
    wire(yIn, 4, null, mIn);

    // ----- calendar -----
    let viewY = new Date().getFullYear(),
      viewM = new Date().getMonth();

    function renderCal() {
      const sel = parseISO(input.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const rangeEnd = sel
        ? new Date(
            sel.getFullYear(),
            sel.getMonth(),
            sel.getDate() + TOTAL_DAYS - 1,
          )
        : null;
      const first = new Date(viewY, viewM, 1);
      const startCell = new Date(viewY, viewM, 1 - first.getDay()); // Sunday on/before the 1st

      const thisYear = today.getFullYear();
      const monthOpts = MONTH_LONG.map(
        (n, i) =>
          `<option value="${i}" ${i === viewM ? "selected" : ""}>${n}</option>`,
      ).join("");
      let yearOpts = "";
      for (
        let y = Math.min(thisYear - 1, viewY);
        y <= Math.max(thisYear + 6, viewY);
        y++
      )
        yearOpts += `<option value="${y}" ${y === viewY ? "selected" : ""}>${y}</option>`;

      let cells = "";
      for (let i = 0; i < 42; i++) {
        const d = new Date(
          startCell.getFullYear(),
          startCell.getMonth(),
          startCell.getDate() + i,
        );
        const cls = ["cal-day"];
        if (d.getMonth() !== viewM) cls.push("out");
        if (d.getDay() === REQUIRED_START_DAY) cls.push("fri");
        if (+d === +today) cls.push("today");
        if (sel && +d === +sel) cls.push("sel");
        else if (sel && d > sel && d <= rangeEnd) cls.push("range");
        const title =
          d.getDay() === REQUIRED_START_DAY
            ? "Friday – valid trip start"
            : "Trip must start on a Friday";
        const out = d.getMonth() !== viewM; // days of the neighbouring months are shown but cannot be picked
        cells += `<button type="button" class="${cls.join(" ")}" ${out ? 'disabled tabindex="-1"' : ""} data-iso="${iso(d.getFullYear(), d.getMonth(), d.getDate())}" title="${title}" aria-label="${d.getDate()} ${MONTH_LONG[d.getMonth()]} ${d.getFullYear()}, ${EN_DAYS[d.getDay()]}">${d.getDate()}</button>`;
      }

      pop.innerHTML = `
        <div class="cal-head">
          <button type="button" class="cal-nav" data-nav="-1" aria-label="Previous month"><i class="fa-solid fa-chevron-left"></i></button>
          <div class="cal-title">
            <select class="cal-month" aria-label="Month">${monthOpts}</select>
            <select class="cal-year" aria-label="Year">${yearOpts}</select>
          </div>
          <button type="button" class="cal-nav" data-nav="1" aria-label="Next month"><i class="fa-solid fa-chevron-right"></i></button>
        </div>
        <div class="cal-week">${EN_DAYS.map((n, i) => `<span class="${i === REQUIRED_START_DAY ? "fri" : ""}">${n.slice(0, 3)}</span>`).join("")}</div>
        <div class="cal-grid" role="grid">${cells}</div>
        <div class="cal-foot">
          <span class="cal-legend"><i></i> Only Friday = trip start</span>
          <button type="button" class="cal-next-fri"><i class="fa-solid fa-train"></i> Next Friday</button>
        </div>`;
    }

    function openCal() {
      const base = new Date(); // always start on the current month
      viewY = base.getFullYear();
      viewM = base.getMonth();
      renderCal();
      pop.hidden = false;
      requestAnimationFrame(() => pop.classList.add("open"));
      calBtn.setAttribute("aria-expanded", "true");
    }

    function closeCal() {
      pop.classList.remove("open");
      calBtn.setAttribute("aria-expanded", "false");
      setTimeout(() => {
        if (!pop.classList.contains("open")) pop.hidden = true;
      }, 180);
    }

    function shiftMonth(n) {
      const d = new Date(viewY, viewM + n, 1);
      viewY = d.getFullYear();
      viewM = d.getMonth();
      renderCal();
    }

    calBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (pop.classList.contains("open")) closeCal();
      else openCal();
    });

    pop.addEventListener("click", (e) => {
      e.stopPropagation();
      const nav = e.target.closest(".cal-nav");
      const day = e.target.closest(".cal-day");
      const nextFri = e.target.closest(".cal-next-fri");
      if (nav) {
        shiftMonth(+nav.dataset.nav);
        return;
      }
      if (day) {
        closeCal();
        setDate(day.dataset.iso);
        return;
      }
      if (nextFri) {
        const t = new Date();
        t.setHours(0, 0, 0, 0);
        t.setDate(t.getDate() + ((REQUIRED_START_DAY - t.getDay() + 7) % 7));
        closeCal();
        setDate(iso(t.getFullYear(), t.getMonth(), t.getDate()));
      }
    });

    pop.addEventListener("change", (e) => {
      if (e.target.classList.contains("cal-month")) {
        viewM = +e.target.value;
        renderCal();
      }
      if (e.target.classList.contains("cal-year")) {
        viewY = +e.target.value;
        renderCal();
      }
    });

    // arrow keys move around the days
    pop.addEventListener("keydown", (e) => {
      const day = e.target.closest && e.target.closest(".cal-day");
      if (!day) return;
      const days = Array.from(pop.querySelectorAll(".cal-day"));
      const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[
        e.key
      ];
      if (step === undefined) return;
      e.preventDefault();
      const target = days[days.indexOf(day) + step];
      if (target) target.focus();
    });

    document.addEventListener("click", (e) => {
      if (!pop.hidden && !wrap.contains(e.target)) closeCal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !pop.hidden) {
        closeCal();
        calBtn.focus();
      }
    });

    syncDisplay(); // show the restored date (if any) in dd / mm / yyyy
  })();
})();
