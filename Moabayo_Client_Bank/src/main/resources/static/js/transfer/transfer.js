(function(){
  const root = document.getElementById('transfer');
  if(!root) return;

  // ---------- helpers ----------
  const $ = (sel, p=document) => p.querySelector(sel);
  const $$ = (sel, p=document) => Array.from(p.querySelectorAll(sel));
  const onlyDigits = s => (s||'').replace(/[^0-9]/g,'');
  const formatKRW = n => new Intl.NumberFormat('ko-KR').format(n) + '원';
  const PW_MIN_LEN = 8; // 로그인/가입 비밀번호 기준(필요 시 프로젝트 규칙에 맞게 조정)

  // ---------- elements ----------
  const toName = $('#toName');
  const fromAccount = $('#fromAccount');
  const amount = $('#amount');
  const btnSend = $('#btnSend');
  const btnCancel = $('#btnCancel');
  const progress = $('#tfProgress');
  const sendName = $('#sendName');
  const sendAmt = $('#sendAmt');
  const done = $('#tfDone');
  const snd = $('#sndSuccess');
  const doneName = $('#doneName');
  const doneAmt = $('#doneAmt');
  const fail = $('#tfFail');
  const failReason = $('#errorReason')

  // password modal
  const pwModal = $('#pwModal');
  const accountPw = $('#accountPw');
  const btnPwOK = $('#btnPwOK');
  const btnPwCancel = $('#btnPwCancel');
  const btnTogglePw = $('#btnTogglePw');
  const pwError = $('#pwError');

  // ---------- form behaviors ----------
  $$('.quick button').forEach(btn => {
    btn.addEventListener('click', () => {
      const delta = +btn.dataset.amt;
      const cur = +(onlyDigits(amount.value) || 0);
      const next = Math.max(0, cur + delta);
      amount.value = next === 0 ? '' : next.toLocaleString('ko-KR');
      validate();
    });
  });

  amount.addEventListener('input', () => {
    const raw = onlyDigits(amount.value);
    amount.value = raw ? Number(raw).toLocaleString('ko-KR') : '';
    validate();
  });
  toName.addEventListener('input', validate);
  fromAccount.addEventListener('change', validate);

  function validate(){
    const nameOk = toName.value.trim().length >= 1;
    const accOk  = !!fromAccount.value;
    const amt    = +(onlyDigits(amount.value) || 0);
    const amtOk  = amt > 0;
    btnSend.disabled = !(nameOk && accOk && amtOk);
  }
  validate();

  // cancel
  btnCancel.addEventListener('click', () => {
    if (document.referrer) history.back();
    else window.location.href = '/';
  });

  // ---------- send flow with password ----------
  let attempts = 0;
  const MAX_ATTEMPTS = 5;

  btnSend.addEventListener('click', async (e) => {
	e.preventDefault();           // ✅ 기본 제출 막기 (혹시 모를 submit 방지)
	if(await getUserByAccNum(toName.value)) {
		console.log("toName: " + sessionStorage.getItem("toName"));
		
		// UI: 성공 → 버튼 다시 활성화
		if (btnSend) btnSend.disabled = false;
	} else {
		return;
	} // 조회된 계좌가 있는지 확인
    if (done.classList.contains('show')) return; // 이미 완료 상태면 무시
    openPwModal();
  });

  function openPwModal(){
    pwError.hidden = true;
    accountPw.classList.remove('invalid','shake');
    accountPw.value = '';
    btnPwOK.disabled = true;
	
	// 패스워드 확인 창에 상대방 이름과 송금액 붙이기
	const amt = +(onlyDigits(amount.value) || 0);
	const sessionSendName = sessionStorage.getItem('toName');
	
	sendName.textContent = sessionSendName  + ' ('+ toName.value.trim() + ')' || '상대방';
	sendAmt.textContent = formatKRW(amt);

    pwModal.classList.add('show');
    pwModal.setAttribute('aria-hidden','false');
    setTimeout(()=> accountPw.focus(), 0);
  }

  function closePwModal(){
	sessionStorage.removeItem("toName");
    pwModal.classList.remove('show');
    pwModal.setAttribute('aria-hidden','true');
  }

  // 비밀번호 입력 이벤트 (길이 기준으로만 1차 체크)
  accountPw.addEventListener('input', () => {
    btnPwOK.disabled = accountPw.value.length < PW_MIN_LEN;
    if (!btnPwOK.disabled) pwError.hidden = true;
  });

  // 엔터로 확인
  accountPw.addEventListener('keydown', (e) => {
    if(e.key === 'Enter' && !btnPwOK.disabled){
      e.preventDefault();
      btnPwOK.click();
    }
  });

  // 보기/가리기
  btnTogglePw.addEventListener('click', () => {
    const t = accountPw.getAttribute('type') === 'password' ? 'text' : 'password';
    accountPw.setAttribute('type', t);
  });

  btnPwCancel.addEventListener('click', () => closePwModal());

  btnPwOK.addEventListener('click', async () => {
    btnPwOK.disabled = true;

    try{
      const ok = await verifyPassword(accountPw.value);
      if(!ok){
        attempts++;
        accountPw.classList.add('invalid','shake');
        pwError.textContent = `비밀번호가 올바르지 않습니다. (${attempts}/${MAX_ATTEMPTS})`;
        pwError.hidden = false;
        setTimeout(()=> accountPw.classList.remove('shake'), 350);

        if(attempts >= MAX_ATTEMPTS){
          pwError.textContent = '시도 횟수를 초과했습니다. 잠시 후 다시 시도해 주세요.';
          return; // 더 진행 금지
        }
        btnPwOK.disabled = false;
        accountPw.focus();
        return;
      }
    }catch(e){
      console.error(e);
      pwError.textContent = '인증 서버와 통신에 실패했습니다. 네트워크를 확인해 주세요.';
      pwError.hidden = false;
      btnPwOK.disabled = false;
      return;
    }

    // 인증 성공 → 송금 진행
    closePwModal();
    await doTransfer();
  });

  // 실제 송금 로직
  async function doTransfer(){
	btnSend.disabled = true;
	progress.classList.add('show');

	const toAccountNumber = toName.value.trim();
	const fromAccountNumber = 
	(fromAccount.selectedOptions?.[0] || fromAccount.options[fromAccount.selectedIndex]).dataset.number;
	console.log(fromAccountNumber);
	const amt = +(onlyDigits(amount.value) || 0);
	const memo = (document.getElementById('memo')?.value || '').trim();

	const fd = new FormData();
	fd.append('toAccountNumber', toAccountNumber);
	fd.append('fromAccountNumber', fromAccountNumber);
	fd.append('sendAmount', amt);
	fd.append('memo', memo);
	
	try {
	  const res = await fetch("/bank/api/transfer", { // ⬅️ 출처표시 쿼리
	    method: "POST",
	    credentials: "include",
	    body: fd       // ⬅️ 숫자 amt가 들어가야 정상
	  });

	  const raw = await res.text();
	  console.log("[transfer] status:", res.status, "raw:", raw);

	  // 응답 처리
	  const data = await res.json().catch(() => ({}));

	  if (res.ok) {
	    // 성공 UI (필요한 데이터만 사용)
	    if (data.toName) {
	      // 성공 화면에 이름/금액 넣고 싶다면
	      const doneName = document.getElementById("doneName");
	      const doneAmt  = document.getElementById("doneAmt");
	      if (doneName) doneName.textContent = data.toName;
	      if (doneAmt)  doneAmt.textContent  = `${amount.toLocaleString()}원`;
	    }
	    showSuccess(); // 3초 후 history로 이동하는 기존 로직 사용
	  } else {
	    showFail(data.message || "송금 처리 중 오류가 발생했습니다.");
	  }
	} catch (e) {
	  console.error(e);
	  showFail("네트워크 오류가 발생했습니다.");
	} finally {
	  // 실패 시에만 버튼을 다시 열고 싶다면 여기서 분기해도 됨
	  btnSend.disabled = false;
	  progress.classList.remove("show");
	}
  }
  
  function showSuccess() {
	// 진행 애니메이션 숨기기
	progress.classList.remove('show');
	fail.classList.remove('show');
	
	// 성공 메시지에 데이터 넣고 보여주기
	const amt = +(onlyDigits(amount.value) || 0);
	doneName.textContent = toName.value.trim() || '상대방';
	doneAmt.textContent = formatKRW(amt);
	done.classList.add('show');

	// ? 아마 빵빠레 실행용 코드 같음. try-catch 로 묶여있고 play() 함수를 사용하는걸 봐서는...
	try{ snd && snd.play && snd.play().catch(()=>{}); }catch(e){}

	// 3초뒤 거래내역 페이지로 이동
	setTimeout(() => { window.location.href = '/bank/history'; }, 3000);
  }
  
  function showFail(reason){
    // 진행 애니메이션 숨기기
    progress.classList.remove('show');
    done.classList.remove('show');

    // 실패 메시지 지정
    failReason.textContent = reason || '송금에 실패했습니다.';

    // 실패 화면 보이기
    fail.classList.add('show');

    // 3초 뒤 인덱스로 이동
	setTimeout(() => { window.location.href = '/bank/index'; }, 3000);
  }

  /**
   * 🔐 계정 비밀번호 서버 검증
   * Spring 기준 예시: POST /api/auth/verify-password
   * body: { password:"..." }  →  { ok:true } / { ok:false }
   */
  async function verifyPassword(password){
    // CSRF 토큰 사용(있을 경우)
    const csrf = document.querySelector('meta[name="_csrf"]')?.content;
    const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.content;
    if (csrf && csrfHeader) headers[csrfHeader] = csrf;

	console.log("입력한 패스워드: ", password);
	const fd1 = new FormData();
	fd1.append('password', password);
	
    // 실제 API로 교체하세요.
    const res = await fetch('/bank/pwcheck', {
       method:'POST', 
	   credentials: 'include',
	   body: fd1
    });
	console.log("fetch 완료 결과 res: ", res);
    if(!res.ok) throw new Error('verify failed');
    const data = await res.json();
    return !!data.ok;

    // 데모: "moa1234!"만 성공
    // await new Promise(r => setTimeout(r, 250));
    // return password === 'moa1234!';
  }
})();


