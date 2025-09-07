(function() {
	function readCookie(name) {
		const cookies = document.cookie.split(";");
		for (let c of cookies) {
			const [k, v] = c.trim().split("=");
			if (k === name) return decodeURIComponent(v || "");
		}
		return null;
	}

	let timer = null;
	let expiredFired = false;

	function hide() {
		const box = document.getElementById("tokenBox");
		const remainTime = document.getElementById("remainTime");
		if (timer) clearInterval(timer);
		if (remainTime) remainTime.textContent = "-";
		if (box) box.style.display = "none";
	}

	function show() {
		const box = document.getElementById("tokenBox");
		if (box) box.style.display = "inline-block";
	}

	function fireExpiredOnce() {
		if (expiredFired) return;
		expiredFired = true;
		window.dispatchEvent(new Event("auth:expired"));
		if (typeof window.onTokenExpired === "function") {
			try { window.onTokenExpired(); } catch (e) { console.warn("[TTL] onTokenExpired error", e); }
		}
	}

	function runCountdown(expSec) {
		const remainTime = document.getElementById("remainTime");
		if (!remainTime) return;
		if (timer) clearInterval(timer);

		function tick() {
			const leftMs = expSec * 1000 - Date.now();
			if (leftMs <= 0) {
				hide();
				fireExpiredOnce();
				return;
			}
			const totalSeconds = Math.floor(leftMs / 1000);
			const m = Math.floor(totalSeconds / 60);
			const s = totalSeconds % 60;
			remainTime.textContent = `${m}:${s < 10 ? "0" + s : s}`;
		}

		expiredFired = false;
		show();
		tick();
		timer = setInterval(tick, 1000);
	}

	function startIfReady() {
		const box = document.getElementById("tokenBox");
		const remainTime = document.getElementById("remainTime");

		console.log("[TTL] tokenBox:", box, "remainTime:", remainTime);

		if (!box || !remainTime) {
			console.log("[TTL] header elements missing:", { box: !!box, remainTime: !!remainTime });
			return false;
		}

		const expStr = readCookie("EXP");
		const exp = expStr ? Number(expStr) : 0;
		console.log("[TTL] start → EXP cookie =", expStr, "→ expNum =", exp);

		if (!exp) {
			hide();
			return true;
		}

		runCountdown(exp);
		return true;
	}

	function waitForElementsAndStart() {
		if (startIfReady()) return;

		const mo = new MutationObserver(() => {
			if (startIfReady()) mo.disconnect();
		});

		mo.observe(document.body, { childList: true, subtree: true });
	}

	document.addEventListener("DOMContentLoaded", waitForElementsAndStart);
	window.addEventListener("pageshow", waitForElementsAndStart);
	window.addEventListener("auth:login", waitForElementsAndStart);
	window.addEventListener("auth:logout", () => {
		document.cookie = "EXP=; Path=/; Max-Age=0; SameSite=Lax";
		hide();
	});

	window.startTokenTimer = waitForElementsAndStart;
})();
