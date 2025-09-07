// 페이지가 로드되면 헤더, 푸터 로드 및 초기화
window.addEventListener("DOMContentLoaded", () => {
	// HEADER 로드
	fetch("http://localhost:8810/fragments/header.html")
		.then((res) => res.text())
		.then((data) => {
			const header = document.getElementById("header");
			if (!header) return; // header 요소 없으면 중단

			header.innerHTML = data;

			updateDropdownMenu(); // 로그인 상태에 따라 드롭다운 메뉴 업데이트

			// 토큰 타이머 시작 시도 (token-exp-display.js가 제공)
			if (window.startTokenTimer) {
				try {
					window.startTokenTimer();
				} catch (e) {
					console.warn("[JWT] startTokenTimer 실행 중 오류:", e);
				}
			} else {
				console.warn("[JWT] startTokenTimer를 찾지 못했습니다. token-exp-display.js 로드 순서 확인 필요");
			}

			// 로그인 상태에 맞는 메뉴 생성
			const userName = localStorage.getItem("userName");
			const authSection = document.getElementById("authSection");
			const token = getCookie("token");

			if (authSection) {
				if (userName) {
					// 로그인 상태일 때 메뉴 표시
					authSection.innerHTML = `
            <span class="welcome-message">${userName} 님</span>
            ${createRotatingMenu([
						{ icon: "fa-sign-out-alt", label: "로그아웃", href: "#", id: "logoutBtn" },
						{ icon: "fa-user-circle", label: "마이페이지", href: "http://localhost:8812/mypage" },
					])}
          `;

					// 로그아웃 버튼 클릭 시 이벤트 처리
					const logoutBtn = document.getElementById("logoutBtn");
					if (logoutBtn) {
						logoutBtn.addEventListener("click", (e) => {
							e.preventDefault();
							logout();
						});
					}
				} else {
					// 비로그인 상태일 때 메뉴 표시
					authSection.innerHTML = createRotatingMenu([
						{ icon: "fa-user-plus", label: "회원가입", href: "http://localhost:8812/registerpage" },
						{ icon: "fa-sign-in-alt", label: "로그인", href: "http://localhost:8812/loginpage" },
					]);
				}
			}
		});

	// FOOTER 로드
	fetch("http://localhost:8810/fragments/footer.html")
		.then((res) => res.text())
		.then((data) => {
			const footer = document.getElementById("footer");
			if (!footer) {
				console.warn("⚠️ footer 요소가 없어서 스킵합니다.");
				return;
			}
			footer.innerHTML = data;
		});

	// 드롭다운 닫기 (외부 클릭 시)
	document.addEventListener("click", (event) => {
		const profile = document.querySelector(".profile-dropdown");
		if (profile && !profile.contains(event.target)) {
			const dropdown = document.getElementById("dropdownMenu");
			if (dropdown) dropdown.style.display = "none";
		}
	});
});

// 다른 탭에서 로그인/로그아웃 시 토큰 타이머 갱신 (선택)
window.addEventListener("storage", (e) => {
	if (e.key === "token" && window.startTokenTimer) {
		window.startTokenTimer();
	}
});

// 전역 네비게이션 이동 함수
const goTo = (url) => {
	window.location.href = url;
};
window.goToMainService = () => goTo("http://localhost:8812/mainpage");
window.goToBankService = () => goTo("/bank");
window.goToCardService = () => goTo("/cards");
window.goToTransactions = () => goTo("/accounts");
window.goAdmin = () => goTo("/support");
window.goToTransactions = () => goTo("http://localhost:8812/transactions");

