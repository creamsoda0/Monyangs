/* ===== 상태 ===== */
const state = { age: "20s", gender: "F", region: "서울", time: "noon" };

/* ===== 공통 상수 ===== */
const UPJONG_CODES  = ["ss001","ss002","ss003","ss004","ss005","ss006","ss007","ss008"];
const UPJONG_LABELS = ["요식/유흥","유통","스포츠/문화/레저","가정생활/서비스","교육/학원","의료","자동차","전자상거래"];

/* ===== 유틸: 키 유연 접근/나이 정규화/시간버킷 매핑 ===== */
function pickFlex(obj, ...names){
  const norm = k => k.replace(/_/g, "").toLowerCase();
  const map = {}; for (const k of Object.keys(obj)) map[norm(k)] = obj[k];
  for (const n of names){ const key = norm(n); if (key in map) return map[key]; }
  return undefined;
}
function normalizeAge(txt){
  if(!txt) return "etc";
  const s = String(txt);
  if (s.includes("70")) return "70s+";
  for (const k of ["60","50","40","30","20"]) if (s.includes(k)) return k+"s";
  return "etc";
}
// 1~6(4시간 단위) → 화면 4구간으로 묶기
const TIME_BUCKETS = {
  morning: [2,3],        // 04–07, 08–11
  noon:    [3,4],        // 08–11, 12–15
  evening: [5,6],        // 16–19, 20–23
  night:   [6,1],        // 20–23, 00–03
};

/* ===== CSV 캐시 ===== */
const CSV = { age: [], region: [], time: [] };

async function loadCsvCache(){
  const [a,r,t] = await Promise.all([
    fetch("/csv/age").then(res=>res.json()),
    fetch("/csv/region").then(res=>res.json()),
    fetch("/csv/time").then(res=>res.json()),
  ]);
  CSV.age = a; CSV.region = r; CSV.time = t;
  // 콘솔로 1행만 확인(필드명 체크용)
  console.log("sample age row:", CSV.age[0]);
  console.log("sample region row:", CSV.region[0]);
  console.log("sample time row:", CSV.time[0]);
}

/* ===== 분포 집계 ===== */
// (AGE,GENDER) → 업종별 비율(0~1)
function distAgeGender(ageBand, gender){
  const sums = Object.fromEntries(UPJONG_CODES.map(c => [c,0]));
  for (const r of CSV.age){
    const code   = pickFlex(r, "UPJONG_CD","upjong_cd","upjongCd");
    const g      = (pickFlex(r, "GENDER","gender") || "").toUpperCase();
    const ageRaw = pickFlex(r, "AGE","age");
    const age    = normalizeAge(ageRaw);
    const tryCnt = Number(pickFlex(r, "CARD_TRY","card_try","cardTry","card_TRY") || 0);
    if (!UPJONG_CODES.includes(code)) continue;
    if (g !== gender.toUpperCase() || age !== ageBand) continue;
    sums[code] += tryCnt;
  }
  const total = Object.values(sums).reduce((a,b)=>a+b,0);
  return UPJONG_CODES.map(c => total>0 ? sums[c]/total : 0);
}

// REGION → 업종별 비율(0~1)
// (Region VO 필드명이 다를 수 있어 pickFlex로 유연하게)
function distRegion(regionLabel){
  const sums = Object.fromEntries(UPJONG_CODES.map(c => [c,0]));
  for (const r of CSV.region){
    const region = pickFlex(r, "REGION","region","region_code","regionCode");
    const code   = pickFlex(r, "UPJONG_CD","upjong_cd","upjongCd");
    const tryCnt = Number(pickFlex(r, "CARD_TRY","card_try","cardTry","card_TRY") || 0);
    if (!UPJONG_CODES.includes(code)) continue;
    if (String(region) !== String(regionLabel)) continue; // 값 그대로 비교(한글)
    sums[code] += tryCnt;
  }
  const total = Object.values(sums).reduce((a,b)=>a+b,0);
  return UPJONG_CODES.map(c => total>0 ? sums[c]/total : 0);
}

