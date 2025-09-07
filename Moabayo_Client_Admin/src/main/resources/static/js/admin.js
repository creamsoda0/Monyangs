// ==============================
// 다크모드 전역 유틸
// ==============================
const THEME_KEY = 'mb.theme';

function getSavedTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  // 저장값이 없으면 시스템 선호 사용
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark' : 'light';
}

function applyTheme(mode) {
  const root = document.documentElement;
  const body = document.body;

  // data-attr + 클래스 둘 다 지원 (CSS 변수는 :root[data-theme]에서도 적용되도록)
  root.setAttribute('data-theme', mode);
  body.classList.toggle('dark', mode === 'dark');

  localStorage.setItem(THEME_KEY, mode);

  // 스위치 상태 동기화
  const sw = document.getElementById('switch-mode');
  if (sw) sw.checked = (mode === 'dark');

  // (선택) data-hook="toggle-theme" 아이콘 버튼 아이콘 전환
  const btn = document.querySelector('[data-hook="toggle-theme"]');
  if (btn) {
    btn.setAttribute('aria-label', mode === 'dark' ? '라이트 모드' : '다크 모드');
    const icon = btn.querySelector('i,svg');
    if (icon) {
      icon.classList.toggle('bx-moon', mode !== 'dark');
      icon.classList.toggle('bx-sun', mode === 'dark');
    }
  }
}

function __themeDelegator(e) {
  const btn = e.target.closest('[data-hook="toggle-theme"]');
  if (!btn) return;
  e.preventDefault();
  const next = (getSavedTheme() === 'dark') ? 'light' : 'dark';
  applyTheme(next);
}

// 헤더/사이드바가 라우트 교체에 영향받거나, 토글 버튼이 partial에 있는 경우 대비
function initThemeToggle(root = document) {
  // 초기 1회 적용
  applyTheme(getSavedTheme());

  // 아이콘 버튼(위임)
  root.removeEventListener('click', __themeDelegator, true);
  root.addEventListener('click', __themeDelegator, true);

  // 체크박스 직접 바인딩 (중복 방지용 플래그)
  const sw = document.getElementById('switch-mode');
  if (sw && !sw.__bound) {
    sw.__bound = true;
    sw.addEventListener('change', (e) => {
      applyTheme(e.target.checked ? 'dark' : 'light');
    });
  }
}

// DOM 준비 시 1회
window.addEventListener('DOMContentLoaded', () => initThemeToggle());


