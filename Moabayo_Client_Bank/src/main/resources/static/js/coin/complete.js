// static/js/coin/complete.js
(() => {
  const root = document.querySelector('.ny-complete');
  if (!root) return;

  const status = root.dataset.status || 'success';
  const card   = root.querySelector('.c-card');
  const conf   = card?.querySelector('.confetti');

  // 성공 시 간단한 컨페티
  if (status === 'success' && conf) {
    // 24조각 정도
    const pieces = 24;
    for (let i = 0; i < pieces; i++) {
      const s = document.createElement('span');
      // 위치/지연/좌우드리프트 랜덤
      const left = 8 + Math.random() * 84;        // %
      const delay = (Math.random() * 500) | 0;    // ms
      const drift = (Math.random() * 18 - 9) | 0; // -9 ~ 9deg
      s.style.left = `${left}%`;
      s.style.animationDelay = `${delay}ms`;
      s.style.transform = `translateY(-14px) rotate(${drift}deg)`;
      conf.appendChild(s);
    }
    // 2.4초 뒤 정리
    setTimeout(() => conf.innerHTML = '', 2400);
  }

  // 실패/취소 시에는 약한 진동 느낌(접근성 고려해 최소화)
  if ((status === 'fail' || status === 'cancel') && card) {
    card.style.transition = 'transform .15s ease';
    card.animate?.(
      [
        { transform: 'translateX(0)' },
        { transform: 'translateX(-3px)' },
        { transform: 'translateX(0)' },
        { transform: 'translateX(3px)' },
        { transform: 'translateX(0)' }
      ],
      { duration: 300, easing: 'ease-out' }
    );
  }
})();
