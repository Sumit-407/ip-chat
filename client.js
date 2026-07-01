<<<<<<< HEAD
/**
 * IP Chat — client.js
 * Handles: UI state (loading/join/chat screens), Socket.IO real-time sync,
 * message rendering with optimistic sending + delivery ticks, reconnect
 * resync, mobile sidebar drawer, toasts, search, theme, PWA registration.
 *
 * Sync strategy (mirrors server.js comments):
 * - Outgoing messages render immediately with a client-generated tempId
 *   ("pending" state, clock tick). When the server echoes the message back
 *   to the sender (with that tempId attached), we swap the pending bubble
 *   in place for the real one — no duplicate ever gets appended.
 * - Every socket (re)connect that already has a joined room re-runs
 *   join-room, and the server always answers with the FULL room history.
 *   The client wipes and rebuilds the message list from that history, so a
 *   dropped connection can never leave stale/duplicate/missing messages.
 */

const socket = io({
  reconnectionDelay: 600,
  reconnectionDelayMax: 4000,
});
=======
const socket = io();
>>>>>>> b84223d379f54b7af70875bcbe33f3de89fa1ba9

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {});
  });
}

<<<<<<< HEAD
/* ============================================================
   DOM references
   ============================================================ */
const loadingScreen = document.getElementById('loading-screen');
const toastContainer = document.getElementById('toast-container');

=======
>>>>>>> b84223d379f54b7af70875bcbe33f3de89fa1ba9
const joinScreen = document.getElementById('join-screen');
const chatScreen = document.getElementById('chat-screen');
const joinForm = document.getElementById('join-form');
const usernameInput = document.getElementById('username');
const roomcodeInput = document.getElementById('roomcode');
const passwordInput = document.getElementById('password');
const joinErrorEl = document.getElementById('join-error');

<<<<<<< HEAD
const sidebar = document.getElementById('sidebar');
const sidebarBackdrop = document.getElementById('sidebar-backdrop');
const sidebarOpenBtn = document.getElementById('sidebar-open');
const sidebarCloseBtn = document.getElementById('sidebar-close');

const myAvatarEl = document.getElementById('my-avatar');
=======
>>>>>>> b84223d379f54b7af70875bcbe33f3de89fa1ba9
const messagesEl = document.getElementById('messages');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const userListEl = document.getElementById('user-list');
const userCountEl = document.getElementById('user-count');
const currentRoomEl = document.getElementById('current-room');
const headerRoomEl = document.getElementById('header-room');
<<<<<<< HEAD
const headerStatusEl = document.getElementById('header-status');
const headerUserEl = document.getElementById('header-user');
const profileStatusEl = document.querySelector('.profile-status');
const typingIndicator = document.getElementById('typing-indicator');
const leaveBtn = document.getElementById('leave-btn');
const connectionPulse = document.getElementById('connection-pulse');
=======
const headerUserEl = document.getElementById('header-user');
const typingIndicator = document.getElementById('typing-indicator');
const leaveBtn = document.getElementById('leave-btn');
>>>>>>> b84223d379f54b7af70875bcbe33f3de89fa1ba9

const emojiBtn = document.getElementById('emoji-btn');
const emojiPanel = document.getElementById('emoji-panel');
const imageBtn = document.getElementById('image-btn');
const imageInput = document.getElementById('image-input');
const replyPreview = document.getElementById('reply-preview');
const replyPreviewUser = document.getElementById('reply-preview-user');
const replyPreviewText = document.getElementById('reply-preview-text');
const replyCancelBtn = document.getElementById('reply-cancel');

const themeToggleJoin = document.getElementById('theme-toggle-join');
const themeToggle = document.getElementById('theme-toggle');

const activeRoomsJoinBlock = document.getElementById('active-rooms-join');
const activeRoomsListJoin = document.getElementById('active-rooms-list-join');
const activeRoomsList = document.getElementById('active-rooms-list');

const searchToggleBtn = document.getElementById('search-toggle-btn');
const searchBar = document.getElementById('search-bar');
const searchInput = document.getElementById('search-input');
const searchCount = document.getElementById('search-count');
const searchClose = document.getElementById('search-close');

