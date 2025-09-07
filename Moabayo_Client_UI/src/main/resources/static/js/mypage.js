// 숫자 포맷
const fmtMoney = n => `₩ ${Number(n || 0).toLocaleString()}`;

// ===== 사이드바 토글 =====
document.addEventListener('click', (e) => {
  if (e.target.id === 'menuToggle' || e.target.closest('#menuToggle')) {
    document.getElementById('sidebar')?.classList.toggle('hide');
  }
});

// ===== 다크모드 =====
(function () {
  const KEY = 'mb.theme';
  const get = () => localStorage.getItem(KEY);
  const apply = (mode) => { document.body.classList.toggle('dark', mode === 'dark'); localStorage.setItem(KEY, mode); };
  apply(get() || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));

  // 라벨 클릭으로도 동작하도록
  document.addEventListener('click', (e) => {
    if (!e.target.closest('[data-hook="toggle-theme"]')) return;
    const next = document.body.classList.contains('dark') ? 'light' : 'dark';
    apply(next);
    // 스위치 체크 상태 동기화
    const c = document.getElementById('switch-mode');
    if (c) c.checked = (next === 'dark');
  });
})();

// ===== 빠른 실행 버튼 라우팅 =====
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.qa');
  if (!btn) return;

  switch (btn.dataset.action) {
    case 'profile-edit': location.href = '/mypage/profile-edit'; break;
    case 'account-list': location.href = '/mypage/accounts'; break;
    case 'card-list':    location.href = '/mypage/cards'; break;
    case 'pin-change':   location.href = '/mypage/pin-change'; break;
    case 'leave':
      if (confirm('정말로 회원탈퇴를 진행하시겠습니까?')) location.href = '/mypage/leave';
      break;
    case 'logout':       location.href = '/logout'; break;
  }
});

// ===== 더미 데이터 바인딩 (원하면 API로 교체) =====
window.addEventListener('DOMContentLoaded', async () => {
  try {
    // TODO: 실제 API로 교체
    // const res = await fetch('/api/mypage/summary'); const data = await res.json();
    const data = { asset: 12500450, accounts: 3, cards: 2 };
    document.getElementById('kpi-asset').textContent = fmtMoney(data.asset);
    document.getElementById('kpi-accounts').textContent = data.accounts;
    document.getElementById('kpi-cards').textContent = data.cards;

    const notif = [
      { title: '새 입금 120,000원', time: '오늘 10:12' },
      { title: '카드 승인 35,900원', time: '오늘 09:45' },
      { title: '비밀번호 변경 안내', time: '어제 18:01' }
    ];
    const ul = document.getElementById('notifList');
    if (ul) {
      ul.innerHTML = notif.map(n => `
        <li>
          <span>${n.title}</span>
          <small style="color:var(--dark-grey)">${n.time}</small>
        </li>
      `).join('');
    }

    // 스위치 초기 체크 상태 동기화
    const c = document.getElementById('switch-mode');
    if (c) c.checked = document.body.classList.contains('dark');
  } catch (e) {
    console.error(e);
  }
});
