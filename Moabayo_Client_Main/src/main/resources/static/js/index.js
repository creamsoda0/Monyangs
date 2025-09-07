(() => {
  const KEY = "monyangs-theme";
  const body = document.body;
  const btn  = document.querySelector(".theme-toggle");
  const sky  = document.querySelector(".sky");

  if (!btn || !sky) {
    console.error("theme-toggle 또는 .sky 요소를 찾을 수 없습니다.");
    return;
  }

  /* ---------- ★ 별(상태/함수) : applyTheme 보다 위에 있어야 함 ---------- */
  const STAR_COUNT = 140;
  let starsSpawned = false;

  function startStars(){
    if (starsSpawned) return;
    starsSpawned = true;
    const frag = document.createDocumentFragment();
    for (let i=0; i<STAR_COUNT; i++){
      const s = document.createElement("div");
      s.className = Math.random() < 0.45 ? "star star--b" : "star";
      s.style.left = (Math.random()*100).toFixed(2) + "vw";
      s.style.top  = (Math.random()*60).toFixed(2) + "vh";
      s.style.setProperty("--dur", (2.2 + Math.random()*2.5).toFixed(2) + "s");
      frag.appendChild(s);
    }
    sky.appendChild(frag);
  }

  function clearStars(){
    starsSpawned = false;
    sky.querySelectorAll(".star").forEach(n => n.remove());
  }

  /* ---------- 유성 ---------- */
  let meteorTimer = null;

  function spawnMeteor(){
    const startXvw = 60 + Math.random()*40;  // 60~100vw
    const startYvh = Math.random()*30;       // 0~30vh
    const el = document.createElement("div");
    el.className = "meteor";
    el.style.setProperty("--x", startXvw + "vw");
    el.style.setProperty("--y", startYvh + "vh");
    el.style.setProperty("--dur", (0.9 + Math.random()*0.9).toFixed(2) + "s");
    sky.appendChild(el);
    el.addEventListener("animationend", () => el.remove(), { once:true });
  }

  function startMeteors(){
    if (meteorTimer) return;
    spawnMeteor();
    meteorTimer = setInterval(() => {
      spawnMeteor();
      if (Math.random() < 0.4) setTimeout(spawnMeteor, 600);
    }, 2500);
  }

  function stopMeteors(clearExisting){
    if (meteorTimer){ clearInterval(meteorTimer); meteorTimer = null; }
    if (clearExisting) sky.querySelectorAll(".meteor").forEach(n => n.remove());
  }

  /* ---------- 테마 적용 함수 ---------- */
  function applyTheme(mode){
    body.setAttribute("data-theme", mode);
    btn.setAttribute("aria-pressed", String(mode === "night"));
    localStorage.setItem(KEY, mode);
    if (mode === "night"){ startStars(); startMeteors(); }
    else { clearStars(); stopMeteors(true); }
  }

  /* ---------- 초기화 & 토글 ---------- */
  const saved = localStorage.getItem(KEY);
  applyTheme(saved === "night" || saved === "day"
    ? saved
    : (body.getAttribute("data-theme") || "day")
  );

  btn.addEventListener("click", () => {
    applyTheme(body.getAttribute("data-theme") === "night" ? "day" : "night");
  });
})();


// index.js (초기화 코드 어딘가에)
document.querySelector('.brand-badge')?.addEventListener('click', () => {
  // 필요에 맞게 경로 지정
  window.location.href = '/mainpage';          // 루트
  // window.location.href = '/index.html';
  // window.location.href = location.origin + '/monyangs/'; // 서브폴더 예시
});