// ==============================
// 공용 fetch 유틸
// ==============================
async function $get(url) {
  const r = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
const fmtMoney = n => `₩ ${Number(n||0).toLocaleString()}`;


// ==============================
// 페이지별 바인더(훅)
// ==============================
const routeHooks = {
  '/dashboard': {
    async onMounted(root) {
      const data = await $get('/api/admin/dashboard/summary');

      $('#kpi-new-accounts', root)?.replaceChildren(
        document.createTextNode(data.newAccountsToday)
      );
      $('#kpi-new-cards', root)?.replaceChildren(
        document.createTextNode(data.newCardsThisMonth)
      );
      $('#kpi-sum-today', root)?.replaceChildren(
        document.createTextNode(fmtMoney(data.sumTxnToday))
      );

      const tbody = root.querySelector('tbody[data-bind="alerts"]');
      if (tbody && Array.isArray(data.alerts)) {
        tbody.innerHTML = data.alerts.map(a => `
          <tr>
            <td>${new Date(a.date_time||'').toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'})}</td>
            <td><span class="badge ${a.type==='HIGH_CARD_AMOUNT'?'danger':'warn'}">${a.type}</span></td>
            <td>${a.shop_name||''}</td>
            <td class="right">${fmtMoney(a.approved_amount||a.cnt)}</td>
          </tr>
        `).join('');
      }
    }
  },

  '/bank': {
    async onMounted(root) {
      const qInput = root.querySelector('input[data-hook="acct-q"]');
      const tbody = root.querySelector('tbody[data-bind="accounts"]');

      async function load(page=0){
        const q = qInput?.value?.trim() || '';
        const data = await $get(`/api/admin/bank/accounts?q=${encodeURIComponent(q)}&limit=20&offset=${page*20}`);
        if (tbody) {
          tbody.innerHTML = (data || []).map(r => `
            <tr>
              <td>${r.name}</td>
              <td>${r.ACCOUNT_NUMBER || r.account_number || ''}</td>
              <td>${r.product_name || ''}</td>
              <td class="right">${fmtMoney(r.balance)}</td>
              <td><span class="badge ok">정상</span></td>
              <td class="actions"><button class="btn" data-action="acct-detail" data-id="${r.USER_ACCOUNT_ID}">상세</button></td>
            </tr>
          `).join('');
        }
      }

      await load();

      root.addEventListener('click', (e)=>{
        const btn = e.target.closest('[data-hook="acct-search"]');
        if (btn) load(0);
      });
    }
  },

  '/analytics': {
    async onMounted(root) {
      const now = new Date();
      const from = new Date(now.getFullYear(), now.getMonth()-5, 1).toISOString().slice(0,10);
      const to   = new Date(now.getFullYear(), now.getMonth()+1, 0).toISOString().slice(0,10);

      const [usersByZip, bankMonthly, cardMonthly] = await Promise.all([
        $get('/api/admin/analytics/users-by-zip?limit=50'),
        $get(`/api/admin/analytics/bank-monthly?from=${from}&to=${to}`),
        $get(`/api/admin/analytics/card-monthly?from=${from}&to=${to}`)
      ]);
      console.debug({ usersByZip, bankMonthly, cardMonthly });
    }
  }
  // '/messages', '/team', '/settings'도 같은 패턴으로 확장
};


// ==============================
// 해시 라우터 (partials fetch)
// ==============================
(function () {
  const routes = {
    '/dashboard': '/adminpage/dashboard.html',
    '/bank': '/adminpage/bank.html',
    '/analytics': '/adminpage/analytics.html',
    '/messages': '/adminpage/messages.html',
    '/team': '/adminpage/team.html',
    '/settings': '/adminpage/settings.html',
    '/logout': null,
  };

  const titleMap = {
    '/dashboard': 'Dashboard',
    '/bank': 'Bank',
    '/analytics': 'Analytics',
    '/messages': 'Message',
    '/team': 'Team',
    '/settings': 'Settings',
  };

  function getPathFromHash() {
    const h = location.hash || '#/dashboard';
    const [path] = h.replace('#', '').split('?');
    return path || '/dashboard';
  }

  function setSidebarActive(path) {
    document.querySelectorAll('#sidebar .side-menu.top li')
      .forEach((li) => li.classList.remove('active'));
    const activeLink = document.querySelector(`#sidebar a[href="#${path}"]`);
    activeLink?.closest('li')?.classList.add('active');
  }

  function syncHeader(path) {
    const titleEl = document.getElementById('pageTitle') || document.querySelector('.head-title h1');
    const breadcrumb = document.getElementById('breadcrumb') || document.querySelector('.head-title .breadcrumb');
    const title = titleMap[path] || 'Dashboard';
    if (titleEl) titleEl.textContent = title;
    if (breadcrumb) {
      breadcrumb.innerHTML = `
        <li><a href="#/dashboard">Dashboard</a></li>
        <li><i class='bx bx-chevron-right'></i></li>
        <li><a class="active" href="#${path}">${title}</a></li>
      `;
    }
  }

  async function loadRoute(path) {
    if (path === '/logout') {
      alert('로그아웃되었습니다.');
      location.hash = '#/dashboard';
      return;
    }

    const app = document.getElementById('app');
    const url = routes[path] || routes['/dashboard'];
    setSidebarActive(path);
    syncHeader(path);

    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const html = await res.text();
      app.innerHTML = html;

      // 페이지별 바인딩 1회만 호출
      const hook = routeHooks[path];
      if (hook?.onMounted) await hook.onMounted(app);

      // 새 파셜에 토글/스위치가 있을 수 있으므로 재바인딩
      initThemeToggle(document);

      window.scrollTo({ top: 0 });
    } catch (err) {
      app.innerHTML = `
        <div class="card">
          <h3>페이지 로드 실패</h3>
          <p class="muted">${url} - ${err.message}</p>
        </div>
      `;
    }
  }

  window.addEventListener('hashchange', () => loadRoute(getPathFromHash()));
  window.addEventListener('DOMContentLoaded', () => loadRoute(getPathFromHash()));
})();
