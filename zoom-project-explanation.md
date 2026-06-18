# TalkFlow / Zoom Project Explanation

## 1. Project Overview

Ye project ek Zoom-like video meeting app hai jiska product name UI me **TalkFlow** dikh raha hai.

High-level architecture:

- **Frontend:** React + Vite app in `frontend/`
- **Backend:** Node.js + Express + MongoDB + Socket.IO in `backend/`
- **Database:** MongoDB through Mongoose
- **Realtime:** Socket.IO for WebRTC signaling and live chat
- **Video calls:** Browser WebRTC APIs: `getUserMedia`, `RTCPeerConnection`, `getDisplayMedia`
- **Auth:** Basic signup/login with user stored in MongoDB and then saved in browser `localStorage`

Important note: `package-lock.json`, `node_modules/`, `dist/`, and image files are generated/build/dependency artifacts. They are not handwritten business logic, so their "use" is explained, but they should not be read line-by-line for app understanding.

## 2. Root Files

### `.gitignore`

Purpose: Git ko batata hai kaunsi files commit nahi karni.

Lines:

- `node_modules/`: installed dependencies ignore.
- `.env`: secrets/config ignore.
- `dist/`: frontend build output ignore.
- `.DS_Store`: macOS system file ignore.
- `*.log`: log files ignore.
- `.vscode/settings.json`, `.idea/`: editor settings ignore.
- `.backend-dev.*`: backend dev process logs/pid ignore.

### `package.json`

Purpose: Root-level package file. Isme sirf `react-icons` dependency hai. Actual frontend/backend scripts apne folders ke package files me hain.

### `package-lock.json`

Purpose: npm dependency versions ka exact lock. Generated file hai.

## 3. Backend

Backend folder: `backend/`

### `backend/package.json`

Purpose: Backend dependencies and scripts.

- `"type": "module"`: ES module imports use hote hain.
- `dev`: `nodemon src/app.js`, development server auto-restart.
- `start`: `node src/app.js`, normal run.
- `prod`: `pm2 src/app.js`, production process manager.
- Dependencies:
  - `express`: REST API.
  - `mongoose`: MongoDB models.
  - `socket.io`: realtime events.
  - `cors`: frontend/backend cross-origin allow.
  - `dotenv`: `.env` values load.
  - `bcrypt`: installed but currently password hashing me use nahi ho raha.
  - `nodemon`: dev reload.

### `backend/.env`

Purpose: Backend config. Key found:

- `MONGO_URL`: MongoDB connection string.

Value intentionally masked.

### `backend/src/app.js`

Purpose: Backend entry point.

Line/block explanation:

- Imports Express, Mongoose, CORS, dotenv, Node HTTP server, socket manager, and route modules.
- `dotenv.config()` loads `.env`.
- `const app = express()` creates Express app.
- `const server = createServer(app)` creates raw HTTP server because Socket.IO needs the HTTP server.
- `connectToSocket(server)` attaches Socket.IO to the same server.
- `app.use(cors())` allows frontend requests.
- `express.json({ limit: "40kb" })` parses JSON body.
- `express.urlencoded(...)` parses form-like body data.
- Route mounting:
  - `/api/auth`
  - `/api/meeting`
  - `/api/chat`
  - `/api/future-meetings`
  - `/api/support`
- `/home` test route returns `{ hello: "world" }`.
- `PORT` comes from env or defaults to `5000`.
- `mongoose.connect(process.env.MONGO_URL)` connects DB.
- After DB connection, server starts listening.
- Catch block logs MongoDB connection error.

### `backend/src/controllers/socketManager.js`

Purpose: Realtime meeting engine. Ye file WebRTC signaling, room joining, screen-share ownership, and realtime chat handle karti hai.

Main variables:

- `meetingPresenters = new Map()`: meetingId -> presenter socket id. Ek time par ek presenter allow karta hai.
- `joinedMeetingId`: current socket ne kaunsi meeting join ki. Note: ye variable function scope me shared hai, per-socket nahi, isliye multi-user disconnect me bug risk hai.
- `io = new Server(server, { cors: ... })`: Socket.IO server starts with allowed frontend origins.

