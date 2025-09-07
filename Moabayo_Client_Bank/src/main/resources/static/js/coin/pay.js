// /js/pay.js
(function () {
  const cfg = document.getElementById('ny-pay-config');

  const READY_API  = cfg?.dataset.ready   ?? '/bank/ready-api';
  const AMOUNT     = Number(cfg?.dataset.amount ?? 0);
  const AUTOSTART  = (cfg?.dataset.autostart ?? 'true') !== 'false';

  const csrf = document.querySelector('input[name="_csrf"]')?.value;

  const $spinner = document.querySelector('[data-step="spinner"]');
  const $error   = document.querySelector('[data-step="error"]');
  const $retry   = document.getElementById('ny-pay-retry');

  function showError(msg) {
    if ($error) {
      $error.textContent = msg;
      $error.hidden = false;
    } else {
      alert(msg);
    }
  }

  async function callReady(amount) {
    try {
      if ($spinner) $spinner.classList.add('is-anim');

      const body = new URLSearchParams({ amount: String(amount) });

      const res = await fetch(READY_API, {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/x-www-form-urlencoded; charset=UTF-8',
          ...(csrf ? { 'X-CSRF-TOKEN': csrf } : {}),
        },
        body: body.toString(),
        credentials: 'same-origin',
      });

      if (!res.ok) {
        throw new Error(`ready ${res.status}`);
      }

      const data = await res.json(); // { redirectUrl, tid }
      if (!data?.redirectUrl) {
        throw new Error('redirectUrl이 응답에 없습니다.');
      }

      // 카카오(or 스텁)로 이동
      window.location.href = data.redirectUrl;
    } catch (e) {
      console.error(e);
      showError(
        '연결에 실패했습니다. 네트워크 상태를 확인한 뒤 다시 시도해 주세요.\n' +
        (e?.message ?? e)
      );
      if ($spinner) $spinner.classList.remove('is-anim');
    }
  }

  // 외부에서 수동 호출할 수도 있게 네임스페이스로 노출
  window.nyPay = {
    start: () => callReady(AMOUNT),
    retry: () => callReady(AMOUNT),
  };

  if ($retry) $retry.addEventListener('click', () => window.nyPay.retry());
  if (AUTOSTART) {
    // 로딩 표시 150~300ms 후 시작하면 UX가 부드러움
    setTimeout(() => window.nyPay.start(), 150);
  }
})();
