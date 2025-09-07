// === card-reco.js (정리/수정본) =====================================

// 색상 토큰
function cssVar(n){ return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
const COL = { brand: cssVar('--brand') || '#7c3aed', ink: cssVar('--ink') || '#111827', sub: cssVar('--sub') || '#6b7280' };

// D-day
function startDday(days, elId){
  const el = document.getElementById(elId);
  if(!el) return;
  const end = Date.now() + days*864e5;
  (function tick(){
    const left = Math.max(0, end - Date.now());
    el.textContent = `D-${Math.ceil(left/864e5)}`;
    if(left > 0) requestAnimationFrame(tick);
  })();
}

// 공통 미니 차트 옵션
function miniOpts({ showXTicks=false } = {}){
  return {
    plugins:{ legend:{display:false}, tooltip:{enabled:false} },
    responsive:true, maintainAspectRatio:false,
    layout:{ padding:{ top:8, right:8, bottom: showXTicks ? 22 : 12, left:8 } },
    scales:{
      x:{ grid:{ display:false },
          ticks:{ display:showXTicks, color:COL.sub, font:{size:11}, maxRotation:0, autoSkip:false, padding:4 } },
      y:{ grid:{ display:false }, ticks:{ display:false }, beginAtZero:true }
    },
    clip:false
  };
}

document.addEventListener('DOMContentLoaded', () => {
  startDday(7, 'dday');  startDday(7, 'dday2');

  // 인사이트 차트
  const fitCtx = document.getElementById('fitChart');
  if(fitCtx){
    new Chart(fitCtx, {
      type:'doughnut',
      data:{ labels:['적합도','나머지'],
        datasets:[{ data:[84,16], cutout:'76%', backgroundColor:[COL.brand,'rgba(128,128,128,.18)'], borderWidth:0 }] },
      options:{ plugins:{legend:{display:false}, tooltip:{enabled:false}}, responsive:true, maintainAspectRatio:false }
    });
    const v = document.getElementById('fitVal'); if(v) v.textContent = 84;
  }

  const timeBar = document.getElementById('timeBar');
  if(timeBar){
    new Chart(timeBar, {
      type:'bar',
      data:{ labels:['아침','점심','저녁','심야'],
        datasets:[{ data:[12,38,26,9], backgroundColor:COL.brand, borderRadius:6 }] },
      options: miniOpts({ showXTicks:true })
    });
  }

  const weekLine = document.getElementById('weekLine');
  if(weekLine){
    new Chart(weekLine, {
      type:'line',
      data:{ labels:['월','화','수','목','금','토','일'],
        datasets:[{ data:[22,28,24,35,48,52,31], borderColor:COL.brand, tension:.35, fill:false, pointRadius:0, borderWidth:2 }] },
      options: miniOpts({ showXTicks:true })
    });
  }

  // 3D tilt
  document.querySelectorAll('.card3d').forEach(card=>{
    card.addEventListener('mousemove', e=>{
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left)/r.width - .5;
      const y = (e.clientY - r.top )/r.height - .5;
      card.style.transform = `translateY(-4px) rotateX(${(-y*4).toFixed(2)}deg) rotateY(${(x*4).toFixed(2)}deg)`;
    }, {passive:true});
    card.addEventListener('mouseleave', ()=> card.style.transform = '');
  });

  // 히어로 파티클
  initParticles();

  // 필터칩 토글(목업)
  document.querySelectorAll('.chip').forEach(ch => ch.addEventListener('click', ()=>{
    if(ch.dataset.k==='age'){ document.querySelectorAll('.chip[data-k="age"]').forEach(c=>c.classList.remove('is-active')); }
    if(ch.dataset.k==='sex'){ document.querySelectorAll('.chip[data-k="sex"]').forEach(c=>c.classList.remove('is-active')); }
    ch.classList.toggle('is-active');
  }));

  // ✅ 혜택 받기 → 스파클 버스트 (이벤트 위임: 동적 콘텐츠도 OK)
  document.addEventListener('click', (e)=>{
    const btn = e.target.closest('.apply-btn');
    if(btn) sparkleBurstFrom(btn);
  }, {passive:true});
});

