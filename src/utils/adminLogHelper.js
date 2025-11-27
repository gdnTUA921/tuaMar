// Shared helper to record admin activity from the frontend.
// Tries server endpoint first (REACT_APP_LAPTOP_IP/recordAdminLog.php). If that fails,
// it appends entries to localStorage under 'adminLogs'.

export async function logAdminActivity(activity) {
  const datetime = new Date().toISOString();
  let clientIp = '';
  try {
    const resp = await fetch('https://api.ipify.org?format=json');
    if (resp.ok) {
      const j = await resp.json();
      clientIp = j.ip || '';
    }
  } catch (e) {
    // best-effort only — ignore failures
  }

  // attempt to read session from the same backend used across app
  let admin_id = 'unknown';
  let email = '';
  try {
    const ip = process.env.REACT_APP_LAPTOP_IP;
    if (ip) {
      const sessionResp = await fetch(`${ip}/fetchSession.php`, { credentials: 'include' });
      if (sessionResp.ok) {
        const sessionJson = await sessionResp.json();
        admin_id = sessionJson.admin_id || sessionJson.id || admin_id;
        email = sessionJson.email || '';
      }
    }
  } catch (e) {
    // ignore session fetch error
  }

  const entry = { datetime, admin_id: admin_id || email || 'unknown', activity, ip_address: clientIp };

  // Attempt server-side write first
  try {
    const ip = process.env.REACT_APP_LAPTOP_IP;
    if (ip) {
      await fetch(`${ip}/recordAdminLog.php`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
      return;
    }
  } catch (e) {
    // ignore server write error and fall back to local storage
  }

  // Fallback to localStorage
  try {
    const raw = localStorage.getItem('adminLogs');
    const arr = raw ? JSON.parse(raw) : [];
    arr.push(entry);
    localStorage.setItem('adminLogs', JSON.stringify(arr));
  } catch (e) {
    console.error('Failed to write admin log to localStorage', e);
  }
}