Event flow:

- `connection`: jab user socket connect karta hai.
- `join-meeting`:
  - meetingId save karta hai.
  - existing room users nikalta hai.
  - current socket ko room join karata hai.
  - current user ko `existing-users` bhejta hai.
  - room ke baaki users ko `user-joined` bhejta hai. Frontend currently `user-joined` listen nahi karta, because offer flow existing-users se start hota hai.
- `offer`: caller ka WebRTC offer target socket ko forward karta hai.
- `answer`: callee ka answer target socket ko forward karta hai.
- `ice-candidate`: ICE candidate target socket ko forward karta hai.
- `screen-share-start`:
  - checks if someone else is already presenting.
  - if free, stores presenter socket id.
  - callback se success/failure frontend ko batata hai.
  - room ko `screen-share-started` emit karta hai.
- `screen-share-stop`:
  - presenter socket matches ho to map se remove.
  - room ko `screen-share-stopped` emit karta hai.
- `send-message`:
  - message validate/trim karta hai.
  - MongoDB me `ChatMessage.create`.
  - room ko `receive-message` emit.
- `disconnect`:
  - meeting room ko `user-left` emit.
  - agar disconnecting user presenter tha to presenter clear.
- `leave-meeting`:
  - manually meeting leave notification.

### `backend/src/routes/authRoutes.js`

Purpose: Signup/login API.

`POST /api/auth/signup`:

- Reads `fullname`, `email`, `password`.
- Required validation.
- Password length min 6.
- Existing email check with lowercase trimmed email.
- Creates user.
- Returns public user object: id, fullname, email.

`POST /api/auth/login`:

- Reads email/password.
- Required validation.
- Finds user by normalized email.
- Compares plain text password.
- Returns user object on success.

Important security note: password plain text me save/compare ho raha hai. `bcrypt` installed hai, but use nahi ho raha. Production ke liye hash required hai.

### `backend/src/routes/meetingRoutes.js`

Purpose: Meeting history save and fetch.

- `POST /api/meeting/save`:
  - Reads `meetingId`, `userId`.
  - Checks if same meeting already exists for same user.
  - Creates only if not existing.
  - Returns saved/existing meeting.
- `GET /api/meeting/:userId`:
  - User ke meetings fetch.
  - Sort by latest date first.

### `backend/src/routes/futureMeetingRoutes.js`

Purpose: Scheduled/future meetings.

- `POST /api/future-meetings/save`:
  - Reads title, description, scheduledDate, scheduledTime, meetingId, userId.
  - Validates all required fields.
  - Creates FutureMeeting.
- `GET /api/future-meetings/:userId`:
  - User ke scheduled meetings fetch.
  - Sort by date/time ascending.

### `backend/src/routes/chatRoutes.js`

Purpose: Chat history APIs.

- `GET /api/chat/meeting/:meetingId`:
  - One meeting ke all messages fetch.
  - Sort oldest to newest.
- `GET /api/chat/user/:userId`:
  - User ke saved meetings fetch.
  - Meeting ids extract.
  - Finds which meetings actually have chat messages.
  - Fetches host user.
  - Returns only meetings where chats exist.

### `backend/src/routes/supportRoutes.js`

Purpose: Help/support form submit.

- `POST /api/support/create`:
  - Reads userId, subject, message.
  - Validates fields.
  - Creates support ticket with default status from model.

### `backend/src/models/user.js`

Purpose: User schema.

Fields:

- `fullname`: required string.
- `email`: required unique string.
- `password`: required string.
- `{ timestamps: true }`: adds `createdAt`, `updatedAt`.

### `backend/src/models/meeting.js`

Purpose: Meeting history schema.

Fields:

- `meetingId`: string meeting code.
- `userId`: string user id.
- `date`: date, default current time.