// 로그인 여부만 확인하는 API (현재는 안 쓰면 지워도 됨)
async function checkLogin() {
	try {
		const res = await fetch("http://localhost:8812/jwt/check", {
			method: "GET",
			credentials: "include",
		});
		if (!res.ok) return null;
		return await res.json(); // { id, name, role, profileImg? } (서버가 주는 경우에만)
	} catch (err) {
		console.error("❌ 로그인 체크 실패:", err);
		return null;
	}
}
// 로그인 후 EXP 쿠키 설정
function onLoginSuccess(jwtPayloadExp) {
	// jwtPayloadExp: JWT 토큰 만료 시간 (예: UNIX timestamp 초 단위)

	const nowSec = Math.floor(Date.now() / 1000);
	const secondsUntilExpire = jwtPayloadExp - nowSec;

	if (secondsUntilExpire > 0) {
		// EXP 쿠키를 초 단위 만료 시간으로 설정
		document.cookie = `EXP=${jwtPayloadExp}; path=/; max-age=${secondsUntilExpire}; SameSite=Lax`;
		console.log("[common.js] EXP 쿠키 설정:", jwtPayloadExp);

		// 타이머 시작 호출
		if (window.startTokenTimer) window.startTokenTimer();
	} else {
		console.warn("[common.js] 만료 시간이 현재보다 이전입니다.");
	}
}

// 로그인 시 EXP 쿠키 설정
function login() {
	const expirationTime = 3600; // 예시: 1시간
	setExpCookie(expirationTime);  // 로그인 후 EXP 쿠키 설정
	console.log("[JWT] startTokenTimer 호출");
	window.startTokenTimer(); // 타이머 시작
}

// 메뉴 토글
function toggleMenu() {
	const menu = document.getElementById("menu");
	if (menu) menu.classList.toggle("active");
}

// 사용자 이름 표시 (단순 표시용)
function showUserName() {
	const userName = localStorage.getItem("userName") || localStorage.getItem("userId") || "사용자";
	const userNameDisplay = document.getElementById("userNameDisplay");
	if (userNameDisplay) userNameDisplay.textContent = userName + "님";
}

// 드롭다운 메뉴 토글
function toggleDropdown() {
	const menu = document.getElementById("dropdownMenu");
	if (menu) {
		menu.style.display = menu.style.display === "block" ? "none" : "block";
	}
}

// 쿠키 읽기(필요시)
function getCookie(name) {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) {
		return parts.pop().split(";").shift();
	}
	return null;
}

// 드롭다운 UI 업데이트 (수정본)
async function updateDropdownMenu() {
	const loggedInEl = document.querySelector(".logged-in");
	const loggedOutEl = document.querySelector(".logged-out");
	const userNameDisplay = document.getElementById("userNameDisplay");
	const defaultProfileIcon = document.getElementById("defaultProfileIcon");
	const userProfileImage = document.getElementById("userProfileImage");

	// 쿠키에서 사용자 이름과 프로필 이미지를 가져옵니다.
	const userName = getCookie("USER_NAME") || getCookie("USER_ID") || ""; // 쿠키에서 USER_NAME이나 USER_ID 가져오기
	const profileImgUrl = getCookie("PROFILE_IMG") || ""; // 프로필 이미지 URL

	if (userName) {
		console.log(`Hello, ${userName}님`);  // 로그인 상태 출력
	} else {
		console.log("로그인 필요"); // 로그인 안 되어 있을 경우 출력
	}

	const isLoggedIn = !!userName; // 로그인 여부 확인

	if (isLoggedIn) {
		if (loggedInEl) loggedInEl.style.display = "block";
		if (loggedOutEl) loggedOutEl.style.display = "none";
		if (userNameDisplay) userNameDisplay.textContent = `${userName} 님`;

		if (profileImgUrl && userProfileImage && defaultProfileIcon) {
			userProfileImage.src = profileImgUrl;
			userProfileImage.style.display = "inline-block";
			defaultProfileIcon.style.display = "none";
		} else if (defaultProfileIcon && userProfileImage) {
			defaultProfileIcon.style.display = "inline-block";
			userProfileImage.style.display = "none";
		}

		// 로그인 후 토큰 타이머 시작
		if (window.startTokenTimer) {
			console.log("[JWT] startTokenTimer 호출");
			try {
				window.startTokenTimer(); // 토큰 타이머 시작
			} catch (e) {
				console.warn("[JWT] startTokenTimer 실행 중 오류:", e);
			}
		} else {
			console.warn("[JWT] startTokenTimer를 찾을 수 없습니다. 확인이 필요합니다.");
		}
	} else {
		if (loggedInEl) loggedInEl.style.display = "none";
		if (loggedOutEl) loggedOutEl.style.display = "block";
		if (userNameDisplay) userNameDisplay.textContent = "로그인이 필요합니다";
		if (defaultProfileIcon) defaultProfileIcon.style.display = "inline-block";
		if (userProfileImage) userProfileImage.style.display = "none";
	}
}

