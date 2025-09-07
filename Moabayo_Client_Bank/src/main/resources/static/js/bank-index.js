// 다크모드 유지(공용 토글과 호환)
(() => {
  const saved = localStorage.getItem('theme');
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
    if (saved === 'dark') document.body.classList.add('dark');
  }
})();

// 잔액 숫자 애니메이션 (있을 때만)
(() => {
  const el = document.querySelector('.bank-index .balance');
  if (!el) return;
  const raw = el.getAttribute('data-balance');
  const target = raw ? parseInt(raw, 10) : NaN;
  if (isNaN(target)) return;

  const start = performance.now();
  const dur = 900;
  const fmt = n => n.toLocaleString('ko-KR');

  function step(t) {
    const p = Math.min(1, (t - start)/dur);
    const eased = 1 - Math.pow(1 - p, 3);
    const val = Math.floor(target * eased);
    el.textContent = `${fmt(val)} 원`;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
})();

// 요소가 화면에 들어오면 살짝 페이드-업
const io = new IntersectionObserver((es)=>es.forEach(e=>{
  if(e.isIntersecting){ e.target.classList.add('is-visible'); }
}), {threshold: .15});
document.querySelectorAll('[data-reveal]').forEach(el=>{
  el.style.opacity = .0; el.style.transform = 'translateY(12px)';
  io.observe(el);
});
// 가시화 스타일(인라인로직 최소화)
const style = document.createElement('style');
style.textContent = `
  [data-reveal].is-visible{ opacity:1 !important; transform:none !important; transition:.5s ease; }
`;
document.head.appendChild(style);

// bank-index.js
(() => {
  const io = new IntersectionObserver(es => es.forEach(e=>{
    if(e.isIntersecting){ e.target.classList.add('is-visible'); io.unobserve(e.target); }
  }), {threshold:.15});
  document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
})();