### `backend/src/models/futureMeeting.js`

Purpose: Scheduled meeting schema.

Fields:

- `title`, `description`: required strings.
- `scheduledDate`: required Date.
- `scheduledTime`: required string.
- `meetingId`: required string.
- `userId`: required string.

### `backend/src/models/chatMessage.js`

Purpose: Chat message schema.

Fields:

- `meetingId`: required string.
- `senderId`: required string.
- `senderName`: required string.
- `message`: required trimmed string.
- timestamps add message time.

### `backend/src/models/supportTicket.js`

Purpose: Support request schema.

Fields:

- `userId`, `subject`, `message`: required.
- `status`: default `"open"`.
- timestamps for tracking.

## 4. Frontend Config

### `frontend/package.json`

Purpose: Frontend app scripts/dependencies.

- `dev`: start Vite dev server.
- `build`: production build.
- `lint`: ESLint.
- `preview`: preview built app.
- Runtime dependencies:
  - `react`, `react-dom`
  - `react-router-dom`
  - `socket.io-client`
- Dev dependencies:
  - Vite, React plugin, ESLint packages.

### `frontend/.env`

Purpose: Frontend config. Key found:

- `VITE_API_URL`: backend API/socket base URL.

Value intentionally masked.

### `frontend/index.html`

Purpose: Vite HTML shell.

- Sets HTML language, charset, viewport.
- Sets favicon.
- Page title: TalkFlow.
- `div#root` is React mount point.
- `/src/main.jsx` loads React app.

### `frontend/vite.config.js`

Purpose: Vite config.

- Imports `defineConfig`.
- Imports React plugin.
- Exports config with `plugins: [react()]`.

### `frontend/eslint.config.js`

Purpose: Lint config.

- Ignores `dist`.
- Applies recommended JS rules, React hooks rules, React refresh Vite rules.
- Browser globals enabled.
- JSX parser option enabled.

### `frontend/README.md`

Purpose: Default Vite React template documentation.

### `frontend/public/favicon.png`

Purpose: Browser tab icon.

### `frontend/dist/*`

Purpose: Built production output. Generated by `vite build`; not source.

## 5. Frontend Entry And Routing

### `frontend/src/main.jsx`

Purpose: React app entry.

- Imports React DOM `createRoot`.
- Imports `App`.
- Finds `#root` from `index.html`.
- Renders `<App />`.

### `frontend/src/App.jsx`

Purpose: Top-level router.

- Uses `BrowserRouter`.
- `/*` routes go to landing site.
- `/dashboard/*` routes go to protected dashboard.
- `ProtectedRoute` checks localStorage user before dashboard.
- `useState` import is unused.

### `frontend/src/Landing/LandingPageWrapper.jsx`

Purpose: Landing-side nested routes.

- Imports landing CSS.
- Wraps all landing pages in `LandingLayout`.
- Routes:
  - `/`
  - `/features`
  - `/pricing`
  - `/support`
  - `/login`
  - `/signup`

### `frontend/src/Landing/LandingLayout.jsx`

Purpose: Common landing layout.

- Shows Navbar.
- Renders current page children.
- Shows Footer.

## 6. Landing Pages

### `Landing.jsx`

Purpose: Home page.

- Uses `useNavigate`.
- Hero section with headline and start button.
- Start Meeting navigates to `/login`.
- How It Works section with 3 cards.
- Testimonials section with avatar images and text.

### `Features.jsx`

Purpose: Marketing feature page.

- Lists HD video/audio, screen sharing, realtime chat, security, performance, browser join.
- CTA button navigates to `/login`.

### `Pricing.jsx`

Purpose: Pricing page.

- Shows Free, Pro, Business plan cards.
- Free and bottom CTA navigate to login.
- Pro/Business buttons currently do not have click handlers.

### `Support.jsx`

Purpose: Public FAQ/support info page.

- Static FAQ list.
- Static contact/support text.
- Does not call backend support API; backend support is used from dashboard Help page.

### `Login.jsx`

