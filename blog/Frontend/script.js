// Config — ajuste FRONTEND_URL e API_URL conforme seu ambiente
const API_BASE = 'http://localhost:4000'; // Ajuste se seu backend rodar em outra porta
const LOGIN_URL = `${API_BASE}/api/login`;
const REFRESH_URL = `${API_BASE}/api/refresh`;
const LOGOUT_URL = `${API_BASE}/api/logout`;
const COMMENTS_URL = `${API_BASE}/api/comments`;

// UI elements
const loginSection = document.getElementById('login-section');
const appSection = document.getElementById('app-section');
const loginForm = document.getElementById('login-form');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const loginMsg = document.getElementById('login-msg');
const logoutBtn = document.getElementById('logout-btn');
const userInfo = document.getElementById('user-info');
const commentForm = document.getElementById('comment-form');
const commentText = document.getElementById('comment-text');
const commentsList = document.getElementById('comments-list');

// O token de acesso (Access Token) é mantido em memória (mais seguro que localStorage)
let accessToken = null;
let currentUser = null;

function showMessage(el, text, isError = true) {
  el.textContent = text;
  el.classList.toggle('error', isError);
  setTimeout(() => { if (el.textContent === text) el.textContent = ''; }, 5000);
}

// Pequena função para decodificar JWT (apenas para ler claims como 'sub' e 'exp')
function parseJwt(token){
  try{
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c=> '%'+('00'+c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    return JSON.parse(jsonPayload);
  }catch(e){ return null; }
}

// Wrapper fetch que anexa Authorization quando temos accessToken
async function apiFetch(input, init = {}, allowRetry = true) {
  init.headers = init.headers || {};
  if (!init.credentials) init.credentials = 'include'; [cite_start]// Envia cookies httpOnly (Refresh Token) [cite: 583]

  if (accessToken) {
    init.headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const res = await fetch(input, init);

  if (res.status === 401 && allowRetry) {
    // Tenta refresh uma vez
    const ok = await tryRefresh();
    if (ok) return apiFetch(input, init, false); // Se o refresh funcionar, repete a chamada API
  }
  return res;
}

// Função que usa o Refresh Token do cookie para obter um novo Access Token
async function tryRefresh(){
  try{
    const res = await fetch(REFRESH_URL, { method: 'POST', credentials: 'include' });
    if (!res.ok) return false;
    
    const data = await res.json();
    if (data && data.accessToken) {
      accessToken = data.accessToken;
      const payload = parseJwt(accessToken);
      currentUser = payload ? payload.sub : null;
      updateUIForAuth();
      return true;
    }
  }catch(e){ console.error('Refresh failed', e); }
  return false;
}

function updateUIForAuth(){
  if (accessToken){
    loginSection.style.display = 'none';
    appSection.style.display = 'block';
    const payload = parseJwt(accessToken) || {};
    userInfo.textContent = `Usuário: ${payload.sub || 'desconhecido'} ${payload.roles ? `| papéis: ${payload.roles.join(',')}` : ''}`;
    loadComments().catch(err => console.error(err));
  } else {
    loginSection.style.display = 'block';
    appSection.style.display = 'none';
    userInfo.textContent = '';
  }
}

// Login
loginForm.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const email = loginEmail.value.trim();
  const password = loginPassword.value;
  try{
    const res = await fetch(LOGIN_URL, {
      method: 'POST',
      credentials: 'include', // Necessário para aceitar o cookie httpOnly
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      if (res.status === 401) showMessage(loginMsg, 'Credenciais inválidas', true);
      else showMessage(loginMsg, 'Erro no servidor', true);
      return;
    }
    const data = await res.json();
    accessToken = data.accessToken;
    updateUIForAuth();
    loginForm.reset();
  }catch(err){
    console.error(err);
    showMessage(loginMsg, 'Erro de rede', true);
  }
});

// Logout
logoutBtn.addEventListener('click', async () => {
  try{
    [cite_start]// Chama o endpoint para revogar o Refresh Token no servidor [cite: 368]
    await fetch(LOGOUT_URL, { method: 'POST', credentials: 'include' });
  }catch(e){ console.error('Logout error', e); }
  
  accessToken = null;
  currentUser = null;
  updateUIForAuth();
});

// Comments
commentForm.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const text = commentText.value.trim();
  if (!text) return;
  try{
    const res = await apiFetch(COMMENTS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    if (res.ok) {
      commentText.value = '';
      await loadComments();
    } else if (res.status === 401) {
      showMessage(loginMsg, 'Sessão inválida. Faça login novamente.', true);
    } else {
      showMessage(loginMsg, 'Erro ao enviar comentário.', true);
    }
  }catch(err){ console.error(err); showMessage(loginMsg, 'Erro de rede', true); }
});

async function loadComments(){
  try{
    const res = await apiFetch(COMMENTS_URL, { method: 'GET' });
    if (!res.ok) {
      if (res.status === 401) {
        accessToken = null;
        updateUIForAuth();
      }
      return;
    }
    const data = await res.json();
    commentsList.innerHTML = ''; [cite_start]// Não é a prática ideal [cite: 625]

    data.comments.forEach(c => {
      const d = document.createElement('div');
      d.className = 'comment';
      const who = document.createElement('div'); who.className = 'small'; who.textContent = `por: ${c.user}`;
      const body = document.createElement('div'); body.textContent = c.text; // Usando textContent para segurança XSS [cite: 365]
      d.appendChild(who); d.appendChild(body);
      commentsList.appendChild(d);
    });
  }catch(e){ console.error('loadComments', e); }
}

// Ao carregar, tenta usar o cookie Refresh Token para obter um Access Token
(async function init(){
  const ok = await tryRefresh();
  updateUIForAuth();
})();