(function(){
  // 색상(테마 변수 읽기)
  function cssVar(name){ return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
  const COL = {
    line: cssVar('--line') || '#e5e7eb',
    sub:  cssVar('--sub')  || '#6b7280',
    brand: cssVar('--brand') || '#7c3aed',
    ink:  cssVar('--ink')  || '#111827'
  };

  // ===== 1) 링 게이지 세팅 =====
  function setRingProgress(el, pct, caption){
    const bar = el.querySelector('.bar');
    const num = el.querySelector('.num');
    const cap = el.querySelector('.ring-sub');
    const CIRC = 2 * Math.PI * 52; // r=52
    const off = CIRC * (100 - pct) / 100;
    bar.style.strokeDasharray = CIRC;
    bar.style.strokeDashoffset = off;
    num.textContent = Math.round(pct);
    if(caption) cap.textContent = caption;
  }

  // ===== 2) Chart.js 미니 차트들 =====
  function mkChart(ctx, cfg){ return new Chart(ctx, cfg); }
  // 공통 미니 차트 옵션 (교체)
  // 공통 미니 차트 옵션
  function miniOpts(){
    return {
      plugins:{ legend:{display:false}, tooltip:{enabled:false} },
      responsive:true, maintainAspectRatio:false,
      layout:{ padding:{ top:8, right:8, bottom:8, left:8 } },   // ✅ 캔버스 안쪽 여백
      scales:{
        x:{ grid:{display:false}, ticks:{display:false} },
        y:{ grid:{display:false}, ticks:{display:false}, beginAtZero:true }
      },
      elements:{ line:{ borderWidth:2, tension:.35 }, point:{ radius:0 } },
      clip:false
    };
  }


  document.addEventListener('DOMContentLoaded', ()=>{
    // 보유 카드: 링(결제일까지 62% 진행)
    const ring = document.querySelector('.ring');
    if(ring) setRingProgress(ring, 62, '결제일 D-7');

    // 카탈로그: 카테고리별 상품 수 (모형)
    const barCtx = document.getElementById('barCatalog');
    if(barCtx){
      mkChart(barCtx, {
        type:'bar',
        data:{ labels:['외식','교통','구독','해외','편의점','주유'],
          datasets:[{ data:[32,18,14,10,22,12], borderRadius:6, backgroundColor:COL.brand }] },
        options: miniOpts()
      });
    }

    // 추천: 적합도 도넛
    const fitCtx = document.getElementById('donutFit');
    if(fitCtx){
      const score = 84;
	  // 도넛 생성 부분만 cutout 키우기 (텍스트와 간섭 줄이기)
	  mkChart(fitCtx, {
	    type:'doughnut',
	    data:{ labels:['적합도','나머지'],
	      datasets:[{ data:[score,100-score], cutout:'76%',   // ← 기존 70% → 76%
	        backgroundColor:[COL.brand,'rgba(128,128,128,.18)'], borderWidth:0 }]},
	    options:{ plugins:{legend:{display:false}, tooltip:{enabled:false}},
	              responsive:true, maintainAspectRatio:false }
	  });
      document.getElementById('fitScore').textContent = score;
    }

    // 혜택 캘린더: 7일 강도 바
    const calCtx = document.getElementById('barCalendar');
    if(calCtx){
      mkChart(calCtx, {
        type:'bar',
        data:{ labels:['월','화','수','목','금','토','일'], datasets:[{ data:[2,3,1,4,6,5,2], borderRadius:6, backgroundColor:COL.brand }]},
        options: miniOpts()
      });
    }

    // 포인트: 스파크라인 + 숫자 카운트업
    const sparkCtx = document.getElementById('sparkPoints');
    if(sparkCtx){
      mkChart(sparkCtx, {
        type:'line',
        data:{ labels:new Array(14).fill(0).map((_,i)=>i+1),
          datasets:[{ data:[200,240,220,260,280,340,320,360,420,430,460,520,510,540],
            borderWidth:2, fill:false, tension:.35, pointRadius:0, borderColor:COL.brand }]},
        options: miniOpts()
      });
    }
    countUp(document.getElementById('pointNow'), 13420, 600);

    // 보유/결제일 목업 데이터
    setOwned({count:2, nextBilling:"9/28(토)"});
  });

  // 숫자 카운트업
  function countUp(el, target, dur=500){
    if(!el) return;
    const start = performance.now(), from = 0;
    function step(ts){
      const p = Math.min(1, (ts-start)/dur);
      el.textContent = Math.round(from + (target-from)*p).toLocaleString();
      if(p<1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  // 보유/결제일 반영
  function setOwned({count=0, nextBilling='–'}={}){
    const b1 = document.getElementById('ownedCountBadge');
    const b2 = document.getElementById('ownedCount');
    const nb = document.getElementById('nextBilling');
    if(b1) b1.textContent = `${count}장`;
    if(b2) b2.textContent = `${count}장`;
    if(nb) nb.textContent = nextBilling;
  }
})();