Purpose: Login UI/API flow.

- State: email, password, error, loading, hideError.
- `handleLogin`:
  - prevents default.
  - POSTs to `${VITE_API_URL}/api/auth/login`.
  - sends email/password JSON.
  - if error, shows backend message.
  - if success, saves user to localStorage.
  - navigates to `/dashboard`.
  - catch shows temporary error.
- JSX renders login box, inputs, submit button, signup link.

### `Signup.jsx`

Purpose: Signup UI/API flow.

- State: fullname, email, password, confirmPassword, message, loading.
- Validates password match.
- Validates min length.
- POSTs to `/api/auth/signup`.
- On success saves user to localStorage and navigates dashboard.
- Renders social login buttons, but they are only UI, no OAuth logic.

### `components/Navbar.jsx`

Purpose: Landing navigation.

- Uses `NavLink` to show active route class.
- Links: TalkFlow home, Features, Pricing, Support, Login, Signup.

### `components/Footer.jsx`

Purpose: Landing footer copyright.

## 7. Dashboard Layout

### `DashboardPageWrapper.jsx`

Purpose: Dashboard nested routing/layout.

- Uses `useLocation` to detect meeting room route.
- If route includes `/meeting/`, hides Sidebar and Topbar.
- Normal dashboard pages get Sidebar + Topbar.
- Routes:
  - `/dashboard`
  - `/dashboard/meeting/:meetingId`
  - `/dashboard/future-meetings`
  - `/dashboard/chats`
  - `/dashboard/profile`
  - `/dashboard/help`
- `Outlet` import is unused.

### `ProtectedRoute.jsx`

Purpose: Client-side route guard.

- Reads `localStorage.getItem("user")`.
- If absent, redirects to `/login`.
- Else renders children.

### `Sidebar.jsx`

Purpose: Dashboard navigation.

- State `menuOpen` controls mobile nav.
- Shows TalkFlow title.
- Mobile menu button toggles nav.
- Links to Dashboard, Future Meetings, Chats, Profile, Help/Support.
- Some CSS class names referenced in CSS are not fully aligned with JSX (`mainnavigation` etc.), but mobile classes exist.

### `Topbar.jsx`

Purpose: Dashboard top bar.

- Reads user from localStorage.
- Shows dashboard title and user name.
- Logout clears user from localStorage and navigates login.

### `DashboardHome.jsx`

Purpose: Main dashboard page.

- Reads user from localStorage.
- Shows welcome.
- `createMeeting`:
  - Generates meeting id like `TF-1234-AB`.
  - Saves meeting to backend.
  - Navigates to meeting room.
- `joinMeeting`:
  - Validates meeting id input.
  - Saves meeting history.
  - Navigates to meeting room.
- `fetchHistory` effect:
  - GETs `/api/meeting/:userId`.
  - Stores recent meetings.
- JSX:
  - New meeting button.
  - Join meeting input/button.
  - Recent meetings list with Rejoin button.

## 8. Dashboard Pages

### `FutureMeetings.jsx`

Purpose: Schedule upcoming meetings.

- State:
  - form open/closed.
  - future meetings list.
  - error.
  - form data.
- On mount fetches `/api/future-meetings/:userId`.
- `generateMeetingId` creates TF meeting code.
- `getInitialFormData` resets form with new meeting id.
- `handleChange` updates form data by input name.
- `handleSubmit`:
  - validates fields.
  - POSTs `/api/future-meetings/save`.
  - appends new future meeting to state.
  - resets/closes form.
- Date input prevents manual typing and opens picker.
- Time input uses 5-minute steps.

### `Chats.jsx`

Purpose: Past chat browser.

- Fetches meetings that have chats using `/api/chat/user/:userId`.
- `searchText` filters by meetingId or hostName with `useMemo`.
- When meeting selected, fetches messages from `/api/chat/meeting/:meetingId`.
- Mobile state `showMobileChat` switches list/history panels.
- Message bubbles are marked own-message if senderId matches current user.