// TIME(아침/점심/저녁/심야) → 업종별 비율(0~1)
function distTime(timeKey){
  const buckets = TIME_BUCKETS[timeKey] || [];
  const sums = Object.fromEntries(UPJONG_CODES.map(c => [c,0]));
  for (const r of CSV.time){
    const bucket = Number(pickFlex(r, "TIME_BUCKET","time_bucket","bucket") || 0);
    const code   = pickFlex(r, "UPJONG_CD","upjong_cd","upjongCd");
    const tryCnt = Number(pickFlex(r, "CARD_TRY","card_try","cardTry","card_TRY") || 0);
    if (!UPJONG_CODES.includes(code)) continue;
    if (!buckets.includes(bucket)) continue;
    sums[code] += tryCnt;
  }
  const total = Object.values(sums).reduce((a,b)=>a+b,0);
  return UPJONG_CODES.map(c => total>0 ? sums[c]/total : 0);
}

/* ===== 화면용 데이터 빌드 ===== */
function buildInsights(){
  // 분포 가중합(필요 시 가중치 조정)
  const wAG=0.5, wRG=0.3, wTM=0.2;
  const ag = distAgeGender(state.age, state.gender);
  const rg = distRegion(state.region);
  const tm = distTime(state.time);

  const donutData = ag.map((v,i)=> wAG*v + wRG*rg[i] + wTM*tm[i]);

  // KPI
  const maxIdx = donutData.reduce((bi, v, i)=> v>donutData[bi]? i:bi, 0);
  const topCat = UPJONG_LABELS[maxIdx];
  const peak   = ({morning:"아침", noon:"점심", evening:"저녁", night:"심야"})[state.time] || "-";

  // 시간대 막대: /csv/time 전체를 4구간으로 합산
  const barLabels = ["아침","점심","저녁","심야"];
  const barData = ["morning","noon","evening","night"].map(k => {
    const buckets = TIME_BUCKETS[k];
    const sum = CSV.time.reduce((acc, r)=>{
      const b = Number(pickFlex(r,"TIME_BUCKET","time_bucket","bucket")||0);
      if (!buckets.includes(b)) return acc;
      return acc + Number(pickFlex(r, "CARD_TRY","card_try","cardTry","card_TRY") || 0);
    }, 0);
    return sum;
  });

  // 라인(최근 7일) 데이터가 없으니 막대 분포를 스케일링하여 임시 생성
  const totalBar = barData.reduce((a,b)=>a+b,0) || 1;
  const lineLabels = ["월","화","수","목","금","토","일"];
  const base = barData.map(v=> Math.round(200 * v/totalBar)); // 대략적인 스케일
  const lineData = [base[0], base[1], base[2], base[1], base[2], base[3], base[0]];

  return {
    kpis: {
      spend: 0,                // 금액 데이터 없으므로 0 유지(필요 시 계산 규칙 추가)
      topCat,                  // 최다 카테고리
      peak: `${peak}`,         // 피크 시간대 라벨
      cohort: CSV.age.length   // 대략 표본 수로 표시
    },
    donut: { labels: UPJONG_LABELS, data: donutData.map(v=> +(v*100).toFixed(1)) }, // %로 표시
    bar:   { labels: barLabels, data: barData },
    line:  { labels: lineLabels, data: lineData },
    products: [] // 제품은 기존 로직/서버에서 주입
  };
}

/* ===== 포맷터 & 차트 인스턴스 ===== */
const fmtWon = v => "₩ " + Number(v||0).toLocaleString();
let donutChart, barChart, lineChart;

/* ===== KPI 적용 ===== */
function applyKpis(k){
  document.getElementById("kpiSpend").textContent = fmtWon(k.spend);
  document.getElementById("kpiTopCat").textContent = k.topCat || "-";
  document.getElementById("kpiPeak").textContent   = k.peak || "-";
  document.getElementById("kpiCohort").textContent = (k.cohort||0).toLocaleString()+"명";
}

