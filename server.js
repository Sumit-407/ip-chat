<<<<<<< HEAD
/**
 * IP Chat — server.js
 * Real-time chat backend: Express (static hosting) + Socket.IO (real-time transport).
 *
 * Sync design notes:
 * - Every message gets a server-assigned numeric timestamp (Date.now()) so ordering
 *   is always consistent across devices, regardless of client clock drift.
 * - Clients send a client-generated `tempId` with each message. The server echoes it
 *   back only to the sender, so the sender can reconcile its optimistic "sending..."
 *   bubble with the real message instead of rendering a duplicate.
 * - "Delivered" status is computed server-side: if there was at least one other
 *   connected user in the room at broadcast time, the message is marked delivered.
 *   (Per-user "seen by" read receipts are intentionally out of scope for this pass —
 *   noted as a future upgrade.)
 * - On reconnect, the client automatically re-runs join-room, and the server resends
 *   full room history. The client dedupes by message id, so reconnect never produces
 *   duplicate or missing messages.
 */

=======
>>>>>>> b84223d379f54b7af70875bcbe33f3de89fa1ba9
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
<<<<<<< HEAD
const io = new Server(server, {
  maxHttpBufferSize: 3 * 1024 * 1024, // allow image payloads up to ~3MB
  pingTimeout: 20000,
  pingInterval: 10000,
});
=======
const io = new Server(server, { maxHttpBufferSize: 3 * 1024 * 1024 }); // allow image payloads up to ~3MB
>>>>>>> b84223d379f54b7af70875bcbe33f3de89fa1ba9

app.use(express.static(path.join(__dirname, 'public')));

const DB_PATH = path.join(__dirname, 'data', 'db.json');
<<<<<<< HEAD
const MAX_MESSAGES_PER_ROOM = 150;

/* ---------------------------- Persistence layer ---------------------------- */
=======
const MAX_MESSAGES_PER_ROOM = 100;
>>>>>>> b84223d379f54b7af70875bcbe33f3de89fa1ba9

function loadDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } catch (e) {
    return { rooms: {} };
  }
}

<<<<<<< HEAD
function saveDB() {
=======
function saveDB(db) {
>>>>>>> b84223d379f54b7af70875bcbe33f3de89fa1ba9
  try {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(db));
  } catch (e) {
    console.error('Failed to save DB:', e.message);
  }
}

<<<<<<< HEAD
const db = loadDB();
=======
let db = loadDB();
>>>>>>> b84223d379f54b7af70875bcbe33f3de89fa1ba9

function getRoomDB(roomCode) {
  if (!db.rooms[roomCode]) db.rooms[roomCode] = { password: null, messages: [] };
  return db.rooms[roomCode];
}

<<<<<<< HEAD
/* ---------------------------- Live presence state ---------------------------- */
// presence[roomCode] = { socketId: username }
const presence = {};
=======
// live (in-memory only) presence tracking
const presence = {}; // roomCode -> { socketId: username }
>>>>>>> b84223d379f54b7af70875bcbe33f3de89fa1ba9

function getRoomUsers(roomCode) {
  return presence[roomCode] ? Object.values(presence[roomCode]) : [];
}

<<<<<<< HEAD
function otherUsersCount(roomCode, excludeSocketId) {
  if (!presence[roomCode]) return 0;
  return Object.keys(presence[roomCode]).filter((id) => id !== excludeSocketId).length;
}

=======
>>>>>>> b84223d379f54b7af70875bcbe33f3de89fa1ba9
function getActiveRooms() {
  return Object.keys(presence)
    .filter((code) => Object.keys(presence[code]).length > 0)
    .map((code) => ({
      roomCode: code,
      userCount: Object.keys(presence[code]).length,
      isLocked: !!(db.rooms[code] && db.rooms[code].password),
    }))
    .sort((a, b) => b.userCount - a.userCount);
}

function broadcastActiveRooms() {
  io.emit('active-rooms', getActiveRooms());
}