/* ===== 파티클 배경 (가벼운 캔버스) ===== */
function initParticles(){
  const c = document.getElementById('fx'); if(!c) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const ctx = c.getContext('2d'); let w,h, parts=[];

  function resize(){
    const hero = document.querySelector('.hero');
    w = c.width  = innerWidth * dpr;
    h = c.height = hero.offsetHeight * dpr;
    c.style.width  = '100%';
    c.style.height = hero.offsetHeight + 'px';
  }
  function spawn(){
    parts = Array.from({length:80}, ()=>({
      x: Math.random()*w, y: Math.random()*h*0.8,
      r: Math.random()*2*dpr+1, a: Math.random()*Math.PI*2, s: .3 + Math.random()*1.2
    }));
  }
  function step(){
    ctx.clearRect(0,0,w,h);
    for(const p of parts){
      p.x += Math.cos(p.a)*p.s;
      p.y += Math.sin(p.a)*p.s*0.4;
      p.a += 0.01;
      if(p.x<0) p.x=w; if(p.x>w) p.x=0;
      if(p.y<0) p.y=h*0.8; if(p.y>h*0.8) p.y=0;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle = hex2rgba(COL.brand, 0.25);
      ctx.fill();
    }
    requestAnimationFrame(step);
  }
  resize(); spawn(); step();
  addEventListener('resize', ()=>{ resize(); spawn(); }, {passive:true});
}
function hex2rgba(hex, a){
  const m = /#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})/i.exec(hex)||[];
  const r=parseInt(m[1]||'7c',16), g=parseInt(m[2]||'3a',16), b=parseInt(m[3]||'ed',16);
  return `rgba(${r},${g},${b},${a})`;
}

/* ===== 스파클·리플 버스트 ===== */
function sparkleBurstFrom(btn){
  // 버튼 중앙(뷰포트 기준)
  const rect = btn.getBoundingClientRect();
  const x = rect.left + rect.width/2;
  const y = rect.top  + rect.height/2;

  // 오버레이 & 중심 컨테이너
  const overlay = document.createElement('div');
  overlay.className = 'fx-overlay';
  const burst = document.createElement('div');
  burst.className = 'fx-burst';
  burst.style.left = x + 'px';
  burst.style.top  = y + 'px';
  overlay.appendChild(burst);
  document.body.appendChild(overlay);

  // 리플
  const ripple = document.createElement('div');
  ripple.className = 'fx-ripple';
  ripple.style.borderColor = COL.brand;
  burst.appendChild(ripple);
  ripple.addEventListener('animationend', ()=> ripple.remove());

  // 스파클
  const colors = [COL.brand, '#8b5cf6', '#22d3ee', '#f59e0b', '#10b981', '#ef4444'];
  const N = 26;
  for(let i=0;i<N;i++){
    const s = document.createElement('div');
    s.className = 'fx-spark ' + (Math.random()<0.3 ? 'star' : 'dot');
    s.style.color = colors[(Math.random()*colors.length)|0];
    burst.appendChild(s);

    const ang  = (i/N)*Math.PI*2 + (Math.random()-.5)*0.6;
    const dist = 90 + Math.random()*80;
    const dx = Math.cos(ang)*dist, dy = Math.sin(ang)*dist;
    const dur = 650 + Math.random()*500;

    s.animate(
      [
        { transform:'translate(-50%,-50%) scale(.8)', opacity:1 },
        { offset:.7, opacity:1 },
        { transform:`translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(.2)`, opacity:0 }
      ],
      { duration:dur, easing:'cubic-bezier(.22,1,.36,1)', fill:'forwards' }
    ).onfinish = () => s.remove();
  }

  setTimeout(()=> overlay.remove(), 1200);
}