<<<<<<< HEAD
/* ============================================================
   State
   ============================================================ */
let myUsername = '';
let myPassword = '';
let currentRoomCode = null;
let typingTimeout = null;
let replyTarget = null; // { id, username, text }
let unreadCount = 0;
let firstConnect = true;
const pendingMessages = new Map(); // tempId -> message <div> awaiting server ack
const ORIGINAL_TITLE = 'IP Chat — by Sumit';
const MAX_IMAGE_BYTES = 1.5 * 1024 * 1024; // 1.5MB original file limit

/* ============================================================
   Toast notifications
   ============================================================ */
function toast(message, type = 'info', duration = 3400) {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span class="toast-dot"></span><span></span>`;
  el.querySelector('span:last-child').textContent = message;
  toastContainer.appendChild(el);
  setTimeout(() => {
    el.classList.add('leaving');
    setTimeout(() => el.remove(), 250);
  }, duration);
}

/* ============================================================
   Theme (dark by default)
   ============================================================ */
function applyTheme(theme) {
  document.body.classList.toggle('light', theme === 'light');
}

function toggleTheme() {
  const next = document.body.classList.contains('light') ? 'dark' : 'light';
=======
let myUsername = '';
let myPassword = '';
let typingTimeout = null;
let replyTarget = null; // { id, username, text }
let unreadCount = 0;
const ORIGINAL_TITLE = 'IP Chat — by Sumit';
const MAX_IMAGE_BYTES = 1.5 * 1024 * 1024; // 1.5MB original file limit

/* ---------------- THEME ---------------- */
function applyTheme(theme) {
  document.body.classList.toggle('light', theme === 'light');
  const icon = theme === 'light' ? '☀️' : '🌙';
  if (themeToggleJoin) themeToggleJoin.textContent = icon;
  if (themeToggle) themeToggle.textContent = icon;
}

function toggleTheme() {
  const current = document.body.classList.contains('light') ? 'light' : 'dark';
  const next = current === 'light' ? 'dark' : 'light';
>>>>>>> b84223d379f54b7af70875bcbe33f3de89fa1ba9
  localStorage.setItem('ipchat-theme', next);
  applyTheme(next);
}

applyTheme(localStorage.getItem('ipchat-theme') || 'dark');
<<<<<<< HEAD
themeToggleJoin.addEventListener('click', toggleTheme);
themeToggle.addEventListener('click', toggleTheme);

/* ============================================================
   Avatars
   ============================================================ */
const AVATAR_COLORS = ['#4F8CFF', '#8B5CF6', '#34D399', '#F472B6', '#FBBF24', '#F87171', '#22D3EE', '#FB923C'];
=======
if (themeToggleJoin) themeToggleJoin.addEventListener('click', toggleTheme);
if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

/* ---------------- AVATAR ---------------- */
const AVATAR_COLORS = ['#FF6B4A', '#4ADE80', '#60A5FA', '#F472B6', '#FBBF24', '#A78BFA', '#34D399', '#F87171'];
>>>>>>> b84223d379f54b7af70875bcbe33f3de89fa1ba9

function hashStr(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash);
}

function avatarFor(username) {
  const color = AVATAR_COLORS[hashStr(username) % AVATAR_COLORS.length];
  const initials = username.trim().slice(0, 2).toUpperCase();
  return `<span class="avatar" style="background:${color}">${initials}</span>`;
}

<<<<<<< HEAD
function paintAvatarEl(el, username) {
  if (!el) return;
  el.style.background = AVATAR_COLORS[hashStr(username) % AVATAR_COLORS.length];
  el.textContent = username.trim().slice(0, 2).toUpperCase();
}

/* ============================================================
   Mobile sidebar drawer
   ============================================================ */
function openSidebar() {
  sidebar.classList.add('open');
  sidebarBackdrop.classList.remove('hidden');
}
function closeSidebar() {
  sidebar.classList.remove('open');
  sidebarBackdrop.classList.add('hidden');
}
sidebarOpenBtn.addEventListener('click', openSidebar);
sidebarCloseBtn.addEventListener('click', closeSidebar);
sidebarBackdrop.addEventListener('click', closeSidebar);

/* ============================================================
   Connection state (drives pulse bar + header status + toasts)
   ============================================================ */
function setConnectionState(state) {
  const isUp = state === 'connected';
  connectionPulse.classList.toggle('reconnecting', !isUp);
  headerStatusEl.textContent = isUp ? 'Connected' : 'Reconnecting…';
  headerStatusEl.classList.toggle('reconnecting', !isUp);
  if (profileStatusEl) {
    profileStatusEl.innerHTML = `<span class="status-dot ${isUp ? 'online' : 'offline'}"></span>${isUp ? 'Online' : 'Reconnecting…'}`;
  }
}

socket.on('connect', () => {
  if (firstConnect) {
    firstConnect = false;
    loadingScreen.classList.add('hidden');
    joinScreen.classList.remove('hidden');
  } else if (currentRoomCode) {
    // Dropped connection came back — resync this room from scratch.
    socket.emit('switch-room', { roomCode: currentRoomCode, username: myUsername, password: myPassword });
    toast('Back online — syncing messages…', 'success');
  }
  setConnectionState('connected');
});

socket.on('disconnect', () => {
  setConnectionState('reconnecting');
  if (!firstConnect) toast('Connection lost. Reconnecting…', 'warn', 5000);
});

socket.io.on('reconnect_attempt', () => setConnectionState('reconnecting'));

socket.on('connect_error', () => {
  setConnectionState('reconnecting');
});

// Fallback so the loading screen never gets stuck if the server is unreachable.
setTimeout(() => {
  if (firstConnect) {
    firstConnect = false;
    loadingScreen.classList.add('hidden');
    joinScreen.classList.remove('hidden');
    toast('Having trouble reaching the server. Retrying…', 'error');
  }
}, 6000);

/* ============================================================
   Emoji picker
   ============================================================ */
const EMOJIS = ['😀','😂','😍','😎','🤔','😢','😡','👍','👎','🙏','🔥','🎉','❤️','💯','😴','🙌','👏','😅','🤝','✨','🚀','💀','🥳','👀'];
emojiPanel.innerHTML = EMOJIS.map((e) => `<span class="emoji-item">${e}</span>`).join('');

emojiBtn.addEventListener('click', (e) => {
  e.stopPropagation();
=======
/* ---------------- EMOJI PICKER ---------------- */
const EMOJIS = ['😀','😂','😍','😎','🤔','😢','😡','👍','👎','🙏','🔥','🎉','❤️','💯','😴','🙌','👏','😅','🤝','✨'];
emojiPanel.innerHTML = EMOJIS.map(e => `<span class="emoji-item">${e}</span>`).join('');

emojiBtn.addEventListener('click', () => {
>>>>>>> b84223d379f54b7af70875bcbe33f3de89fa1ba9
  emojiPanel.classList.toggle('hidden');
});

emojiPanel.addEventListener('click', (e) => {
  if (e.target.classList.contains('emoji-item')) {
    messageInput.value += e.target.textContent;
    messageInput.focus();
  }
});

document.addEventListener('click', (e) => {
  if (!emojiPanel.contains(e.target) && e.target !== emojiBtn) {
    emojiPanel.classList.add('hidden');
  }
});

<<<<<<< HEAD
/* ============================================================
   Image sharing
   ============================================================ */
=======
/* ---------------- IMAGE SHARING ---------------- */
>>>>>>> b84223d379f54b7af70875bcbe33f3de89fa1ba9
imageBtn.addEventListener('click', () => imageInput.click());

imageInput.addEventListener('change', () => {
  const file = imageInput.files[0];
  if (!file) return;

  if (file.size > MAX_IMAGE_BYTES) {
<<<<<<< HEAD
    toast('Image too large — please pick something under 1.5MB.', 'error');
=======
    alert('Image too large. Please pick something under 1.5MB.');
>>>>>>> b84223d379f54b7af70875bcbe33f3de89fa1ba9
    imageInput.value = '';
    return;
  }

  const reader = new FileReader();
<<<<<<< HEAD
  reader.onload = () => sendMessage(reader.result, 'image');
=======
  reader.onload = () => {
    socket.emit('chat-message', { text: reader.result, replyTo: replyTarget, type: 'image' });
    clearReplyTarget();
  };
>>>>>>> b84223d379f54b7af70875bcbe33f3de89fa1ba9
  reader.readAsDataURL(file);
  imageInput.value = '';
});

<<<<<<< HEAD
/* ============================================================
   Notification sound (Web Audio, no asset needed)
   ============================================================ */
=======
/* ---------------- NOTIFICATION SOUND ---------------- */
>>>>>>> b84223d379f54b7af70875bcbe33f3de89fa1ba9
let audioCtx = null;
function playBeep() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = 720;
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.18);
<<<<<<< HEAD
  } catch (err) { /* ignore audio errors (e.g. autoplay policy before first user gesture) */ }
}

/* ============================================================
   Unread title badge
   ============================================================ */
=======
  } catch (err) { /* ignore audio errors */ }
}

/* ---------------- UNREAD BADGE ---------------- */
>>>>>>> b84223d379f54b7af70875bcbe33f3de89fa1ba9
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    unreadCount = 0;
    document.title = ORIGINAL_TITLE;
  }
});

function bumpUnread() {
  if (document.hidden) {
    unreadCount++;
    document.title = `(${unreadCount}) ${ORIGINAL_TITLE}`;
  }
}

<<<<<<< HEAD
/* ============================================================
   Active channels directory (join screen + sidebar)
   ============================================================ */
socket.on('active-rooms', (rooms) => {
=======
/* ---------------- ACTIVE ROOMS DIRECTORY ---------------- */
socket.on('active-rooms', (rooms) => {
  // Join screen list
>>>>>>> b84223d379f54b7af70875bcbe33f3de89fa1ba9
  if (rooms.length === 0) {
    activeRoomsJoinBlock.classList.add('hidden');
  } else {
    activeRoomsJoinBlock.classList.remove('hidden');
    activeRoomsListJoin.innerHTML = rooms.map((r) => `
      <li class="active-room-item" data-room="${escapeHtml(r.roomCode)}">
        <span>${r.isLocked ? '🔒 ' : ''}#${escapeHtml(r.roomCode)}</span>
        <span class="room-user-count">${r.userCount}</span>
      </li>
    `).join('');
  }

<<<<<<< HEAD
=======
  // Sidebar list (exclude current room)
>>>>>>> b84223d379f54b7af70875bcbe33f3de89fa1ba9
  if (!chatScreen.classList.contains('hidden')) {
    const others = rooms.filter((r) => r.roomCode !== currentRoomCode);
    activeRoomsList.innerHTML = others.length
      ? others.map((r) => `
          <li class="active-room-item" data-room="${escapeHtml(r.roomCode)}" data-locked="${r.isLocked}">
            <span>${r.isLocked ? '🔒 ' : ''}#${escapeHtml(r.roomCode)}</span>
            <span class="room-user-count">${r.userCount}</span>
          </li>
        `).join('')
      : '<li class="no-rooms">No other active channels</li>';
  }
});

activeRoomsListJoin.addEventListener('click', (e) => {
  const item = e.target.closest('.active-room-item');
  if (!item) return;
  roomcodeInput.value = item.dataset.room;
  usernameInput.focus();
});

activeRoomsList.addEventListener('click', (e) => {
  const item = e.target.closest('.active-room-item');
  if (!item) return;
  const roomCode = item.dataset.room;
  const isLocked = item.dataset.locked === 'true';
  let password = '';
  if (isLocked) {
    password = prompt(`#${roomCode} is password-protected. Enter password:`) || '';
    if (!password) return;
  }