<<<<<<< HEAD
function stripInternal(msg) {
  const { ownerSocketId, ...rest } = msg;
  return rest;
}

/* ---------------------------- Room join / switch / leave ---------------------------- */

function doJoin(socket, { roomCode, username, password }) {
  roomCode = (roomCode || 'general').trim().toLowerCase().slice(0, 20) || 'general';
  username = (username || 'Anonymous').trim().slice(0, 24) || 'Anonymous';
=======
function doJoin(socket, { roomCode, username, password }) {
  roomCode = (roomCode || 'general').trim().toLowerCase();
  username = (username || 'Anonymous').trim().slice(0, 24);
>>>>>>> b84223d379f54b7af70875bcbe33f3de89fa1ba9
  password = (password || '').trim();

  const roomData = getRoomDB(roomCode);

  if (roomData.password) {
    if (password !== roomData.password) {
      socket.emit('join-error', 'Incorrect password for this channel.');
      return false;
    }
  } else if (password) {
    roomData.password = password;
<<<<<<< HEAD
    saveDB();
=======
    saveDB(db);
>>>>>>> b84223d379f54b7af70875bcbe33f3de89fa1ba9
  }

  socket.join(roomCode);
  socket.data.roomCode = roomCode;
  socket.data.username = username;

  if (!presence[roomCode]) presence[roomCode] = {};
  presence[roomCode][socket.id] = username;

  socket.emit('joined', { roomCode, username, isLocked: !!roomData.password });
<<<<<<< HEAD

  // Send full history, ordered by time, internal fields stripped.
  const publicHistory = roomData.messages
    .slice()
    .sort((a, b) => a.time - b.time)
    .map(stripInternal);
  socket.emit('history', publicHistory);

  socket.to(roomCode).emit('system-message', { text: `${username} joined the chat`, time: Date.now() });
=======
  const publicHistory = roomData.messages.map(({ ownerSocketId, ...rest }) => rest);
  socket.emit('history', publicHistory);

  socket.to(roomCode).emit('system-message', `${username} joined the chat`);
>>>>>>> b84223d379f54b7af70875bcbe33f3de89fa1ba9
  io.to(roomCode).emit('user-list', getRoomUsers(roomCode));
  broadcastActiveRooms();
  return true;
}

function doLeaveCurrentRoom(socket) {
  const { roomCode, username } = socket.data;
  if (!roomCode) return;
  socket.leave(roomCode);
  if (presence[roomCode]) {
    delete presence[roomCode][socket.id];
    if (Object.keys(presence[roomCode]).length === 0) {
      delete presence[roomCode];
    } else {
<<<<<<< HEAD
      socket.to(roomCode).emit('system-message', { text: `${username} left the chat`, time: Date.now() });
=======
      socket.to(roomCode).emit('system-message', `${username} left the chat`);
>>>>>>> b84223d379f54b7af70875bcbe33f3de89fa1ba9
      io.to(roomCode).emit('user-list', getRoomUsers(roomCode));
    }
  }
  socket.data.roomCode = null;
}

<<<<<<< HEAD
/* ---------------------------- Socket.IO event wiring ---------------------------- */

io.on('connection', (socket) => {
  // Every newly connected socket (fresh tab or auto-reconnect) gets the live directory.
  socket.emit('active-rooms', getActiveRooms());

  socket.on('join-room', (data) => {
    doJoin(socket, data || {});
  });

  // Used both for the "switch channel" sidebar action and for automatic
  // resync after a dropped connection reconnects.
  socket.on('switch-room', (data) => {
    doLeaveCurrentRoom(socket);
    doJoin(socket, data || {});
  });

  socket.on('chat-message', ({ text, replyTo, type, tempId }) => {
=======
io.on('connection', (socket) => {
  socket.emit('active-rooms', getActiveRooms());

  socket.on('join-room', (data) => {
    doJoin(socket, data);
  });

  socket.on('switch-room', (data) => {
    doLeaveCurrentRoom(socket);
    doJoin(socket, { ...data, username: socket.data.username || data.username });
    broadcastActiveRooms();
  });

  socket.on('chat-message', ({ text, replyTo, type }) => {
>>>>>>> b84223d379f54b7af70875bcbe33f3de89fa1ba9
    const { roomCode, username } = socket.data;
    if (!roomCode || !text) return;

    const isImage = type === 'image';
    if (!isImage && !text.trim()) return;

    const roomData = getRoomDB(roomCode);
    const id = crypto.randomUUID();
    const cleanText = isImage ? text : text.trim().slice(0, 1000);
<<<<<<< HEAD
    const deliveredToOthers = otherUsersCount(roomCode, socket.id) > 0;
=======
>>>>>>> b84223d379f54b7af70875bcbe33f3de89fa1ba9

    const message = {
      id,
      username,
      text: cleanText,
      type: isImage ? 'image' : 'text',
<<<<<<< HEAD
      time: Date.now(), // numeric epoch ms -> reliable cross-device ordering
      replyTo: replyTo || null,
      delivered: deliveredToOthers,
=======
      time: new Date().toISOString(),
      replyTo: replyTo || null,
>>>>>>> b84223d379f54b7af70875bcbe33f3de89fa1ba9
      ownerSocketId: socket.id,
    };

    roomData.messages.push(message);
    if (roomData.messages.length > MAX_MESSAGES_PER_ROOM) {
      roomData.messages = roomData.messages.slice(-MAX_MESSAGES_PER_ROOM);
    }
<<<<<<< HEAD
    saveDB();

    const publicMessage = stripInternal(message);

    // Sender gets the tempId back to reconcile its optimistic bubble.
    socket.emit('chat-message', { ...publicMessage, tempId: tempId || null });
    // Everyone else in the room gets it fresh (no tempId — not their optimistic message).
    socket.to(roomCode).emit('chat-message', publicMessage);
=======
    saveDB(db);

    const { ownerSocketId, ...publicMessage } = message;
    io.to(roomCode).emit('chat-message', publicMessage);
>>>>>>> b84223d379f54b7af70875bcbe33f3de89fa1ba9
  });

  socket.on('edit-message', ({ id, newText }) => {
    const { roomCode } = socket.data;
    const roomData = db.rooms[roomCode];
    if (!roomData) return;
    const msg = roomData.messages.find((m) => m.id === id);
    if (!msg || msg.ownerSocketId !== socket.id || msg.type === 'image') return;
    if (!newText || !newText.trim()) return;

    msg.text = newText.trim().slice(0, 1000);
<<<<<<< HEAD
    saveDB();
=======
    saveDB(db);
>>>>>>> b84223d379f54b7af70875bcbe33f3de89fa1ba9
    io.to(roomCode).emit('message-edited', { id, newText: msg.text });
  });

  socket.on('delete-message', ({ id }) => {
    const { roomCode } = socket.data;
    const roomData = db.rooms[roomCode];
    if (!roomData) return;
    const idx = roomData.messages.findIndex((m) => m.id === id);
    if (idx === -1 || roomData.messages[idx].ownerSocketId !== socket.id) return;

    roomData.messages.splice(idx, 1);
<<<<<<< HEAD
    saveDB();
    io.to(roomCode).emit('message-deleted', { id });
  });

  // Typing indicator — deliberately not persisted, purely transient/live.
=======
    saveDB(db);
    io.to(roomCode).emit('message-deleted', { id });
  });

>>>>>>> b84223d379f54b7af70875bcbe33f3de89fa1ba9
  socket.on('typing', (isTyping) => {
    const { roomCode, username } = socket.data;
    if (!roomCode) return;
    socket.to(roomCode).emit('typing', { username, isTyping });
  });

  socket.on('disconnect', () => {
    doLeaveCurrentRoom(socket);
    broadcastActiveRooms();
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`IP Chat server running on port ${PORT}`);
});
