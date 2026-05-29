'use strict';

/* ─── Dark Mode ─── */
function initDarkMode() {
  const saved = localStorage.getItem('finsight-theme');
  if (saved === 'light') document.documentElement.classList.remove('dark');
  else document.documentElement.classList.add('dark');
}
function toggleDarkMode() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('finsight-theme', isDark ? 'dark' : 'light');
}
initDarkMode();

/* ─── Modal Core ─── */
function openModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('is-open');
  document.body.classList.add('modal-open');
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('is-open');
  if (!document.querySelector('.modal-overlay.is-open')) {
    document.body.classList.remove('modal-open');
  }
}
function closeAllModals() {
  document.querySelectorAll('.modal-overlay.is-open').forEach(m => m.classList.remove('is-open'));
  document.body.classList.remove('modal-open');
}

/* ─── Desktop Sidebar ─── */
function buildSidebarHTML() {
  const path = window.location.pathname;
  const navItems = [
    { href: 'dashboard.html',    icon: 'grid_view',              label: 'Dashboard'  },
    { href: 'transactions.html', icon: 'swap_horiz',             label: 'Atividade'  },
    { href: 'wallets.html',      icon: 'account_balance_wallet', label: 'Carteiras'  },
    { href: 'goals.html',        icon: 'ads_click',              label: 'Metas'      },
    { href: 'categories.html',   icon: 'category',               label: 'Categorias' },
    { href: 'reports.html',      icon: 'bar_chart',              label: 'Relatórios' },
    { href: 'profile.html',      icon: 'person',                 label: 'Perfil'     },
  ];
  const linksHTML = navItems.map(item => {
    const active = path.endsWith(item.href) || path.includes(item.href.replace('.html', ''));
    return `<a href="${item.href}" class="sidebar_link${active ? ' active' : ''}">
      <span class="material-symbols-outlined">${item.icon}</span>
      <span class="sidebar_link_label">${item.label}</span>
    </a>`;
  }).join('');
  return `
    <div class="sidebar_top">
      <span class="material-symbols-outlined">account_balance_wallet</span>
      <span class="sidebar_brand_name">FinSight</span>
    </div>
    <nav class="sidebar_nav">${linksHTML}</nav>
    <div class="sidebar_footer">v2.0.0</div>
  `;
}

function setupDesktopSidebar() {
  if (!document.querySelector('.bottom-nav')) return;
  const isDesktop = window.innerWidth >= 1024;
  const existing  = document.getElementById('sidebar');

  if (isDesktop && !existing) {
    const sidebar = document.createElement('aside');
    sidebar.id = 'sidebar';
    sidebar.innerHTML = buildSidebarHTML();
    document.body.prepend(sidebar);
    document.body.classList.add('has-sidebar');
  } else if (!isDesktop && existing) {
    existing.remove();
    document.body.classList.remove('has-sidebar');
  }
}

let _sidebarResizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(_sidebarResizeTimer);
  _sidebarResizeTimer = setTimeout(setupDesktopSidebar, 100);
});