<<<<<<< HEAD
  myPassword = password;
  socket.emit('switch-room', { roomCode, username: myUsername, password });
  closeSidebar();
});

/* ============================================================
   Join flow
   ============================================================ */
joinForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = usernameInput.value.trim();
  const roomCode = roomcodeInput.value.trim() || 'general';
=======
  socket.emit('switch-room', { roomCode, username: myUsername, password });
});

/* ---------------- JOIN ---------------- */
let currentRoomCode = null;

joinForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = usernameInput.value.trim();
  const roomCode = (roomcodeInput.value.trim() || 'general');
>>>>>>> b84223d379f54b7af70875bcbe33f3de89fa1ba9
  const password = passwordInput.value;
  if (!username) return;

  myUsername = username;
  myPassword = password;
  joinErrorEl.classList.add('hidden');
  socket.emit('join-room', { roomCode, username, password });
});

socket.on('join-error', (msg) => {
<<<<<<< HEAD
  if (chatScreen.classList.contains('hidden')) {
    joinErrorEl.textContent = msg;
    joinErrorEl.classList.remove('hidden');
  } else {
    // A mid-session switch-room attempt (e.g. wrong password) failed.
    toast(msg, 'error');
  }
=======
  joinErrorEl.textContent = msg;
  joinErrorEl.classList.remove('hidden');
>>>>>>> b84223d379f54b7af70875bcbe33f3de89fa1ba9
});

