// /js/mypagesections/index.js
const ROUTES = new Set(['mypage','bank','cards','security', 'settings']);
const TITLE  = { mypage:'마이페이지', bank:'모으냥은행', cards:'카드', security:'보안', settings: '설정' };
const rootOf = (name) => document.querySelector(`#mainSections .section-view[data-section="${name}"]`);

const rendered = new Set(); // 섹션 최초 렌더 여부

const V='?v=20250813'; // 캐시 버스터 (원하면 삭제 가능)
const loaders = {
  bank:     () => import('./bank.js'+V).then(m=>m.renderBank()),
  cards:    () => import('./cards.js'+V).then(m=>m.renderCards()),
  security: () => import('./security.js'+V).then(m=>m.renderSecurity()),
  settings: () => import('./settings.js'+V).then(m=>m.renderSettings(rootOf('settings'))), // ✅ root 전달
};

const $ = (q, r=document)=>r.querySelector(q);
const $$=(q, r=document)=>Array.from(r.querySelectorAll(q));

function getRouteFromHash(){
  const h = (location.hash || '#/mypage').replace(/^#\//,'').trim();
  return ROUTES.has(h) ? h : 'mypage';
}

function toggleSidebarActive(route){
  $$('#sidebar .side-menu.top li').forEach(li=>{
    const a = $('a[href^="#/"]', li);
    const r = a ? a.getAttribute('href').replace(/^#\//,'') : '';
    li.classList.toggle('active', r === route);
  });
}

function toggleViews(route){
  const overview = $('.table-data.layout-3col'); // 개요
  const stack    = $('#mainSections');           // 섹션 스택
  if (!overview || !stack) return console.warn('[router] container missing');

  const isOverview = (route === 'mypage');
  overview.classList.toggle('hide', !isOverview);
  stack.classList.toggle('active', !isOverview);

  $$('#mainSections .section-view').forEach(v=>{
    v.classList.toggle('active', v.dataset.section === route);
  });

  // 제목/브레드크럼
  const t = TITLE[route] || TITLE.mypage;
  const pageTitle = $('#pageTitle'); if (pageTitle) pageTitle.textContent = t;
  const bcActive  = $('#breadcrumb a.active');
  if (bcActive){ bcActive.textContent = t; bcActive.setAttribute('href', `#/${route}`); }

  toggleSidebarActive(route);
}

async function ensureRendered(route){
  if (route === 'mypage') return;
  if (rendered.has(route)) return;
  if (!loaders[route]) return;
  await loaders[route]();
  rendered.add(route);
}

async function applyRoute(){
  const route = getRouteFromHash();
  toggleViews(route);
  await ensureRendered(route);
}

function interceptRouterLinks(e){
  const a = e.target.closest('a[href^="#/"]');
  if (!a) return;
  const target = a.getAttribute('href').replace(/^#\//,'');
  if (!ROUTES.has(target)) return; // help/settings/logout 등은 통과
  e.preventDefault();
  if (getRouteFromHash() !== target) location.hash = `#/${target}`;
}

function wireLogout(e){
  const a = e.target.closest('a[href="#/logout"]');
  if (!a) return;
  e.preventDefault();
  if (window.App?.logout) return void window.App.logout();
  if (window.doLogout)    return void window.doLogout();
  alert('로그아웃 되었습니다.');
  // location.href = '/logout';
}

window.addEventListener('DOMContentLoaded', ()=>{
  document.addEventListener('click', interceptRouterLinks);
  document.addEventListener('click', wireLogout);
  applyRoute();
});
window.addEventListener('hashchange', applyRoute);
