document.addEventListener("DOMContentLoaded", () => {
	const progressBar = document.getElementById("progress-bar");
	const progressText = document.getElementById("progress-text");

	let progress = 0;

	const interval = setInterval(() => {
		if (progress >= 100) {
			clearInterval(interval);
			// ✅ 메인 페이지로 자동 이동
			window.location.href = "http://localhost:8812/mainpage";
		} else {
			progress += 2;
			progressBar.style.width = `${progress}%`;
			progressText.textContent = `${progress}%`;
		}
	}, 50); // 약 2.5초 만에 완료
});