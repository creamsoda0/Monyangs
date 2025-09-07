// /js/mypagesections/settings.js
const K = (k) => `mb.${k}`;
const get = (k, d=null) => {
  try { const v = localStorage.getItem(K(k)); return v ?? d; } catch { return d; }
};
const set = (k, v) => { try { localStorage.setItem(K(k), v); } catch {} };

export function renderSettings(root){
  if (!root) return;

  root.innerHTML = `
    <div class="section-head">
      <h3>설정</h3><span class="sub">환경설정 · 알림 · 개인정보</span>
    </div>

    <div class="settings-grid">
      <!-- 테마 -->
	  <div class="panel">
	    <div class="panel-title">모양(테마)</div>
	    <form class="settings-form" id="set-theme">
	      <div class="row between">
	        <div class="label-text">다크 모드</div>
	        <div class="ctrl">
	          <input type="checkbox" id="setThemeDark" hidden>
	          <!-- NOTE: data-hook 붙이지 마세요(중복 토글 방지) -->
	          <label class="swith-lm sm" for="setThemeDark" aria-label="다크 모드 스위치">
	            <i class="bx bxs-moon"></i>
	            <i class="bx bx-sun"></i>
	            <div class="ball"></div>
	          </label>
	        </div>
	      </div>
	      <div class="hint">라이트/다크는 상단 토글과 동기화됩니다.</div>
	    </form>
	  </div>


      <!-- 일반 환경설정 -->
      <div class="panel">
        <div class="panel-title">환경설정</div>
        <form class="settings-form" id="set-prefs">
          <label>
            언어
            <select id="setLang" class="select">
              <option value="ko">한국어</option>
              <option value="en">English</option>
              <option value="ja">日本語</option>
            </select>
          </label>
          <label>
            통화
            <select id="setCurrency" class="select">
              <option value="KRW">KRW ₩</option>
              <option value="USD">USD $</option>
              <option value="JPY">JPY ¥</option>
            </select>
          </label>
        </form>
      </div>

      <!-- 알림 -->
      <div class="panel">
        <div class="panel-title">알림</div>
        <form class="settings-form" id="set-notif">
          <label>이메일 알림 <input type="checkbox" id="setNotifEmail"></label>
          <label>푸시 알림   <input type="checkbox" id="setNotifPush"></label>
          <div class="hint">실제 연동 전까지는 로컬에만 저장됩니다.</div>
        </form>
      </div>

      <!-- 개인정보 -->
      <div class="panel">
        <div class="panel-title">개인정보</div>
        <form class="settings-form" id="set-privacy">
          <label>자산/잔액 가리기 <input type="checkbox" id="setHideBalance"></label>
          <div class="hint">공용 환경에서 수치를 흐리게 표시합니다.</div>
        </form>
      </div>
    </div>
  `;

  // 초기값 바인딩
  const themeDark = document.getElementById('setThemeDark');
  themeDark.checked = (get('theme','light') === 'dark');

  const langSel = document.getElementById('setLang');
  const curSel  = document.getElementById('setCurrency');
  langSel.value = get('lang','ko');
  curSel.value  = get('currency','KRW');

  const notifEmail = document.getElementById('setNotifEmail');
  const notifPush  = document.getElementById('setNotifPush');
  notifEmail.checked = get('notifEmail','1') === '1';
  notifPush.checked  = get('notifPush','1')  === '1';

  const hideBalance = document.getElementById('setHideBalance');
  hideBalance.checked = get('hideBalance','0') === '1';
  document.body.classList.toggle('hide-balance', hideBalance.checked);

  // 이벤트
  themeDark.addEventListener('change', () => {
    const t = themeDark.checked ? 'dark' : 'light';
    set('theme', t);
    // theme.js와 동일 로직 적용(즉시 반영)
    document.documentElement.setAttribute('data-theme', t);
    document.body.classList.toggle('dark', t === 'dark');
    const sw = document.getElementById('switch-mode');
    if (sw) sw.checked = (t === 'dark');
  });

  langSel.addEventListener('change', e => set('lang', e.target.value));
  curSel.addEventListener('change',  e => set('currency', e.target.value));

  notifEmail.addEventListener('change', e => set('notifEmail', e.target.checked ? '1':'0'));
  notifPush .addEventListener('change', e => set('notifPush',  e.target.checked ? '1':'0'));

  hideBalance.addEventListener('change', e => {
    set('hideBalance', e.target.checked ? '1':'0');
    document.body.classList.toggle('hide-balance', e.target.checked);
  });
}
