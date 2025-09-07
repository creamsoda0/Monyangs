window.addEventListener('DOMContentLoaded', () => {
	// Header 불러오기
	fetch('header.html')
		.then(response => response.text())
		.then(data => {
			document.getElementById('header').innerHTML = data;
		})
		.catch(err => console.error('헤더 로드 실패:', err));

	// Footer 불러오기
	fetch('footer.html')
		.then(response => response.text())
		.then(data => {
			document.getElementById('footer').innerHTML = data;
		})
		.catch(err => console.error('풋터 로드 실패:', err));
});