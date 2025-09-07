// === register.bundle.js ===
document.addEventListener('DOMContentLoaded', () => {
  // ---- 엘리먼트 참조 ----
  const signupForm = document.getElementById('signupForm');
  const loginIdInput = document.getElementById('loginId');
  const checkUserIdBtn = document.getElementById('checkUserIdBtn');
  const userIdCheckMessage = document.getElementById('idCheckMsg'); // fallback
  const signupBtn = signupForm?.querySelector('button[type="submit"]');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const passwordMatchMsg = document.getElementById('passwordMatchMsg');
  const passwordMismatchMsg = document.getElementById('passwordMismatchMsg');

  // ---- 설정 ----
  const MIN_ID_LEN = 4;
  // 같은 오리진이면 상대경로 유지, 다른 포트/도메인이면 절대경로로 교체하고 CORS 허용 필요
  const CHECK_URL = '/registration/checkId';

  // ---- 상태 ----
  let isUserIdAvailable = false;
  let typingTimer = null;

  // ---- 유틸 ----
  const setIdMsg = (text, color) => {
//    if (!userIdCheckMessage) return;
	console.log("text: ", text, ", color: ", color);
    userIdCheckMessage.textContent = text;
    userIdCheckMessage.className = `small ${color ? `text-${color}` : ''}`.trim();
    // Bootstrap 유효/무효 표시
    if (loginIdInput) {
      if (color === 'success') {
        loginIdInput.classList.add('is-valid');
        loginIdInput.classList.remove('is-invalid');
      } else if (color === 'danger' || color === 'warning') {
        loginIdInput.classList.add('is-invalid');
        loginIdInput.classList.remove('is-valid');
      } else {
        loginIdInput.classList.remove('is-valid', 'is-invalid');
      }
    }
  };

  const setSubmitEnabled = () => {
    if (!signupForm || !signupBtn) return;
    const formValid = signupForm.checkValidity();
    signupBtn.disabled = !(formValid && isUserIdAvailable);
  };

  const validatePasswordMatch = () => {
    if (!passwordInput || !confirmPasswordInput) return;
    const pw = passwordInput.value;
    const pw2 = confirmPasswordInput.value;

    if (!pw || !pw2) {
      try { confirmPasswordInput.setCustomValidity('비밀번호를 입력하라냥'); } catch {}
      if (passwordMatchMsg) passwordMatchMsg.style.display = 'none';
      if (passwordMismatchMsg) passwordMismatchMsg.style.display = 'none';
      return;
    }
    if (pw === pw2) {
      try { confirmPasswordInput.setCustomValidity(''); } catch {}
      if (passwordMatchMsg) passwordMatchMsg.style.display = 'block';
      if (passwordMismatchMsg) passwordMismatchMsg.style.display = 'none';
    } else {
      try { confirmPasswordInput.setCustomValidity('비밀번호가 일치하지 않습니다'); } catch {}
      if (passwordMatchMsg) passwordMatchMsg.style.display = 'none';
      if (passwordMismatchMsg) passwordMismatchMsg.style.display = 'block';
    }
  };

  // ---- 아이디 중복 검사 ----
  const checkDuplicate = async () => {
    const id = (loginIdInput?.value || '').trim();
	console.log("입력된 id: ", id)
    if (id.length < MIN_ID_LEN) {
      isUserIdAvailable = false;
      setIdMsg('4자 이상 입력하세요.', 'secondary');
      setSubmitEnabled();
      return;
    }

    try {
      // 버튼 잠깐 비활성화(연속 클릭 방지)
      checkUserIdBtn && (checkUserIdBtn.disabled = true);

      const url = `${CHECK_URL}?loginId=${encodeURIComponent(id)}`;
      const res = await fetch(url, { method: 'GET', headers: { 'Accept': 'text/plain' } });
		console.log("url: ", url);
		console.log("res: ", res);
      if (!res.ok) {
        isUserIdAvailable = false;
        setIdMsg('서버 오류 발생', 'warning');
        setSubmitEnabled();
        return;
      }

      const text = (await res.text()).trim().toLowerCase(); // "duplicate" | "ok" | "true"/"false"
      const dup = (text === 'duplicate' || text === 'true');

      if (dup) {
        isUserIdAvailable = false;
        setIdMsg('이미 사용 중인 아이디입니다.', 'danger');
      } else {
        isUserIdAvailable = true;
        setIdMsg('사용 가능한 아이디입니다.', 'success');
      }
    } catch (e) {
      console.error(e);
      isUserIdAvailable = false;
      setIdMsg('통신 실패', 'warning');
    } finally {
      checkUserIdBtn && (checkUserIdBtn.disabled = false);
      setSubmitEnabled();
    }
  };

  // ---- 이벤트 바인딩 ----
  if (loginIdInput) {
    // 입력 중엔 가짜 상태로 (중복 체크 아직 X)
    loginIdInput.addEventListener('input', () => {
      isUserIdAvailable = false; // 아이디 변경 시 다시 확인 필요
      // 메시지 리셋/가이드
      const len = loginIdInput.value.trim().length;
      if (len === 0) {
        setIdMsg('아이디를 입력하라냥...', 'danger');
      } else if (len < MIN_ID_LEN) {
        setIdMsg('4자 이상 입력하세요.', 'secondary');
      } else {
        setIdMsg('중복 확인 중...', 'secondary');
      }

      clearTimeout(typingTimer);
      // 300ms 디바운스 자동 체크
      typingTimer = setTimeout(checkDuplicate, 300);
      setSubmitEnabled();
    });
  }

  checkUserIdBtn?.addEventListener('click', (e) => {
    e.preventDefault();
	console.log("아이디 중복 확인 버튼 클릭됨.")
    checkDuplicate();
	console.log("아이디 중복 확인 완료.")
  });

  confirmPasswordInput?.addEventListener('input', () => {
    validatePasswordMatch();
    setSubmitEnabled();
  });
  passwordInput?.addEventListener('input', () => {
    validatePasswordMatch();
    setSubmitEnabled();
  });

  // 모든 input에 validity 변화 감지 (HTML5 required/패턴 등)
  signupForm?.querySelectorAll('input').forEach((input) => {
    input.addEventListener('input', setSubmitEnabled);
  });

  // 초기 상태
  validatePasswordMatch();
  setSubmitEnabled();
  if (signupBtn) signupBtn.disabled = true;

  // ---- 다음(카카오) 주소 검색 ----
  const searchAddressBtn = document.getElementById('searchAddress');
  if (searchAddressBtn && window.daum && window.daum.Postcode) {
    searchAddressBtn.addEventListener('click', function () {
      new daum.Postcode({
        oncomplete: function (data) {
          document.getElementById('zipCode')?.setAttribute('value', data.zonecode);
          document.getElementById('address')?.setAttribute('value', data.roadAddress || data.address);
          document.getElementById('addressDetail')?.focus();
        }
      }).open();
    });
  }
});

