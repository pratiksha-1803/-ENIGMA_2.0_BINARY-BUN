/* ============================================================
  OncoGuard AI — Local fallback configuration
  ============================================================ */

// Running in local-only mode (no Firebase). This file intentionally
// does not attempt to load or initialize any Firebase SDKs. The app
// uses `js/firebase-db.js` (local implementation) and `js/auth.js`
// which provide the same method signatures but backed by localStorage.

console.log('ℹ Running in local-only mode (no Firebase)');