### `Profile.jsx`

Purpose: Read-only profile page.

- Loads localStorage user.
- Shows avatar initial, name, email, user id.

### `Help.jsx`

Purpose: Dashboard support page.

- Local form state: subject/message.
- Validates required fields.
- Reads logged-in user.
- POSTs support ticket to `/api/support/create`.
- Shows temporary success/error messages.
- Also shows static common issues and quick tips.

## 9. Meeting Room

### `MeetingRoom.jsx`

Purpose: UI composition for one meeting.

- Gets `meetingId` from URL params.
- Calls `useMeetingRoom(meetingId)`.
- Receives refs, streams, states, handlers.
- Shows meeting header.
- If someone is presenting, renders `PresenterView`; otherwise `VideoGrid`.
- Always renders `MeetingControls`.
- Renders `ChatPanel` when chat is open.

### `hooks/useMeetingRoom.js`

Purpose: Core meeting logic.

Important refs:

- `socketRef`: Socket.IO connection.
- `videoRef`: local video DOM element.
- `streamRef`: local camera/mic stream.
- `screenRef`: screen-share stream.
- `peerConnectionsRef`: socketId -> RTCPeerConnection.
- `mySocketIdRef`: current socket id.

Important states:

- `isMuted`, `isCameraOff`, `isScreenShare`.
- `messages`, `message`.
- `remoteStreams`.
- `activePresenterId`.
- `isChatOpen`.

Main functions:

- `stopLocalResources`:
  - disconnects socket.
  - closes all peer connections.
  - stops camera/mic tracks.
  - stops screen-share tracks.
- `startCamera`:
  - asks browser permission for video/audio.
  - stores stream.
  - attaches stream to local video.
- `createOffer`:
  - creates WebRTC offer.
  - sets local description.
  - emits offer to target socket.
- `fetchMessages`:
  - loads old messages for current meeting.
  - marks own messages.
- `createPeerConnection`:
  - prevents duplicate peer connection.
  - configures STUN/TURN servers.
  - adds local tracks.
  - receives remote tracks into `remoteStreams`.
  - sends ICE candidates to target socket.
- `setupMeeting`:
  - starts camera.
  - fetches chat history.
  - connects socket.
  - registers all socket event listeners.
  - emits `join-meeting`.
- Socket listeners:
  - `connect`: saves socket id.
  - `receive-message`: appends chat message and opens chat if message is from other user.
  - `screen-share-started/stopped`: controls presenter state.
  - `existing-users`: creates offers to users already in room.
  - `receive-offer`: creates/uses peer connection, sets remote offer, sends answer.
  - `receive-answer`: applies answer.
  - `receive-ice-candidate`: adds ICE candidate.
  - `user-left`: closes peer connection and removes stream.
- Derived UI values:
  - `presenterIsLocal`
  - `presenterStream`
  - `otherRemoteEntries`
  - `gridClass`
- User actions:
  - `sendMessage`: emits realtime chat message.
  - `endMeeting`: emits leave, cleans up, navigates dashboard.
  - `toggleMute`: enables/disables audio track.
  - `toggleCamera`: enables/disables video track.
  - `stopScreenShare`: replaces screen track back with camera track.
  - `toggleScreenShare`: asks backend for presenter lock, calls `getDisplayMedia`, replaces outgoing video track with screen track.

Important note: TURN credentials are hardcoded in frontend. Production me env/server-side token flow better hai.

### `components/MeetingRoom/VideoGrid.jsx`

Purpose: Normal video grid.

- Maps `remoteStreams` into remote video tiles.
- If no remote users, local video appears as main tile.
- If remote users exist, remote videos show in grid and local video appears in preview.
- Each `<video>` gets stream through `ref`.

### `components/MeetingRoom/PresenterView.jsx`

Purpose: Screen-share layout.

- If local user is presenter, local videoRef displays screen stream and label says "You are sharing".
- If remote user is presenter, presenter stream is attached to large video.
- Participant strip shows local video and other remote users.

