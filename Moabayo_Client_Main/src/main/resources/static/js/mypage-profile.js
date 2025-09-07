// /js/mypage-profile.js

// --- 주소 검색(카카오/다음 우편번호) ---
function openPostcode() {
  new daum.Postcode({
    oncomplete: function(data) {
      // 1) 우편번호
      const zonecode = data.zonecode; // 5자리
      // 2) 기본 주소(도로명 우선, 없으면 지번)
      const addr = data.roadAddress && data.roadAddress.trim().length > 0
        ? data.roadAddress
        : data.jibunAddress;

      // 3) 법정동/건물명 보조 정보(선택)
      // const bname = data.bname;         // 법정동/법정리
      // const buildingName = data.buildingName; // 건물명

      document.getElementById('pf-zip').value = zonecode || '';
      document.getElementById('pf-addr').value = addr || '';

      // 상세주소로 포커스 이동
      const detail = document.getElementById('pf-addrDetail');
      if (detail) detail.focus();
    },
    // 사용성 옵션(선택): 도로명/지번 탭 Default 등
    // theme: { searchBgColor: "#f3f4f6" } // 색상 커스텀 가능
  }).open();
}

window.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btnAddrSearch');
  if (btn) btn.addEventListener('click', openPostcode);
});



// 1) 프로필 불러와서 value/placeholder 채우기
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/profile', {
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error('profile fetch failed');
    const p = await res.json(); // {name, phone, email, addr}

    const $ = sel => document.querySelector(sel);
    $('#pf-name').value  = p.name  ?? '';
    $('#pf-phone').value = p.phone ?? '';
    $('#pf-email').value = p.email ?? '';
    $('#pf-addr').value  = p.addr  ?? '';
	$('#pf-zip').value   = p.zipcode ?? '';  

    // 요청하신 대로 placeholder에도 동일 값 노출을 원하시면 아래 주석 해제
    // $('#pf-name').placeholder  = p.name  ?? $('#pf-name').placeholder;
    // $('#pf-phone').placeholder = p.phone ?? $('#pf-phone').placeholder;
    // $('#pf-email').placeholder = p.email ?? $('#pf-email').placeholder;
    // $('#pf-addr').placeholder  = p.addr  ?? $('#pf-addr').placeholder;
	const baseAddr   = document.getElementById('pf-addr').value.trim();
	const detailAddr = document.getElementById('pf-addrDetail').value.trim();
	const zip        = document.getElementById('pf-zip').value.trim();
	const mergedAddr = zip ? `[${zip}] ${baseAddr}${detailAddr ? ' ' + detailAddr : ''}`
	                       : `${baseAddr}${detailAddr ? ' ' + detailAddr : ''}`;
  } catch (e) {
    console.error(e);
  }
});

// 2) 저장(수정) 요청: 비번 일치 검사 후 전송
document.getElementById('formProfile').addEventListener('submit', async (e) => {
  e.preventDefault();
  const $ = sel => document.querySelector(sel);


  const body = {
    name:  $('#pf-name').value.trim(),
    phone: $('#pf-phone').value.trim(),
    email: $('#pf-email').value.trim(),
	address:        $('#pf-addr').value.trim(),
	addressDetail:  $('#pf-addrDetail').value.trim(),  // ★ 분리
	zipcode:            $('#pf-zip').value.trim(),         // ★ 분리
    newPw: $('#pf-newPw').value,
    newPwConfirm: $('#pf-newPwConfirm').value
  };

  try {
    const res = await fetch('/profile', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      // 서버 에러 메시지 있으면 표시
      let msg = `save failed: ${res.status}`;
      try { const err = await res.json(); if (err?.message) msg = err.message; } catch {}
      alert(msg);
      return;
    }

    const ok = await res.json(); // {success:true}
    if (ok.success) {
      alert('저장되었습니다.');
      $('#pf-newPw').value = '';
      $('#pf-newPwConfirm').value = '';
    } else {
      alert(ok.message || '저장 중 오류가 발생했습니다.');
    }
  } catch (err) {
    console.error(err);
    alert('네트워크 오류가 발생했습니다.');
  }
});


