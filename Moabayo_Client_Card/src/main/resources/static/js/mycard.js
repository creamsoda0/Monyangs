// -----------------------------
// UI (한 번만!)
// -----------------------------
document.addEventListener('DOMContentLoaded', () => {
  // THEME
  const html = document.documentElement;
  const saved = localStorage.getItem('theme');
  if (saved) html.setAttribute('data-theme', saved);

  // ELEMENTS
  const els = {
    list : document.getElementById('cardList'),
    cover: document.getElementById('dCover'),
    title: document.getElementById('dTitle'),
    bank : document.getElementById('dBank'),
    benefit: document.getElementById('dBenefit'),
    limit: document.getElementById('dLimit'),
    point: document.getElementById('dPoint'),
    state: document.getElementById('dState'),
    stSel: document.getElementById('stSelected'),
    stFav: document.getElementById('stFav'),
    stNext: document.getElementById('stNext'),
    btnFav: document.getElementById('btnFav'),
    btnShare: document.getElementById('btnShare'),
    reset: document.getElementById('resetBtn'),
  };
  if (!els.list) return;

  // ---- 진행률 바 유틸 ----
  const parseLimitText = (txt)=>{
    if(!txt) return { used:0, total:0 };
    const [a='',b=''] = String(txt).split('/');
    const toNum = s => Number(String(s).replace(/[^\d]/g,'') || 0);
    return { used:toNum(a), total:toNum(b) };
  };
  const updateLimitBar = (limitText)=>{
    const bar   = document.getElementById('limitBar');
    const label = document.getElementById('limitLabel');
    if(!bar || !label) return;
    const { used, total } = parseLimitText(limitText);
    const pct = (!total || used<0) ? 0 : Math.min(100, Math.round((used/total)*100));
    bar.classList.remove('is-warn','is-danger');
    if (pct >= 90) bar.classList.add('is-danger');
    else if (pct >= 70) bar.classList.add('is-warn');
    bar.style.width = pct + '%';
    label.textContent = pct + '%';
  };

  let selected = null, favored = false;

  function renderStatus(){
    els.stSel?.classList.toggle('active', !!selected);
    if (els.stSel) els.stSel.innerHTML =
      `<span class="dot"></span>${selected ? ' 선택됨: ' + (selected.dataset.title || '') : ' 선택된 카드 없음'}`;
    els.stFav?.classList.toggle('fav', favored);
    if (els.stFav) els.stFav.innerHTML = `<span class="dot"></span>즐겨찾기: ${favored ? '켜짐' : '꺼짐'}`;
    if (els.stNext) els.stNext.innerHTML =
      `<span class="dot"></span>다음 납부일: ${selected?.dataset.next || '-'}`;
  }
  function setStateBadge(stateText){
    if (!els.state) return;
    const st = (stateText || '').toLowerCase();
    els.state.className = 'badge';
    if (st === 'active') els.state.classList.add('state-active');
    else if (st === 'frozen') els.state.classList.add('state-frozen');
    else if (st === 'lost')   els.state.classList.add('state-lost');
    els.state.textContent = st==='active'?'사용중':st==='frozen'?'정지':st==='lost'?'분실 신고':'-';
  }
  function clearActive(){
    document.querySelectorAll('.card.is-active').forEach(el=>el.classList.remove('is-active'));
  }
  function fillDetail(card){
    if (!card) return;
    els.cover && (els.cover.style.backgroundImage = card.dataset.img ? `url('${card.dataset.img}')` : '');
    els.title && (els.title.textContent = card.dataset.title || '카드');
    els.bank && (els.bank.textContent   = card.dataset.bank || '');
    els.benefit && (els.benefit.textContent = card.dataset.benefit || '-');
    els.limit && (els.limit.textContent = card.dataset.limit || '-');
    els.point && (els.point.textContent = card.dataset.point || '-');
    updateLimitBar(card.dataset.limit || '');
    setStateBadge(card.dataset.state || '');
  }
  function onSelect(card){
    selected = card;
    clearActive();
    card.classList.add('is-active');
    fillDetail(card);
    renderStatus();
  }

  // 리스트 인터랙션 (추가 타일 분기 포함)
  els.list.addEventListener('click', (e)=>{
    const card = e.target.closest('.card');
    if(!card) return;
    if(card.classList.contains('card--add')){
      location.assign(card.dataset.route || '/usercard/recommend');
    }else{
      onSelect(card);
    }
  });
  els.list.addEventListener('keydown', (e)=>{
    if((e.key==='Enter' || e.key===' ') && e.target.classList.contains('card')){
      e.preventDefault();
      const card = e.target;
      if(card.classList.contains('card--add')){
        location.assign(card.dataset.route || '/usercard/recommend');
      }else{
        onSelect(card);
      }
    }
  });

  // 액션
  els.btnFav?.addEventListener('click', ()=>{
    if(!selected) return alert('카드를 먼저 선택하세요.');
    favored = !favored; renderStatus();
  });
  els.btnShare?.addEventListener('click', async ()=>{
    if(!selected) return alert('카드를 먼저 선택하세요.');
    const text = `내 카드: ${selected.dataset.title} | 상태:${els.state?.textContent || '-'} | 한도:${selected.dataset.limit || '-'} | 다음 납부:${selected.dataset.next || '-'}`;
    try{
      if(navigator.share) await navigator.share({ title:'모으냥즈 내 카드', text, url: location.href });
      else { await navigator.clipboard.writeText(text); alert('카드 상태가 복사되었습니다.'); }
    }catch(_){}
  });
  els.reset?.addEventListener('click', ()=>{
    selected=null; favored=false;
    if (els.cover) els.cover.style.backgroundImage='';
    if (els.title) els.title.textContent='카드를 선택하세요';
    if (els.bank)  els.bank.textContent='은행/발급사';
    if (els.benefit) els.benefit.textContent='-';
    if (els.limit)   els.limit.textContent='-';
    if (els.point)   els.point.textContent='-';
    if (els.state){ els.state.className='badge'; els.state.textContent='-'; }
    updateLimitBar('0 / 0'); clearActive(); renderStatus();
  });

  // 초기 상태 (추가 타일은 제외)
  renderStatus();
  const first = els.list.querySelector('.card:not(.card--add)');
  if(first) onSelect(first);
}); // <-- 중요: DOMContentLoaded 닫기!

