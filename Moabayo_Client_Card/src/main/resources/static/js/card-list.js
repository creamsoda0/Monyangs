/**
 * 카드 리스트 페이지 전용 스크립트
 * - 서버가 렌더링한 DOM(data-* 속성)을 읽어 초기 상태를 구성
 * - 검색/정렬/칩(태그) 필터를 클라이언트에서 수행
 * - 외부 파일로 분리하여 캐시/유지보수 개선
 */

// -------------------- 전역 상태/DOM 참조 --------------------
/** 화면 상태(검색어, 정렬 기준, 선택된 태그, 카드 데이터 목록) */
const state = {
  q: '',                 // 검색어(소문자)
  sort: 'popular',       // 정렬 기준: 'popular' | 'annual' | 'name'
  tags: new Set(),       // 선택된 태그들의 집합 (교집합 필터)
  list: []               // [{id, name, img, issuer, annual, perks[], tags[], popular}]
};

// 주요 DOM 요소 캐싱
const $grid  = document.getElementById('grid');   // 카드 그리드 컨테이너
const $count = document.getElementById('count');  // 총 개수 표시
const $empty = document.getElementById('empty');  // 빈 상태 표시 박스
const $q     = document.getElementById('q');      // 검색 인풋
const $sort  = document.getElementById('sort');   // 정렬 셀렉트
const $chips = document.getElementById('chips');  // 태그 칩 컨테이너

// -------------------- 초기화: 서버 렌더 DOM -> 상태 부팅 --------------------
/**
 * 서버가 렌더링한 .card-item 요소에서 data-* 속성을 읽어
 * state.list 형태(렌더 함수가 쓰는 구조)로 변환한다.
 */
function bootstrapFromDOM() {
  // 페이지에 이미 렌더되어 있는 카드 DOM 목록
  const items = Array.from(document.querySelectorAll('.card-item'));

  state.list = items.map(el => {
    // 혜택 문자열(예: "영화 3천원,카페 10%")을 기호(, ·)로 분할 → 배열
    const perksStr = el.dataset.perks || '';
    const perks = perksStr ? perksStr.split(/\s*[,·]\s*/) : [];

    // 태그는 카테고리/타입을 사용 (필요 시 확장 가능)
    const tags = [el.dataset.category, el.dataset.type].filter(Boolean);

    return {
      id:     el.dataset.id,
      name:   el.dataset.name || '이름 없음',
      img:    el.dataset.img  || '/images/placeholder-card.png',
      issuer: el.dataset.issuer || '',
      annual: Number(el.dataset.annual || 0),
      perks,                  // ['영화 3천원', '카페 10%']
      tags,                   // ['여행','카페'] 등
      popular: Number(el.dataset.popular || 50)
    };
  });
}

// -------------------- 렌더링 --------------------
/**
 * 현재 state를 기준으로 필터링/정렬하여 그리드 HTML을 갱신한다.
 */
function render() {
  // 1) 필터링: 검색어 포함 + 선택 태그(교집합) 모두 포함
  let list = state.list.filter(c => {
    // 검색 대상 문자열(카드명 + 혜택 + 태그)을 소문자로 합쳐둠
    const hay = (c.name + ' ' + c.perks.join(' ') + ' ' + c.tags.join(' ')).toLowerCase();
    // 검색어가 있고 포함되지 않으면 제외
    if (state.q && !hay.includes(state.q)) return false;
    // 선택된 태그가 하나라도 카드에 없으면 제외 (교집합 논리)
    for (const t of state.tags) {
      if (!c.tags.includes(t)) return false;
    }
    return true;
  });

  // 2) 정렬
  list.sort((a, b) => {
    if (state.sort === 'annual') return (a.annual || 0) - (b.annual || 0);               // 연회비 오름차순
    if (state.sort === 'name')   return a.name.localeCompare(b.name, 'ko');              // 이름 가나다순
    return (b.popular || 0) - (a.popular || 0);                                          // 기본: 인기 내림차순
  });

  // 3) 개수/빈 상태 표시
  if ($count) $count.textContent = list.length;
  if ($empty) $empty.style.display = list.length ? 'none' : 'block';

  // 4) 그리드 내용 갱신
  if ($grid) $grid.innerHTML = list.map(cardHtml).join('');
}

/**
 * 단일 카드 아이템의 HTML 문자열을 생성한다.
 * (이미지는 <img>로 출력하여 Cloudinary 등 외부 URL을 안전하게 표시)
 */
function cardHtml(c) {
  const annualBadge = c.annual
    ? `<span class="badge">연회비 ${Number(c.annual).toLocaleString()}원</span>`
    : `<span class="badge">연회비 없음</span>`;

  return `
    <div class="card-item" data-id="${c.id}" onclick="viewDetail('${c.id}')">
      <div class="thumb">
        <img src="${c.img}" alt="" loading="lazy" referrerpolicy="no-referrer"
             onerror="this.src='/images/placeholder-card.png'">
      </div>
      <div class="meta">
        <div class="name">${escapeHtml(c.name)}</div>
        <div class="badges">
          ${c.tags.map(t => `<span class="badge">#${escapeHtml(t)}</span>`).join('')}
          ${annualBadge}
        </div>
        <div class="issuer">${(c.perks && c.perks.length) ? c.perks.map(escapeHtml).join(' · ') : escapeHtml(c.issuer || '')}</div>
      </div>
    </div>
  `;
}

// -------------------- 유틸 --------------------
/** 아주 간단한 HTML 이스케이프 (이름/태그/문자열 출력 안전성 보강) */
function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// -------------------- 이벤트 바인딩 --------------------
/** 검색 인풋: 입력할 때마다 state.q 갱신 후 렌더 */
if ($q) {
  $q.addEventListener('input', (e) => {
    state.q = (e.target.value || '').trim().toLowerCase();
    render();
  });
}

/** 정렬 셀렉트: 변경 시 state.sort 갱신 후 렌더 */
if ($sort) {
  $sort.addEventListener('change', (e) => {
    state.sort = e.target.value || 'popular';
    render();
  });
}

/** 칩(태그) 컨테이너: 위임 클릭으로 active 토글 + state.tags 갱신 */
if ($chips) {
  $chips.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');  // 클릭한 요소가 .chip 내부여도 찾아줌
    if (!chip) return;
    const tag = chip.dataset.tag;
    if (!tag) return;

    // UI 토글
    chip.classList.toggle('active');

    // 상태 토글 (선택되면 추가, 해제되면 삭제)
    chip.classList.contains('active') ? state.tags.add(tag) : state.tags.delete(tag);

    // 렌더
    render();
  });
}

// -------------------- 상세 페이지 이동 --------------------
/**
 * 카드 클릭 시 상세로 이동.
 * 실제 라우팅 규칙에 맞게 수정하세요.
 * 예: location.href = `/usercard/detail?cardId=${id}`;
 */
function viewDetail(id) {
  console.log('view card:', id);
   location.href = `/usercard/newcard?cardId=${encodeURIComponent(id)}`;
}

// -------------------- 페이지 로드 시 초기화 --------------------
/** 스크립트가 defer로 로드되니 DOMContentLoaded 없이 바로 초기화 가능 */
bootstrapFromDOM();
render();
