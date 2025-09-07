(() => {
  const form = document.getElementById('chargeForm');
  const amountInput = document.getElementById('amount');
  const amountErr = document.getElementById('amount-error');
  const sumAmount = document.getElementById('sum-amount');
  const sumBalance = document.getElementById('sum-balance');
  const payBtn = document.getElementById('payBtn');
  const agree1 = document.getElementById('agree1');
  const agree2 = document.getElementById('agree2');

  const LIMIT_ONCE = 1_000_000; // 1회 한도
  const currentBalance = parseKRW(sumBalance?.textContent || '0');

  // 유틸
  function parseKRW(v){ return Number(String(v).replace(/[^\d]/g,'')) || 0; }
  function fmtKRW(n){ return (n || 0).toLocaleString('ko-KR') + '원'; }
  function getAmount(){ return parseKRW(amountInput.value); }
  function setAmount(n){
    amountInput.value = n ? n.toLocaleString('ko-KR') : '';
    updateSummary();
  }

  // 검증
  function validate(){
    const n = getAmount();
    let ok = true, msg = '';
    if (!n || n <= 0){ ok = false; msg = '금액을 입력하세요.'; }
    else if (n > LIMIT_ONCE){ ok = false; msg = '1회 최대 1,000,000원을 초과했습니다.'; }
    amountErr.textContent = msg;
    amountErr.hidden = ok;
    amountInput.classList.toggle('is-error', !ok);
    return ok;
  }

  // 요약/버튼 상태
  function updateSummary(){
    const n = getAmount();
    sumAmount.textContent = fmtKRW(n);
    sumBalance.textContent = fmtKRW(currentBalance + (n||0));
    const ready = validate() && agree1.checked && agree2.checked;
    payBtn.classList.toggle('enabled', ready);
    payBtn.disabled = !ready;
  }

  // 숫자 입력 + 커서 유지
  amountInput.addEventListener('input', () => {
    const end = amountInput.selectionEnd ?? amountInput.value.length;
    const before = amountInput.value.length;
    const n = parseKRW(amountInput.value);
    amountInput.value = n ? n.toLocaleString('ko-KR') : '';
    const after = amountInput.value.length;
    const pos = Math.max(0, end + (after - before));
    amountInput.setSelectionRange(pos, pos);
    updateSummary();
  });

  // 칩
  document.querySelectorAll('.chip').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.all){
        // 전액: 데모값 (원하면 서버에서 한도/잔액으로 바꾸면 됨)
        setAmount(LIMIT_ONCE);
      } else {
        const base = getAmount();
        setAmount(base + Number(btn.dataset.amount || 0));
      }
    });
  });

  // 동의 체크
  [agree1, agree2].forEach(el => el.addEventListener('change', updateSummary));

  // 제출: 숫자만 서버로
  form.addEventListener('submit', (e) => {
    if (payBtn.disabled){ e.preventDefault(); return; }
    const n = getAmount();
    amountInput.value = String(n);  // 서버에는 콤마 없는 숫자 전송
    payBtn.classList.add('loading');
  });

  // 초기화
  updateSummary();
})();
