/**
 * AudioManager: müzik/efekt çalma, mute ve ses seviyesi kontrolü.
 * Ses dosyası bulunamazsa veya çalınamazsa oyunun akışını bozmadan
 * sessizce (bir kere uyarı loglayarak) devam eder.
 */
class AudioManager {
  constructor() {
    this.bgmEl = new Audio();
    this.bgmEl.loop = true;
    this.currentBgmFile = null;

    this.musicOn = CONFIG.defaultSettings.musicOn;
    this.sfxOn = CONFIG.defaultSettings.sfxOn;
    this.musicVolume = CONFIG.defaultSettings.musicVolume;
    this.sfxVolume = CONFIG.defaultSettings.sfxVolume;

    this.bgmEl.volume = this.musicVolume;

    // Daha önce yüklenemediği tespit edilen dosyalar tekrar denenmesin.
    this._unavailable = new Set();

    this.bgmEl.addEventListener('error', () => {
      if (this.currentBgmFile) {
        this._markUnavailable(this.currentBgmFile);
      }
    });
  }

  applySettings(settings) {
    if (!settings) return;
    if (typeof settings.musicOn === 'boolean') this.setMusicOn(settings.musicOn);
    if (typeof settings.sfxOn === 'boolean') this.sfxOn = settings.sfxOn;
    if (typeof settings.musicVolume === 'number') this.setMusicVolume(settings.musicVolume);
    if (typeof settings.sfxVolume === 'number') this.sfxVolume = settings.sfxVolume;
  }

  _markUnavailable(filename) {
    if (!this._unavailable.has(filename)) {
      this._unavailable.add(filename);
      console.warn('[AudioManager] Ses dosyası bulunamadı, atlanıyor:', filename);
    }
  }

  playBgm(filename) {
    if (!filename || this._unavailable.has(filename)) return;
    if (this.currentBgmFile === filename) return;

    this.currentBgmFile = filename;
    this.bgmEl.src = assetPath('audio', filename);

    if (!this.musicOn) return;

    const playPromise = this.bgmEl.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => this._markUnavailable(filename));
    }
  }

  stopBgm() {
    this.bgmEl.pause();
    this.bgmEl.currentTime = 0;
    this.currentBgmFile = null;
  }

  playSfx(filename) {
    if (!this.sfxOn || !filename || this._unavailable.has(filename)) return;

    const el = new Audio(assetPath('audio', filename));
    el.volume = this.sfxVolume;
    el.addEventListener('error', () => this._markUnavailable(filename));

    const playPromise = el.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => this._markUnavailable(filename));
    }
  }

  setMusicOn(on) {
    this.musicOn = !!on;
    if (!this.musicOn) {
      this.bgmEl.pause();
    } else if (this.currentBgmFile && !this._unavailable.has(this.currentBgmFile)) {
      const p = this.bgmEl.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => this._markUnavailable(this.currentBgmFile));
      }
    }
  }

  setSfxOn(on) {
    this.sfxOn = !!on;
  }

  setMusicVolume(v) {
    this.musicVolume = v;
    this.bgmEl.volume = v;
  }

  setSfxVolume(v) {
    this.sfxVolume = v;
  }
}
