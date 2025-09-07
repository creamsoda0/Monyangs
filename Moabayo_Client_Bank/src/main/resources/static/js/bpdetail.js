// ─────────────────────────────────────────
// 0) 유틸
// ─────────────────────────────────────────
const $  = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const asPct   = (n, dp=2)=> (Number(n).toFixed(dp) + '%');
const fmtMoney= n => n.toLocaleString('ko-KR');
const clamp   = (n,a,b)=> Math.max(a, Math.min(b,n));

// 1) 서버가 준 bpDetail을 dataset에서 읽기
function loadProductFromDataset(){
  const el = document.getElementById('bpDetail');
  if (!el) { throw new Error('#bpDetail not found'); }
  return {
    account_id: Number(el.dataset.id),
    name: el.dataset.name || '',
    img: el.dataset.img || '',
    description: el.dataset.desc || '',
    category: el.dataset.category || '',
    benefits: el.dataset.benefits || '',
    interest: Number(el.dataset.rate || 0),
    type: el.dataset.type || ''
  };
}

// 우대 조건 → 가산 금리(%p) 매핑(예시)
const BONUS_MAP = new Map([
  ['급여이체',0.20], ['카드실적',0.10], ['자동이체',0.10],
  ['앱 로그인',0.05], ['타행이체 수수료면제',0.00], ['ATM 수수료면제',0.00],
]);

// ─────────────────────────────────────────
// 2) 현재 상품 로드
// ─────────────────────────────────────────
const qs = new URLSearchParams(location.search);
/*const currentId = Number(new URLSearchParams(location.search).get('id'));
if (currentId && currentId !== product.account_id) {
  console.warn('URL id와 서버 주입 id가 다릅니다:', currentId, product.account_id);
}*/
const product = loadProductFromDataset();

// 금리(연) – 스키마에 baseRate가 없어서 임시로 최고금리-0.5%p를 기본으로 추정
const maxRatePct = product.interest; // 예: 0.25 또는 3.10

// 상품 혜택 중 "가산되는 우대bp(>0)" 총합을 구해 기본/우대캡을 추정
const allBenefits = (product.benefits || '').split(',').map(s=>s.trim()).filter(Boolean);
const positiveBonusSumPctp = allBenefits
  .map(b => BONUS_MAP.get(b) || 0)
  .filter(v => v > 0)
  .reduce((a,b)=> a + b, 0);                   // %p 합 (예: 0.05)

const baseRatePct = clamp(maxRatePct - positiveBonusSumPctp, 0, maxRatePct); // 예: 0.25 - 0.05 = 0.20
const maxBonusCap = positiveBonusSumPctp;                                    // 예: 0.05

// ─────────────────────────────────────────
// 3) 히어로 주입
// ─────────────────────────────────────────
$('#p-type').textContent = product.type || '-';
$('#p-cat').textContent  = product.category || '-';
$('#p-name').textContent = product.name;
$('#p-desc').textContent = product.description || '-';

const fit = 0.82; // 임시 적합도
$('#fitRing').style.setProperty('--val', fit);
$('#fitPct').textContent = Math.round(fit*100)+'%';

$('#baseRate').textContent = asPct(baseRatePct);
$('#maxRate').textContent  = asPct(maxRatePct);
$('#typeLabel').textContent= product.type;

$('#ctaMax').textContent  = asPct(maxRatePct, 2);
$('#ctaBase').textContent = asPct(baseRatePct, 2);

// 베네핏 칩 & 우대 토글
const benefits = (product.benefits||'').split(',').map(s=>s.trim()).filter(Boolean);
$('#p-benefits').innerHTML = benefits.map(b=>`<span class="chip">${b}</span>`).join('');

const togglesWrap = $('#benefitToggles');
const bonusItems  = benefits.filter(b => BONUS_MAP.has(b));
if (bonusItems.length){
  togglesWrap.innerHTML = `
    <div class="bp-badges">
      ${bonusItems.map((b,i)=>`
        <label class="bp-badge">
          <input type="checkbox" data-bonus="${BONUS_MAP.get(b)}" ${i<2?'checked':''}/>
          ${b} (+${BONUS_MAP.get(b).toFixed(2)}%p)
        </label>
      `).join('')}
    </div>`;
}

const positiveBonuses = allBenefits.filter(b => (BONUS_MAP.get(b) || 0) > 0);
const zeroBonuses     = allBenefits.filter(b => (BONUS_MAP.get(b) || 0) <= 0);

if (positiveBonuses.length || zeroBonuses.length){
  togglesWrap.innerHTML = `
    ${positiveBonuses.length ? `
      <div class="bp-badges">
        ${positiveBonuses.map(b=>`
          <label class="bp-badge">
            <input type="checkbox" data-bonus="${BONUS_MAP.get(b)}"/>
            ${b} (+${BONUS_MAP.get(b).toFixed(2)}%p)
          </label>
        `).join('')}
      </div>` : ''}

    ${zeroBonuses.length ? `
      <div class="hint" style="margin-top:6px">
        우대 영향 없음: ${zeroBonuses.join(', ')}
      </div>` : ''}
  `;
}
// ─────────────────────────────────────────
// 4) 시뮬레이터 (단일 구현)
//    - 입력: #amount / #amountRange / #term / #tax / [data-bonus]
//    - 출력: #r-gross / #r-net / #r-eff  +  #preInt / #postInt / #apy / #maturity / #rateLine
// ─────────────────────────────────────────
const elAmount = $('#amount');
const elRange  = $('#amountRange');
const elTerm   = $('#term');
const elTax    = $('#tax');

