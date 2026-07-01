const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { maxHttpBufferSize: 3 * 1024 * 1024 }); // allow image payloads up to ~3MB

app.use(express.static(path.join(__dirname, 'public')));

const DB_PATH = path.join(__dirname, 'data', 'db.json');
const MAX_MESSAGES_PER_ROOM = 100;

function loadDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } catch (e) {
    return { rooms: {} };
  }
}

function saveDB(db) {
  try {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(db));
  } catch (e) {
    console.error('Failed to save DB:', e.message);
  }
}

let db = loadDB();

function getRoomDB(roomCode) {
  if (!db.rooms[roomCode]) db.rooms[roomCode] = { password: null, messages: [] };
  return db.rooms[roomCode];
}

// live (in-memory only) presence tracking
const presence = {}; // roomCode -> { socketId: username }

function getRoomUsers(roomCode) {
  return presence[roomCode] ? Object.values(presence[roomCode]) : [];
}

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

function doJoin(socket, { roomCode, username, password }) {
  roomCode = (roomCode || 'general').trim().toLowerCase();
  username = (username || 'Anonymous').trim().slice(0, 24);
  password = (password || '').trim();

  const roomData = getRoomDB(roomCode);

  if (roomData.password) {
    if (password !== roomData.password) {
      socket.emit('join-error', 'Incorrect password for this channel.');
      return false;
    }
  } else if (password) {
    roomData.password = password;
    saveDB(db);
  }

  socket.join(roomCode);
  socket.data.roomCode = roomCode;
  socket.data.username = username;

  if (!presence[roomCode]) presence[roomCode] = {};
  presence[roomCode][socket.id] = username;

  socket.emit('joined', { roomCode, username, isLocked: !!roomData.password });
  const publicHistory = roomData.messages.map(({ ownerSocketId, ...rest }) => rest);
  socket.emit('history', publicHistory);

  socket.to(roomCode).emit('system-message', `${username} joined the chat`);
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
      socket.to(roomCode).emit('system-message', `${username} left the chat`);
      io.to(roomCode).emit('user-list', getRoomUsers(roomCode));
    }
  }
  socket.data.roomCode = null;
}

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
    const { roomCode, username } = socket.data;
    if (!roomCode || !text) return;

    const isImage = type === 'image';
    if (!isImage && !text.trim()) return;

    const roomData = getRoomDB(roomCode);
    const id = crypto.randomUUID();
    const cleanText = isImage ? text : text.trim().slice(0, 1000);

    const message = {
      id,
      username,
      text: cleanText,
      type: isImage ? 'image' : 'text',
      time: new Date().toISOString(),
      replyTo: replyTo || null,
      ownerSocketId: socket.id,
    };

    roomData.messages.push(message);
    if (roomData.messages.length > MAX_MESSAGES_PER_ROOM) {
      roomData.messages = roomData.messages.slice(-MAX_MESSAGES_PER_ROOM);
    }
    saveDB(db);

    const { ownerSocketId, ...publicMessage } = message;
    io.to(roomCode).emit('chat-message', publicMessage);
  });

  socket.on('edit-message', ({ id, newText }) => {
    const { roomCode } = socket.data;
    const roomData = db.rooms[roomCode];
    if (!roomData) return;
    const msg = roomData.messages.find((m) => m.id === id);
    if (!msg || msg.ownerSocketId !== socket.id || msg.type === 'image') return;
    if (!newText || !newText.trim()) return;

    msg.text = newText.trim().slice(0, 1000);
    saveDB(db);
    io.to(roomCode).emit('message-edited', { id, newText: msg.text });
  });

  socket.on('delete-message', ({ id }) => {
    const { roomCode } = socket.data;
    const roomData = db.rooms[roomCode];
    if (!roomData) return;
    const idx = roomData.messages.findIndex((m) => m.id === id);
    if (idx === -1 || roomData.messages[idx].ownerSocketId !== socket.id) return;

    roomData.messages.splice(idx, 1);
    saveDB(db);
    io.to(roomCode).emit('message-deleted', { id });
  });

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
