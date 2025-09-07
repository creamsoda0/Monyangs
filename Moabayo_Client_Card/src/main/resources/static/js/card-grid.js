(function(){
  // 페이지 이동
  function go(code){
    const map = {
      'N07-01' : '/usercard/mycard',
      'N08-01' : '/card/newcard.html',
      'N09-01' : '/usercard/recommend'
    };
    const page = map[code];
    if(!page){ alert('연결할 페이지가 정의되지 않았습니다.'); return; }
    location.href = new URL(page, location.href).toString();
  }

  document.addEventListener("DOMContentLoaded", ()=>{
    // 타일 내부 버튼 라우팅
    document.querySelectorAll("[data-go]").forEach(b=>{
      b.addEventListener("click", ()=> go(b.getAttribute("data-go")));
    });

    // 목업 데이터 (실연동 시 교체)
    setOwnedInfo({ count:2, nextBilling:"9/28(토)" });
    setPoints({ now: 13420 });
  });

  function setOwnedInfo({count=0, nextBilling="–"}={}){
    const $ = s => document.getElementById(s);
    $("ownedCount") && ($("ownedCount").textContent = `${count}장`);
    $("nextBilling") && ($("nextBilling").textContent = nextBilling);
  }
  function setPoints({now=0}={}){
    const el = document.getElementById("pointNow");
    if(el) el.textContent = now.toLocaleString();
  }
})();
