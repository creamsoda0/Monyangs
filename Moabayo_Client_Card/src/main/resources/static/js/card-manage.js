document.addEventListener('DOMContentLoaded', () => {
  // ===== 더미 카드 (이미지 없이도 그라디언트 커버로 보임) =====
  const cards = [
    { id:'c1', title:'Moa Classic', bank:'Moa Bank', state:'active',
      limit:'633,000원 / 1,000,000원', point:'8,220p', next:'09/05 (금)' },
    { id:'c2', title:'Moa Gold', bank:'Moa Bank', state:'active',
      limit:'410,000원 / 800,000원', point:'5,120p', next:'09/07 (토)' },
    { id:'c3', title:'Moa Pink', bank:'Moa Card', state:'lost',
      limit:'- / -', point:'-', next:'분실 신고 완료' },
  ];

  // ===== 엘리먼트 =====
  const els = {
    list: document.getElementById('cardListM'),
    add : document.getElementById('addCard'),

    title: document.getElementById('cardTitle'),
    state: document.getElementById('cardState'),

    limitText: document.getElementById('limitText'),
    pointText: document.getElementById('pointText'),
    nextText: document.getElementById('nextText'),
    limitBar: document.getElementById('limitBar'),
    limitLabel: document.getElementById('limitLabel'),

    tabs: document.querySelectorAll('.m-tabs [role="tab"]'),
    panels: document.querySelectorAll('.m-tab'),

    freezeToggle: document.getElementById('freezeToggle'),
    closeCard: document.getElementById('closeCard'),
    closeCard2: document.getElementById('closeCard2'),
    closeModal: document.getElementById('closeModal'),

    cover: document.getElementById('cover'),
    log: document.getElementById('activity'),

    // limit panel
    limitChips: document.getElementById('limitChips'),
    limitRange: document.getElementById('limitRange'),
    limitInput: document.getElementById('limitInput'),

    // security
    revealBtn: document.getElementById('revealBtn'),
    revealArea: document.getElementById('revealArea'),

    // tx
    txBody: document.getElementById('txBody'),
  };

  // ===== 유틸 =====
  const fmtNum = (n)=> n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const parseLimit = (s)=>{
    const [a='',b=''] = String(s||'0/0').split('/');
    const used = Number(a.replace(/[^\d]/g,''))||0;
    const tot  = Number(b.replace(/[^\d]/g,''))||0;
    const pct  = (!tot||used<0) ? 0 : Math.min(100, Math.round((used/tot)*100));
    return { used, tot, pct };
  };
  const log = (txt)=>{
    if(!els.log) return;
    const li = document.createElement('li');
    li.textContent = `${new Date().toLocaleTimeString()} · ${txt}`;
    els.log.prepend(li);
  };
  const setTab = (name)=>{
    els.tabs.forEach(b=>{
      const on = b.dataset.tab === name;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-selected', String(on));
    });
    els.panels.forEach(p=> p.classList.toggle('is-on', p.id === `tab-${name}`));
  };

  // ===== 리스트 =====
  function drawList(){
    els.list.innerHTML = cards.map(c=>`
      <li role="option" data-id="${c.id}">
        <span>${c.title}</span>
        <span class="badge ${c.state==='active'?'state-active':''}" style="margin-left:auto">${c.state}</span>
      </li>
    `).join('');
  }

  let cur = null;

  function select(id){
    const c = cards.find(x=>x.id===id); if(!c) return;
    cur = c;

    els.list.querySelectorAll('li').forEach(li=> li.classList.toggle('is-on', li.dataset.id===id));
    els.title.textContent = c.title;
    els.state.className = 'badge ' + (c.state==='active' ? 'state-active' : '');
    els.state.textContent = (c.state==='active'?'사용중':c.state);

    els.limitText.textContent = c.limit;
    els.pointText.textContent = c.point;
    els.nextText.textContent  = c.next;

    const { pct } = parseLimit(c.limit);
    els.limitBar.style.width = pct + '%';
    els.limitLabel.textContent = pct + '%';

    // 커버는 그라디언트(이미지 없이도 안정)
    if (els.cover){
      const seed = [...c.title].reduce((a,ch)=>a+ch.charCodeAt(0),0)%360;
      els.cover.style.background = `
        radial-gradient(120% 120% at 20% 10%, hsl(${(seed+40)%360} 70% 70% / .55), transparent 55%),
        radial-gradient(120% 120% at 80% 0%,   hsl(${(seed+200)%360} 80% 70% / .45), transparent 50%),
        linear-gradient(180deg, color-mix(in oklab, var(--muted), transparent 20%), var(--muted))
      `;
    }

    log(`카드 선택: ${c.title}`);
  }

  // ===== 이벤트 바인딩 =====
  els.list.addEventListener('click', (e)=>{
    const li = e.target.closest('li[data-id]'); if(!li) return;
    select(li.dataset.id);
  });
  els.add.addEventListener('click', ()=> location.assign('/usercard/recommend'));

  // 탭
  els.tabs.forEach(tab=>{
    tab.addEventListener('click', ()=>{
      setTab(tab.dataset.tab);
      // 빠른 이동 버튼과 동기
      if(tab.dataset.tab==='tx') renderTx();
    });
  });

  // 빠른 작업 -> 탭 이동
  document.querySelectorAll('.qbtn[data-go]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      setTab(btn.dataset.go);
      if(btn.dataset.go==='tx') renderTx();
    });
  });

  // 정지/해제 (낙관적 UI + 취소)
  els.freezeToggle.addEventListener('click', ()=>{
    if(!cur) return;
    const frozen = (cur.state!=='active');
    cur.state = frozen ? 'active' : 'frozen';
    drawList(); select(cur.id);
    toast(frozen ? '정지가 해제되었습니다.' : '카드가 정지되었습니다.', {
      undo: ()=>{ cur.state = frozen ? 'frozen' : 'active'; drawList(); select(cur.id); }
    });
  });

  // 해지(설정 탭 버튼도 동일 동작)
  [els.closeCard, els.closeCard2].forEach(b=> b?.addEventListener('click', openCloseModal));
  function openCloseModal(){
    if(!els.closeModal) return;
    els.closeModal.showModal();
    els.closeModal.addEventListener('close', ()=>{
      if(els.closeModal.returnValue!=='ok') return;
      // TODO: 마지막 4자리 검증 및 서버 연동
      if(!cur) return;
      cur.state = 'closed';
      drawList(); select(cur.id);
      toast('카드가 해지되었습니다.');
    }, { once:true });
  }

  // 한도관리 바인딩
  const fmt = n => n.toLocaleString() + '원';
  els.limitRange.addEventListener('input', ()=> els.limitInput.value = fmt(+els.limitRange.value));
  els.limitInput.addEventListener('input', ()=>{
    const v = Number(els.limitInput.value.replace(/[^\d]/g,''))||0;
    els.limitRange.value = v;
  });
  els.limitChips.addEventListener('click', (e)=>{
    const btn = e.target.closest('.chip[data-v]'); if(!btn) return;
    els.limitRange.value = btn.dataset.v;
    els.limitInput.value = fmt(+btn.dataset.v);
  });

  // 보안 – 카드번호 보기 5초
  els.revealBtn.addEventListener('click', ()=>{
    if(!cur) return;
    const masked = '1234 5678 **** ****  ·  CVV ***';
    els.revealArea.classList.remove('hide');
    els.revealArea.textContent = masked + '  (5초 뒤 숨김)';
    log('카드번호 노출(가림 처리)');
    setTimeout(()=>{ els.revealArea.classList.add('hide'); els.revealArea.textContent=''; }, 5000);
  });

  // 이용내역 더미 & 렌더
  const txAll = [
    { d:'09/01', m:'GS25',   c:'편의점', a:  4200 },
    { d:'09/01', m:'배민',   c:'배달앱', a: 15800 },
    { d:'09/02', m:'CU',     c:'편의점', a:  2300 },
    { d:'09/03', m:'요기요', c:'배달앱', a: 12900 },
    { d:'09/04', m:'이마트', c:'마트',   a: 48000 },
  ];
  let txFilter = null; // ex) {type:'cat', value:'편의점'} or {type:'month', value:'cur'}
  function renderTx(){
    // 간단 필터만 예시 (달 필터는 데모이므로 전체 반환)
    let list = txAll.slice();
    if(txFilter?.type==='cat') list = list.filter(x=>x.c===txFilter.value);
    els.txBody.innerHTML = list.map(x=>`
      <tr>
        <td>${x.d}</td><td>${x.m}</td><td>${x.c}</td><td class="r">${x.a.toLocaleString()}원</td>
      </tr>
    `).join('');
  }
  document.querySelector('#tab-tx .filters').addEventListener('click', (e)=>{
    const b = e.target.closest('.chip'); if(!b) return;
    document.querySelectorAll('#tab-tx .filters .chip').forEach(c=>c.classList.remove('is-on'));
    b.classList.add('is-on');
    const f = b.dataset.filter || '';
    if(f==='reset') txFilter=null;
    else if(f.startsWith('cat:')) txFilter={type:'cat', value:f.split(':')[1]};
    else if(f.startsWith('month:')) txFilter={type:'month', value:f.split(':')[1]};
    renderTx();
  });

  // 토스트
  function toast(msg, opt){
    const t=document.createElement('div'); t.className='toast'; t.textContent=msg;
    if(opt?.undo){ const b=document.createElement('button'); b.textContent='되돌리기'; b.onclick=()=>{ opt.undo(); t.remove(); }; t.append(b); }
    document.body.append(t); setTimeout(()=>t.remove(), 3500);
  }

  // 초기화
  drawList();
  select(cards[0].id);
  renderTx();
  setTab('overview');
});
