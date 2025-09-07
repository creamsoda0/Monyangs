/* ===== State ===== */
const state = {
  period: "thisMonth",
  type: "all",
  cat: "all",
  method: "all",
  q: "",
  amtMin: null,
  amtMax: null,
  sort: "dateDesc",
  page: 1,
  pageSize: 20
};

/* ===== Mock data (replace with API later) ===== */
/*
const mockTx = (() => {
  const cats = ["외식","교통","주거","통신","구독","기타"];
  const methods = ["card","transfer","auto","cash","fee","refund"];
  const merchants = {
    외식:["스타냥스","냥버거","모으카페","라면당"],
    교통:["지하철","버스","택시","주차장"],
    주거:["관리비","전기요금","수도요금","도시가스"],
    통신:["모바일요금","인터넷요금"],
    구독:["뮤직냥","영상냥","클라우드냥"],
    기타:["편의점","문구점","서점"]
  };
  const rnd = (a,b)=>Math.floor(Math.random()*(b-a+1))+a;

  const rows = [];
  const today = new Date();
  for(let i=0;i<120;i++){
    const d = new Date(today); d.setDate(today.getDate()-rnd(0,40));
    const cat = cats[rnd(0,cats.length-1)];
    const mlist = merchants[cat]; const merchant = mlist[rnd(0,mlist.length-1)];
    const method = methods[rnd(0,methods.length-1)];
    let amt = rnd(1000, 150000);
    const sign = Math.random()<0.15 ? 1 : -1; // 15% income
    if(method==="refund") amt = -rnd(2000, 40000)*sign; // refunds flip sign
    rows.push({
      id:`T${i}${d.getTime()}`, date:d.toISOString().slice(0,10),
      time:`${String(rnd(9,21)).padStart(2,"0")}:${String(rnd(0,59)).padStart(2,"0")}`,
      amount: sign*amt, merchant, category:cat, method,
      tags: Math.random()<.2 ? ["점심"] : [],
      memo: Math.random()<.1 ? "메모 샘플" : "",
      meta:{ approvalNo:`AP${rnd(100000,999999)}` }
    });
  }
  return rows.sort((a,b)=>a.date>b.date?-1:1);
})();
*/

const mockTx = (() => {
  const init = Array.isArray(window.TX_ALL) ? window.TX_ALL : [];
  console.log("init: ", init);

  // 서버 → 프론트 구조 어댑트 (너의 모의 구조에 맞춤)
  const adapt = (it) => {
	// ts = "YYYY-MM-DD HH:MM" 분리
	const ts = (it.ts || '').trim();
	const sp = ts.indexOf(' ');
	const date = sp > 0 ? ts.slice(0, sp) : '';
	const time = sp > 0 ? ts.slice(sp + 1) : '';

	// 1) 원시 금액
	const rawAmt =
	  Number(it.amount ?? it.approvedAmount ?? it.approved_amount ?? 0);

	// 2) 거래 방향(DEPOSIT/WITHDRAW) 추출
	const accountType = String(
	  it.accountType ?? it.account_type ?? it.type ?? ''
	).toUpperCase();

	// 3) 메서드(환불/수수료 등) 추출
	const method = String(it.method ?? 'transfer').toLowerCase();

	// 4) 부호 표준화 로직
	//    - 원칙: 입금/수입은 +, 출금/지출은 −
	//    - 서버가 부호를 이상하게 줘도 여기서 강제로 정리
	let amt = rawAmt;

	if (accountType === 'DEPOSIT') {
	  amt = Math.abs(rawAmt);        // 무조건 +
	} else if (accountType === 'WITHDRAW') {
	  amt = -Math.abs(rawAmt);       // 무조건 −
	} else {
	  // 방향 정보가 없으면: 서버가 이미 부호를 줬다고 보고 그대로 사용
	  // (필요시 여기서 추가 규칙 더해도 됨)
	}

	// 5) 환불/수수료 보정 (도메인 규칙에 맞게)
	if (method === 'refund') amt = Math.abs(amt);     // 환불은 +
	if (method === 'fee')    amt = -Math.abs(amt);    // 수수료는 −

	return {
	  id: String(it.id),
	  date, time,
	  amount: amt,                  // ✅ 표준화된 부호
	  merchant: it.merchant || '',
	  category: it.category || '기타',
	  method,
	  tags: [],
	  memo: '',
	  meta: { approvalNo: it.approvedNum || '' }
	};
  };

  const rows = init.map(adapt);
  // 기존 mock처럼 최신 우선 정렬 유지
  rows.sort((a,b) => (a.date === b.date ? b.time.localeCompare(a.time) : b.date.localeCompare(a.date)));
  return rows;
})();