// 로그아웃 처리
function logout() {
	// 1) 쿠키 삭제
	document.cookie = "ACCESS_TOKEN=; Path=/; Max-Age=0; SameSite=Lax";
	document.cookie = "REFRESH_TOKEN=; Path=/; Max-Age=0; SameSite=Lax";
	document.cookie = "USER_NAME=; Path=/; Max-Age=0; SameSite=Lax";
	document.cookie = "LOGGED_IN=; Path=/; Max-Age=0; SameSite=Lax";
	document.cookie = "PROFILE_IMG=; Path=/; Max-Age=0; SameSite=Lax";
	document.cookie = "EXP=; Path=/; Max-Age=0; SameSite=Lax";

	fetch("http://localhost:8812/user/logout", {
		method: "POST",
		credentials: "include",
	}).catch((err) => console.warn("서버 로그아웃 요청 실패:", err));

	// 4) 안내 및 이동
	alert("로그아웃 되었습니다.");
	location.href = "http://localhost:8812/mainpage";
}

/* =========================
   🔔 토큰 만료 자동 로그아웃 훅
   ========================= */
let hasLoggedOut = false;
// 만료되면 자동 로그아웃: 쿠키/로컬스토리지 정리 + 서버 로그아웃 + 이동
window.onTokenExpired = async function() {
	if (hasLoggedOut) return;
	hasLoggedOut = true;
	console.log("onTokenExpired 실행됨", new Error().stack);
	try {
		// 표시용 EXP 쿠키 제거
		document.cookie = "ACCESS_TOKEN=; Path=/; Max-Age=0; SameSite=Lax";
		document.cookie = "REFRESH_TOKEN=; Path=/; Max-Age=0; SameSite=Lax";
		document.cookie = "USER_NAME=; Path=/; Max-Age=0; SameSite=Lax";
		document.cookie = "LOGGED_IN=; Path=/; Max-Age=0; SameSite=Lax";
		document.cookie = "PROFILE_IMG=; Path=/; Max-Age=0; SameSite=Lax";
		document.cookie = "EXP=; Path=/; Max-Age=0; SameSite=Lax";
		// 서버 세션 정리 (있는 경우)
		await fetch("http://localhost:8812/user/logout", {
			method: "POST",
			credentials: "include",
		}).catch(() => { });
		// 타이머 쪽에 알림
		window.dispatchEvent(new Event("auth:logout"));
	} finally {
		alert("세션이 만료되었습니다. 다시 로그인 해주세요.");
		location.href = "http://localhost:8812/mainpage";
	}
};

// token-exp-display.js가 발행하는 만료 이벤트를 수신
window.addEventListener("auth:expired", window.onTokenExpired);

// 메뉴 생성 함수 (로그인 상태에 따라 다르게 생성)
function createRotatingMenu(items) {
	return `
    <div class="menu" id="menu">
      <div class="btn trigger" onclick="toggleMenu()">
        <span class="line"></span>
      </div>
      <div class="icons">
        ${items
			.map(
				(item) => `
          <div class="rotater">
            <div class="btn btn-icon">
              <a href="${item.href}" ${item.id ? `id="${item.id}"` : ""} style="color:inherit; text-decoration:none;">
                <i class="fa ${item.icon}"></i>${item.label}
              </a>
            </div>
          </div>`
			)
			.join("")}
      </div>
    </div>
  `;
}