socket.on('joined', ({ roomCode, username, isLocked }) => {
  currentRoomCode = roomCode;
  joinScreen.classList.add('hidden');
  chatScreen.classList.remove('hidden');
  currentRoomEl.textContent = (isLocked ? '🔒 ' : '') + '#' + roomCode;
  headerRoomEl.textContent = (isLocked ? '🔒 ' : '') + '#' + roomCode;
  headerUserEl.textContent = username;
<<<<<<< HEAD
  paintAvatarEl(myAvatarEl, username);
  setConnectionState('connected');
  pendingMessages.clear();
  messageInput.focus();
  closeSearch();
  closeSidebar();
=======
  messageInput.focus();
  closeSearch();
>>>>>>> b84223d379f54b7af70875bcbe33f3de89fa1ba9
});

socket.on('history', (messages) => {
  messagesEl.innerHTML = '';
<<<<<<< HEAD
  pendingMessages.clear();
  messages.forEach((m) => renderMessage(m));
  scrollToBottom();
});

/* ============================================================
   Search
   ============================================================ */
=======
  messages.forEach(renderMessage);
});

/* ---------------- SEARCH ---------------- */
>>>>>>> b84223d379f54b7af70875bcbe33f3de89fa1ba9
function openSearch() {
  searchBar.classList.remove('hidden');
  searchInput.value = '';
  searchInput.focus();
  filterMessages('');
}

