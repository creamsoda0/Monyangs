async function goToCardService() {
	// 1) 세션 확인 (쿠키 자동 전송)
	try {
		const res = await fetch("http://localhost:8812/jwt/verify", {
			method: "GET",
			credentials: "include" // ❗쿠키 동반 필수
		});


		const text = await res.text().catch(() => "(no body)");
		console.log("[verify] status:", res.status, "body:", text);





	/*	// cardservice.js
		document.addEventListener('DOMContentLoaded', () => {
			// 로그인 세션 기반: 백엔드가 세션에서 userId 추출함
			fetch('/api/cards/summary')
				.then(res => {
					if (!res.ok) throw new Error("로그인 필요");
					return res.json();
				})
				.then(data => {
					// KPI 데이터 반영
					document.getElementById('kpiCards').textContent = `${data.ownedCount}장`;
					document.getElementById('kpiSpend').textContent = `₩ ${Number(data.totalSpend).toLocaleString()}`;
					document.getElementById('kpiReward').textContent = `₩ ${Number(data.expectedReward).toLocaleString()}`;
					document.getElementById('kpiAlerts').textContent = `${data.alertsCount}건`;

					// 추가 정보 예시 (링 게이지 %)
					const ring = document.querySelector('.ring');
					const ringLabel = document.getElementById('ringPct');
					const ringCaption = document.getElementById('ringCaption');
					const dday = data.daysUntilBilling;

					ring.setAttribute('data-progress', 100 - dday * 3); // 30일 기준 예시
					ringLabel.textContent = `${100 - dday * 3}`;
					ringCaption.textContent = `결제일 D-${dday}`;
					document.getElementById('nextBilling').textContent = `D-${dday}`;
				})
				.catch(err => {
					console.warn("세션 없음 또는 오류:", err.message);
				});
		});*/

		if (res.ok) {
			// 2) 인증 성공 → 은행 서비스로 이동
			window.location.href = "http://localhost:8814/usercard/cardList";
		} else {
			throw new Error("인증 실패");
		}
	} catch (err) {
		console.error("❌ 인증 에러:", err);
		alert("인증되지않았습니다. 다시 로그인해주세요.");
		window.location.href = "http://localhost:8812/loginpage";
	}
}
