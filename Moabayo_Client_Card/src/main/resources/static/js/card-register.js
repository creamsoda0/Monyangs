(function(){
  // Step navigation
  const steps = Array.from(document.querySelectorAll('.stepper .step'));
  const panels = ['step1','step2','step3'].map(id=>document.getElementById(id));
  const setStep = (n)=>{
    panels.forEach((p,i)=>p.classList.toggle('is-active', i===n-1));
    steps.forEach((s,i)=>s.classList.toggle('is-active', i===n-1));
    currentStep = n;
  };
  let currentStep = 1;

  // Buttons
  document.querySelectorAll('[data-next]').forEach(b=>b.addEventListener('click',()=>setStep(currentStep+1)));
  document.querySelectorAll('[data-prev]').forEach(b=>b.addEventListener('click',()=>setStep(currentStep-1)));

  // Preview updates
  const cardImg = document.getElementById('cardImg');
  const cardName = document.getElementById('cardName');
  const designSelect = document.getElementById('designSelect');
  const brandRadios = document.querySelectorAll('input[name="brand"]');

  designSelect?.addEventListener('change', (e)=>{
    cardImg.src = e.target.value;
    const name = e.target.options[e.target.selectedIndex].text;
    cardName.textContent = `Moa ${name}`;
  });

  // Bank select
  let selectedBank = '우리';
  const bankList = document.getElementById('bankList');
  bankList?.addEventListener('click', (e)=>{
    const b = e.target.closest('.bank'); if(!b) return;
    bankList.querySelectorAll('.bank').forEach(x=>x.classList.remove('is-selected'));
    b.classList.add('is-selected');
    selectedBank = b.dataset.bank;
  });

  // OTP simulation
  const phone = document.getElementById('phone');
  const otp = document.getElementById('otp');
  const otpMsg = document.getElementById('otpMsg');
  const linkBtn = document.getElementById('linkBtn');
  let sentCode = null;

  document.getElementById('sendOtp')?.addEventListener('click', ()=>{
    // demo: generate 6-digit code
    sentCode = (''+Math.floor(100000 + Math.random()*900000));
    otpMsg.textContent = `인증번호가 발송되었습니다. (데모: ${sentCode})`;
    otpMsg.className = 'msg';
    otp.focus();
  });

  otp?.addEventListener('input', ()=>{
    if(sentCode && otp.value.trim() === sentCode){
      otpMsg.textContent = '인증 완료';
      otpMsg.className = 'msg ok';
      linkBtn.disabled = false;
    }else{
      otpMsg.textContent = '';
      otpMsg.className = 'msg';
      linkBtn.disabled = true;
    }
  });

  // Link account
  const account = document.getElementById('account');
  let linkedAccount = null;
  linkBtn?.addEventListener('click', ()=>{
    const acc = (account.value || '').trim();
    if(!acc || acc.length < 7){
      otpMsg.textContent = '계좌번호를 확인해 주세요.';
      otpMsg.className = 'msg err';
      return;
    }
    linkedAccount = `${selectedBank} ${acc}`;
    // move to step3
    document.getElementById('sumAccount').textContent = linkedAccount;
    document.getElementById('sumCard').textContent = cardName.textContent;
    const brand = Array.from(brandRadios).find(r=>r.checked)?.value || 'VISA';
    document.getElementById('sumBrand').textContent = brand;
    setStep(3);
  });

  // Issue
  document.getElementById('issueBtn')?.addEventListener('click', ()=>{
    // 실제에선 서버에 발급 요청 → 성공 시 완료 표시/리다이렉트
    const done = document.getElementById('doneBox');
    done.hidden = false;
    done.scrollIntoView({behavior:'smooth', block:'center'});
  });

  // small tilt effect
  const stage = document.getElementById('cardStage');
  stage?.addEventListener('mousemove',(e)=>{
    const r = stage.getBoundingClientRect();
    const dx = (e.clientX - r.left)/r.width - .5;
    const dy = (e.clientY - r.top)/r.height - .5;
    stage.style.transform = `perspective(1200px) rotateX(${dy*-6}deg) rotateY(${dx*6}deg)`;
  });
  stage?.addEventListener('mouseleave',()=> stage.style.transform = 'perspective(1200px) rotateX(0) rotateY(0)');

  // init
  setStep(1);
})();
