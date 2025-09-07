// bpregister.js (요약 버전)

// 유틸
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const asPct = (n, dp=2)=> `${Number(n ?? 0).toFixed(dp)}%`;
const fmtMoney = n => `${Math.round(n).toLocaleString('ko-KR')}원`;
const clamp = (n,a,b)=> Math.max(a, Math.min(b,n));

function loadProductFromDataset(){
  const el = document.getElementById('bpDetail');
  if (!el) throw new Error('#bpDetail not found');
  return {
    account_id : Number(el.dataset.id),
    name       : el.dataset.name || '',
    img        : el.dataset.img  || '',
    description: el.dataset.desc || '',
    category   : el.dataset.category || '',
    benefits   : el.dataset.benefits || '',
    interest   : Number(el.dataset.rate || 0),
    type       : el.dataset.type || ''
  };
}

// (선택) 사용자 계좌 API – 엔드포인트는 프로젝트에 맞게 교체
async function loadUserAccounts(){
  try {
    const res = await fetch('/api/accounts', { headers: { 'Accept':'application/json' } });
    if (res.ok) return await res.json();
  } catch(e){ console.warn('[apply] loadUserAccounts 실패', e); }
  return [];
}

document.addEventListener('DOMContentLoaded', async () => {
  // ① 상품/전역
  const product = loadProductFromDataset();
  window.product = product;

  // ② 금리 파생값
  const BONUS_MAP = new Map([['급여이체',0.20], ['자동이체',0.10], ['앱 로그인',0.05]]);
  const allBenefits = (product.benefits||'').split(',').map(s=>s.trim()).filter(Boolean);
  const posBonusSum = allBenefits.map(b=>BONUS_MAP.get(b)||0).filter(v=>v>0).reduce((a,b)=>a+b,0);
  const MAX = product.interest;
  const BASE = clamp(MAX - posBonusSum, 0, MAX);
  const BONUS_CAP = MAX - BASE;
  const fit = 0.82;

  // ③ 좌측 요약
  $('#prodChips').innerHTML = `
    <span class="badge">${product.type || '-'}</span>
    <span class="badge">${product.category || '-'}</span>
  `;
  $('#prodName').textContent = product.name || '-';
  $('#prodDesc').textContent = product.description || '-';
  $('#baseRate').textContent = asPct(BASE);
  $('#maxRate').textContent  = asPct(MAX);
  const ring = $('#fitRing');
  if (ring) {
    ring.style.setProperty('--val', fit);
    $('#fitPct').textContent = Math.round(fit*100)+'%';
  }

  // ④ 계정 드롭다운
  const accts = await loadUserAccounts();
  const fundingSel = $('#funding');
  if (fundingSel) {
    fundingSel.innerHTML = accts.length
      ? accts.map(a=>`<option value="${a.user_account_id}">${a.account_name} · ${a.account_number} · 잔액 ${Number(a.balance).toLocaleString()}원</option>`).join('')
      : `<option disabled selected>연결된 계좌가 없습니다</option>`;
  }

  // ⑤ 예금/적금 분기
  const isSaving = product.type === '적금';
  $('#savingExtra').style.display = isSaving ? '' : 'none';
  $('#amountLabel').textContent   = isSaving ? '월 납입액' : '예치 금액';

  // ⑥ 입력 초기화
  const elAmt  = $('#amount'), elRange = $('#amountRange'), elTerm = $('#term'), elTax = $('#tax');
  const initVal = isSaving ? 300_000 : 3_000_000;
  if (elAmt)  elAmt.value  = initVal.toLocaleString();
  if (elRange) elRange.value = initVal;

  // ⑦ 우대 토글
  const bonusWrap = $('#bonusWrap');
  const positive = allBenefits.filter(b => (BONUS_MAP.get(b) || 0) > 0);
  if (bonusWrap){
    bonusWrap.innerHTML = positive.length
      ? positive.map(b=>`<label class="badge"><input type="checkbox" data-bonus="${BONUS_MAP.get(b)}"> ${b} (+${BONUS_MAP.get(b).toFixed(2)}%p)</label>`).join('')
      : ($('#noBonusHint').style.display = '', '');
  }

  // ⑧ 계산/바인딩
  function getAmount(){ return +(elAmt.value.replace(/[^\d]/g,''))||0; }
  function gatherBonus(){
    const sum = [...document.querySelectorAll('#bonusWrap input[type="checkbox"]:checked')]
      .reduce((s,el)=> s + (+el.dataset.bonus||0), 0);
    return clamp(sum, 0, BONUS_CAP);
  }
  function calc(){
    const P = getAmount(), m = +elTerm.value, tax = +elTax.value, bonus = gatherBonus();
    const ratePct = BASE + bonus, r = ratePct/100;
    let gross = isSaving ? P * (r/12) * (m*(m+1)/2) : P * r * (m/12);
    const net = gross * (1 - tax);
    const total = isSaving ? (P*m + net) : (P + net);
    $('#appliedRate').textContent = asPct(ratePct,2);
    $('#preInt').textContent = fmtMoney(gross);
    $('#postInt').textContent = fmtMoney(net);
    $('#maturity').textContent = fmtMoney(total);
    $('#appliedLine').textContent =
      `적용 금리: ${asPct(ratePct,2)} · 우대 합산 +${bonus.toFixed(2)}%p (최대 ${BONUS_CAP.toFixed(2)}%p)`;
    $('#sumAmount').textContent = (isSaving?'월 납입액: ':'예치금: ') + fmtMoney(P);
    $('#sumTerm').textContent   = m+'개월';
    $('#sumRate').textContent   = asPct(ratePct,2);
  }
  function syncAmount(e){
    if (e?.target===elRange) elAmt.value = (+elRange.value).toLocaleString();
    else if (e?.target===elAmt){ const v = getAmount(); elRange.value = v; elAmt.value = v.toLocaleString(); }
    calc();
  }
  elRange?.addEventListener('input', syncAmount);
  elAmt?.addEventListener('input', syncAmount);
  elTerm?.addEventListener('change', calc);
  elTax?.addEventListener('change', calc);
  bonusWrap?.addEventListener('change', calc);
  calc();

  // ⑨ 스텝 이동
  let step = 1;
  const goto = n=>{
    step = n;
    document.querySelectorAll('.section').forEach(s=>s.classList.toggle('is-on', +s.dataset.step===step));
    document.querySelectorAll('#stepper .step').forEach((s,i)=>s.classList.toggle('is-on', i===step-1));
    if(step===4){
      const fSel = $('#funding');
      $('#sumFunding').textContent = fSel?.options[fSel.selectedIndex]?.textContent || '-';
    }
  };
  $('#next1')?.addEventListener('click', ()=>goto(2));
  $('#prev2')?.addEventListener('click', ()=>goto(1));
  $('#next2')?.addEventListener('click', ()=>goto(3));
  $('#prev3')?.addEventListener('click', ()=>goto(2));
  $('#next3')?.addEventListener('click', ()=>{
    if(!$('#consent1')?.checked || !$('#consent2')?.checked){ alert('필수 약관에 동의해 주세요.'); return; }
    goto(4);
  });
  $('#prev4')?.addEventListener('click', ()=>goto(3));

  // ⑩ 제출(예시)
  $('#submitBtn')?.addEventListener('click', async()=>{
	const isSaving = (window.product?.type === '적금');
	const payload = {
	  product_id: window.product.account_id,
	  product_type: window.product.type,
	  funding_user_account_id: +$('#funding').value,
	  open_new_account: $('#openNew').value, // "yes"|"no"
	  amount: +$('#amount').value.replace(/[^\d]/g,''),
	  term_months: +$('#term').value,
	  tax_rate: +$('#tax').value,
	  autopay_day: isSaving ? $('#autopayDay').value : null,
	  maturity_option: $('#maturityOp').value || null,
	  selected_bonuses: [...document.querySelectorAll('#bonusWrap input:checked')]
	    .map((el,i)=>({ label: el.parentElement.textContent.trim(), bp:+el.dataset.bonus, idx:i })),
	  consents: { terms:$('#consent1').checked, privacy:$('#consent2').checked, marketing:$('#consent3').checked }
	};

	const f = document.getElementById('applyForm');
	f.innerHTML = '';  // reset

	// 단일 필드
	const put = (name,val)=>{ const i=document.createElement('input'); i.type='hidden'; i.name=name; i.value=(val??''); f.appendChild(i); };
	put('product_id', payload.product_id);
	put('product_type', payload.product_type);
	// #funding 에서 NaN 이슈 있어서 아래와 같이 바꿈.
	// 안전하게 값 읽기
	const fundingEl = document.getElementById('funding');
	const fundingVal = (fundingEl && /^\d+$/.test(fundingEl.value)) 
	  ? Number(fundingEl.value) 
	  : null;

	// 히든 폼에 넣을 때도 "유효할 때만" 추가
	if (Number.isFinite(fundingVal)) {
	  put('funding_user_account_id', String(fundingVal));
	}
	// 유효하지 않으면 필드를 아예 추가하지 않으면 Spring이 null로 바인딩해요.
	put('open_new_account', payload.open_new_account);
	put('amount', payload.amount);
	put('term_months', payload.term_months);
	put('tax_rate', payload.tax_rate);
	if (payload.autopay_day)    put('autopay_day', payload.autopay_day);
	if (payload.maturity_option)put('maturity_option', payload.maturity_option);

	// nested: selected_bonuses[i].label / .bp
	payload.selected_bonuses.forEach(b=>{
	  put(`selected_bonuses[${b.idx}].label`, b.label);
	  put(`selected_bonuses[${b.idx}].bp`,    b.bp);
	});

	// nested: consents.terms / .privacy / .marketing
	put('consents.terms',     payload.consents.terms);
	put('consents.privacy',   payload.consents.privacy);
	put('consents.marketing', payload.consents.marketing);

	f.submit();
    // await fetch('/api/apply',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    alert('가입 신청이 접수되었습니다! (콘솔에서 payload 확인)');
  });
});
