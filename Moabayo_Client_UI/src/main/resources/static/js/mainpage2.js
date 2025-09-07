// /static/js/mainpage2.js  ← 전체 교체
(() => {
	const KEY = 'mb.theme';
	const root = document.documentElement;

	// 1) 구 키('theme') → 신 키('mb.theme') 1회 이관
	(function migrateOldKey() {
		try {
			const old = localStorage.getItem('theme');
			if (old && !localStorage.getItem(KEY)) {
				localStorage.setItem(KEY, old === 'dark' ? 'dark' : 'light');
			}
			localStorage.removeItem('theme');
		} catch { }
	})();

	// 2) 읽기: 저장값 > html data-attr > class > 시스템 기본
	function readTheme() {
		try {
			const saved = localStorage.getItem(KEY);
			if (saved) return saved;
		} catch { }
		const attr = root.getAttribute('data-theme');
		if (attr) return attr;
		if (root.classList.contains('dark')) return 'dark';
		try { return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
		catch { return 'light'; }
	}

	// 라벨/ARIA 동기화
	function syncUi(theme) {
		const t = (theme === 'dark') ? 'dark' : 'light';
		const btn = document.getElementById('themeToggle');
		const label = document.getElementById('themeLabel');
		if (btn) btn.setAttribute('aria-pressed', String(t === 'dark'));
		if (label) label.textContent = t === 'dark' ? '라이트모드' : '다크모드';
	}

	// 3) 적용: html/body 동기화 + 저장 + 라벨/ARIA
	function applyTheme(t) {
		const theme = (t === 'dark') ? 'dark' : 'light';

		// html
		root.setAttribute('data-theme', theme);
		root.classList.toggle('dark', theme === 'dark');

		// body(레거시 CSS 대응)
		if (document.body) {
			document.body.setAttribute('data-theme', theme);
			document.body.classList.toggle('dark', theme === 'dark');
		}

		// 저장
		try { localStorage.setItem(KEY, theme); } catch { }

		// 라벨/ARIA
		syncUi(theme);
	}

	// 4) 버튼 바인딩
	function bindThemeToggle() {
		// ✅ 위임 바인딩: 헤더가 나중에 들어와도 동작
		document.addEventListener('click', (e) => {
			const btn = e.target.closest('#themeToggle');
			if (!btn) return;

			const before = readTheme(); // 클릭 전 상태 저장
			const proxy = document.querySelector('label[for="switch-mode"]');

			if (proxy) proxy.click(); // theme.js가 붙어 있으면 이 경로로 처리

			// ✅ 한 틱 뒤 상태 확인: theme.js가 못 받았으면 우리가 처리
			setTimeout(() => {
				const after = document.documentElement.getAttribute('data-theme') || readTheme();
				if (after === before) {
					// theme.js가 반응 못함 → 수동 토글
					applyTheme(before === 'dark' ? 'light' : 'dark');
				} else {
					// theme.js가 처리했음 → UI/저장 싱크만
					syncUi(after);
					try { localStorage.setItem(KEY, after); } catch { }
				}
			}, 0);
		}, { passive: true });
	}

	// (선택) 어디서 바꿔도 UI 싱크
	function observeThemeAttr() {
		try {
			const mo = new MutationObserver(() => {
				syncUi(document.documentElement.getAttribute('data-theme'));
			});
			mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
		} catch { }
	}

	function init() {
		applyTheme(readTheme());  // 초기 동기화
		bindThemeToggle();
		observeThemeAttr();       // ✅ 선택: 어디서 바꿔도 UI 싱크
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();



/* MNZ Compare – hover follow (mouse) + drag (touch) */
(function(){
  const stages = document.querySelectorAll('[data-mnz-compare]');
  if(!stages.length) return;

  stages.forEach(stage=>{
    const before = stage.querySelector('[data-mnz-before]');
    const bar    = stage.querySelector('[data-mnz-bar]');

    function setX(clientX){
      const rect = stage.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const ratio = x / rect.width * 100;
      before.style.width = ratio + '%';
      bar.style.left = ratio + '%';
    }

    // ✅ 호버만으로 실시간 반응
    stage.addEventListener('mousemove', e => setX(e.clientX));
    stage.addEventListener('mouseenter', e => {
      // 진입 시 현재 포인터 위치 또는 중앙으로 세팅
      setX(e.clientX ?? (stage.getBoundingClientRect().left + stage.getBoundingClientRect().width/2));
    });

    // ✅ 터치 드래그 (모바일)
    stage.addEventListener('touchstart', e => setX(e.touches[0].clientX), {passive:true});
    stage.addEventListener('touchmove',  e => setX(e.touches[0].clientX), {passive:true});

    // 초기값: 중앙
    requestAnimationFrame(()=>{
      const r = stage.getBoundingClientRect();
      setX(r.left + r.width/2);
    });

    // 리사이즈 시 중앙 유지
    window.addEventListener('resize', ()=>{
      const r = stage.getBoundingClientRect();
      setX(r.left + r.width/2);
    });
  });
})();