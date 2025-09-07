// D-Day 표시 (7일 기준)
function startCountdown(days){
  const el = document.getElementById("dday");
  const end = Date.now() + days*24*60*60*1000;
  (function tick(){
    const remain = Math.max(0, end - Date.now());
    el.textContent = `D-${Math.ceil(remain / (24*60*60*1000))}`;
    if(remain>0) requestAnimationFrame(tick);
  })();
}

// 페이지 이동 맵
function go(code){
  const map = {
    'N07-01' : '/usercard/allcardList',
    'N08-01' : '/card/newcard.html',
    'N09-01' : '/card/writecard.html'
  };
  const page = map[code];
  if(!page){ alert('연결할 페이지가 정의되지 않았습니다.'); return; }
  location.href = new URL(page, location.href).toString();
}

document.addEventListener("DOMContentLoaded", () => {
  startCountdown(7);

  // 타일 클릭/키보드 접근성
  document.querySelectorAll(".c-tile").forEach(tile=>{
    tile.addEventListener("click", ()=> go(tile.dataset.code));
    tile.addEventListener("keydown", (e)=>{
      if(e.key === "Enter" || e.key === " ") { e.preventDefault(); go(tile.dataset.code); }
    });
  });

  // KPI 목업 (실데이터 연동 시 setKpis 사용)
  setKpis({ cards: 2, spend: 482000, reward: 12500, alerts: 1 });
});

// 실데이터 주입용
function setKpis({cards=0, spend=0, reward=0, alerts=0}={}){
  const won = n => "₩ " + Math.round(n).toLocaleString();
  const el = id => document.getElementById(id);
  el("kpiCards").textContent = `${cards}장`;
  el("kpiSpend").textContent = won(spend);
  el("kpiReward").textContent = won(reward);
  el("kpiAlerts").textContent = `${alerts}건`;
}

// 외부에서 사용 가능하도록
window.cardLanding = { setKpis, go };

function startCountdown(days){
  const el = document.getElementById("dday");
  const end = Date.now() + days*24*60*60*1000;
  (function tick(){
    const remain = Math.max(0, end - Date.now());
    el.textContent = `D-${Math.ceil(remain / (24*60*60*1000))}`;
    if(remain>0) requestAnimationFrame(tick);
  })();
}
function go(code){
  const map = {
    'N07-01' : '/usercard/allcardList',
    'N08-01' : '/card/newcard.html',
    'N09-01' : '/card/writecard.html'
  };
  const page = map[code];
  if(!page){ alert('연결할 페이지가 정의되지 않았습니다.'); return; }
  location.href = new URL(page, location.href).toString();
}
document.addEventListener("DOMContentLoaded", () => {
  startCountdown(7);
  document.querySelectorAll(".c-tile").forEach(tile=>{
    tile.addEventListener("click", (e)=>{
      // 타일 배경 클릭 시만 이동(내부 버튼 클릭은 아래 핸들러가 처리)
      if(e.target.closest("[data-go]")) return;
      go(tile.dataset.code);
    });
    tile.addEventListener("keydown", (e)=>{
      if(e.key === "Enter" || e.key === " ") { e.preventDefault(); go(tile.dataset.code); }
    });
  });
  // 타일 내부 '바로가기' 버튼
  document.querySelectorAll("[data-go]").forEach(btn=>{
    btn.addEventListener("click", ()=> go(btn.getAttribute("data-go")));
  });
  // KPI 목업
  setKpis({ cards: 2, spend: 482000, reward: 12500, alerts: 1 });
});
function setKpis({cards=0, spend=0, reward=0, alerts=0}={}){
  const won = n => "₩ " + Math.round(n).toLocaleString();
  const el = id => document.getElementById(id);
  el("kpiCards").textContent = `${cards}장`;
  el("kpiSpend").textContent = won(spend);
  el("kpiReward").textContent = won(reward);
  el("kpiAlerts").textContent = `${alerts}건`;
}
window.cardLanding = { setKpis, go };

