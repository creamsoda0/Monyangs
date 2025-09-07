// ===== Dynamic Accent from Image (safe fallback) =====
(function(){
  const img = document.getElementById('cardImg');
  if(!img) return;

  const setAccent = (r,g,b) => {
    // to HSL for better gradients
    const rgb2hsl = (r,g,b)=>{
      r/=255; g/=255; b/=255;
      const max=Math.max(r,g,b), min=Math.min(r,g,b);
      let h,s,l=(max+min)/2;
      if(max===min){ h=s=0; }
      else{
        const d=max-min;
        s = l>0.5 ? d/(2-max-min) : d/(max+min);
        switch(max){
          case r: h=(g-b)/d + (g<b?6:0); break;
          case g: h=(b-r)/d + 2; break;
          case b: h=(r-g)/d + 4; break;
        }
        h/=6;
      }
      return [Math.round(h*360), Math.round(s*100), Math.round(l*100)];
    };

    const [h,s,l] = rgb2hsl(r,g,b);
    const accent = `hsl(${h} ${Math.min(68, s+6)}% ${Math.min(54, l+4)}%)`;
    const bg1 = `hsl(${h} ${Math.max(20, s-30)}% ${Math.max(10, l-20)}%)`;
    const bg2 = `hsl(${(h+12)%360} ${Math.max(24, s-18)}% ${Math.max(14, l-12)}%)`;

    document.documentElement.style.setProperty('--accent', accent);
    document.documentElement.style.setProperty('--bg1', bg1);
    document.documentElement.style.setProperty('--bg2', bg2);

    // browser UI color
    const meta = document.querySelector('meta[name="theme-color"]');
    if(meta) meta.setAttribute('content', bg1);
  };

  const computeAccent = () => {
    try{
      const c = document.createElement('canvas');
      const w = c.width = 48, h = c.height = 30;
      const ctx = c.getContext('2d', { willReadFrequently:true });
      ctx.drawImage(img, 0, 0, w, h);
      const { data } = ctx.getImageData(0,0,w,h);

      let r=0,g=0,b=0,count=0;
      for(let i=0;i<data.length;i+=4){
        const R=data[i], G=data[i+1], B=data[i+2], A=data[i+3];
        // skip near-white/near-black/transparent to reduce noise
        const lum = 0.2126*R + 0.7152*G + 0.0722*B;
        if(A<200) continue;
        if(lum<20 || lum>240) continue;
        r+=R; g+=G; b+=B; count++;
      }
      if(count<5) throw new Error('not enough samples');
      setAccent( (r/count)|0, (g/count)|0, (b/count)|0 );
    }catch(e){
      // Fallback (keeps CSS defaults)
      // console.warn('Accent compute failed:', e);
    }
  };

  if(img.complete) computeAccent();
  else img.addEventListener('load', computeAccent);

  // simple tilt effect
  const stage = document.getElementById('cardStage');
  if(stage){
    stage.addEventListener('mousemove', (e)=>{
      const rect = stage.getBoundingClientRect();
      const dx = (e.clientX - rect.left) / rect.width - .5;
      const dy = (e.clientY - rect.top) / rect.height - .5;
      stage.style.transform = `perspective(1200px) rotateX(${dy*-6}deg) rotateY(${dx*6}deg)`;
    });
    stage.addEventListener('mouseleave', ()=>{
      stage.style.transform = 'perspective(1200px) rotateX(0) rotateY(0)';
    });
  }

  // CTA
  document.getElementById('applyBtn')?.addEventListener('click', ()=>{
    alert('발급 프로세스로 이동합니다. (라우팅 연결 예정)');
	window.location.href = "/usercard/register";   // 컨트롤러 매핑 URL
  });
  document.getElementById('shareBtn')?.addEventListener('click', async ()=>{
    const url = location.href;
    try{
      if(navigator.share){
        await navigator.share({ title: document.title, url });
      }else{
        await navigator.clipboard.writeText(url);
        alert('링크를 클립보드에 복사했어요.');
      }
    }catch(_){}
  });
})();