// -----------------------------
// Fireflies (ultra lite) — 별도 IIFE (한 번만!)
// -----------------------------
(function(){
  const canvas = document.getElementById('fireflies'); if(!canvas) return;
  const ctx = canvas.getContext('2d');

  let CFG = { COUNT: 22, FPS: 30, SPEED: 0.18, R_MIN: 1.4, R_MAX: 2.2, DPR_MAX: 1.25 };
  let dpr=1, W=0, H=0, rafId=null, running=false, bugs=[], sprites={}, prev=0, acc=0;

  const htmlEl=document.documentElement, bodyEl=document.body;
  const isDark=()=> htmlEl.matches('[data-theme="dark"], .dark') || bodyEl.matches('[data-theme="dark"], .dark');

  const vp = ()=>({ w: canvas.clientWidth||window.innerWidth, h: canvas.clientHeight||window.innerHeight });
  function resize(){ const {w,h}=vp(); W=w; H=h;
    dpr = Math.min(CFG.DPR_MAX, Math.max(1, window.devicePixelRatio||1));
    canvas.width = Math.floor(W*dpr); canvas.height = Math.floor(H*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }

  function sprite(color){
    if (sprites[color]) return sprites[color];
    const S=64, c=document.createElement('canvas'); c.width=c.height=S;
    const g=c.getContext('2d'), r=S/2;
    const grd=g.createRadialGradient(r,r,0,r,r,r);
    grd.addColorStop(0,'rgba(255,255,255,1)'); grd.addColorStop(1,'rgba(255,255,255,0)');
    g.fillStyle=grd; g.fillRect(0,0,S,S);
    g.globalCompositeOperation='source-in'; g.fillStyle=color; g.fillRect(0,0,S,S);
    g.globalCompositeOperation='source-over';
    return sprites[color]=c;
  }
  const cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || undefined;
  const colors = ()=> [cssVar('--glow-1')||'#9a8cff', cssVar('--glow-2')||'#ffd166', cssVar('--glow-3')||'#6ee7ff'];
  const rnd=(a,b)=>Math.random()*(b-a)+a;
  const spawn=i=>({ x:rnd(0,W), y:rnd(0,H), vx:rnd(-CFG.SPEED,CFG.SPEED), vy:rnd(-CFG.SPEED,CFG.SPEED),
                    r:rnd(CFG.R_MIN,CFG.R_MAX), c:colors()[i%3], tw:rnd(.4,1) });
  function init(){ bugs=Array.from({length:CFG.COUNT},(_,i)=>spawn(i)); }

  function draw(ts){
    const frame=1000/CFG.FPS;
    if(!prev) prev=ts;
    const dt=ts-prev; acc+=dt; if(acc < frame){ rafId=requestAnimationFrame(draw); return; }
    prev=ts; acc=0;

    ctx.clearRect(0,0,W,H);
    for(const b of bugs){
      b.x=(b.x+b.vx)|0; b.y=(b.y+b.vy)|0;
      if(b.x<-12||b.x>W+12) b.vx*=-1;
      if(b.y<-12||b.y>H+12) b.vy*=-1;
      b.vx+=rnd(-.015,.015); b.vy+=rnd(-.015,.015);
      const a=0.30+0.40*Math.sin(ts*0.002 + b.tw*6.283);
      const s=sprite(b.c), size=b.r*22;
      ctx.globalAlpha=a; ctx.drawImage(s, b.x-size/2, b.y-size/2, size, size);
    }
    ctx.globalAlpha=1;
    rafId=requestAnimationFrame(draw);
  }

  function start(){ if(running) return; running=true; resize(); init(); prev=0; acc=0; rafId=requestAnimationFrame(draw); }
  function stop(){ running=false; if(rafId) cancelAnimationFrame(rafId); ctx.clearRect(0,0,W,H); }

  // 최적화: 비가시/블러 상태 멈춤
  document.addEventListener('visibilitychange', ()=> document.hidden ? stop() : (isDark() && start()));
  window.addEventListener('blur', ()=> running && stop());
  window.addEventListener('focus', ()=> isDark() && start());
  window.addEventListener('resize', ()=> running && resize());

  const apply=()=> isDark()? start(): stop();
  requestAnimationFrame(apply);
  new MutationObserver(apply).observe(htmlEl,{attributes:true,attributeFilter:['data-theme','class']});
  new MutationObserver(apply).observe(bodyEl,{attributes:true,attributeFilter:['data-theme','class']});

  // 디버그
  window.firefliesStart=start; window.firefliesStop=stop;
})();
