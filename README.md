# IP Chat

<<<<<<< HEAD
A production-quality real-time chat app — glassmorphism UI inspired by Discord/Telegram/WhatsApp Web, built with Node.js + Express + Socket.IO.
=======
Real-time web chat app — 1-on-1 aur group chat, channel codes ke through. Node.js + Express + Socket.io (backend), plain HTML/CSS/JS (frontend).
>>>>>>> b84223d379f54b7af70875bcbe33f3de89fa1ba9

## Local pe chalana

```bash
npm install
npm start
```

<<<<<<< HEAD
Browser me kholo: http://localhost:3000

## Free Deploy (Render.com)

1. GitHub pe naya repo banao, ye saara code push/upload karo (node_modules aur data/db.json ko chhod ke — .gitignore already handle karta hai).
2. https://render.com pe GitHub se sign in karo.
3. "New +" → "Web Service" → apna repo connect karo.
4. Settings:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start` (ya `node server.js`)
   - **Instance Type**: Free
5. Deploy hote hi ek live URL milega.

## UI/UX
- Glassmorphism design — blurred glass panels, blue→violet gradient accents
- Dark mode by default, light mode toggle available
- Inter font, smooth 60fps animations throughout
- Mobile-first responsive layout — sidebar becomes a slide-out drawer on phones/tablets, permanent dock on desktop (≥1024px)
- No horizontal scrolling on any screen size
- Modern message bubbles with delivery ticks (🕐 sending → ✓ sent → ✓✓ delivered)
- Loading screen + connection status pulse bar + toast notifications
- Animated typing indicator (bouncing dots)

## Real-time sync (fixed for this redesign)
- **No duplicate messages**: the sender's own message is only ever echoed back to that sender's socket (with a client-generated `tempId`); everyone else gets exactly one broadcast copy. The client swaps its optimistic "sending…" bubble for the real message using that `tempId` — it never appends a second copy.
- **No missing messages / correct order**: every message gets a server-assigned numeric timestamp (`Date.now()`), so ordering is consistent across devices even with clock drift.
- **Auto reconnect + resync**: Socket.IO auto-reconnects on network loss. On every reconnect, the client automatically re-joins its current room, and the server always answers with the *full* room history — the client wipes and rebuilds the message list from that, guaranteeing devices converge on identical state after any drop.
- **Delivery confirmation**: a message is marked `delivered` server-side if someone else was in the room at broadcast time; the sender's bubble shows a single vs. double checkmark accordingly.
- **Typing indicator & online status**: synced live via Socket.IO room broadcasts, cleared automatically on disconnect.

## Features
- Username + channel code (room) system, with optional password-protected channels
- Real-time messaging with delivery ticks
- Image sharing (up to 1.5MB)
- Reply/quote, edit, delete your own messages
- Emoji picker
- In-channel message search
- Live directory of active channels — switch between them with one click
- Message history persisted to `data/db.json` (last 150 messages per channel), survives restarts
- Installable as a PWA ("Add to Home Screen")
- Notification sound + unread title badge when the tab is in the background

### Note on persistence
Render's free tier disk can reset on a fresh deploy, so very long-term history isn't guaranteed there — it will survive normal restarts and the free-tier sleep cycle though. For guaranteed permanent storage, swapping in a real database (e.g. MongoDB Atlas free tier) would be the next upgrade.
=======
Phir browser me kholo: http://localhost:3000

Do alag browser tabs/windows me kholo, same "channel code" daalo (ya default "general" rehne do), aur chat shuru karo.

## Free pe Deploy karna (Render.com)

Render free tier websockets (Socket.io) ko properly support karta hai, isliye ye best free option hai.

1. Github pe ek naya repo banao aur ye saara code push karo:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - IP Chat"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```

2. https://render.com pe jaake free account banao (GitHub se sign in kar sakte ho).

3. Dashboard me "New +" -> "Web Service" click karo.

4. Apna GitHub repo connect karo (jo abhi push kiya).

5. Settings fill karo:
   - **Name**: ip-chat (ya jo bhi chaho)
   - **Region**: jo nazdeek ho (Singapore best for India)
   - **Branch**: main
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

6. "Create Web Service" click karo. 2-3 minute me deploy ho jayega aur tumhe ek live URL milega jaise:
   `https://ip-chat-xxxx.onrender.com`

Ye URL kisi ke saath bhi share kar sakte ho — wo bhi same channel code daal ke tumse chat kar payega.

### Note
Render free tier pe app 15 min inactivity ke baad sleep ho jaata hai, aur next request pe wapas spin-up hone me ~30-50 sec lagte hain. Agar always-on chahiye to paid plan ($7/month) lena padega, ya Railway.app try kar sakte ho (similar free tier behavior hai).

## Features
- Username + channel code se join (channel code = room, jitne log same code daalenge sab ek chat me)
- Real-time messaging (Socket.io)
- Online users list per channel
- Typing indicator
- System messages (join/leave)
- Mobile responsive
- 🌗 Dark/Light theme toggle
- 👤 Colorful avatars per user
- 😀 Emoji picker
- 🔊 Notification sound on new message
- ↩️ Reply/quote to a specific message
- ✏️ Edit/delete your own messages
- 🖼️ Image sharing (up to 1.5MB per image)
- 🔒 Optional password-protected channels (first person to join with a password locks it)
- 💾 Message history saved to a local file (`data/db.json`) — survives server restarts, last 100 messages per channel
- 🔍 Search messages within the current channel
- 🌐 Live directory of active channels — see what's active and switch between them with one click
- 📲 Installable as an app (PWA) — "Add to Home Screen" on mobile or "Install" on desktop browsers

### Note on persistence
Render's free tier disk can reset on a fresh deploy (e.g. after pushing new code), so very long-term history isn't guaranteed there. It will, however, survive normal restarts and the free-tier "sleep" cycle. For guaranteed permanent storage, a real database like MongoDB Atlas (free tier) would be the next upgrade.
>>>>>>> b84223d379f54b7af70875bcbe33f3de89fa1ba9
