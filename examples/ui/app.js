const el = (id) => document.getElementById(id);
const show = (id) => el(id).classList.remove('hidden');
const hide = (id) => el(id).classList.add('hidden');
const setMsg = (txt) => { el('message').textContent = txt; };

const saveToken = (t, email) => { localStorage.setItem('ak_token', t); localStorage.setItem('ak_email', email); };
const clearToken = () => { localStorage.removeItem('ak_token'); localStorage.removeItem('ak_email'); };
const getToken = () => localStorage.getItem('ak_token');

// UI wiring
el('show-login').addEventListener('click', () => { el('show-login').classList.add('active'); el('show-register').classList.remove('active'); show('login-form'); hide('register-form'); setMsg(''); });
el('show-register').addEventListener('click', () => { el('show-register').classList.add('active'); el('show-login').classList.remove('active'); show('register-form'); hide('login-form'); setMsg(''); });

// Register
el('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = el('reg-email').value.trim();
  const password = el('reg-password').value;
  try {
    setMsg('Registering...');
    const res = await fetch(`${BACKEND_URL}/auth/register`, {
      method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    saveToken(data.token, data.user.email);
    setMsg('Registered — logged in');
    showDashboard();
  } catch (err) { setMsg(err.message); }
});

// Login
el('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = el('login-email').value.trim();
  const password = el('login-password').value;
  try {
    setMsg('Logging in...');
    const res = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    saveToken(data.token, data.user.email);
    setMsg('Login successful');
    showDashboard();
  } catch (err) { setMsg(err.message); }
});

el('btn-logout').addEventListener('click', () => { clearToken(); hide('dashboard'); show('auth'); setMsg('Logged out'); });
el('btn-refresh').addEventListener('click', fetchKeys);

async function fetchKeys() {
  try {
    setMsg('Loading keys...');
    const token = getToken();
    if (!token) throw new Error('Not authenticated');
    const res = await fetch(`${BACKEND_URL}/api/keys`, { headers: { 'Authorization': `Bearer ${token}` } });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load keys');
    const list = el('keys-list'); list.innerHTML = '';
    data.keys.forEach(k => {
      const li = document.createElement('li');
      li.textContent = `${k.name} — ${k.key}`;
      list.appendChild(li);
    });
    setMsg(`Loaded ${data.count} keys`);
  } catch (err) { setMsg(err.message); }
}

function showDashboard() {
  hide('auth'); show('dashboard'); el('user-email').textContent = localStorage.getItem('ak_email') || '';
  fetchKeys();
}

// Auto-login if token present
if (getToken()) showDashboard();