### `components/MeetingRoom/MeetingControls.jsx`

Purpose: Bottom meeting controls.

- Imports icons from `react-icons/fa`.
- Buttons:
  - mute/unmute
  - camera on/off
  - end call
  - screen share
  - chat
- `messagesCount` prop is currently unused.

### `components/MeetingRoom/ChatPanel.jsx`

Purpose: Live in-meeting chat modal.

- If `isChatOpen` false, returns `null`.
- Backdrop click closes chat.
- Modal click stops propagation.
- Lists messages.
- Own messages get `own-message`.
- Form input updates message state.
- Submit calls `sendMessage`.

## 10. CSS Files

### `Landing/landingpagestyle.css`

Purpose: Styling for public landing/auth pages. It contains:

- Global body styling.
- Hero sections for landing/features/support.
- Buttons and hover effects.
- How-it-works cards.
- Testimonial cards.
- Navbar and footer.
- Feature/pricing/support layouts.
- Login/signup forms.
- Some dashboard styles also appear in this file, likely older duplicated code.
- Mobile responsive rules at max-width 768px.

### `Dashboard/dashboardpagestyle.css`

Purpose: Styling for dashboard and meeting UI. It contains:

- Dashboard layout, sidebar, topbar.
- Dashboard home actions and recent meeting cards.
- Error/hide animations.
- Meeting room fullscreen layout.
- Presenter mode, video stage, participant strip.
- Video cards, labels, controls.
- Chat modal and chat history page.
- Future meetings page/form/list.
- Profile page.
- Help/support page.
- Responsive rules for 1024px, 900px, 768px, 420px.

## 11. Full App Flow

Signup/login:

1. User opens landing site.
2. Login/signup form calls backend auth route.
3. Backend creates/finds user.
4. Frontend stores returned user in localStorage.
5. Protected dashboard opens.

Create meeting:

1. Dashboard generates meeting id.
2. Saves meeting history to MongoDB.
3. Navigates to `/dashboard/meeting/:meetingId`.
4. MeetingRoom starts camera and socket connection.
5. Socket joins room.
6. Existing users and new user exchange WebRTC offers/answers/candidates.
7. Browser-to-browser media streams start.

Chat:

1. On meeting open, old messages are fetched by REST API.
2. New messages are sent through Socket.IO.
3. Backend saves message to MongoDB.
4. Backend broadcasts saved message to room.

Screen share:

1. User clicks screen-share.
2. Frontend asks backend `screen-share-start`.
3. Backend checks one-presenter rule.
4. Frontend calls `getDisplayMedia`.
5. Existing WebRTC video sender track is replaced with screen track.
6. Stop reverses track back to camera.

Future meetings:

1. User opens Future Meetings.
2. Existing scheduled meetings fetched.
3. Add form creates new meeting id.
4. Backend saves scheduled meeting.

Support:

1. Dashboard Help form posts support request.
2. Backend saves SupportTicket.

## 12. Issues / Improvement Points

- Passwords are stored as plain text. Use `bcrypt.hash` on signup and `bcrypt.compare` on login.
- No JWT/session token. localStorage user object is easy to fake.
- `joinedMeetingId` in socket manager is shared across sockets. Should be per-socket, e.g. `socket.data.meetingId`.
- Frontend hardcodes TURN credentials. Move to env or token service.
- `user-joined` event emitted but not used on frontend.
- `gridClass` is calculated but not passed/used effectively in `VideoGrid`.
- Some imports are unused: `useState` in `App.jsx`, `Outlet` in `DashboardPageWrapper.jsx`.
- Some displayed characters are mojibake (`â€™`, `ðŸ...`), meaning encoding/rendering issue. Replace with proper UTF-8 or ASCII text.
- Login/signup buttons use `onClick` instead of form `onSubmit`; works, but semantic form submit would be cleaner.
- No backend auth middleware protecting meeting/chat/future/support APIs.
- No delete/update for future meetings or support tickets.

