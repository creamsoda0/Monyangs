// 로그인 페이지로 접근하기 전에 사용자가 원래 가고자 했던 URL을 sessionStorage에 저장
if (document.referrer && !sessionStorage.getItem("redirectUrl") && !location.href.includes("login")) {
	sessionStorage.setItem("redirectUrl", document.referrer);
}

// 쿠키에서 특정 이름의 값 가져오기
function getCookie(name) {
	const cookies = document.cookie.split("; ");
	for (const c of cookies) {
		const [key, value] = c.split("=");
		if (key === name) return decodeURIComponent(value);
	}
	return null;
}

// 로그인 이후 사용자 정보 활용 예시
const userName = getCookie("USER_NAME");
const isLoggedIn = getCookie("LOGGED_IN") === "true";

if (isLoggedIn && userName) {
	console.log(`✅ 로그인 상태: ${userName}님`);
	const welcomeMessageElement = document.getElementById("welcomeMessage");
	if (welcomeMessageElement) {
		welcomeMessageElement.textContent = `${userName}님 환영합니다!`;
	}
} else {
	console.log("❌ 로그인되어 있지 않음");
}

// 로그인 폼 제출
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
	e.preventDefault();

	const id = document.getElementById("username").value;
	const pw = document.getElementById("password").value;

	try {
		const response = await fetch("http://localhost:8811/user/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ id, pw }),
			credentials: "include"  // ✅ 쿠키 포함
		});

		if (!response.ok) {
			const errorText = await response.text();
			alert("❌ 로그인 실패: " + errorText);
			return;
		}

		const user = await response.json();

		// 서버가 HttpOnly 쿠키로 ACCESS_TOKEN을 내려주므로 프론트는 토큰을 직접 다루지 않음.
		const accessToken = getCookie("ACCESS_TOKEN");  // 쿠키에서 토큰 가져오기

		// 토큰 만료 시간 받아오기 (예시로 ACCESS_TOKEN이 포함된 만료시간을 얻을 수 있는 경우)
		const expirationTimeInSeconds = user.token_expiration; // 만약 서버에서 제공하는 토큰 만료시간이 있다면

		if (expirationTimeInSeconds) {
			startTokenTimer(expirationTimeInSeconds);
		}

		// 서버에게 로그인 상태 최종 확인 (예: /jwt/check 같은 API 호출)
		const meResponse = await fetch("/jwt/check", { credentials: "include" });
		if (!meResponse.ok) {
			alert("⚠️ 서버 세션 확인 실패");
			return;
		}
		const me = await meResponse.json();

		alert(`✅ 로그인 성공! 환영합니다 ${me.name || me.id}님`);

		// 드롭다운 메뉴 업데이트
		updateDropdownMenu();

		// 원래 가려던 곳 이동
		const redirectUrl = sessionStorage.getItem("redirectUrl") || "/mainpage";
		sessionStorage.removeItem("redirectUrl");
		location.href = redirectUrl;

	} catch (err) {
		console.error("🚨 로그인 요청 실패:", err);
		alert("⚠️ 서버에 연결할 수 없습니다.");
	}
});