function closeSearch() {
  searchBar.classList.add('hidden');
  searchInput.value = '';
  filterMessages('');
}

searchToggleBtn.addEventListener('click', () => {
  searchBar.classList.contains('hidden') ? openSearch() : closeSearch();
});
searchClose.addEventListener('click', closeSearch);

function filterMessages(query) {
  const q = query.trim().toLowerCase();
  const items = messagesEl.querySelectorAll('.msg:not(.system)');
  let matches = 0;
  items.forEach((div) => {
    const textEl = div.querySelector('.msg-bubble');
    const text = textEl ? textEl.textContent.toLowerCase() : '';
    const isMatch = q === '' || text.includes(q);
    div.classList.toggle('search-hidden', !isMatch);
    if (isMatch && q !== '') matches++;
  });
  searchCount.textContent = q === '' ? '' : `${matches} match${matches === 1 ? '' : 'es'}`;
}

searchInput.addEventListener('input', () => filterMessages(searchInput.value));

<<<<<<< HEAD
/* ============================================================
   Reply
   ============================================================ */
=======
/* ---------------- REPLY ---------------- */
>>>>>>> b84223d379f54b7af70875bcbe33f3de89fa1ba9
function setReplyTarget(id, username, text, type) {
  replyTarget = { id, username, text: type === 'image' ? '📷 Photo' : text };
  replyPreviewUser.textContent = username;
  replyPreviewText.textContent = replyTarget.text.length > 60 ? replyTarget.text.slice(0, 60) + '…' : replyTarget.text;
  replyPreview.classList.remove('hidden');
  messageInput.focus();
}

function clearReplyTarget() {
  replyTarget = null;
  replyPreview.classList.add('hidden');
}

replyCancelBtn.addEventListener('click', clearReplyTarget);

<<<<<<< HEAD
/* ============================================================
   Message rendering
   ============================================================ */
