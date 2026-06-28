/* ══════════════════════════════════════
   Paisa — Student Expense Tracker
   app.js | DecodeLabs Project 1
   ══════════════════════════════════════ */

'use strict';

/* ── CATEGORY CONFIG ── */
const CATEGORIES = {
  food:   { label: 'Food',   emoji: '🍽️', color: '#e07b54', bg: '#fdeee8' },
  travel: { label: 'Travel', emoji: '🚌', color: '#5aafc4', bg: '#e0f2f8' },
  books:  { label: 'Books',  emoji: '📚', color: '#7a5f4e', bg: '#f0e6df' },
  fun:    { label: 'Fun',    emoji: '🎮', color: '#c47ab8', bg: '#f5e8f3' },
  health: { label: 'Health', emoji: '💊', color: '#5ab87a', bg: '#e2f5ea' },
  other:  { label: 'Other',  emoji: '📦', color: '#b8a45a', bg: '#f5f0e0' },
};

/* ── STATE ── */
let expenses   = JSON.parse(localStorage.getItem('paisa_expenses') || '[]');
let budget     = Number(localStorage.getItem('paisa_budget') || 0);
let selectedCat = 'food';
let filterCat   = 'all';

/* ── DOM REFS ── */
const budgetDisplay  = document.getElementById('budgetDisplay');
const totalSpentEl   = document.getElementById('totalSpent');
const balanceLeftEl  = document.getElementById('balanceLeft');
const spentHintEl    = document.getElementById('spentHint');
const balanceHintEl  = document.getElementById('balanceHint');
const progressFill   = document.getElementById('progressFill');
const budgetPctEl    = document.getElementById('budgetPct');
const progressBar    = document.querySelector('.progress-bar');

const expTitle       = document.getElementById('expTitle');
const expAmount      = document.getElementById('expAmount');
const expDate        = document.getElementById('expDate');
const formError      = document.getElementById('formError');
const addExpenseBtn  = document.getElementById('addExpenseBtn');
const catBtns        = document.querySelectorAll('.cat-btn');

const expenseList    = document.getElementById('expenseList');
const listEmpty      = document.getElementById('listEmpty');
const filterCatEl    = document.getElementById('filterCat');
const clearAllBtn    = document.getElementById('clearAllBtn');

const editBudgetBtn  = document.getElementById('editBudgetBtn');
const modalOverlay   = document.getElementById('modalOverlay');
const modalCancel    = document.getElementById('modalCancel');
const modalSave      = document.getElementById('modalSave');
const budgetInput    = document.getElementById('budgetInput');
const budgetError    = document.getElementById('budgetError');

const donutSvg       = document.getElementById('donutSvg');
const donutTotal     = document.getElementById('donutTotal');
const legendEl       = document.getElementById('legend');
const currentMonth   = document.getElementById('currentMonth');
const toast          = document.getElementById('toast');


/* ══════════════════════════════════════
   INIT
   ══════════════════════════════════════ */
function init() {
  // Set today's date as default
  expDate.value = new Date().toISOString().split('T')[0];

  // Show current month
  currentMonth.textContent = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  // Set default category
  updateCategoryUI('food');

  // Render everything
  renderAll();
}


/* ══════════════════════════════════════
   SAVE TO LOCALSTORAGE
   ══════════════════════════════════════ */
function save() {
  localStorage.setItem('paisa_expenses', JSON.stringify(expenses));
  localStorage.setItem('paisa_budget', String(budget));
}


/* ══════════════════════════════════════
   RENDER ALL
   ══════════════════════════════════════ */
function renderAll() {
  renderSummary();
  renderProgress();
  renderList();
  renderDonut();
}


/* ══════════════════════════════════════
   SUMMARY CARDS
   ══════════════════════════════════════ */
function renderSummary() {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const balance = budget - total;

  budgetDisplay.textContent = budget > 0 ? formatINR(budget) : '₹ —';
  totalSpentEl.textContent  = formatINR(total);
  balanceLeftEl.textContent = budget > 0 ? formatINR(balance) : '₹ —';

  spentHintEl.textContent = expenses.length === 0
    ? 'No expenses yet'
    : `Across ${expenses.length} expense${expenses.length > 1 ? 's' : ''}`;

  if (budget > 0) {
    const pct = (total / budget) * 100;
    if (pct >= 100) {
      balanceHintEl.textContent = '⚠️ Over budget!';
      balanceLeftEl.classList.add('danger');
    } else if (pct >= 80) {
      balanceHintEl.textContent = '⚠️ Almost at limit';
      balanceLeftEl.classList.remove('danger');
    } else {
      balanceHintEl.textContent = `${Math.round(100 - pct)}% remaining`;
      balanceLeftEl.classList.remove('danger');
    }
  } else {
    balanceHintEl.textContent = 'Set a budget to start';
    balanceLeftEl.classList.remove('danger');
  }
}