/* ===== Utils ===== */
const fmtWon = v => "₩ " + Math.round(v).toLocaleString();
const groupByDate = list => list.reduce((acc,t)=>((acc[t.date]??=[]).push(t),acc),{});
const el = sel => document.querySelector(sel);
const els = sel => document.querySelectorAll(sel);

/* ===== Init ===== */
document.addEventListener("DOMContentLoaded", () => {
  bindControls();
  renderAll();
});

/* ===== Bindings ===== */
function bindControls(){
  // 기간
  const period = el("#periodSelect");
  const from = el("#fromDate"); const to = el("#toDate"); const dash = document.querySelector(".dash");
  period.addEventListener("change", ()=>{
    state.period = period.value;
    const cust = period.value==="custom";
    from.hidden = to.hidden = dash.hidden = !cust;
    if(!cust) renderAll();
  });
  [from,to].forEach(inp=>inp.addEventListener("change", ()=>renderAll()));

  // 빠른 필터
  els(".chip").forEach(c=>c.addEventListener("click", ()=>{
    els(".chip").forEach(b=>b.classList.remove("is-active"));
    c.classList.add("is-active");
    state.type = c.dataset.type;
    renderAll();
  }));

  // 상단 필터 바
  el("#searchInput").addEventListener("input", e=>{ state.q=e.target.value.trim(); renderAll(); });
  el("#catSelect").addEventListener("change", e=>{ state.cat=e.target.value; renderAll(); });
  el("#methodSelect").addEventListener("change", e=>{ state.method=e.target.value; renderAll(); });
  el("#amtMin").addEventListener("input", e=>{ state.amtMin = e.target.value? Number(e.target.value):null; renderAll(); });
  el("#amtMax").addEventListener("input", e=>{ state.amtMax = e.target.value? Number(e.target.value):null; renderAll(); });
  el("#sortSelect").addEventListener("change", e=>{ state.sort=e.target.value; renderAll(); });

  el("#resetBtn").addEventListener("click", ()=>{
    state.q=""; state.cat="all"; state.method="all"; state.amtMin=null; state.amtMax=null; state.type="all"; state.page=1;
    el("#searchInput").value=""; el("#catSelect").value="all"; el("#methodSelect").value="all";
    el("#amtMin").value=""; el("#amtMax").value=""; els(".chip").forEach((b,i)=>b.classList.toggle("is-active", i===0));
    renderAll();
  });

  el("#exportBtn").addEventListener("click", exportCSV);
  el("#moreBtn").addEventListener("click", ()=>{ state.page++; renderList(filterSort(mockTx)); });
}

/* ===== Render ===== */
function renderAll(){
  const list = applyPeriod(mockTx);
  const filtered = filterSort(list);
  renderKpis(filtered);
  renderActiveChips();
  renderList(filtered);
  renderCharts(filtered);
}

function applyPeriod(list){
  const now = new Date();
  let from, to;
  if(state.period==="thisMonth"){
    from = new Date(now.getFullYear(), now.getMonth(), 1);
    to = new Date(now.getFullYear(), now.getMonth()+1, 0);
  }else if(state.period==="lastMonth"){
    from = new Date(now.getFullYear(), now.getMonth()-1, 1);
    to = new Date(now.getFullYear(), now.getMonth(), 0);
  }else if(state.period==="90d"){
    from = new Date(now.getTime()-90*24*60*60*1000);
    to = now;
  }else{ // custom
    const fd = el("#fromDate").value; const td = el("#toDate").value;
    if(fd && td){ from = new Date(fd); to = new Date(td); } else { return list; }
  }
  const f = from.toISOString().slice(0,10), t = to.toISOString().slice(0,10);
  return list.filter(tx=>tx.date>=f && tx.date<=t);
}

