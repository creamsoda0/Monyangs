// /js/mypagesections/cards.js
import { fmtMoney } from '/js/mypage-core.js';
import {
  fetchMyCards, fetchSpendThisMonth, fetchRecommendedCards, estimateBenefit
} from './data.js';

export async function renderCards(){
  const [mine, spend, reco] = await Promise.all([
    fetchMyCards(), fetchSpendThisMonth(), fetchRecommendedCards()
  ]);

  // 혜택 요약
  const { est, cap, ratio } = estimateBenefit(spend);
  const elSpend = document.getElementById('benefit-spend');
  const elEst   = document.getElementById('benefit-est');
  const elBar   = document.getElementById('benefit-bar');
  if (elSpend) elSpend.textContent = fmtMoney(spend);
  if (elEst)   elEst.textContent   = `${fmtMoney(est)} (캡 ${fmtMoney(cap)})`;
  if (elBar)   elBar.style.width   = `${Math.round(ratio*100)}%`;

  // 내 카드
  const myGrid = document.getElementById('my-card-grid');
  if (myGrid) myGrid.innerHTML = mine.map(c=>`
    <div class="card-tile-lite">
      <div class="logo">${c.brand.slice(0,1)}</div>
      <div class="meta">
        <div class="name">${c.name} • **** ${c.last4}</div>
        <div class="desc">${c.brand} · ${c.desc}</div>
        <div class="tags">${(c.tags||[]).map(t=>`<span class="tag">${t}</span>`).join('')}</div>
      </div>
      <div class="actions">
        <button class="btn ghost"><i class='bx bx-detail'></i> 상세</button>
      </div>
    </div>
  `).join('');

  // 추천 카드
  const recoGrid = document.getElementById('reco-card-grid');
  if (recoGrid) recoGrid.innerHTML = reco.map(c=>`
    <div class="card-tile-lite">
      <div class="logo">${c.brand.slice(0,1)}</div>
      <div class="meta">
        <div class="name">${c.name}</div>
        <div class="desc">${c.brand} · ${c.desc}</div>
        <div class="tags">${(c.tags||[]).map(t=>`<span class="tag">${t}</span>`).join('')}</div>
        <div class="progress" style="margin-top:6px"><div class="bar" style="width:${40 + Math.round(Math.random()*50)}%"></div></div>
      </div>
      <div class="actions">
        <button class="btn primary"><i class='bx bxs-like'></i> 발급 안내</button>
      </div>
    </div>
  `).join('');
}
