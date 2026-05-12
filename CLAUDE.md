# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev           # Dev server at localhost:3000
npm run build         # Production build (also runs next-sitemap)
npm run start         # Start production server
npm run lint          # ESLint (next lint)
```

### Environment selection
`ENV` env var controls which config block loads from `config/config.json`. Values: `local | dev | qa | prod` (defaults to `qa`).

```bash
ENV=local npm run dev
ENV=prod npm run build
```

---

## Project Overview
Travel booking web app — brand **QTravel / Qugo** (qugo.io). Serves two user types:
- **B2C** (`qugo`) — individual travelers: search + book flights/hotels/packages, wallet, profile
- **Corporate** — business travel: departments, travel policies, approvals, expense management

**Related service:** `E:\QTRAVEL\ai-agent-service` — AI booking agent backend (Node.js/TS, port 4000). The webapp connects to it via `NEXT_PUBLIC_AI_AGENT_URL` env var.

---

## Tech Stack
- **Next.js 13** — Pages Router (`src/pages/`), JavaScript (not TypeScript)
- **Redux Toolkit** + `next-redux-wrapper`
- **Tailwind CSS** + **Bootstrap 5** + **CSS Modules**
- **Firebase** — push notifications (prod) + analytics
- **Pusher** + **STOMP/WebSocket** — real-time (corporate)
- **CashFree + PhonePe** — payments (`src/paymentGateways/`)

## Path Aliases (`jsconfig.json`)
- `@/*` → `./src/*`
- `@/utils/*` → `./utils/*`

---

## Environment & Config
- All env values in `config/config.json` under `environments.<ENV>` + `common` section
- `src/config.js` and `next.config.js` both merge env+common into one config object
- **Never hardcode URLs** — always read from `config` import
- **AI Agent URL**: `NEXT_PUBLIC_AI_AGENT_URL` in `.env.local` — this is a Next.js public env var, NOT in config.json

---

## Auth & Session — Critical Patterns

### NEVER import raw axios. Always use:
```js
import axios, { getTabSpecificData, setTabSpecificData, removeTabSpecificData } from "@/utils/axios/axios"
```

The custom instance (`utils/axios/axios.js`) handles:
- `Authorization: Bearer {token}` + `X-User-Type` header injection
- 401 → token refresh (max 3 attempts) → retry queue → force logout
- Tab-specific sessionStorage isolation (each browser tab has its own session)

### Token storage keys (tab-specific sessionStorage)
- `activeUserType` — `"corporate"` or `"qugo"` — read this FIRST to know which user type
- `${userType}_accessToken` — JWT access token, e.g. `corporate_accessToken` or `qugo_accessToken`
- `${userType}_refreshToken` — JWT refresh token, e.g. `corporate_refreshToken` or `qugo_refreshToken`
- `userDetails` — username string

**NEVER** use plain `accessToken` or `refreshToken` keys — they do not exist. Always read `activeUserType` first, then access `${activeUserType}_accessToken`.

```js
const activeUserType = getTabSpecificData("activeUserType");
const token = getTabSpecificData(`${activeUserType}_accessToken`)?.replace(/"/g, "");
const refreshToken = getTabSpecificData(`${activeUserType}_refreshToken`)?.replace(/"/g, "");
```

### User type detection
```js
import { useUserType } from "@/hooks/useUserType"   // React hook
import { isCorporateUser } from "@/utils/common"    // Utility (non-hook)
```

---

## State Management (`src/store/`)

```
store.js
slices/
  userSlice.js          — corporate auth: { isLoggedIn, userInfo: { loggedInDetails: { userDetails, companyDetails, travelPolicy } } }
  b2c/userSlice.js      — B2C: { profile: { id, firstName, lastName, email, mobile }, wallet, bookings, recentSearches }
  travellersSlice.js    — traveller selection for booking
  notificationSlice.js
  approvalSlice.js      — corporate approval requests
context/
  LoginContext.js       — accessToken, isLoggedIn, openPopup/closePopup, isCorporateLoginModalVisible
selectors/
  corporateSelectors.js
  b2cSelectors.js
```

**Corporate userId**: `state.user.userInfo?.loggedInDetails?.userDetails?._id`
**B2C userId**: `state.b2cUser.profile?.id ?? state.b2cUser.profile?._id`

---

## App Initialization (`src/pages/_app.js`)
The provider/initializer stack (top → bottom):
```
<Provider store={store}>
  <LoginProvider>
    <StoreInitializer />        — restores session from localStorage
    <WebSocketInitializer />    — STOMP websocket for corporate real-time
    <NotificationInitializer /> — Firebase FCM push notifications
    <GlobalPolicyListener />    — travel policy updates
    <AIChatWidget />            — [AI AGENT] floating booking assistant widget
    <ProfileCompletionGuard>
      <Component />
    </ProfileCompletionGuard>
```

---

## AI Chat Widget (`src/components/AIChatWidget/`)
Floating booking assistant powered by `ai-agent-service`. Added 2026-03-14.

| File | Purpose |
|---|---|
| `AIChatWidget.jsx` | Main widget — floating button + chat panel, SSE streaming |
| `ChatMessage.jsx` | Message bubble renderer (plain / confirm card / payment link) |
| `WorkflowProgress.jsx` | 9-step horizontal progress bar |
| `AIChatWidget.module.css` | All styles |

**Auth pattern**:
```js
const isCorporate = useUserType()
const corporateUserId = useSelector(selectCorporateUserId)   // from corporateSelectors
const b2cUserId = useSelector(selectB2CUserId)               // from b2cSelectors
const userId = isCorporate ? corporateUserId : b2cUserId

const activeUserType = getTabSpecificData("activeUserType");
const token = getTabSpecificData(`${activeUserType}_accessToken`)?.replace(/"/g, "");
const refreshToken = getTabSpecificData(`${activeUserType}_refreshToken`)?.replace(/"/g, "");
```

**AI_AGENT_URL** — read from `config.AI_AGENT_URL` (set in `config/config.json` per environment). Base path: `{AI_AGENT_URL}/ai-agent/api/v1.0`.

**Conversation state** — stored only in DB, never in sessionStorage. On mount, widget calls `GET /ai-agent/api/v1.0/chat/me/active` to restore history.

**SSE streaming** — `fetch()` + `ReadableStream` to `POST {AI_AGENT_BASE}/chat`. Special chunk prefixes:
- `"CONV:{id}"` → capture conversationId (always first chunk)
- `"STEP:{STAGE}"` → update workflow progress bar
- `"CONFIRM:{json}"` → render Yes/No confirmation card
- `"LINK:{url}"` → render payment button
- `"[Processing:..."` → internal marker, skip in UI
- `"END"` → stream done

**Widget only renders when user is logged in** (returns `null` if `userId` is null).

---

## Key Directories

| Path | Contents |
|---|---|
| `src/pages/flights/` | B2C flight search: `oneway/`, `twoway/`, `multicity/`, `confirmation.js` |
| `src/pages/flight/` | Corporate flight pages |
| `src/pages/booking/` | Hotel booking flow |
| `src/pages/bookings/` | Booking list |
| `src/pages/confirmationbooking/` | Booking confirmation |
| `src/pages/corporate/` | Corporate portal |
| `src/components/flights/` | B2C flight UI (banner, seat map, filters, sidesheet) |
| `src/components/b2c/` | B2C-specific components |
| `src/components/corporate/` | Corporate components (booking, travel policy, approvals) |
| `src/components/AIChatWidget/` | AI booking agent widget (4 files) |
| `utils/flights/` | Flight search hook (3215 lines), helpers |
| `utils/axios/` | Custom axios instance — the ONLY way to make HTTP calls |
| `utils/bookingAPI.js` | Hotel booking API calls |
| `utils/profileAPI.js` | User profile + flight booking detail retrieval |
| `src/paymentGateways/` | `cashFree.js`, `phonePe.js`, `pgRouting.js` |
| `src/hooks/` | Custom hooks: `useUserType`, `useWebSockets`, `useLocalStorage`, etc. |
| `src/hoc/` | Higher-order components: `withAuth.js` (corporate auth guard) |

---

## Real-time Infrastructure

| Channel | Technology | Endpoint | Purpose |
|---|---|---|---|
| Corporate real-time | WebSocket (STOMP/SockJS) | `wss://qa-socket.qugo.io:3109/ws` | Notifications, approvals, bookings |
| Events chat | Pusher | Channel-based | Event chatbot, typing indicators |
| Push notifications | Firebase Cloud Messaging | Service Worker | Browser push |
| AI agent chat | SSE (fetch) | `{AI_AGENT_URL}/api/chat` | AI booking workflow |
| Existing chatbot | SSE (fetch) | `/qtravels/eventsService/api/v1.0/messages/chat` | Old event chatbot |

---

## QTravel API Base URLs
- QA: `https://qa.qtravelservice.qugo.io`
- Prod: `https://prod.qtravelservice.qugo.io`

Key flight APIs (all relative to base URL):
- Search: `POST /qtravels/flightSearchService/api/v1.0/searchFlights`
- Fare quote: `POST /qtravels/flightSearchService/api/v1.0/getFareQuote`
- Book (LCC): `POST /qtravels/flightbookingservice/api/v1.0/ticketLccFlight`
- Book (NonLCC): `POST /qtravels/flightbookingservice/api/v1.0/ticketNonLccFlight`
- Payment: `POST /qtravels/paymentservice/api/v1.0/CreatePaymentOrder`

---

## Firebase Service Worker
`public/firebase-messaging-sw.js` is **auto-generated** at build time from `public/firebase-messaging-sw-template.js`. Edit the template, not the generated file.

---

## Coding Conventions
1. **Never** import raw `axios` — always from `@/utils/axios/axios`
2. **Config values** — import from `@/config` (default export)
3. **Toasts** — use `showToast()` from `@/utils/toast`
4. **Tab data** — always use `getTabSpecificData` / `setTabSpecificData`
5. Pages use `.js`; components use `.jsx` for React-heavy UI files
6. B2C and corporate features get their own subdirectories under `src/components/`
7. CSS: prefer Tailwind utility classes; use CSS Modules (`.module.css`) for complex component-specific styles
