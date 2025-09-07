// /js/theme.js
(function () {
  const KEY = 'mb.theme';

  function setTheme(t, persist) {
    const theme = (t === 'dark') ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    // 레거시 CSS 호환 (body.dark 쓰는 규칙 있을 때)
    if (document.body) document.body.classList.toggle('dark', theme === 'dark');
    if (persist) try { localStorage.setItem(KEY, theme); } catch {}

    const sw = document.getElementById('switch-mode');
    if (sw) sw.checked = (theme === 'dark');
  }

  // 1) 초기 적용 (저장값 있으면 그걸, 없으면 HTML의 기본값 사용)
  const stored = (() => { try { return localStorage.getItem(KEY); } catch { return null; }})();
  setTheme(stored || (document.documentElement.getAttribute('data-theme') || 'light'), false);

  // 2) 라벨 클릭만으로 토글 (change 핸들러/추가 클릭 핸들러 전부 금지)
  function attach() {
    const label = document.querySelector('label[for="switch-mode"]');
    if (!label) return;
    label.addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme') || 'light';
      const next = (cur === 'dark') ? 'light' : 'dark';
      setTheme(next, true);
    });
  }
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', attach, { once: true });
  } else {
    attach();
  }
})();
