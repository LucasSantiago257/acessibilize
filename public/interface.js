// Conta e preferências da interface.
paths.user = '<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>';
paths.menu = '<path d="M4 6h16M4 12h16M4 18h16"/>';
paths.panel = '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16m6-11-3 3 3 3"/>';
let currentUser = null, afterLogin = null;
function setCurrentUser(user) {
  currentUser = user;
  const button = $('#loginBtn');
  button.innerHTML = icon('user') + `<span>${user ? esc(user.name) : 'Entrar'}</span>`;
  button.title = user ? `Conta: ${user.name}` : 'Entrar';
  button.setAttribute('aria-label', user ? `Conta de ${user.name}` : 'Entrar');
}
function openLogin(next = null) {
  afterLogin = next;
  if (currentUser) {
    showModal(`<h2>Olá, ${esc(currentUser.name)}.</h2><p>Você pode cadastrar locais e publicar avaliações com a sua conta.</p><p id="sessionError" class="form-error" role="alert" hidden></p><button class="secondary" id="logoutBtn">Sair</button>`, 'SUA CONTA');
    $('#logoutBtn').onclick = async () => {
      const button = $('#logoutBtn'); button.disabled = true;
      try {
        const response = await fetch('/api/session', { method: 'DELETE', signal: AbortSignal.timeout(15000) });
        if (!response.ok) throw Error('Não foi possível sair. Tente novamente.');
        setCurrentUser(null); communitySignedIn = false; afterLogin = null;
        $('#modal').close(); toast('Você saiu da sua conta.');
      } catch (error) { $('#sessionError').textContent = error.message; $('#sessionError').hidden = false; button.disabled = false; }
    };
    return;
  }
  showModal(`<h2>Entre para contribuir.</h2><p>O mapa está aberto para consulta. Para cadastrar um local ou avaliar, entre na sua conta.</p><form id="demoLoginForm" class="login-form"><label class="form-field">Usuário<input name="username" autocomplete="username" required maxlength="50" value="${esc(read('az-last-username', ''))}" placeholder="Seu usuário" autocapitalize="none" spellcheck="false"></label><label class="form-field">Senha<input name="password" type="password" autocomplete="current-password" required maxlength="128" placeholder="Sua senha"></label><p id="sessionError" class="form-error" role="alert" hidden></p><button class="primary" type="submit">${icon('user')}Entrar</button></form>`, 'ENTRAR NO ACESSIBILIZE');
  $('#demoLoginForm').onsubmit = async event => {
    event.preventDefault();
    const form = new FormData(event.target); const username = String(form.get('username')).trim(); const password = String(form.get('password'));
    const button = event.target.querySelector('[type=submit]'); button.disabled = true; button.textContent = 'Entrando…';
    try {
      const response = await fetch('/api/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }), signal: AbortSignal.timeout(15000) });
      const data = await response.json();
      if (!response.ok) throw Error(data.error || 'Não foi possível entrar.');
      communitySignedIn = true; setCurrentUser(data.user); write('az-alias', data.user.name); write('az-last-username', data.user.username);
      const nextAction = afterLogin; afterLogin = null;
      $('#modal').close(); await loadCommunity();
      toast(`Bem-vindo, ${data.user.name}!`);
      if (nextAction) nextAction();
    } catch (error) { $('#sessionError').textContent = error.name === 'TimeoutError' ? 'A conexão demorou. Tente novamente.' : error.message; $('#sessionError').hidden = false; button.disabled = false; button.innerHTML = icon('user') + 'Entrar'; }
  };
}
$('#loginBtn').onclick = () => openLogin();
$('#sidebarAddBtn').onclick = () => communityAddPlace();
$('#sidebarReadingBtn').onclick = () => $('#accessibilityBtn').click();
setCurrentUser(null);

const panelMedia = matchMedia('(max-width: 760px)');
let desktopCollapsed = read('az-sidebar-collapsed', false) === true;
function setPanelOpen(open, save = true) {
  const panel = $('#sidebarPanel');
  panel.hidden = !open; panel.inert = !open;
  document.body.classList.toggle('sidebar-collapsed', !open);
  document.body.classList.toggle('map-open', panelMedia.matches && !open);
  const button = $('#sidebarToggle');
  button.innerHTML = icon(open ? 'panel' : 'menu');
  button.setAttribute('aria-expanded', String(open));
  button.setAttribute('aria-label', open ? 'Recolher menu lateral' : 'Abrir menu lateral');
  button.title = open ? 'Recolher menu lateral' : 'Abrir menu lateral';
  $('#toggleMap').innerHTML = icon(open ? 'map' : 'list') + (open ? 'Ver mapa' : 'Ver lista');
  if (!panelMedia.matches && save) { desktopCollapsed = !open; write('az-sidebar-collapsed', !open); }
  requestAnimationFrame(() => { if (map) map.invalidateSize(); });
}
$('#sidebarToggle').onclick = () => setPanelOpen($('#sidebarPanel').hidden);
$('#toggleMap').onclick = () => setPanelOpen($('#sidebarPanel').hidden);
panelMedia.addEventListener('change', () => setPanelOpen(panelMedia.matches || !desktopCollapsed, false));
setPanelOpen(panelMedia.matches || !desktopCollapsed, false);

let dismissedNotices;
try { dismissedNotices = JSON.parse(sessionStorage.getItem('az-dismissed-notices') || '[]'); } catch { dismissedNotices = []; }
if (!Array.isArray(dismissedNotices)) dismissedNotices = [];
function updateDismissedNotices() {
  document.querySelectorAll('[data-notice]').forEach(element => { element.hidden = dismissedNotices.includes(element.dataset.notice); });
  $('#restoreNotices').hidden = dismissedNotices.length === 0;
}
document.querySelectorAll('[data-dismiss-notice]').forEach(button => button.onclick = () => {
  const target = button.closest('[data-notice]');
  dismissedNotices = [...new Set([...dismissedNotices, target.dataset.notice])];
  try { sessionStorage.setItem('az-dismissed-notices', JSON.stringify(dismissedNotices)); } catch {}
  updateDismissedNotices();
  ($('#sidebarPanel').hidden ? $('#sidebarToggle') : $('#restoreNotices')).focus({ preventScroll: true });
});
$('#restoreNotices').onclick = () => {
  dismissedNotices = [];
  try { sessionStorage.removeItem('az-dismissed-notices'); } catch {}
  updateDismissedNotices();
  $('#sidebarToggle').focus({ preventScroll: true });
};
updateDismissedNotices();
$('#closeMapError').onclick = () => {
  $('#mapError').dataset.dismissed = 'true';
  $('#mapError').hidden = true;
  $('#sidebarToggle').focus({ preventScroll: true });
};
// Toasts mantêm a mensagem acessível e permitem fechamento imediato.
toast = function(message) {
  const box = $('#toast');
  box.innerHTML = `<span>${esc(message)}</span><button class="toast-close" type="button" aria-label="Fechar notificação">${icon('close')}</button>`;
  box.classList.add('visible'); clearTimeout(toastTimer);
  box.querySelector('button').onclick = () => { clearTimeout(toastTimer); box.classList.remove('visible'); };
  toastTimer = setTimeout(() => box.classList.remove('visible'), 6000);
};