// === 달력(생년월일) ===
document.addEventListener('DOMContentLoaded', function () {
  if (window.flatpickr) {
    flatpickr('#birthDate', {
      locale: 'ko',
      dateFormat: 'Y-m-d',
      maxDate: 'today',       // 오늘 이후 선택 불가
      allowInput: true,       // 직접 타이핑 허용
      disableMobile: false    // 모바일에서도 위젯 사용
    });
  }

  // (선택) 부트스트랩 floating label과 궁합: 값 있으면 label이 떠 있게
  const bd = document.getElementById('birthDate');
  if (bd) {
    const toggleFilled = () => bd.classList.toggle('is-filled', !!bd.value);
    bd.addEventListener('change', toggleFilled);
    bd.addEventListener('input', toggleFilled);
    toggleFilled();
  }
});

// 값이 있으면 라벨이 올라가도록 class 부여 (자동완성/초기값 대응)
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.form-floating > .form-control').forEach(el => {
    const sync = () => el.classList.toggle('is-filled', !!el.value);
    ['input','change'].forEach(ev => el.addEventListener(ev, sync));
    setTimeout(sync, 50); // 자동완성/초기값 반영
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const radios = document.querySelectorAll('.nx-segment .seg-radio');
  const sync = () => {
    radios.forEach(r => {
      const label = document.querySelector(`label[for="${r.id}"]`);
      if (label) label.setAttribute('aria-pressed', r.checked ? 'true' : 'false');
    });
  };
  radios.forEach(r => r.addEventListener('change', sync));
  sync();
});

