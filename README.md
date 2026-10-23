⚡ Reminder App — Smart Ephemeral Shelf & Pocket Utility
> **The clutter-free replacement for messaging yourself on WhatsApp.**  
> A mobile-first, offline-first shelf utility designed to temporarily store links, IBANs, text snippets, and quick notes with an automated, self-purging background engine.
---
📖 Overview
Many of us have formed the habit of sending messages to our own chat in WhatsApp, Telegram, or Slack just to stash an IBAN, save an interesting link, or remember a temporary door code. Over time, that self-chat turns into an unorganized, permanent graveyard of outdated information.
QuickDrop solves this by offering an instant, private, on-device pocket shelf that automatically purges old data when its time is up, keeping your temporary digital workspace lightweight and focused.
---
✨ Features
📶 Offline-First & Progressive Web App (PWA) Capabilities
100% Offline-First Architecture: Powered entirely by local client-side storage (`localStorage` / `IndexedDB`). Requires zero backend connections, zero third-party cloud trackers, and zero API keys.
Standalone PWA Installability: Fully compliant Progressive Web App with dedicated Web App Manifest, offline service workers via `vite-plugin-pwa`, and adaptive high-resolution icons (192px, 512px, and maskable).
iOS Safari & Android Support: Built-in detection for standalone display mode, complete with guided step-by-step "Add to Home Screen" instructions for iOS Safari users.
Network Resilience: Real-time connectivity monitoring that switches seamlessly to cached local storage whenever you are offline or in airplane mode.
📋 Intelligent Drop & Capture
1-Tap Clipboard Ingestion: Read directly from the device clipboard with a single tap using `navigator.clipboard.readText()`.
Automatic Category Detection:
IBAN Recognition: Identifies Turkish (`TR...`) and international IBAN formats, parses bank identification codes (e.g., Garanti BBVA, İş Bankası, Ziraat Bankası, Yapı Kredi, Akbank), formats the account into readable 4-digit chunks, and provides a 1-tap "Copy Clean IBAN" button.
Link Parsing: Automatically detects web addresses, extracts root domains (e.g., `github.com`), and formats cards with clean external launch actions.
Notes & Snippets: Auto-wraps multiline text, codes, and temporary snippets with clean typography.
⏳ Ephemeral Storage & Auto-Cleanup Engine
Lifespan Presets: Set drops to expire in 24 Hours, 3 Days (Default), 7 Days, or Permanent.
Self-Purging Engine: Scans expiration timestamps on application start, every 60 seconds in the background, and whenever the app resumes focus. Non-pinned drops past their expiration are automatically purged.
Pin Protection: Toggle the Pin on critical drops to override expiration timers and keep them indefinitely.
Instant Undo: Accidentally deleted an item? Restore it in one click via non-intrusive action toasts.
📱 Native Mobile Experience
Touch-Optimized Micro-Interactions: Tactile scale-down active states (`active:scale-95`) and haptic feedback.
Bottom Thumb Dock: Quick access to paste, drop, and shelf controls positioned ergonomically for one-handed mobile use.
On-Screen QR Code Generator: Generates a clean, on-device SVG QR code for any drop so peers can scan links or IBANs directly from your screen with their phone camera.
Search & Filter Pills: Real-time client-side search across content, domain names, and bank tags, combined with dynamic count tabs (All, Links, IBANs, Notes, Pinned).
Data Portability: Export your entire shelf to a clean `.json` backup or import an existing backup at any time.
---
💻 Tech Stack
Framework & UI: React / Next.js patterns
Bundler & Build Tool: Vite
Styling: Tailwind CSS (Charcoal aesthetic `#0d1117`, borders `#21262d`, safe-area-inset support)
Language: TypeScript
PWA Integration: `vite-plugin-pwa` with Service Workers
Iconography: Lucide Icons
---
📂 Project Architecture
```text
├── public/                       # PWA manifest icons & static brand assets
│   ├── icon.svg                  # Vector brand icon
│   ├── pwa-192x192.png           # Standard PWA launcher icon
│   ├── pwa-512x512.png           # High-resolution splash icon
│   ├── pwa-maskable-512x512.png  # Adaptive Android maskable icon
│   ├── apple-touch-icon.png      # iOS Safari home screen icon
│   └── favicon.ico               # Browser tab favicon
├── src/
│   ├── components/               # UI components
│   │   ├── DropCard.tsx          # Card displaying content, expiration & actions
│   │   ├── DropFeed.tsx          # Responsive card list and empty states
│   │   ├── FilterBar.tsx         # Search bar, category filter pills & sorting
│   │   ├── Header.tsx            # Navigation header, counter & install button
│   │   ├── MobileBottomDock.tsx  # Thumb-reach mobile action bar
│   │   ├── PWAInstallButton.tsx  # PWA install prompt & iOS Safari guide
│   │   ├── QRCodeModal.tsx       # Zero-dependency SVG QR code generator
│   │   ├── QuickInputBar.tsx     # Clipboard paste & auto-detection input
│   │   ├── StatsModal.tsx        # Storage usage, JSON backup & purge options
│   │   └── Toast.tsx             # Toast notification & Undo manager
│   ├── hooks/                    # Custom React hooks
│   │   ├── useOnlineStatus.ts    # Online/offline network event monitor
│   │   ├── usePWAInstall.ts      # beforeinstallprompt & standalone detection
│   │   └── useQuickDrop.ts       # Unified shelf state & auto-cleanup scheduler
│   ├── types/
│   │   └── index.ts              # TypeScript schemas and data models
│   ├── utils/                    # Helper utilities
│   │   ├── cleanup.ts            # Auto-cleanup expiration logic
│   │   ├── detector.ts           # IBAN/URL regex parser & bank code matcher
│   │   ├── qr.ts                 # Self-contained QR code SVG generator
│   │   └── storage.ts            # LocalStorage engine, initial seed & JSON export
│   ├── App.tsx                   # Main application layout
│   ├── index.css                 # Tailwind CSS styles & custom scrollbars
│   └── main.tsx                  # Client entry point
├── index.html                    # PWA metadata, Apple touch tags & viewport
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript compiler configuration
└── vite.config.ts                # Vite configuration with PWA plugin
```
---
🚀 Installation & Local Development
Prerequisites
Ensure you have Node.js (v18.0.0 or higher) installed on your system.
1. Clone the Repository
```bash
git clone https://github.com/willbyers1/reminder-app.git
cd quickdrop
```
2. Install Dependencies
```bash
npm install
```
3. Run Development Server
```bash
npm run dev
```
The application will be accessible at: `http://localhost:3000`
4. Build for Production
To create an optimized production build with complete PWA service workers and asset bundles:
```bash
npm run build
```
To preview the production build locally:
```bash
npm run preview
```
---
⌨️ Shortcuts & Gestures
Action	Shortcut / Gesture
Drop single-line item	Press <kbd>Enter</kbd> in the input field
Drop multiline note	Press <kbd>Ctrl</kbd> + <kbd>Enter</kbd> (or <kbd>Cmd</kbd> + <kbd>Enter</kbd>)
Paste from Clipboard	Tap the Paste button in the input bar or bottom dock
Copy Clean IBAN	Tap the Copy IBAN button on any IBAN card
Prevent Expiration	Tap the Pin icon (turns amber)
Undo Deletion	Click Undo on the deletion toast notification
---
📄 License
This project is licensed under the MIT License — feel free to use, modify, and distribute.
