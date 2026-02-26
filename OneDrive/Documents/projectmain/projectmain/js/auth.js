// ── OncoGuard AI — Local Authentication Module (localStorage) ───────────
(function () {
    'use strict';

    const SESSION_KEY = 'oncoguard_session';
    let currentUser = null;

    // Demo credentials (local-only mode)
    const DEMO_USER_EMAIL = 'doctor';
    const DEMO_USER_PASSWORD = 'oncoguard2024';
    const DEMO_USER_FULLNAME = 'Demo Doctor';

    function seedDemoUser() {
        try {
            const users = JSON.parse(localStorage.getItem('oncoguard_users') || '{}');
            if (!users[DEMO_USER_EMAIL]) {
                users[DEMO_USER_EMAIL] = { id: 'u_demo', email: DEMO_USER_EMAIL, password: DEMO_USER_PASSWORD, profile: { fullName: DEMO_USER_FULLNAME, role: 'doctor', email: DEMO_USER_EMAIL } };
                localStorage.setItem('oncoguard_users', JSON.stringify(users));
            }
            const data = JSON.parse(localStorage.getItem('oncoguard_data') || '{}');
            data['u_demo'] = data['u_demo'] || {};
            localStorage.setItem('oncoguard_data', JSON.stringify(data));
        } catch (e) {
            console.warn('Could not seed demo user', e);
        }
    }

    // ensure demo user exists, then initialize session
    seedDemoUser();
    // initialize from session
    function initSession(){
        const id = localStorage.getItem('current_user_id');
        if (id) {
            currentUser = { uid: id, email: localStorage.getItem('current_user_email') };
            localStorage.setItem(SESSION_KEY, 'authenticated');
        }
    }
    initSession();

    /** Returns true if the user has a valid session */
    window.isAuthenticated = function () {
        return currentUser !== null || localStorage.getItem(SESSION_KEY) === 'authenticated';
    };

    /** Get the current authenticated user */
    window.getCurrentUser = function () {
        return currentUser;
    };

    /** Get current user ID */
    window.getCurrentUserId = function () {
        return currentUser?.uid || localStorage.getItem('current_user_id');
    };

    /** Redirect unauthenticated users to login. Call at top of every protected page. */
    window.requireAuth = function () {
        if (!isAuthenticated()) {
            window.location.href = '#/login';
        }
    };

    /** Local sign up. Returns { success, error } */
    window.attemptSignUp = async function (email, password, userData) {
        try {
            const result = await FDB.signUp(email, password, userData);
            return result;
        } catch (error) {
            console.error('Sign up error:', error);
            return { success: false, error: error.message };
        }
    };

    /** Local login. Returns { success, error } */
    window.attemptLogin = async function (email, password) {
        try {
            const result = await FDB.signIn(email, password);
            if (result.success) {
                // Establish session
                localStorage.setItem(SESSION_KEY, 'authenticated');
                localStorage.setItem('current_user_id', result.user.uid);
                localStorage.setItem('current_user_email', result.user.email);
                currentUser = { uid: result.user.uid, email: result.user.email };
                return { success: true };
            }
            return { success: false, error: result.error };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    };

    /** Logout */
    window.logout = async function () {
        try {
            await FDB.signOut();
        } catch (e) { /* ignore */ }
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem('current_user_id');
        localStorage.removeItem('current_user_email');
        localStorage.removeItem('screening_step1');
        localStorage.removeItem('screening_step2');
        localStorage.removeItem('screening_step3');
        currentUser = null;
        window.location.href = '#/login';
    };

    /** Password reset (local stub) */
    window.resetPassword = async function (email) {
        // In local mode we can't send emails; mimic success if user exists
        const users = JSON.parse(localStorage.getItem('oncoguard_users') || '{}');
        if (users[email]) return { success: true };
        return { success: false, error: 'No user found' };
    };

})();