// 송금을 받을 유저를 계좌번호로 가져와서 세션 저장
// 계좌번호는 Unique 라서 한명 확정
// 만약 없다면 버튼을 잠그고 "계좌에 해당하는 사람이 없습니다" 출력
async function getUserByAccNum(accountNum) {
  const btnSend = document.getElementById("btnSend");

  // UI: 먼저 전송버튼 잠깐 막아두기(중복요청 방지)
  if (btnSend) btnSend.disabled = true;

  try {
    // ✅ 백엔드 컨트롤러: @GetMapping("/api/user") / @RequestParam String query
    const url = `/bank/api/user?${new URLSearchParams({ query: accountNum }).toString()}`;

    const res = await fetch(url, {
      method: "GET",
      // 세션 쿠키 쓰는 경우 포함 (필요 없으면 지워도 됨)
      credentials: "include",
      headers: {
        "Accept": "application/json"
      }
    });

    if (!res.ok) {
      throw new Error(`서버 오류: ${res.status}`);
    }

    // ✅ null/빈 본문 대비 (Controller가 null 반환 시 "null" 문자열이 올 수 있음)
    const raw = await res.text();                    // 본문을 일단 텍스트로
    const data = raw ? JSON.parse(raw) : null;       // 있으면 JSON 파싱, 없으면 null

    if (data && typeof data.name === "string" && data.name.trim()) {
      // ✅ 세션 저장
      sessionStorage.setItem("toName", data.name.trim());
      console.log("[getUserByAccNum] 세션 저장 성공:", data.name.trim());
	  console.log("[getUserByAccNum] data 는 이렇게 생겼습니다: ", data)
      return data;
    } else {
      // ✅ 사용자 없음
      alert("계좌에 해당하는 사람이 없습니다");
      // 버튼은 잠금 유지
      return null;
    }
  } catch (err) {
    console.error("[getUserByAccNum] 오류:", err);
    alert("사용자 조회 중 오류가 발생했습니다.");
    // 버튼은 잠금 유지
    return null;
  }
}

(function maskAccountNumbers() {
    const sel = document.getElementById('fromAccount');
    [...sel.options].forEach(opt => {
      if (!opt.value) return;
      const parts = opt.text.split(' • ');
      if (parts.length < 2) return;
      const name = parts[0];
      const num  = parts[1].replace(/\s/g,''); // 공백 제거
      // 단순 마스킹: 마지막 4자리만 남김
      const last4 = num.slice(-4);
      const masked = '****-****-' + last4;
      opt.text = `${name} • ${masked}`;
    });
  })();

