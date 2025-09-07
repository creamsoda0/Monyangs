// /js/mypage-panels.js (module)
import { fmtMoney } from '/js/mypage-core.js';

/* ====== 뷰 전환 설정 ====== */
const RT_VIEWS = ['profile','accounts','cards','pin','leave','logout'];

function showView(name, { scroll = true, label } = {}) {
  if (!RT_VIEWS.includes(name)) return;

  // 뷰 토글
  document.querySelectorAll('.rt-view').forEach(v => {
    v.classList.toggle('active', v.dataset.view === name);
  });

  // 레이블 업데이트
  const mapLabel = {
    profile:'정보 수정', accounts:'계좌조회', cards:'카드조회',
    pin:'비밀번호', leave:'회원탈퇴', logout:'로그아웃'
  };
  const el = document.getElementById('rt-label');
  if (el) el.textContent = label || mapLabel[name] || '';

  // URL ?rt=name 동기화 (location.href 사용 없이)
  try {
    const params = new URLSearchParams(window.location.search);
    params.set('rt', name);
    const next = `${window.location.pathname}?${params.toString()}${window.location.hash || ''}`;
    history.replaceState(null, '', next);
  } catch (_) {}

  // 섹션으로 스크롤
  if (scroll) document.getElementById('realtimeSection')?.scrollIntoView({ behavior:'smooth', block:'start' });
}

/* ====== 더미 데이터 (API 교체 지점) ====== */
const dummyAccounts = [
  { alias:'월급통장', no:'273-111-6789', balance: 3520450, status:'정상' },
  { alias:'생활비',   no:'273-333-0101', balance:  820000, status:'정상' },
  { alias:'비상금',   no:'273-555-7777', balance: 1200000, status:'출금제한' },
];
const dummyCards = [
  { name:'모으냥즈 체크',      brand:'VISA',   desc:'생활 할인형', last4:'1234' },
  { name:'모으냥즈 플래티넘',  brand:'Master', desc:'해외 적합',   last4:'5678' },
  { name:'냥청년 청년카드',    brand:'VISA',   desc:'청년 특화',   last4:'9012' },
];

/* ====== 렌더링 ====== */
function renderAccounts(list) {
  const tbody = document.querySelector('#accTable tbody');
  if (!tbody) return;
  tbody.innerHTML = list.map(a => `
    <tr>
      <td>${a.alias}</td>
      <td>${a.no}</td>
      <td class="right">${fmtMoney(a.balance)}</td>
      <td><span class="badge">${a.status}</span></td>
      <td><button class="btn ghost" data-acc="${a.no}"><i class='bx bx-search'></i> 상세</button></td>
    </tr>
  `).join('');
}
function filterAccounts(q) {
  const k = (q || '').trim().toLowerCase();
  return dummyAccounts.filter(a => a.alias.toLowerCase().includes(k) || a.no.includes(k));
}

function renderCards(list) {
  const grid = document.getElementById('cardGrid');
  if (!grid) return;
  grid.innerHTML = list.map(c => `
    <div class="card-tile">
      <div class="logo">${c.brand.slice(0,1)}</div>
      <div class="meta">
        <div class="name">${c.name}</div>
        <div class="desc">${c.brand} • ${c.desc} • **** ${c.last4}</div>
      </div>
      <div class="actions">
        <button class="btn ghost" data-card="${c.last4}"><i class='bx bx-detail'></i> 상세</button>
      </div>
    </div>
  `).join('');
}
function filterCards(q) {
  const k = (q || '').trim().toLowerCase();
  return dummyCards.filter(c => c.name.toLowerCase().includes(k) || c.brand.toLowerCase().includes(k));
}

/* ====== 초기 바인딩 ====== */
window.addEventListener('DOMContentLoaded', () => {
  // 리스트 초기 렌더
  renderAccounts(dummyAccounts);
  renderCards(dummyCards);

  // ?rt= 로 진입 시 해당 뷰 열기 (location.href 미사용)
  try {
    const rt = new URLSearchParams(window.location.search).get('rt');
    if (RT_VIEWS.includes(rt)) showView(rt, { scroll:false });
  } catch (_) {}

  // 계좌 검색/새로고침
  const accSearch = document.getElementById('accSearch');
  const accRefresh = document.getElementById('accRefresh');
  accSearch?.addEventListener('input', e => renderAccounts(filterAccounts(e.target.value)));
  accRefresh?.addEventListener('click', () => { if (accSearch) accSearch.value = ''; renderAccounts(dummyAccounts); });

  // 카드 검색/새로고침
  const cardSearch = document.getElementById('cardSearch');
  const cardRefresh = document.getElementById('cardRefresh');
  cardSearch?.addEventListener('input', e => renderCards(filterCards(e.target.value)));
  cardRefresh?.addEventListener('click', () => { if (cardSearch) cardSearch.value = ''; renderCards(dummyCards); });

  // 정보수정 저장(목업)
/*  const form = document.getElementById('formProfile');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(form).entries());
    console.log('Profile Save (dummy):', payload);
    alert('저장되었습니다.');
  });*/
});

/* ====== 빠른 실행 → 실시간 뷰 매핑 (6개 전부) ====== */
document.addEventListener('click', (e) => {
  const qa = e.target.closest('.qa');
  if (!qa) return;

  const map = {
    'profile-edit':'profile',
    'account-list':'accounts',
    'card-list'   :'cards',
    'pin-change'  :'pin',
    'leave'       :'leave',
    'logout'      :'logout'
  };
  const view = map[qa.dataset.action];
  if (!view) return;

  e.preventDefault();
  showView(view);

  // 뷰별 포커스/초기화
  if (view === 'profile') {
    setTimeout(() => document.querySelector('#formProfile input[name="name"]')?.focus(), 0);
  } else if (view === 'accounts') {
    const q = document.getElementById('accSearch'); if (q) q.value = '';
    renderAccounts?.(dummyAccounts); setTimeout(() => q?.focus(), 0);
  } else if (view === 'cards') {
    const q = document.getElementById('cardSearch'); if (q) q.value = '';
    renderCards?.(dummyCards); setTimeout(() => q?.focus(), 0);
  } else if (view === 'pin') {
    setTimeout(() => document.querySelector('#formPin input[name="cur"]')?.focus(), 0);
  }
});



/* ====== 폼/버튼 목업 ====== */
document.addEventListener('submit', (e) => {
  if (e.target?.id === 'formPin') {
    e.preventDefault();
    const fd = new FormData(e.target);
    if (fd.get('next') !== fd.get('next2')) return alert('새 비밀번호가 일치하지 않습니다.');
    alert('비밀번호가 변경되었습니다.');
  }
  if (e.target?.id === 'formLeave') {
    e.preventDefault();
    if (!confirm('정말로 탈퇴하시겠습니까?')) return;
    alert('탈퇴 처리가 완료되었습니다.');
  }
});

document.addEventListener('click', (e) => {
  if (e.target?.id === 'btnDoLogout') {
    e.preventDefault();
    // 실제 로그아웃 시: window.location.assign('/logout');
    alert('로그아웃 되었습니다.');
  }
  if (e.target?.dataset?.action === 'cancel-leave' || e.target?.dataset?.action === 'cancel-logout') {
    showView('profile');
  }
});
