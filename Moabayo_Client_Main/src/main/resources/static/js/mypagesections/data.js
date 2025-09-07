// /js/mypagesections/data.js

// ==== 더미 데이터 (원하면 API로 교체) ====
const bankData = {
  savings: [
    { name:'냥복리 적금', rate: 3.2, balance: 2200000, maturity:'2026-02-01', status:'정상' },
    { name:'단기 목표 적금', rate: 2.4, balance:  840000, maturity:'2025-12-15', status:'정상' },
  ],
  invest: [
    { symbol:'MOONY', eval: 1850000, pnl: 120000, roi: 6.94 },
    { symbol:'CATX',  eval: 920000,  pnl: -38000, roi:-3.97 },
  ],
  accounts: [
    { alias:'월급통장', no:'273-111-6789', balance: 3520450, status:'정상' },
    { alias:'생활비',   no:'273-333-0101', balance:  820000, status:'정상' },
    { alias:'비상금',   no:'273-555-7777', balance: 1200000, status:'출금제한' },
  ],
};

const myCards = [
  { name:'모으냥즈 체크', brand:'VISA',   desc:'생활 할인형', last4:'1234', tags:['생활','편의점','대중교통'] },
  { name:'모으냥즈 플래티넘', brand:'Master', desc:'해외 적합',   last4:'5678', tags:['해외','항공','라운지'] },
];

const spendThisMonth = 812000; // 이번달 사용액(원)

const recoCards = [
  { name:'냥청년 청년카드', brand:'VISA',  desc:'청년 특화 최대 5%', tags:['통신','온라인쇼핑','카페'] },
  { name:'모으냥 프라임',  brand:'AMEX',  desc:'외식/배달 10% 적립', tags:['외식','배달','OTT'] },
];

// ==== fetch 래퍼 (나중에 API로 교체) ====
export async function fetchBankData(){ return bankData; }
export async function fetchMyCards(){ return myCards; }
export async function fetchSpendThisMonth(){ return spendThisMonth; }
export async function fetchRecommendedCards(){ return recoCards; }

// 간단한 혜택 추정기 (룰 없이 일단 1.5% 가정)
export function estimateBenefit(spend, rate = 0.015, cap = 50000){
  const est = Math.min(Math.round(spend * rate), cap);
  return { est, cap, ratio: Math.min(est / cap, 1) };
}
