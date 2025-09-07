// /js/mypagesections/bank.js
import { fmtMoney } from '/js/mypage-core.js';
import { fetchBankData } from './data.js';

export async function renderBank(){
  const elSavings   = document.getElementById('bk-sum-savings');
  const elInvest    = document.getElementById('bk-sum-invest');
  const elAccCount  = document.getElementById('bk-acc-count');

  const data = await fetchBankData();

  const sumSavings = data.savings.reduce((s,x)=>s + (x.balance||0),0);
  const sumInvest  = data.invest.reduce((s,x)=>s + (x.eval||0),0);
  const accCount   = data.accounts.length;

  if (elSavings)  elSavings.textContent = fmtMoney(sumSavings);
  if (elInvest)   elInvest.textContent  = fmtMoney(sumInvest);
  if (elAccCount) elAccCount.textContent = accCount;

  // 적금
  const tb1 = document.querySelector('#tbl-savings tbody');
  if (tb1) tb1.innerHTML = data.savings.map(s=>`
    <tr>
      <td>${s.name}</td>
      <td class="right">${s.rate.toFixed(2)}%</td>
      <td class="right">${fmtMoney(s.balance)}</td>
      <td>${s.maturity}</td>
      <td><span class="badge">${s.status}</span></td>
    </tr>
  `).join('');

  // 투자
  const tb2 = document.querySelector('#tbl-invest tbody');
  if (tb2) tb2.innerHTML = data.invest.map(i=>`
    <tr>
      <td>${i.symbol}</td>
      <td class="right">${fmtMoney(i.eval)}</td>
      <td class="right"><span class="badge ${i.pnl>=0?'up':'down'}">${i.pnl>=0?'+':''}${fmtMoney(i.pnl)}</span></td>
      <td class="right">${i.roi>=0?'+':''}${i.roi.toFixed(2)}%</td>
    </tr>
  `).join('');

  // 계좌
  const tb3 = document.querySelector('#tbl-bank-accounts tbody');
  if (tb3) tb3.innerHTML = data.accounts.map(a=>`
    <tr>
      <td>${a.alias}</td>
      <td>${a.no}</td>
      <td class="right">${fmtMoney(a.balance)}</td>
      <td><span class="badge">${a.status}</span></td>
    </tr>
  `).join('');
}
