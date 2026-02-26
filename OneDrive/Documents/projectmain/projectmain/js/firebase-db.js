/* ============================================================
   OncoGuard AI — LocalStorage 'FDB' Implementation
   A lightweight drop-in replacement for the original FDB that
   uses localStorage so the app can run without Firebase.
   ============================================================ */

const FDB = (function () {
  const USERS_KEY = 'oncoguard_users';
  const DATA_KEY = 'oncoguard_data';

  function readJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; } catch(e){ return fallback; }
  }
  function writeJSON(key, v){ localStorage.setItem(key, JSON.stringify(v || {})); }

  // users: { [email]: { id, email, password, profile } }
  function ensureUsers(){ const u = readJSON(USERS_KEY, {}); return u; }

  // data: generic storage per user id -> { screening: {step_1: {...}}, medical_data: [...] }
  function ensureData(){ return readJSON(DATA_KEY, {}); }

  return {
    async signUp(email, password, userData = {}){
      const users = ensureUsers();
      if (users[email]) return { success: false, error: 'User already exists' };
      const id = 'u_' + Date.now();
      users[email] = { id, email, password, profile: { fullName: userData.fullName || '', role: userData.role || 'patient', email } };
      writeJSON(USERS_KEY, users);
      // create data bucket
      const data = ensureData(); data[id] = data[id] || {}; writeJSON(DATA_KEY, data);
      return { success: true, user: { uid: id, email } };
    },

    async signIn(email, password){
      const users = ensureUsers();
      const u = users[email];
      if (!u) return { success: false, error: 'No user found' };
      if (u.password !== password) return { success: false, error: 'Invalid password' };
      return { success: true, user: { uid: u.id, email: u.email } };
    },

    async signOut(){ return { success: true }; },

    async getCurrentUser(){
      const id = localStorage.getItem('current_user_id');
      if (!id) return null;
      const users = ensureUsers();
      const u = Object.values(users).find(x => x.id === id);
      return u ? { uid: u.id, email: u.email } : null;
    },

    async createUserProfile(userId, profileData){
      const data = ensureData(); data[userId] = data[userId] || {}; data[userId].profile = { ...data[userId].profile, ...profileData }; writeJSON(DATA_KEY, data);
      return { success: true };
    },

    async getUserProfile(userId){
      const data = ensureData(); const p = data[userId]?.profile || null; if (!p) return { success: false, error: 'Profile not found' }; return { success: true, data: p };
    },

    async updateUserProfile(userId, updates){
      const data = ensureData(); data[userId] = data[userId] || {}; data[userId].profile = { ...(data[userId].profile || {}), ...updates }; writeJSON(DATA_KEY, data); return { success: true };
    },

    async saveScreeningData(userId, stepNumber, dataObj){
      const data = ensureData(); data[userId] = data[userId] || {}; data[userId].screening = data[userId].screening || {}; data[userId].screening[`step_${stepNumber}`] = { step: stepNumber, responses: dataObj, createdAt: Date.now() }; writeJSON(DATA_KEY, data); return { success: true };
    },

    async getScreeningData(userId, stepNumber = null){
      const data = ensureData(); const scr = data[userId]?.screening || {};
      if (stepNumber) { const doc = scr[`step_${stepNumber}`]; return { success: true, data: doc ? [doc] : [] }; }
      const arr = Object.values(scr || {});
      return { success: true, data: arr };
    },

    // Minimal stubs for the other API used by the UI
    async saveMedicalData(userId, medicalData){ const data = ensureData(); data[userId]=data[userId]||{}; data[userId].medical_data = data[userId].medical_data || []; data[userId].medical_data.unshift({ id: 'm_'+Date.now(), data: medicalData, createdAt: Date.now() }); writeJSON(DATA_KEY,data); return { success: true }; },
    async getMedicalData(userId){ const data = ensureData(); return { success: true, data: data[userId]?.medical_data || [] }; },
    async saveRiskAssessment(userId, riskData){ const data = ensureData(); data[userId]=data[userId]||{}; data[userId].risk_assessments = data[userId].risk_assessments||[]; data[userId].risk_assessments.unshift({ id:'r_'+Date.now(), ...riskData, createdAt: Date.now() }); writeJSON(DATA_KEY,data); return { success: true }; },
    async getRiskAssessments(userId){ const data = ensureData(); return { success: true, data: data[userId]?.risk_assessments || [] }; },

    async getValidationRecords(){ const data = ensureData(); return { success: true, data: data.validation_records || [] }; },
    async addValidationRecord(record){ const data = ensureData(); data.validation_records = data.validation_records||[]; data.validation_records.unshift({ ...record, createdAt: Date.now() }); writeJSON(DATA_KEY,data); return { success: true }; },

    // subscriptions are not supported in local mode — provide no-op
    subscribeToScreeningChanges(){ return () => {}; },
    subscribeToMedicalDataChanges(){ return () => {}; },
    subscribeToRiskAssessmentChanges(){ return () => {}; }
  };
})();
