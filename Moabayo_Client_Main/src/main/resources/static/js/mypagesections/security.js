// /js/mypagesections/security.js

export async function renderSecurity(){
  const logins = [
    { time:'2025-08-13 14:22', ip:'203.0.113.8', ua:'Chrome • Windows', status:'성공' },
    { time:'2025-08-12 21:07', ip:'203.0.113.44', ua:'iOS App',         status:'성공' },
    { time:'2025-08-11 08:58', ip:'198.51.100.2', ua:'Safari • macOS',  status:'차단' },
  ];
  const devices = [
    { name:'iPhone 15',     agent:'iOS App',        since:'2025-03-02' },
    { name:'Work Laptop',   agent:'Chrome • Win11', since:'2024-11-15' },
  ];

  const tb1 = document.querySelector('#tbl-logins tbody');
  if (tb1) tb1.innerHTML = logins.map(x=>`
    <tr>
      <td>${x.time}</td>
      <td>${x.ip}</td>
      <td>${x.ua}</td>
      <td><span class="badge ${x.status==='성공'?'up':'down'}">${x.status}</span></td>
    </tr>
  `).join('');

  const tb2 = document.querySelector('#tbl-devices tbody');
  if (tb2) tb2.innerHTML = devices.map(d=>`
    <tr>
      <td>${d.name}</td>
      <td>${d.agent}</td>
      <td>${d.since}</td>
      <td><button class="btn ghost">해지</button></td>
    </tr>
  `).join('');
}
