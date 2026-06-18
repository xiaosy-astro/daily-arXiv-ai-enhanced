/**
 * Authentication Module
 * Handles password verification and session management for the application
 *
 * @module Auth
 * @requires auth-config.js
 */

const Auth = {

    // ===============================
    // utils
    // ===============================
    sha256Fallback(ascii) {
        function rightRotate(value, amount) {
            return (value >>> amount) | (value << (32 - amount));
        }

        const mathPow = Math.pow;
        const maxWord = mathPow(2, 32);
        let result = '';

        const words = [];
        const asciiBitLength = ascii.length * 8;

        let hash = this.sha256Fallback.h = this.sha256Fallback.h || [];
        const k = this.sha256Fallback.k = this.sha256Fallback.k || [];

        let isComposite = {};

        for (let candidate = 2, primeCounter = 0; primeCounter < 64; candidate++) {
            if (!isComposite[candidate]) {
                for (let i = candidate; i < 313; i += candidate) {
                    isComposite[i] = true;
                }
                hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
                k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
            }
        }

        ascii += '\x80';
        while (ascii.length % 64 - 56) ascii += '\x00';

        for (let i = 0; i < ascii.length; i++) {
            const j = ascii.charCodeAt(i);
            words[i >> 2] |= j << ((3 - i) % 4) * 8;
        }

        words[words.length] = asciiBitLength;

        for (let j = 0; j < words.length;) {
            const w = words.slice(j, j += 16);
            let oldHash = hash.slice(0);

            for (let i = 0; i < 64; i++) {
                const a = hash[0], e = hash[4];

                const temp1 =
                    hash[7] +
                    (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
                    ((e & hash[5]) ^ (~e & hash[6])) +
                    k[i] +
                    (w[i] = i < 16 ? w[i] :
                        (w[i - 16] + w[i - 7]) | 0
                    );

                const temp2 =
                    (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
                    ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

                hash = [(temp1 + temp2) | 0].concat(hash);
                hash[4] = (hash[4] + temp1) | 0;
            }

            for (let i = 0; i < 8; i++) {
                hash[i] = (hash[i] + oldHash[i]) | 0;
            }
        }

        for (let i = 0; i < 8; i++) {
            result += (hash[i] >>> 0).toString(16).padStart(8, '0');
        }

        return result;
    },

    // ===============================
    // config safe getter
    // ===============================
    _config() {
        if (typeof AUTH_CONFIG === "undefined") {
            console.error("AUTH_CONFIG missing");
            return null;
        }
        return AUTH_CONFIG;
    },

    // ===============================
    // password enabled
    // ===============================
    isPasswordEnabled() {
        const cfg = this._config();
        if (!cfg) return false;

        return cfg.passwordHash &&
            cfg.passwordHash !== 'PLACEHOLDER_PASSWORD_HASH' &&
            cfg.passwordHash !== 'DISABLED_NO_PASSWORD_SET_IN_SECRETS';
    },

    // ===============================
    // login
    // ===============================
    async login(password, remember = true) {
        const cfg = this._config();
        if (!cfg) return false;

        const hash = await this.hashPassword(password);

        if (hash === cfg.passwordHash) {

            const expire = Date.now() +
                (remember ? cfg.sessionDuration : 24 * 3600 * 1000);

            localStorage.setItem(cfg.storageKey, hash);
            localStorage.setItem(cfg.storageExpireKey, expire);

            // simple anti-tamper marker
            sessionStorage.setItem("auth_flag", "1");

            return true;
        }

        return false;
    },

    async hashPassword(password) {
        if (window.crypto?.subtle) {
            const enc = new TextEncoder();
            const buf = await crypto.subtle.digest("SHA-256", enc.encode(password));
            return [...new Uint8Array(buf)]
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
        }
        return this.sha256Fallback(password);
    },

    // ===============================
    // auth check (FIXED)
    // ===============================
    isAuthenticated() {
        const cfg = this._config();
        if (!cfg) return false;

        const token = localStorage.getItem(cfg.storageKey);
        const expire = localStorage.getItem(cfg.storageExpireKey);

        if (!token || !expire) return false;

        if (Date.now() > parseInt(expire)) {
            this.logout();
            return false;
        }

        // 防简单篡改
        return token === cfg.passwordHash;
    },

    // ===============================
    // require auth (IMPORTANT FIX)
    // ===============================
    requireAuth() {
        const cfg = this._config();

        // ❗如果没启用密码 → 直接放行
        if (!this.isPasswordEnabled()) return;

        // ❗未登录 → 立即阻断
        if (!this.isAuthenticated()) {

            // stop rendering early
            document.documentElement.innerHTML = `
                <div style="font-family:Arial;padding:40px;">
                    <h2>🔒 Authentication Required</h2>
                    <p>Redirecting...</p>
                </div>
            `;

            window.location.href = "login.html";
        }
    },

    // ===============================
    logout() {
        const cfg = this._config();
        if (!cfg) return;

        localStorage.removeItem(cfg.storageKey);
        localStorage.removeItem(cfg.storageExpireKey);
        sessionStorage.removeItem("auth_flag");

        window.location.href = "login.html";
    }
};