const state = {
  amount: 3_000_000,
  term: Number(elTerm.value),
  tax: Number(elTax.value),
  bonus: 0,
};

function parseMoney(v){ return Number(String(v).replace(/[^\d]/g,''))||0; }
function fmtWon(n){ return `${Math.round(n).toLocaleString('ko-KR')}원`; }

function gatherBonus(){
  const checks = $$('#benefitToggles input[type="checkbox"]');
  const sum = checks.filter(c=>c.checked).reduce((a,c)=> a + Number(c.dataset.bonus||0), 0);
  return clamp(sum, 0, maxBonusCap);
}

function updateOutputs({gross, net, effAnnual, rateEffPct, bonusSumPctp}){
  // 세트 1 (bp-result)
  $('#r-gross').textContent = fmtWon(gross);
  $('#r-net').textContent   = fmtWon(net);
  $('#r-eff').textContent   = asPct(effAnnual, 2);

  // 세트 2 (sim-outputs)
  $('#preInt').textContent = fmtWon(gross);
  $('#postInt').textContent= fmtWon(net);
  $('#apy').textContent = asPct(effAnnual, 2); // 0.00% 포맷 유지
  $('#maturity').textContent = fmtWon(state.amount + net);
  $('#rateLine').textContent =
    `적용 금리: ${rateEffPct.toFixed(2)}% · 우대 합산 +${bonusSumPctp.toFixed(0)}bp (최대 ${(maxBonusCap*100).toFixed(0)}bp)`;

  // 상단 우대/캡 뱃지
  $('#capBadges').innerHTML = `
    <span class="bp-badge">적용 금리: <b>${rateEffPct.toFixed(2)}%</b></span>
    <span class="bp-badge ${bonusSumPctp>0?'ok':''}">우대 합산: +${bonusSumPctp.toFixed(0)}bp (최대 ${(maxBonusCap*100).toFixed(0)}bp)</span>
  `;
}

function calc(){
  state.amount = parseMoney(elAmount.value);
  state.term   = Number(elTerm.value);
  state.tax    = Number(elTax.value);
  state.bonus  = gatherBonus();         // %p

  const rateEffPct = baseRatePct + state.bonus; // 최종 연이율(%)
  const r = rateEffPct / 100;                   // 소수
  let gross = 0;

  if (product.type === '적금'){
    const n = state.term;
    gross = state.amount * (r/12) * (n*(n+1)/2);         // 월적립 근사
  } else {
    gross = state.amount * r * (state.term/12);          // 거치식
  }

  const net       = gross * (1 - state.tax);
  const effAnnual = (product.type === '적금')
    ? ( (net / (state.amount * state.term)) * 12 * 100 )  // 연환산(%)
    : ( (net / state.amount) / (state.term/12) * 100 );

  updateOutputs({
    gross, net, effAnnual,
    rateEffPct,
    bonusSumPctp: state.bonus * 100   // bp
  });
}

// 입력 바인딩
function syncFromRange(e){
  elAmount.value = fmtMoney(Number(e.target.value));
  calc();
}
function syncFromInput(e){
  const v = parseMoney(e.target.value);
  elRange.value = v;
  e.target.value = fmtMoney(v);
  calc();
}
elRange.addEventListener('input', syncFromRange);
elAmount.addEventListener('input', syncFromInput);
[elTerm, elTax].forEach(el=> el.addEventListener('change', calc));
togglesWrap.addEventListener('change', calc);

// 초기값 세팅 + 계산
elAmount.value = fmtMoney(state.amount);
elRange.value  = state.amount;
calc();

// ─────────────────────────────────────────
// 5) 비슷한 상품 (현재 작동 안함)
// ─────────────────────────────────────────
/*const SIMILAR = PRODUCTS
  .filter(p => p.account_id !== product.account_id &&
               (p.type === product.type || p.category.split('/')[0] === product.category.split('/')[0]))
  .slice(0,6);

$('#similarWrap').innerHTML = SIMILAR.map(p=>`
  <article class="sp-card">
    <div class="sp-thumb" style="background:
      linear-gradient(135deg, rgba(167,139,250,.16), rgba(236,72,153,.12));"></div>
    <div class="sp-name">${p.name}</div>
    <div class="sp-cat">${p.category}</div>
    <div class="sp-cta">
      <span class="sp-rate">${p.interest.toFixed(2)}%</span>
      <a href="?id=${p.account_id}">자세히</a>
    </div>
  </article>
`).join('');
*/
// 가입 CTA
// 가입 CTA
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('applyBtn');
  if (!btn) return;

  btn.addEventListener('click', (e) => {
    const params = new URLSearchParams({
		productId: String(product.account_id)
	});

    // 1) #bpDetail data-id → 2) window.product → 3) ?id= 쿼리스트링


    // 서버가 /register/apply/{productId} 를 받는 경우
    location.href = `/register/apply?${params.toString()}`;

    // 만약 쿼리스트링으로 받는 컨트롤러라면 위 한 줄 대신 ↓ 사용
    // location.href = `/register/apply?productId=${encodeURIComponent(id)}`;
  });
});