function filterSort(list){
  return list
    .filter(tx=>{
      if(state.type==="income" && tx.amount<=0) return false;
      if(state.type==="expense" && tx.amount>=0) return false;
      if(state.type==="card" && tx.method!=="card") return false;
      if(state.type==="transfer" && tx.method!=="transfer") return false;
      if(state.type==="fee" && tx.method!=="fee") return false;
      if(state.type==="refund" && tx.method!=="refund") return false;
      if(state.cat!=="all" && tx.category!==state.cat) return false;
      if(state.method!=="all" && tx.method!==state.method) return false;
      if(state.q){
        const hay = (tx.merchant + " " + (tx.memo||"") + " " + (tx.tags||[]).join(" ")).toLowerCase();
        if(!hay.includes(state.q.toLowerCase())) return false;
      }
      if(state.amtMin!=null && Math.abs(tx.amount) < state.amtMin) return false;
      if(state.amtMax!=null && Math.abs(tx.amount) > state.amtMax) return false;
      return true;
    })
    .sort((a,b)=>{
      switch(state.sort){
        case "dateAsc": return a.date.localeCompare(b.date) || a.time.localeCompare(b.time);
        case "amtDesc": return Math.abs(b.amount)-Math.abs(a.amount);
        case "amtAsc":  return Math.abs(a.amount)-Math.abs(b.amount);
        case "merchantAsc": return a.merchant.localeCompare(b.merchant);
        default: return b.date.localeCompare(a.date) || b.time.localeCompare(a.time);
      }
    });
}

function renderKpis(list){
  const exp = list.filter(t=>t.amount<0);
  const inc = list.filter(t=>t.amount>0);
  const expSum = exp.reduce((s,t)=>s+Math.abs(t.amount),0);
  const incSum = inc.reduce((s,t)=>s+Math.abs(t.amount),0);
  el("#kpiExpense").textContent = fmtWon(expSum);
  el("#kpiIncome").textContent = fmtWon(incSum);
  el("#kpiNet").textContent = fmtWon(expSum - incSum);
  el("#kpiExpenseCnt").textContent = `${exp.length}건`;
  el("#kpiIncomeCnt").textContent = `${inc.length}건`;
  el("#kpiCount").textContent = `${list.length}건`;
}

function renderActiveChips(){
  const box = el("#activeChips");
  const chips = [];
  if(state.q) chips.push(`검색: “${state.q}”`);
  if(state.cat!=="all") chips.push(`카테고리: ${state.cat}`);
  if(state.method!=="all") chips.push(`수단: ${state.method}`);
  if(state.amtMin!=null || state.amtMax!=null) chips.push(`금액: ${state.amtMin??0}~${state.amtMax??"∞"}`);
  box.innerHTML = chips.map(c=>`<span class="badge">${c}</span>`).join("");
}

function renderList(list){
  const container = el("#txList");
  const pageItems = list.slice(0, state.page*state.pageSize);
  const groups = groupByDate(pageItems);
  const dates = Object.keys(groups).sort((a,b)=>b.localeCompare(a));

  container.innerHTML = dates.map(d=>{
    const items = groups[d];
    const total = items.reduce((s,t)=>s+t.amount,0);
    const dayTotal = (total>=0?"+":"-") + fmtWon(Math.abs(total)).replace("₩ ","₩ ");
    return `
      <section class="group">
        <div class="group-h">
          <div>${d}</div>
          <div class="day-total">${dayTotal}</div>
        </div>
        ${items.map(tx => rowHtml(tx)).join("")}
      </section>
    `;
  }).join("");

  // toggle detail
  container.querySelectorAll(".toggle").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const detail = btn.closest(".row").nextElementSibling;
      detail.classList.toggle("open");
    });
  });
}