/* ─── DOMContentLoaded ─── */
document.addEventListener('DOMContentLoaded', () => {

  setupDesktopSidebar();
  initAppbarUser();

  /* Active nav item */
  const path = window.location.pathname;
  document.querySelectorAll('.nav-item').forEach(item => {
    const href = item.getAttribute('href') || '';
    if (href && (path.endsWith(href) || path.includes(href.replace('.html', '')))) {
      item.classList.add('active');
    }
  });

  /* Dark mode toggle */
  const themeToggle = document.getElementById('theme_toggle');
  if (themeToggle) {
    themeToggle.classList.toggle('on', document.documentElement.classList.contains('dark'));
    themeToggle.addEventListener('click', () => {
      themeToggle.classList.toggle('on');
      toggleDarkMode();
    });
  }

  /* Open: data-modal */
  document.querySelectorAll('[data-modal]').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); openModal(btn.dataset.modal); });
  });

  /* Close: data-close */
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); closeModal(btn.dataset.close); });
  });

  /* Close on overlay click */
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(overlay.id); });
  });

  /* Escape */
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAllModals(); });

  /* FAB type selector → specific modal */
  document.querySelectorAll('.fab-type-card').forEach(card => {
    card.addEventListener('click', () => {
      const target = card.dataset.target;
      closeModal('modal_fab_type');
      if (target) setTimeout(() => openModal(target), 60);
    });
  });

  /* Password show/hide */
  document.querySelectorAll('[data-pw-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.pwToggle);
      if (!input) return;
      const hidden = input.type === 'password';
      input.type = hidden ? 'text' : 'password';
      const icon = btn.querySelector('.material-symbols-outlined');
      if (icon) icon.textContent = hidden ? 'visibility_off' : 'visibility';
    });
  });

  /* Filter tabs */
  document.querySelectorAll('[data-tabs]').forEach(group => {
    const tabs = group.querySelectorAll('[data-tab]');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
      });
    });
  });

  /* Type toggles */
  document.querySelectorAll('.type-toggle').forEach(toggle => {
    const btns = toggle.querySelectorAll('.type-btn');
    const firstExpense = toggle.querySelector('[data-type="expense"]');
    if (firstExpense) firstExpense.classList.add('active-expense');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active-expense', 'active-income'));
        btn.classList.add(btn.dataset.type === 'expense' ? 'active-expense' : 'active-income');
        updateCatPreview();
      });
    });
  });

  /* Icon selectors */
  document.querySelectorAll('.icon-grid, .goal-icon-grid').forEach(grid => {
    grid.querySelectorAll('.icon-opt').forEach(opt => {
      opt.addEventListener('click', () => {
        grid.querySelectorAll('.icon-opt').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        updateCatPreview();
      });
    });
  });

  /* Color selectors */
  document.querySelectorAll('.color-grid, .wallet-color-grid').forEach(grid => {
    grid.querySelectorAll('.color-opt, .wallet-color-opt').forEach(opt => {
      opt.addEventListener('click', () => {
        grid.querySelectorAll('.color-opt, .wallet-color-opt').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        updateCatPreview();
      });
    });
  });

  /* Cat name → preview */
  const catNameInput = document.getElementById('cat_name');
  if (catNameInput) catNameInput.addEventListener('input', updateCatPreview);

  /* Default date inputs to today */
  const today = new Date().toISOString().split('T')[0];
  document.querySelectorAll('input[type="date"]').forEach(inp => { if (!inp.value) inp.value = today; });

  /* Installment toggle */
  document.querySelectorAll('[data-toggle-parcel]').forEach(cb => {
    const target = document.getElementById(cb.dataset.toggleParcel);
    if (!target) return;
    const syncVisibility = () => { target.style.display = cb.checked ? 'flex' : 'none'; };
    syncVisibility();
    cb.addEventListener('change', syncVisibility);
  });

  /* Fixed expense toggle */
  document.querySelectorAll('[data-toggle-fixed]').forEach(cb => {
    const target = document.getElementById(cb.dataset.toggleFixed);
    if (!target) return;
    const syncVisibility = () => { target.style.display = cb.checked ? 'block' : 'none'; };
    syncVisibility();
    cb.addEventListener('change', syncVisibility);
  });

  /* Transaction effectuation toggle (RF03) */
  document.querySelectorAll('.tx-check').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      btn.classList.toggle('done');
    });
  });

  /* Password strength (register) */
  const pwInput = document.getElementById('reg_password');
  if (pwInput) {
    pwInput.addEventListener('input', () => {
      const val = pwInput.value;
      const bars  = document.querySelectorAll('.strength-bar');
      const label = document.getElementById('strength_label');
      let score = 0;
      if (val.length >= 8) score++;
      if (/[A-Z]/.test(val) && /[0-9]/.test(val)) score++;
      if (/[^A-Za-z0-9]/.test(val)) score++;
      const colors = ['#ef4444', '#f97316', '#22c55e'];
      const labels = ['Fraca', 'Média', 'Forte'];
      bars.forEach((bar, i) => {
        bar.style.background = i < score ? colors[score - 1] : '';
      });
      if (label) label.textContent = val.length === 0 ? '' : `Força: ${labels[score - 1] || 'Fraca'}`;
    });
  }

  updateCatPreview();
});

/* ─── Appbar User Info ─── */
function initAppbarUser() {
  try {
    const raw = localStorage.getItem('finsight-user');
    if (!raw) return;
    const user = JSON.parse(raw);
    const name = user.nome || user.username || '';
    const initials = user.iniciais
      || name.split(' ').map(w => w[0]).filter(Boolean).slice(0,2).join('').toUpperCase()
      || '?';
    document.querySelectorAll('.appbar_user_name').forEach(el => { el.textContent = name; });
    document.querySelectorAll('.appbar_user_avatar').forEach(el => { el.textContent = initials; });
  } catch (_) {}

  // Injeta botão de tema no appbar_actions (todas as páginas)
  const actions = document.querySelector('.appbar_actions');
  if (actions && !document.getElementById('appbar_theme_btn')) {
    const isDark = document.documentElement.classList.contains('dark');
    const btn = document.createElement('button');
    btn.id = 'appbar_theme_btn';
    btn.className = 'appbar_btn';
    btn.title = isDark ? 'Modo claro' : 'Modo escuro';
    btn.innerHTML = `<span class="material-symbols-outlined">${isDark ? 'light_mode' : 'dark_mode'}</span>`;
    btn.addEventListener('click', () => {
      toggleDarkMode();
      const nowDark = document.documentElement.classList.contains('dark');
      btn.title = nowDark ? 'Modo claro' : 'Modo escuro';
      btn.querySelector('.material-symbols-outlined').textContent = nowDark ? 'light_mode' : 'dark_mode';
    });
    // Insere antes do avatar (último filho)
    actions.insertBefore(btn, actions.lastElementChild);
  }
}

/* ─── Category Preview ─── */
function updateCatPreview() {
  const previewName = document.getElementById('preview_name');
  if (!previewName) return;

  const previewIcon  = document.getElementById('preview_icon');
  const previewBox   = document.getElementById('preview_box');
  const previewBadge = document.getElementById('preview_badge');

  const nameInput = document.getElementById('cat_name');
  if (nameInput) previewName.textContent = nameInput.value.trim() || 'Nome da categoria';

  const selIconEl = document.querySelector('#modal_new_category .icon-opt.selected .material-symbols-outlined');
  if (selIconEl && previewIcon) previewIcon.textContent = selIconEl.textContent;

  const selColor = document.querySelector('#modal_new_category .color-opt.selected');
  if (selColor && previewBox) {
    const hex = selColor.dataset.color;
    previewBox.style.background = hex + '22';
    if (previewIcon) previewIcon.style.color = hex;
  }

  const isIncome = !!document.querySelector('#modal_new_category .type-btn.active-income');
  if (previewBadge) {
    if (isIncome) {
      previewBadge.textContent = 'Receita';
      previewBadge.style.cssText = 'background:var(--income-dim);color:var(--income);';
    } else {
      previewBadge.textContent = 'Despesa';
      previewBadge.style.cssText = 'background:var(--expense-dim);color:var(--expense);';
    }
  }
}