/* ══════════════════════════════════════
   PROGRESS BAR
   ══════════════════════════════════════ */
function renderProgress() {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const pct   = budget > 0 ? Math.min((total / budget) * 100, 100) : 0;

  progressFill.style.width = pct + '%';
  budgetPctEl.textContent  = Math.round(pct) + '%';
  progressBar.setAttribute('aria-valuenow', Math.round(pct));

  progressFill.classList.remove('warning', 'danger');
  if (pct >= 100) progressFill.classList.add('danger');
  else if (pct >= 80) progressFill.classList.add('warning');
}


/* ══════════════════════════════════════
   DONUT CHART
   ══════════════════════════════════════ */
function renderDonut() {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  donutTotal.textContent = formatINR(total);

  // Remove old segments (keep the track circle)
  donutSvg.querySelectorAll('.donut__segment').forEach(s => s.remove());
  legendEl.innerHTML = '';

  if (total === 0) {
    legendEl.innerHTML = `<li class="legend-empty">No spending data yet</li>`;
    return;
  }

  // Aggregate by category
  const byCategory = {};
  expenses.forEach(e => {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
  });

  const CIRCUMFERENCE = 2 * Math.PI * 48; // r = 48
  let offset = 0;

  Object.entries(byCategory)
    .sort(([, a], [, b]) => b - a)
    .forEach(([cat, amt]) => {
      const config = CATEGORIES[cat];
      const pct    = amt / total;
      const dash   = pct * CIRCUMFERENCE;
      const gap    = CIRCUMFERENCE - dash;

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('class', 'donut__segment');
      circle.setAttribute('cx', '60');
      circle.setAttribute('cy', '60');
      circle.setAttribute('r', '48');
      circle.setAttribute('stroke', config.color);
      circle.setAttribute('stroke-dasharray', `${dash} ${gap}`);
      circle.setAttribute('stroke-dashoffset', -offset);
      donutSvg.appendChild(circle);

      offset += dash;

      // Legend item
      const li = document.createElement('li');
      li.className = 'legend-item';
      li.innerHTML = `
        <span class="legend-dot" style="background:${config.color}" aria-hidden="true"></span>
        <span class="legend-item__name">${config.emoji} ${config.label}</span>
        <span class="legend-item__amt">${formatINR(amt)}</span>
        <span class="legend-item__pct">${Math.round(pct * 100)}%</span>
      `;
      legendEl.appendChild(li);
    });
}


/* ══════════════════════════════════════
   EXPENSE LIST
   ══════════════════════════════════════ */
function renderList() {
  expenseList.innerHTML = '';

  const filtered = filterCat === 'all'
    ? expenses
    : expenses.filter(e => e.category === filterCat);

  // Sort newest first
  const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

  if (sorted.length === 0) {
    listEmpty.classList.add('show');
    listEmpty.textContent = filterCat === 'all'
      ? 'No expenses yet. Add your first one above! 👆'
      : `No ${CATEGORIES[filterCat]?.label} expenses found.`;
    return;
  }

  listEmpty.classList.remove('show');

  sorted.forEach(exp => {
    const config = CATEGORIES[exp.category];
    const li = document.createElement('li');
    li.className = 'expense-item';
    li.setAttribute('data-id', exp.id);
    li.innerHTML = `
      <div class="expense-item__icon" style="background:${config.bg}" aria-hidden="true">
        ${config.emoji}
      </div>
      <div class="expense-item__info">
        <p class="expense-item__title">${escapeHTML(exp.title)}</p>
        <div class="expense-item__meta">
          <span>${formatDate(exp.date)}</span>
          <span class="expense-item__cat-tag"
            style="background:${config.bg};color:${config.color}">
            ${config.label}
          </span>
        </div>
      </div>
      <span class="expense-item__amount">−${formatINR(exp.amount)}</span>
      <button class="expense-item__del" data-id="${exp.id}" aria-label="Delete ${escapeHTML(exp.title)}">✕</button>
    `;

    li.querySelector('.expense-item__del').addEventListener('click', () => deleteExpense(exp.id));
    expenseList.appendChild(li);
  });
}