function rowHtml(tx){
  const signCls = tx.amount<0 ? "neg" : "pos";
  const iconTxt = tx.category.slice(0,1);
  return `
    <div class="row">
      <div class="icon">${iconTxt}</div>
      <div>
        <div class="merchant">${tx.merchant}</div>
        <div class="meta">${tx.category} · ${tx.method.toUpperCase()} · ${tx.time} ${tx.tags.map(t=>`<span class="badge">${t}</span>`).join(" ")}</div>
      </div>
      <div class="amount ${signCls}">${tx.amount<"WITHDRAW"? "-" : "+"} ${fmtWon(Math.abs(tx.amount))}</div>
    </div>
    <div class="detail">
      <div class="detail-grid">
        <div><strong>승인번호</strong><br/>${tx.meta.approvalNo}</div>
        <div><strong>메모</strong><br/>${tx.memo || "—"}</div>
      </div>
    </div>
  `;
}

/* ===== Charts ===== */
let donut, trend, daypart;

function renderCharts(list){
  const gridColor = getComputedStyle(document.documentElement).getPropertyValue("--line").trim();
  const tickColor = getComputedStyle(document.documentElement).getPropertyValue("--sub").trim();

  const byCat = {};
  list.forEach(t=>{ const k=t.category; byCat[k]=(byCat[k]||0)+Math.max(0, -t.amount); });
  const catLabels = Object.keys(byCat); const catData = catLabels.map(k=>byCat[k]);

  const byDate = {};
  list.forEach(t=>{ byDate[t.date]=(byDate[t.date]||0)+Math.max(0, -t.amount); });
  const dates = Object.keys(byDate).sort((a,b)=>a.localeCompare(b)).slice(-14);
  const trendData = dates.map(k=>byDate[k]);

  const parts = {아침:0, 점심:0, 저녁:0, 심야:0};
  list.forEach(t=>{
    const hh = Number(t.time.slice(0,2));
    const bucket = hh<11? "아침" : hh<15? "점심" : hh<22? "저녁" : "심야";
    parts[bucket] += Math.max(0, -t.amount);
  });

  // donut
  donut?.destroy();
  donut = new Chart(document.getElementById("donut"), {
    type:"doughnut",
    data:{ labels:catLabels, datasets:[{ data:catData }] },
    options:{ plugins:{ legend:{ position:"bottom", labels:{ color:tickColor } } }, cutout:"62%" }
  });

  // trend
  trend?.destroy();
  trend = new Chart(document.getElementById("trend"), {
    type:"line",
    data:{ labels:dates, datasets:[{ data:trendData, tension:.35, pointRadius:2 }] },
    options:{
      plugins:{ legend:{ display:false } },
      scales:{ x:{ grid:{ color:gridColor }, ticks:{ color:tickColor } },
              y:{ grid:{ color:gridColor }, ticks:{ color:tickColor }, beginAtZero:true } }
    }
  });

  // daypart
  daypart?.destroy();
  daypart = new Chart(document.getElementById("daypart"), {
    type:"bar",
    data:{ labels:Object.keys(parts), datasets:[{ data:Object.values(parts) }] },
    options:{
      plugins:{ legend:{ display:false } },
      scales:{ x:{ grid:{ color:gridColor }, ticks:{ color:tickColor } },
              y:{ grid:{ color:gridColor }, ticks:{ color:tickColor }, beginAtZero:true } }
    }
  });
}

/* ===== Export CSV ===== */
function exportCSV(){
  const list = filterSort(applyPeriod(mockTx));
  const headers = ["id","date","time","amount","merchant","category","method","tags","memo","approvalNo"];
  const lines = [headers.join(",")];
  list.forEach(t=>{
    lines.push([
      t.id, t.date, t.time, t.amount, `"${t.merchant}"`, t.category, t.method,
      `"${(t.tags||[]).join("|")}"`, `"${(t.memo||"").replace(/"/g,'""')}"`, t.meta.approvalNo
    ].join(","));
  });
  const blob = new Blob([lines.join("\n")], {type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "transactions.csv"; a.click();
  URL.revokeObjectURL(url);
}