/* ===== 차트 마운트/업데이트 ===== */
function mountCharts(d){
  const donutCtx = document.getElementById("donutChart");
  const barCtx   = document.getElementById("barChart");
  const lineCtx  = document.getElementById("lineChart");

  const gridColor = getComputedStyle(document.documentElement).getPropertyValue("--line").trim() || "#eee";
  const tickColor = getComputedStyle(document.documentElement).getPropertyValue("--sub").trim()  || "#666";

  donutChart = new Chart(donutCtx, {
    type: "doughnut",
    data: { labels: d.donut.labels, datasets: [{ data: d.donut.data }] },
    options: {
      plugins:{
        legend:{ position:"bottom", labels:{ color: tickColor } },
        tooltip:{ callbacks:{ label: (ctx)=> `${ctx.label}: ${ctx.parsed}%` } }
      },
      cutout: "62%"
    }
  });

  barChart = new Chart(barCtx, {
    type: "bar",
    data: { labels: d.bar.labels, datasets: [{ data: d.bar.data }] },
    options: {
      scales:{
        x:{ grid:{ color:gridColor }, ticks:{ color:tickColor } },
        y:{ grid:{ color:gridColor }, ticks:{ color:tickColor }, beginAtZero:true }
      },
      plugins:{ legend:{ display:false } }
    }
  });

  lineChart = new Chart(lineCtx, {
    type: "line",
    data: { labels: d.line.labels, datasets: [{ data: d.line.data, tension:.35, fill:false, pointRadius:3 }] },
    options: {
      scales:{
        x:{ grid:{ color:gridColor }, ticks:{ color:tickColor } },
        y:{ grid:{ color:gridColor }, ticks:{ color:tickColor }, beginAtZero:false }
      },
      plugins:{ legend:{ display:false } }
    }
  });
}

function updateCharts(d){
  donutChart.data.labels = d.donut.labels;
  donutChart.data.datasets[0].data = d.donut.data;
  donutChart.update();

  barChart.data.labels = d.bar.labels;
  barChart.data.datasets[0].data = d.bar.data;
  barChart.update();

  lineChart.data.labels = d.line.labels;
  lineChart.data.datasets[0].data = d.line.data;
  lineChart.update();
}

/* ===== 상품 카드(기존 로직 유지) ===== */
function renderProducts(items){
  const grid = document.getElementById("productGrid");
  if (!items || !items.length){ grid.innerHTML = ""; return; }
  grid.innerHTML = items.map(p => `
    <article class="pcard">
      <span class="badge tag">이벤트</span>
      <div class="bank">${p.bank||""}</div>
      <h4>${p.name||""}</h4>
      <div class="rate">${p.rate||""}</div>
      <ul class="perks">${(p.tags||[]).map(t=>`<li>• ${t}</li>`).join("")}</ul>
      <div class="actions">
        <a class="btn btn-primary" href="${p.cta||"#"}">가입하기</a>
        <a class="btn btn-outline" href="${p.detail||"#"}">자세히</a>
      </div>
    </article>`).join("");
}

/* ===== 필터 바인딩 ===== */
function bindFilters(){
  document.querySelectorAll(".chip-group, .seg-group").forEach(group=>{
    group.addEventListener("click", e=>{
      const btn = e.target.closest("button"); if(!btn) return;
      [...group.querySelectorAll("button")].forEach(b=>b.classList.remove("is-active"));
      btn.classList.add("is-active");
      state[group.dataset.key] = btn.dataset.value;
      refresh();
    });
  });
  document.querySelectorAll(".select").forEach(sel=>{
    sel.addEventListener("change", ()=>{
      state[sel.dataset.key] = sel.value;
      refresh();
    });
  });
}

/* ===== 리프레시 ===== */
function refresh(){
  const d = buildInsights();
  applyKpis(d.kpis);
  updateCharts(d);
  // 제품은 별도 주입/기존 로직 사용
}

/* ===== 간단 D-day ===== */
function startCountdown(days){
  const end = Date.now() + days*86400000;
  const el = document.getElementById("dday");
  if(!el) return;
  const tick = () => {
    const left = Math.max(0, end - Date.now());
    el.textContent = `D-${Math.ceil(left/86400000)}`;
    if (left>0) requestAnimationFrame(tick);
  };
  tick();
}

/* ===== 초기화 ===== */
document.addEventListener("DOMContentLoaded", async ()=>{
  startCountdown(7);
  bindFilters();
  await loadCsvCache();              // ← CSV 한번만 로딩
  const d = buildInsights();
  applyKpis(d.kpis);
  mountCharts(d);
  renderProducts([]);                // 제품은 서버/다른 JS에서 주입
});

/* ===== 외부에서 실데이터 주입하고 싶을 때(옵션) ===== */
window.renderInsights = function(payload){
  applyKpis(payload.kpis||{});
  updateCharts(payload);
  renderProducts(payload.products||[]);
};
