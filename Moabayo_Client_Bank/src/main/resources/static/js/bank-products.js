// ========= Elements
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

const grid = $('#grid');
const empty = $('#empty');
const q = $('#q'), typeSel = $('#typeSel'), catSel = $('#catSel'),
	minRate = $('#minRate'), maxRate = $('#maxRate'), sortSel = $('#sortSel'), resetBtn = $('#resetBtn');
const cmpBar = $('#compareBar'), cmpChips = $('#compareChips'), cmpModal = $('#compareModal'), cmpTbody = $('#compareTbody');
const statVisible = $('#stat-visible'), statAvg = $('#stat-avg'), statCats = $('#stat-cats');

// ========= Helpers
const normalize = s => (s || '').toString().toLowerCase();
const num = v => Number.isFinite(parseFloat(v)) ? parseFloat(v) : NaN;
function debounce(fn, ms) { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), ms); }; }

// ========= Stats
function refreshStats(visibleItems) {
	const items = visibleItems ?? $$('.card-wrap', grid).filter(el => !el.hidden);
	statVisible.textContent = String(items.length);
	const rates = items.map(el => num(el.dataset.rate)).filter(v => Number.isFinite(v));
	const avg = rates.length ? (rates.reduce((s, n) => s + n, 0) / rates.length) : NaN;
	statAvg.textContent = Number.isFinite(avg) ? `${avg.toFixed(2)}%` : '-';
	const cats = new Set(items.map(el => el.dataset.category).filter(Boolean));
	statCats.textContent = cats.size ? `${cats.size}종` : '-';
}

// ========= Category options (fill once if 서버 미제공)
function fillCategoryOptionsOnce() {
	if (catSel.dataset.filled === '1') return;
	const set = new Set();
	$$('.card-wrap', grid).forEach(el => { const c = (el.dataset.category || '').trim(); if (c) set.add(c); });
	if (!catSel.querySelector('[th\\:each]')) {
		[...set].sort().forEach(c => {
			const opt = document.createElement('option'); opt.value = c; opt.textContent = c; catSel.appendChild(opt);
		});
	}
	catSel.dataset.filled = '1';
}

// ========= Filter & Sort
function applyFilters() {
	const text = normalize(q.value), type = normalize(typeSel.value), cat = normalize(catSel.value);
	const min = num(minRate.value), max = num(maxRate.value);

	const list = $$('.card-wrap', grid);
	const visible = [];

	list.forEach(el => {
		const nm = normalize(el.dataset.name);
		const tp = normalize(el.dataset.type);
		const ct = normalize(el.dataset.category);
		const rate = num(el.dataset.rate);
		const body = el.textContent.toLowerCase(); // 설명/혜택 포함

		const matchQ = !text || nm.includes(text) || tp.includes(text) || ct.includes(text) || body.includes(text);
		const matchT = !type || tp === type;
		const matchC = !cat || ct === cat;
		const matchMin = !Number.isFinite(min) || (Number.isFinite(rate) && rate >= min);
		const matchMax = !Number.isFinite(max) || (Number.isFinite(rate) && rate <= max);

		const show = matchQ && matchT && matchC && matchMin && matchMax;
		el.hidden = !show;
		if (show) visible.push(el);
	});

	empty.hidden = visible.length !== 0;
	applySort(); // 보이는 것만 재배열
	refreshStats(visible.filter(el => !el.hidden));
}

function applySort() {
	const val = sortSel.value;
	if (val === 'default') return;
	const items = $$('.card-wrap', grid).filter(el => !el.hidden);

	const nameOf = el => (el.dataset.name || '').toLowerCase();
	const rateOf = el => { const v = parseFloat(el.dataset.rate); return Number.isFinite(v) ? v : -Infinity; };

	items.sort((a, b) => {
		if (val === 'name-asc') return nameOf(a) > nameOf(b) ? 1 : -1;
		if (val === 'name-desc') return nameOf(a) < nameOf(b) ? 1 : -1;
		if (val === 'rate-asc') return rateOf(a) - rateOf(b);
		if (val === 'rate-desc') return rateOf(b) - rateOf(a);
		return 0;
	});
	items.forEach(el => grid.appendChild(el));
}

// ========= Compare
const compare = new Map();      // key: id
const COMPARE_MAX = 6;

function toggleBar() { cmpBar.style.transform = compare.size ? 'translateY(0)' : 'translateY(100%)'; }

function addCompareFrom(el) {
	const wrap = el.closest('.card-wrap');
	const id = wrap.dataset.id || wrap.dataset.name; // accountId 우선
	const name = wrap.dataset.name;
	if (compare.has(id) || compare.size >= COMPARE_MAX) return;

	compare.set(id, {
		name, type: wrap.dataset.type, category: wrap.dataset.category, rate: wrap.dataset.rate
	});

	const chip = document.createElement('span');
	chip.className = 'chip badge rounded-pill text-bg-light border'; // 공용/간단 스타일
	chip.textContent = name; chip.dataset.key = id;
	chip.setAttribute('role', 'button'); chip.setAttribute('aria-label', `${name} 비교함에서 제거`);
	chip.onclick = () => { compare.delete(id); chip.remove(); toggleBar(); };
	cmpChips.appendChild(chip);
	toggleBar();
}

function openCompare() {
	cmpTbody.innerHTML = '';
	[...compare.values()].forEach(v => {
		const tr = document.createElement('tr');
		tr.innerHTML = `<td>${v.name}</td><td>${v.type}</td><td>${v.category}</td><td class="t-right">${parseFloat(v.rate || 0).toFixed(2)}%</td>`;
		cmpTbody.appendChild(tr);
	});
	cmpModal.hidden = false;
}
function closeCompare() { cmpModal.hidden = true; }
function clearCompare() { compare.clear(); cmpChips.innerHTML = ''; toggleBar(); }

// ========= Init
window.addEventListener('DOMContentLoaded', () => {
	// Controls
	q.addEventListener('input', debounce(applyFilters, 120));
	typeSel.addEventListener('change', applyFilters);
	catSel.addEventListener('change', applyFilters);
	minRate.addEventListener('input', debounce(applyFilters, 120));
	maxRate.addEventListener('input', debounce(applyFilters, 120));
	sortSel.addEventListener('change', applySort);
	resetBtn.addEventListener('click', () => {
		q.value = ''; typeSel.value = ''; catSel.value = ''; minRate.value = ''; maxRate.value = ''; sortSel.value = 'default';
		applyFilters();
	});

	grid.addEventListener('click', e => {
		const act = e.target.closest('[data-act]')?.dataset.act;
		if (act === 'compare') addCompareFrom(e.target);
	});

	$('.compare').addEventListener('click', e => {
		const act = e.target.closest('[data-act]')?.dataset.act;
		if (act === 'clear') clearCompare();
		if (act === 'open') openCompare();
	});
	cmpModal.addEventListener('click', e => {
		const act = e.target.closest('[data-act]')?.dataset.act;
		if (act === 'close') closeCompare();
	});

	// 초기 세팅
	fillCategoryOptionsOnce();
	applyFilters();
});