function formatTime(ms) {
  const t = new Date(ms);
  return t.getHours().toString().padStart(2, '0') + ':' + t.getMinutes().toString().padStart(2, '0');
}

function fullDateTime(ms) {
  return new Date(ms).toLocaleString();
}

function ticksHtml(status) {
  // status: 'pending' | 'sent' | 'delivered'
  if (status === 'pending') return `<span class="msg-ticks pending-tick">🕐</span>`;
  if (status === 'delivered') return `<span class="msg-ticks delivered">✓✓</span>`;
  return `<span class="msg-ticks">✓</span>`;
}

function scrollToBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function isNearBottom() {
  return messagesEl.scrollHeight - messagesEl.scrollTop - messagesEl.clientHeight < 120;
}

function renderMessage(msg) {
  const { id, username, text, time, replyTo, type, delivered } = msg;
  const isOwn = username === myUsername;
  const isImage = type === 'image';
  const wasNearBottom = isNearBottom();

=======
/* ---------------- MESSAGE RENDERING ---------------- */
function formatTime(iso) {
  const t = new Date(iso);
  return t.getHours().toString().padStart(2, '0') + ':' + t.getMinutes().toString().padStart(2, '0');
}

function fullDateTime(iso) {
  return new Date(iso).toLocaleString();
}

function renderMessage({ id, username, text, time, replyTo, type }) {
  const isOwn = username === myUsername;
  const isImage = type === 'image';
>>>>>>> b84223d379f54b7af70875bcbe33f3de89fa1ba9
  const div = document.createElement('div');
  div.className = 'msg' + (isOwn ? ' own' : '');
  div.dataset.id = id;

  const replyHtml = replyTo
<<<<<<< HEAD
    ? `<div class="quoted"><strong>${escapeHtml(replyTo.username)}</strong>: ${escapeHtml(replyTo.text.slice(0, 60))}</div>`
    : '';

  const bubbleHtml = isImage
    ? `<span class="msg-bubble img-bubble"><img src="${text}" class="chat-image" alt="shared image" loading="lazy"></span>`
=======
    ? `<div class="quoted"><strong>${escapeHtml(replyTo.username)}</strong>: ${escapeHtml(replyTo.text.slice(0,60))}</div>`
    : '';

  const bubbleHtml = isImage
    ? `<span class="msg-bubble img-bubble"><img src="${text}" class="chat-image" alt="shared image"></span>`
>>>>>>> b84223d379f54b7af70875bcbe33f3de89fa1ba9
    : `<span class="msg-bubble">${escapeHtml(text)}</span>`;

  const actionsHtml = `
    <span class="msg-actions">
      <button class="msg-action-btn reply-btn" title="Reply">↩</button>
      ${isOwn && !isImage ? '<button class="msg-action-btn edit-btn" title="Edit">✎</button>' : ''}
      ${isOwn ? '<button class="msg-action-btn delete-btn" title="Delete">🗑</button>' : ''}
    </span>
  `;

<<<<<<< HEAD
  const ticks = isOwn ? ticksHtml(delivered ? 'delivered' : 'sent') : '';

  div.innerHTML = `
    ${!isOwn ? avatarFor(username) : ''}
    <div class="msg-body">
      <span class="msg-meta">${escapeHtml(username)} · <span class="msg-time" title="${fullDateTime(time)}">${formatTime(time)}</span>${ticks}</span>
=======
  div.innerHTML = `
    ${!isOwn ? avatarFor(username) : ''}
    <div class="msg-body">
      <span class="msg-meta">${escapeHtml(username)} · <span class="msg-time" title="${fullDateTime(time)}">${formatTime(time)}</span></span>
>>>>>>> b84223d379f54b7af70875bcbe33f3de89fa1ba9
      ${replyHtml}
      ${bubbleHtml}
    </div>
    ${actionsHtml}
  `;

  div.querySelector('.reply-btn').addEventListener('click', () => setReplyTarget(id, username, text, type));
<<<<<<< HEAD
=======

>>>>>>> b84223d379f54b7af70875bcbe33f3de89fa1ba9
  if (isOwn && !isImage) {
    div.querySelector('.edit-btn').addEventListener('click', () => startEdit(div, id, text));
  }
  if (isOwn) {
    div.querySelector('.delete-btn').addEventListener('click', () => {
      if (confirm('Delete this message?')) socket.emit('delete-message', { id });
    });
  }

  messagesEl.appendChild(div);
<<<<<<< HEAD
  if (wasNearBottom) scrollToBottom();
  return div;
}

function renderPendingMessage(tempId, { username, text, replyTo, type }) {
  const div = document.createElement('div');
  div.className = 'msg own pending';
  div.dataset.id = tempId;

  const replyHtml = replyTo
    ? `<div class="quoted"><strong>${escapeHtml(replyTo.username)}</strong>: ${escapeHtml(replyTo.text.slice(0, 60))}</div>`
    : '';
  const bubbleHtml = type === 'image'
    ? `<span class="msg-bubble img-bubble"><img src="${text}" class="chat-image" alt="shared image"></span>`
    : `<span class="msg-bubble">${escapeHtml(text)}</span>`;

  div.innerHTML = `
    <div class="msg-body">
      <span class="msg-meta">${escapeHtml(username)} · <span class="msg-time">sending…</span>${ticksHtml('pending')}</span>
      ${replyHtml}
      ${bubbleHtml}
    </div>
  `;

  messagesEl.appendChild(div);
  scrollToBottom();
  return div;
}

function finalizePendingMessage(div, msg) {
  div.dataset.id = msg.id;
  div.classList.remove('pending');
  const timeEl = div.querySelector('.msg-time');
  if (timeEl) {
    timeEl.textContent = formatTime(msg.time);
    timeEl.title = fullDateTime(msg.time);
  }
  const ticksEl = div.querySelector('.msg-ticks');
  if (ticksEl) ticksEl.outerHTML = ticksHtml(msg.delivered ? 'delivered' : 'sent');

  // Wire up reply/edit/delete now that this bubble has a real, permanent id.
  const actionsHtml = `
    <span class="msg-actions">
      <button class="msg-action-btn reply-btn" title="Reply">↩</button>
      ${msg.type !== 'image' ? '<button class="msg-action-btn edit-btn" title="Edit">✎</button>' : ''}
      <button class="msg-action-btn delete-btn" title="Delete">🗑</button>
    </span>
  `;
  if (!div.querySelector('.msg-actions')) {
    div.insertAdjacentHTML('beforeend', actionsHtml);
    div.querySelector('.reply-btn').addEventListener('click', () => setReplyTarget(msg.id, msg.username, msg.text, msg.type));
    if (msg.type !== 'image') {
      div.querySelector('.edit-btn').addEventListener('click', () => startEdit(div, msg.id, msg.text));
    }
    div.querySelector('.delete-btn').addEventListener('click', () => {
      if (confirm('Delete this message?')) socket.emit('delete-message', { id: msg.id });
    });
  }
=======
  messagesEl.scrollTop = messagesEl.scrollHeight;
>>>>>>> b84223d379f54b7af70875bcbe33f3de89fa1ba9
}

function startEdit(div, id, currentText) {
  const bubble = div.querySelector('.msg-bubble');
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'edit-input';
  input.value = currentText;
  bubble.replaceWith(input);
  input.focus();
<<<<<<< HEAD
  input.setSelectionRange(input.value.length, input.value.length);
=======
>>>>>>> b84223d379f54b7af70875bcbe33f3de89fa1ba9

  function finish(save) {
    if (save && input.value.trim() && input.value.trim() !== currentText) {
      socket.emit('edit-message', { id, newText: input.value.trim() });
    } else {
      const newBubble = document.createElement('span');
      newBubble.className = 'msg-bubble';
      newBubble.textContent = currentText;
      input.replaceWith(newBubble);
    }
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') finish(true);
    if (e.key === 'Escape') finish(false);
  });
  input.addEventListener('blur', () => finish(true));
}

<<<<<<< HEAD
/* ---- Incoming messages: reconcile own optimistic sends, render others ---- */
socket.on('chat-message', (payload) => {
  if (payload.tempId && pendingMessages.has(payload.tempId)) {
    const div = pendingMessages.get(payload.tempId);
    finalizePendingMessage(div, payload);
    pendingMessages.delete(payload.tempId);
  } else {
    renderMessage(payload);
    if (payload.username !== myUsername) {
      playBeep();
      bumpUnread();
    }
  }
  if (!searchBar.classList.contains('hidden')) filterMessages(searchInput.value);
=======
socket.on('chat-message', (payload) => {
  renderMessage(payload);
  if (!searchBar.classList.contains('hidden')) filterMessages(searchInput.value);
  if (payload.username !== myUsername) {
    playBeep();
    bumpUnread();
  }
>>>>>>> b84223d379f54b7af70875bcbe33f3de89fa1ba9
});

socket.on('message-edited', ({ id, newText }) => {
  const div = messagesEl.querySelector(`[data-id="${id}"]`);
  if (!div) return;
  const bubble = div.querySelector('.msg-bubble');
  if (bubble) bubble.textContent = newText;
});

socket.on('message-deleted', ({ id }) => {
  const div = messagesEl.querySelector(`[data-id="${id}"]`);
  if (div) div.remove();
});

<<<<<<< HEAD
socket.on('system-message', ({ text, time }) => {
  const div = document.createElement('div');
  div.className = 'msg system';
  div.innerHTML = `<span class="msg-bubble">${escapeHtml(text)}</span>`;
  messagesEl.appendChild(div);
  if (isNearBottom()) scrollToBottom();
=======
socket.on('system-message', (text) => {
  const div = document.createElement('div');
  div.className = 'msg system';
  div.textContent = text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
>>>>>>> b84223d379f54b7af70875bcbe33f3de89fa1ba9
});

socket.on('user-list', (users) => {
  userListEl.innerHTML = '';
  users.forEach((u) => {
    const li = document.createElement('li');
<<<<<<< HEAD
    li.innerHTML = `<span class="status-dot online"></span>${avatarFor(u)}<span>${escapeHtml(u)}</span>`;
=======
    li.innerHTML = `${avatarFor(u)}<span>${escapeHtml(u)}</span>`;
>>>>>>> b84223d379f54b7af70875bcbe33f3de89fa1ba9
    userListEl.appendChild(li);
  });
  userCountEl.textContent = users.length;
});

<<<<<<< HEAD
/* ---- Typing indicator with animated dots ---- */
socket.on('typing', ({ username, isTyping }) => {
  typingIndicator.innerHTML = isTyping
    ? `<span>${escapeHtml(username)} is typing</span><span class="typing-dots"><span></span><span></span><span></span></span>`
    : '';
});

/* ============================================================
   Sending messages (optimistic + ack reconciliation)
   ============================================================ */
function makeTempId() {
  return 'tmp-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

function sendMessage(text, type) {
  const tempId = makeTempId();
  const optimistic = { username: myUsername, text, replyTo: replyTarget, type };
  const div = renderPendingMessage(tempId, optimistic);
  pendingMessages.set(tempId, div);

  socket.emit('chat-message', { text, replyTo: replyTarget, type, tempId });
  clearReplyTarget();
}

=======
socket.on('typing', ({ username, isTyping }) => {
  typingIndicator.textContent = isTyping ? `${username} is typing...` : '';
});

/* ---------------- SEND ---------------- */
>>>>>>> b84223d379f54b7af70875bcbe33f3de89fa1ba9
messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = messageInput.value;
  if (!text.trim()) return;
<<<<<<< HEAD
  sendMessage(text.trim(), 'text');
  messageInput.value = '';
  socket.emit('typing', false);
  clearTimeout(typingTimeout);
=======
  socket.emit('chat-message', { text, replyTo: replyTarget, type: 'text' });
  messageInput.value = '';
  clearReplyTarget();
  socket.emit('typing', false);
>>>>>>> b84223d379f54b7af70875bcbe33f3de89fa1ba9
});

messageInput.addEventListener('input', () => {
  socket.emit('typing', true);
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => socket.emit('typing', false), 1200);
});

leaveBtn.addEventListener('click', () => {
  window.location.reload();
});

<<<<<<< HEAD
/* ============================================================
   Utils
   ============================================================ */
=======
>>>>>>> b84223d379f54b7af70875bcbe33f3de89fa1ba9
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
