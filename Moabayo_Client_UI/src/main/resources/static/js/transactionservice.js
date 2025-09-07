function goToTransactions() {
	const token = localStorage.getItem('token');

	if (!token) {
		alert("로그인이 필요합니다.");
		window.location.href = "http://localhost:8812/loginpage";
		return;
	}

	// ✅ 카드 인증 요청
	fetch("http://localhost:8812/jwt/verify", {
		method: "GET",
		headers: {
			"Authorization": token
		}
	})
		.then(res => {
			console.log(res);
			if (res.ok) {
				// ✅ 인증 성공 시 브라우저 이동 (진짜 이동)
				const cardUrl = `http://localhost:8813/bank/verify?token=${encodeURIComponent(token)}`;
				window.location.href = cardUrl;
			} else {
				throw new Error("인증 실패");
			}
		})
		/*		.then(html => {
					document.open();
					document.write(html);
					document.close();
				})*/
		.catch(err => {
			console.error("❌ 인증 에러:", err);
			alert("인증되지 않았습니다. 다시 로그인해주세요.");
			window.location.href = "http://localhost:8812/loginpage";
		});
}