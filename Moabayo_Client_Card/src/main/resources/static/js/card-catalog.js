// 토큰
function cssVar(n){ return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
const COL = { brand: cssVar('--brand') || '#7c3aed' };

/* ---------- 이미지 주입 ---------- */
function injectThumbs(){
  document.querySelectorAll('.kcard').forEach(card=>{
    const url = card.getAttribute('data-img');
    if(url){
      const th = card.querySelector('.thumb');
      if(th) th.style.backgroundImage = `url("${url}")`;
    }
  });
}

/* ---------- 필터/검색 ---------- */
function applyFilter(){
  const tag = document.querySelector('.chip.is-active')?.dataset.filter || 'all';
  const qv  = (document.getElementById('q')?.value || '').trim().toLowerCase();

  document.querySelectorAll('.kcard').forEach(el=>{
    const tags = (el.dataset.tags || '').toLowerCase();
    const name = (el.querySelector('.name, .b-name')?.textContent || '').toLowerCase();
    const passTag = tag === 'all' || tags.includes(tag);
    const passQ   = !qv || tags.includes(qv) || name.includes(qv);
    el.style.display = (passTag && passQ) ? '' : 'none';
  });
}
const applyFilterDebounced = (fn=>{let t; return ()=>{clearTimeout(t); t=setTimeout(fn,150);} })(applyFilter);

function setupFilter(){
  const chips = document.querySelectorAll('.chip');
  chips.forEach(ch=> ch.addEventListener('click', ()=>{
    chips.forEach(c=>c.classList.remove('is-active'));
    ch.classList.add('is-active');
    applyFilter();
  }));

  const q = document.getElementById('q');
  if(q) q.addEventListener('input', applyFilterDebounced);

  applyFilter(); // 최초 1회
}

/* ---------- 초기화 (단 한 번) ---------- */
document.addEventListener('DOMContentLoaded', () => {
  injectThumbs();
  setupFilter();
});

/* ---------- Flip / Sparkle 그대로 사용 ---------- */
document.addEventListener('click', (e)=>{
  const backBtn = e.target.closest('.flip-back');
  if(backBtn){ backBtn.closest('.kcard')?.classList.remove('is-flipped'); return; }
  const card = e.target.closest('.kcard');
  const cta  = e.target.closest('.apply-btn');
  if(cta){ sparkleBurstFrom(cta); return; }
  if(card){ card.classList.toggle('is-flipped'); }
}, {passive:true});

function sparkleBurstFrom(btn){
  const rect = btn.getBoundingClientRect();
  const x = rect.left + rect.width/2;
  const y = rect.top  + rect.height/2;

  const overlay = document.createElement('div');
  overlay.className = 'fx-overlay';
  const burst = document.createElement('div');
  burst.className = 'fx-burst';
  burst.style.left = x + 'px';
  burst.style.top  = y + 'px';
  overlay.appendChild(burst);
  document.body.appendChild(overlay);

  const ripple = document.createElement('div');
  ripple.className = 'fx-ripple';
  burst.appendChild(ripple);

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

/* ---------- Back-face 업그레이드 (런타임 변환) ---------- */
function upgradeBackFaces(){
  document.querySelectorAll('.kcard').forEach(card=>{
    const back = card.querySelector('.face.back');
    if(!back || back.classList.contains('upgraded')) return;

    // 기존 리스트에서 혜택 텍스트 수집
    const benefitLis = back.querySelectorAll('.benefits li, ul li, .b-list li');
    const benefits = [...benefitLis].map(li => li.textContent.trim()).filter(Boolean);

    // 카드명/지표 (없으면 기본값)
    const title = card.querySelector('.name, .b-name')?.textContent?.trim() || '추천 카드';
    const fit   = Number(card.dataset.fit || 84);
    const cap   = card.dataset.cap || '30,000P';
    const fee   = card.dataset.fee || '무료';
    const req   = card.dataset.req || '30만+';

    // 새 뒷면 마크업 주입
    back.innerHTML = `
      <div class="back-hero">
        <div class="fit">
          <div class="fit-ring" style="--p:${fit}"><span>${fit}%</span></div>
          <em>적합도</em>
        </div>
        <div class="info">
          <h3 class="b-name">${title}</h3>
          <div class="kv">
            <span class="kv-chip">월 최대 <b>${cap}</b></span>
            <span class="kv-chip">연회비 <b>${fee}</b></span>
            <span class="kv-chip">전월실적 <b>${req}</b></span>
          </div>
        </div>
      </div>
      <div class="benefit-grid">
        ${benefits.map(t=>`<div class="b-item">${t}</div>`).join('')}
      </div>
      <div class="actions">
        <button class="mbtn mbtn--primary is-pill apply-btn">혜택 받기</button>
        <button class="mbtn mbtn--outline is-pill flip-back">뒤로</button>
      </div>
    `;
    back.classList.add('upgraded');
  });
}

// ✅ 초기화 묶음 안에서 한 번만 호출
document.addEventListener('DOMContentLoaded', () => {
  injectThumbs();
  setupFilter();
  upgradeBackFaces();        // ← 이 줄 추가
});

// ===== Catalog Banner JS =====
(function(){
  const banner = document.getElementById('catalogBanner');
  if(!banner) return;

  const KEY = 'nyang_catalog_banner_hide_until';


  // 도넛 게이지 값 바인딩
  const ring = banner.querySelector('.cb-ring');
  if (ring) {
    const val = Math.max(0, Math.min(100, Number(ring.dataset.val || 0)));
    ring.style.setProperty('--val', val);
    ring.querySelector('span').textContent = `${val}%`;
  }


  // 쿼리로 강제 노출 (디버그용) ?showBanner=1
  const sp = new URLSearchParams(location.search);
  if (sp.get('showBanner') === '1') {
    localStorage.removeItem(KEY);
  }
})();
