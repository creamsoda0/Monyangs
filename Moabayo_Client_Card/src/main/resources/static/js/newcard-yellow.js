/**
 * newcard-yellow.js
 * - 카드 면 이미지(URL: window.CARD_ART_URL)를 SVG <image.card-art>에 주입
 * - 카드 연출(인트로 애니메이션 / 패럴랙스 / 유광 스트립)
 * - 설정값(크기/회전/확대/이동)은 아래 상수로 조정
 */

/* ==================== 설정 ==================== */
/** 카드 전체 스케일 (0.8 ~ 1.0 권장) */
const CARD_SCALE   = 0.85;
/** 세로 사진이면 true → 90도 회전 */
const ROTATE_ART   = false;
/** 카드 면 이미지 최소 확대 (1.06 ~ 1.12 권장) */
const ART_SCALE    = 1.08;
/** 카드 면 이미지 미세 위치 조정(X,Y) */
const ART_SHIFT_X  = 0;
const ART_SHIFT_Y  = 0.5;
/** 마우스 패럴랙스 효과 On/Off */
const SHOW_PARALLAX = true;
/** 유광 스트립 애니메이션 On/Off */
const SHOW_SHEEN    = true;

/* ==================== 실행부 ==================== */
(function init() {
  // 필수 요소 참조
  const artImg   = document.querySelector('.card-art');   // 카드 이미지(<image>)
  const artInner = document.getElementById('artInner');   // 카드 이미지 변형 그룹

  // 카드 중심 좌표 (이미지 transform 기준점)
  const cx = 170, cy = 270;

  // 0) 전역 변수로 넘어온 카드 이미지 URL 확인
  if (!window.CARD_ART_URL) {
    console.error('[newcard] CARD_ART_URL 비어있음. placeholder로 대체합니다.');
    window.CARD_ART_URL = '/images/placeholder-card.png';
  }

  // 1) 이미지 주입 + cover(꽉 채움)
  //    SVG <image>에 외부 URL 주입. preserveAspectRatio='xMidYMid slice'로 cover처럼 동작.
  artImg.setAttribute('xlink:href', window.CARD_ART_URL);
  artImg.setAttribute('preserveAspectRatio', 'xMidYMid slice');

  // 2) 회전/확대/이동 (카드 중앙(cx,cy) 기준 변형)
  //    순서: (필요시)회전 → (미세이동) → 중심으로 이동 → 스케일 → 원위치
  let t = '';
  if (ROTATE_ART) t += `rotate(90 ${cx} ${cy}) `;
  t += `translate(${ART_SHIFT_X} ${ART_SHIFT_Y}) translate(${cx} ${cy}) scale(${ART_SCALE}) translate(${-cx} ${-cy})`;
  artInner.setAttribute('transform', t);

  // 3) GSAP 인트로 & 배치
  const tl = gsap.timeline()
    // 텍스트/칩 기본 위치 세팅
    .set('.numTxt',  { x:22,  y:375 })
    .set('.nameTxt', { x:22,  y:410 })
    .set('.chip',    { x:148, y:66  })
    // 메인 그룹을 화면 정중앙으로
    .add(centerMain(), 0.05)
    // 배경 볼륨 등장
    .from('.ball',   { duration:1.2, transformOrigin:'50% 50%', scale:0.9, opacity:0.6, ease:'power2.out', stagger:0.1 }, 0)
    // 카드 등장 모션
    .fromTo('.card',
      { x:200, y:40, rotation:-4, skewX:10, skewY:4, scale:2, opacity:0 },
      { duration:1.1, skewX:0, skewY:0, scale: CARD_SCALE, opacity:1, ease:'power4.inOut' },
      0.1
    );

  // 화면 중앙 배치 함수 (윈도우 리사이즈 대응)
  function centerMain(){
    gsap.set('.main', { x:'50%', xPercent:-50, y:'50%', yPercent:-50 });
  }
  addEventListener('resize', centerMain);
  centerMain();

  // 4) 패럴랙스 & 유광 효과
  if (SHOW_PARALLAX) {
    addEventListener('mousemove', e => {
      const p = { x: e.clientX / innerWidth, y: e.clientY / innerHeight };
      gsap.to('.card', { rotation: -7 + 9*p.x, duration:.45, overwrite:'auto' });
      gsap.to('.bg',   { x:100-200*p.x, y:20-40*p.y, duration:.45, overwrite:'auto' });
    });
  }

  if (SHOW_SHEEN) {
    // 유광 스트립 초기/재생
    gsap.set('.sheen', { display:'block', x:-360, opacity:0 });
    gsap.to('.sheen',  { x:540, opacity:.6, duration:1.2, ease:'power2.out', delay:.6 });
  }
})();