/* ══════════════════════════════════════
   ADD EXPENSE
   ══════════════════════════════════════ */
addExpenseBtn.addEventListener('click', () => {
  const title  = expTitle.value.trim();
  const amount = parseFloat(expAmount.value);
  const date   = expDate.value;

  // Validate
  if (!title) {
    showError('Please enter what you spent on.');
    expTitle.focus();
    return;
  }
  if (!amount || amount <= 0 || isNaN(amount)) {
    showError('Please enter a valid amount.');
    expAmount.focus();
    return;
  }
  if (!date) {
    showError('Please select a date.');
    expDate.focus();
    return;
  }

  clearError();

  const newExpense = {
    id:       Date.now(),
    title,
    amount,
    date,
    category: selectedCat,
  };

  expenses.unshift(newExpense);
  save();
  renderAll();

  // Reset form
  expTitle.value  = '';
  expAmount.value = '';
  expDate.value   = new Date().toISOString().split('T')[0];

  showToast(`✅ ₹${amount.toFixed(0)} added for "${title}"`);

  // Warn if over budget
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  if (budget > 0 && total > budget) {
    setTimeout(() => showToast('⚠️ You have exceeded your budget!'), 1500);
  }
});

function showError(msg) { formError.textContent = msg; }
function clearError()   { formError.textContent = ''; }


/* ══════════════════════════════════════
   DELETE EXPENSE
   ══════════════════════════════════════ */
function deleteExpense(id) {
  const item = expenses.find(e => e.id === id);
  expenses = expenses.filter(e => e.id !== id);
  save();
  renderAll();
  if (item) showToast(`🗑️ "${item.title}" removed`);
}


/* ══════════════════════════════════════
   CLEAR ALL
   ══════════════════════════════════════ */
clearAllBtn.addEventListener('click', () => {
  if (expenses.length === 0) { showToast('No expenses to clear.'); return; }
  if (!confirm('Delete all expenses? This cannot be undone.')) return;
  expenses = [];
  save();
  renderAll();
  showToast('🗑️ All expenses cleared');
});


/* ══════════════════════════════════════
   CATEGORY SELECTION
   ══════════════════════════════════════ */
catBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    updateCategoryUI(btn.dataset.cat);
  });
});

function updateCategoryUI(cat) {
  selectedCat = cat;
  catBtns.forEach(b => {
    const isActive = b.dataset.cat === cat;
    b.classList.toggle('active', isActive);
    b.setAttribute('aria-pressed', String(isActive));
  });
}


/* ══════════════════════════════════════
   FILTER
   ══════════════════════════════════════ */
filterCatEl.addEventListener('change', () => {
  filterCat = filterCatEl.value;
  renderList();
});


/* ══════════════════════════════════════
   BUDGET MODAL
   ══════════════════════════════════════ */
function openModal() {
  budgetInput.value = budget || '';
  budgetError.textContent = '';
  modalOverlay.classList.add('show');
  modalOverlay.setAttribute('aria-hidden', 'false');
  setTimeout(() => budgetInput.focus(), 100);
}
function closeModal() {
  modalOverlay.classList.remove('show');
  modalOverlay.setAttribute('aria-hidden', 'true');
}

editBudgetBtn.addEventListener('click', openModal);
modalCancel.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });

modalSave.addEventListener('click', () => {
  const val = parseFloat(budgetInput.value);
  if (!val || val <= 0 || isNaN(val)) {
    budgetError.textContent = 'Please enter a valid budget amount.';
    budgetInput.focus();
    return;
  }
  budget = val;
  save();
  renderAll();
  closeModal();
  showToast(`💰 Budget set to ${formatINR(budget)}`);
});

budgetInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') modalSave.click();
  if (e.key === 'Escape') closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});


/* ══════════════════════════════════════
   TOAST
   ══════════════════════════════════════ */
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}


/* ══════════════════════════════════════
   HELPERS
   ══════════════════════════════════════ */
function formatINR(n) {
  return '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function escapeHTML(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}


/* ── START ── */
init();
