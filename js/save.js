/**
 * SaveManager: localStorage tabanlı kayıt/ayar yönetimi.
 * Tek bir kayıt slotu kullanır (basit tutmak için).
 */
const SAVE_KEY = 'kahveOyunu.save.v1';
const SETTINGS_KEY = 'kahveOyunu.settings.v1';

const SaveManager = {
  hasSave() {
    try {
      return localStorage.getItem(SAVE_KEY) !== null;
    } catch (e) {
      return false;
    }
  },

  /**
   * @param {{label:string, index:number}} state
   */
  save(state) {
    try {
      const payload = Object.assign({}, state, { savedAt: Date.now() });
      localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
      return true;
    } catch (e) {
      console.warn('[SaveManager] Kayıt yazılamadı:', e);
      return false;
    }
  },

  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('[SaveManager] Kayıt okunamadı:', e);
      return null;
    }
  },

  clearSave() {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (e) {
      /* yoksay */
    }
  },

  loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      const stored = raw ? JSON.parse(raw) : {};
      return Object.assign({}, CONFIG.defaultSettings, stored);
    } catch (e) {
      return Object.assign({}, CONFIG.defaultSettings);
    }
  },

  saveSettings(settings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      return true;
    } catch (e) {
      console.warn('[SaveManager] Ayarlar yazılamadı:', e);
      return false;
    }
  },

  resetSave() {
    try {
      localStorage.removeItem(SAVE_KEY);
      return true;
    } catch (e) {
      return false;
    }
  }
};
