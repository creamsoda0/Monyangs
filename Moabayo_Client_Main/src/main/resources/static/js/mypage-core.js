// /js/mypage-core.js

// 공통: 숫자 포맷
export const fmtMoney = n => `₩ ${Number(n || 0).toLocaleString()}`;

// ===== 사이드바 토글 =====
document.addEventListener('click', (e) => {
  if (e.target.id === 'menuToggle' || e.target.closest('#menuToggle')) {
    document.getElementById('sidebar')?.classList.toggle('hide');
  }
});


// ===== KPI & 알림 (더미; 실제 API로 교체 가능) =====
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/mypagesummary');
    const data = await res.json();
    /*const data = { asset: 12500450, accounts: 3, cards: 2 };//테스트용 더미데이터 */ 

    const elAsset = document.getElementById('kpi-asset');
    const elAcc   = document.getElementById('kpi-accounts');
    const elCard  = document.getElementById('kpi-cards');
    if (elAsset) elAsset.textContent = fmtMoney(data.asset);
    if (elAcc)   elAcc.textContent   = data.accounts;
    if (elCard)  elCard.textContent  = data.cards;

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
  } catch (e) {
    console.error(e);
  }
});

// /js/mypage-core.js (하단 어디든)
document.addEventListener('click', (e)=>{
  const qa = e.target.closest('.qa');
  if (!qa) return;
  // 실시간 패널로 보내던 옛 로직을 쓰지 않게, 라우트 전용 데이터 속성만 쓴다면:
  const route = qa.getAttribute('data-route'); // 예: bank/cards/security
  if (route) {
    e.preventDefault();
    location.hash = `#/${route}`;
  }
});
/* 
주의!
- 빠른 실행 → 실시간 전환 로직은 전부 /js/mypage-panels.js에서 처리합니다.
- 여기(core)에는 페이지 이동/라우팅(setRealtimeTab, location.href 등) 관련 코드가 없어야 합니다.
*/
