// /js/theme.js (덮어쓰기 버전)
// - 쿠키 저장: mb.theme = (light|dark) ; path=/ ; 1년
// - 로컬스토리지 동기화: 'mb.theme'
// - data-theme/html, body.dark(레거시) 적용
// - 시스템 테마 연동(사용자 지정 없을 때만)
// - 여러 페이지/토글 스위치(#switch-mode, label[for="switch-mode"]) 동작

(function () {
  const KEY = 'mb.theme';
  const COOKIE_NAME = 'mb.theme';
  const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1y
  const BOUND = new WeakSet();
  const mm = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)')) || null;

  // ---------- cookie helpers ----------
  function readCookie(name) {
    const m = document.cookie.match(new RegExp('(?:^|;\\s*)' + name.replace('.', '\\.') + '\\s*=\\s*([^;]+)'));
    return m ? decodeURIComponent(m[1]) : null;
  }
  function writeCookie(name, val) {
    try {
      document.cookie = name + '=' + encodeURIComponent(val) +
        '; Max-Age=' + COOKIE_MAX_AGE +
        '; Path=/' +
        '; SameSite=Lax';
      // Domain은 로컬/서브도메인 이슈가 있어 생략이 안전함
    } catch {}
  }
  function eraseCookie(name) {
    try { document.cookie = name + '=; Max-Age=0; Path=/; SameSite=Lax'; } catch {}
  }

  // ---------- storage helpers ----------
  function lsGet() { try { return localStorage.getItem(KEY); } catch { return null; } }
  function lsSet(v) { try { localStorage.setItem(KEY, v); } catch {} }
  function lsHas() { try { return localStorage.getItem(KEY) != null; } catch { return false; } }

  // ---------- theme core ----------
  function applyTheme(theme, persist) {
    const t = (theme === 'dark') ? 'dark' : 'light';
    const root = document.documentElement;

    // html[data-theme]
    root.setAttribute('data-theme', t);
    // 레거시 호환
    if (document.body) {
      document.body.classList.toggle('dark', t === 'dark');
    }

    // 스위치 상태 반영
    document.querySelectorAll('#switch-mode').forEach(sw => { sw.checked = (t === 'dark'); });

    if (persist) {
      writeCookie(COOKIE_NAME, t);
      lsSet(t);
    }
  }

  function currentPreference() {
    // 1) cookie
    const ck = readCookie(COOKIE_NAME);
    if (ck === 'dark' || ck === 'light') return ck;
    // 2) localStorage (백업)
    const st = lsGet();
    if (st === 'dark' || st === 'light') return st;
    // 3) html 초기값 / 시스템
    const attr = document.documentElement.getAttribute('data-theme');
    if (attr === 'dark' || attr === 'light') return attr;
    return (mm && mm.matches) ? 'dark' : 'light';
  }

  // 최초 적용 (defer라면 DOM 파싱 뒤이긴 함)
  applyTheme(currentPreference(), false);

  // ---------- bind UI ----------
  function bindToggles() {
    // label 클릭 토글
    document.querySelectorAll('label[for="switch-mode"]').forEach(lb => {
      if (BOUND.has(lb)) return;
      lb.addEventListener('click', (e) => {
        e.preventDefault();
        const cur = document.documentElement.getAttribute('data-theme') || 'light';
        const next = (cur === 'dark') ? 'light' : 'dark';
        applyTheme(next, true);
      }, { passive: false });
      BOUND.add(lb);
    });
    // input 직접 변경
    document.querySelectorAll('#switch-mode').forEach(sw => {
      if (BOUND.has(sw)) return;
      sw.addEventListener('change', (e) => {
        applyTheme(e.currentTarget.checked ? 'dark' : 'light', true);
      });
      BOUND.add(sw);
    });
  }
  (document.readyState === 'loading')
    ? window.addEventListener('DOMContentLoaded', bindToggles, { once: true })
    : bindToggles();
  new MutationObserver(bindToggles).observe(document.documentElement, { childList: true, subtree: true });

  // ---------- system changes ----------
  // 사용자가 직접 테마를 선택하지 않은 상태(쿠키/LS 없음)에서만 시스템 변경을 따름
  mm && mm.addEventListener?.('change', () => {
    if (!readCookie(COOKIE_NAME) && !lsHas()) {
      applyTheme(mm.matches ? 'dark' : 'light', false);
    }
  });

  // ---------- storage sync (다른 탭과 동기화) ----------
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) {
      const v = lsGet();
      if (v === 'dark' || v === 'light') {
        writeCookie(COOKIE_NAME, v);
        applyTheme(v, false);
      } else {
        eraseCookie(COOKIE_NAME);
      }
    }
  });

  // ---------- 공개 API (선택) ----------
  window.mnzTheme = {
    get: () => currentPreference(),
    set: (t, persist = true) => applyTheme(t, persist),
    clear: () => { eraseCookie(COOKIE_NAME); try { localStorage.removeItem(KEY); } catch {} }
  };
})();
