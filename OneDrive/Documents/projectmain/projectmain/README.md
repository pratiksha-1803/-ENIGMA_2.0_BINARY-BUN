# OncoGuard AI Web App

This repository contains a simple single‑page application (SPA) built with
plain HTML/CSS/JavaScript and Firebase for authentication and data storage.
It lives under `projectmain/` in the workspace and can be run locally or
hosted on Firebase Hosting.

## 🚀 Getting Started (run locally)

1. **Clone / open** the workspace in VS Code.
2. **Install a static server**. You can use one of the following methods:
   - **Node (recommended)**
     ```bash
     npm install --save-dev http-server
     npm run start          # opens http://localhost:8080 by default
     ```
     A `package.json` with a `start` script is included in the repo.
   - **Python** (no install):
     ```bash
     cd projectmain
     python -m http.server 8000
     ```
   - **Other** servers such as `live-server`, `serve`, etc. will also work.

3. Open the URL reported by the server (e.g. `http://localhost:8080`) in
your browser. Firebase features require the site to be served over `http` or
`https` (file:// will not work because of security restrictions).

4. **Configure Firebase** (see below) before trying to log in or use the
portal.

## 🔧 Firebase configuration

The app reads settings from `js/firebase-config.js`. Replace the placeholder
values with the credentials from your Firebase console (Project settings ➜
General). Example:

```js
const FIREBASE_CONFIG = {
  apiKey: "AIza....",
  authDomain: "myproject.firebaseapp.com",
  projectId: "myproject",
  storageBucket: "myproject.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456",
  measurementId: "G-XXXXXXX"
};
```

> 🚨 **Do not commit real API keys or service account files to a public
> repository.** Treat this file as configuration that varies per
environment.

After updating the config, refresh the page and you should see the
`✓ Firebase initialized` message in the browser console.

## 📦 Optional: Firebase Hosting

To deploy the site to Firebase Hosting, first install the CLI:

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# when prompted, select the `projectmain` directory as your public folder
# and configure as a single‑page app (rewrite all URLs to index.html)
```

Then publish:

```bash
firebase deploy --only hosting
```

Your site will be available at `https://<your-project>.web.app` (or
`.firebaseapp.com`).

## 🗂️ Project structure

```
projectmain/
├─ index.html          # entrypoint
├─ css/styles.css
├─ js/                 # all client-side scripts
├─ sql/                # (empty) future database exports
└─ README.md           # this help file
```

## ✅ Checklist for a runnable site

- [ ] Firebase config has been updated.
- [ ] Site served via HTTP/HTTPS (not file://).
- [ ] All JS files load without 404 errors (check browser console).
- [ ] Authentication rules in Firebase allow the operations used by the
  application.

---

Feel free to modify assets or add build tooling if necessary. The core
application is plain HTML/JS and can run in any modern browser.