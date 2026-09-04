/**
 * AudioManager: müzik/efekt çalma, mute ve ses seviyesi kontrolü.
 *
 * Ses kaynağı CONFIG.audioMode ile belirlenir:
 *   'auto'  — önce assets/audio içindeki dosya denenir; dosya yoksa veya
 *             çalınamıyorsa aynı ses WebAudio ile üretilir (js/synth.js).
 *             Böylece dosyalar tek tek eklenebilir, eksikler sessiz kalmaz.
 *   'files' — sadece dosyalar; eksik olan ses hiç çalmaz.
 *   'synth' — dosyalar hiç denenmez.
 *
 * Hangi durumda olursa olsun oyunun akışı bozulmaz: bir ses çalınamazsa
 * sessizce (bir kere uyarı loglayarak) devam edilir.
 */
class AudioManager {
  constructor() {
    const mode = (typeof CONFIG !== 'undefined' && CONFIG.audioMode) || 'auto';
    this.mode = mode;
    this.useFiles = mode === 'auto' || mode === 'files';
    this.synth = (mode !== 'files' && typeof SynthAudio === 'function') ? new SynthAudio() : null;

    this.bgmEl = new Audio();
    this.bgmEl.loop = true;
    this.currentBgmFile = null;

    this.musicOn = CONFIG.defaultSettings.musicOn;
    this.sfxOn = CONFIG.defaultSettings.sfxOn;
    this.musicVolume = CONFIG.defaultSettings.musicVolume;
    this.sfxVolume = CONFIG.defaultSettings.sfxVolume;

    this.bgmEl.volume = this.musicVolume;

    // Daha önce yüklenemediği görülen dosyalar tekrar denenmez.
    this._unavailable = new Set();

    this.bgmEl.addEventListener('error', () => {
      if (this.currentBgmFile) this._fallbackBgm(this.currentBgmFile);
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
      console.info('[AudioManager] Ses dosyası yok, üretilmiş sese düşülüyor:', filename);
    }
  }

  /** Dosya çalınamadı: aynı parçayı sentezle sürdür. */
  _fallbackBgm(filename) {
    this._markUnavailable(filename);
    this.bgmEl.pause();
    if (this.synth && this.musicOn && this.currentBgmFile === filename) {
      this.synth.playBgm(filename);
    }
  }

  playBgm(filename) {
    if (!filename) return;
    if (this.currentBgmFile === filename && this.musicOn) return;
    this.currentBgmFile = filename;

    // Dosya daha önce bulunamadıysa doğrudan sentez.
    if (!this.useFiles || this._unavailable.has(filename)) {
      if (this.synth) { if (this.musicOn) this.synth.playBgm(filename); else this.synth.stopBgm(); }
      return;
    }

    if (this.synth) this.synth.stopBgm();
    this.bgmEl.src = assetPath('audio', filename);
    if (!this.musicOn) return;

    const playPromise = this.bgmEl.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => this._fallbackBgm(filename));
    }
  }

  stopBgm() {
    this.bgmEl.pause();
    this.bgmEl.currentTime = 0;
    if (this.synth) this.synth.stopBgm();
    this.currentBgmFile = null;
  }

  playSfx(filename) {
    if (!this.sfxOn || !filename) return;

    if (!this.useFiles || this._unavailable.has(filename)) {
      if (this.synth) this.synth.playSfx(filename);
      return;
    }

    const el = new Audio(assetPath('audio', filename));
    el.volume = this.sfxVolume;
    const fallback = () => {
      this._markUnavailable(filename);
      if (this.synth) this.synth.playSfx(filename);
    };
    el.addEventListener('error', fallback);

    const playPromise = el.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(fallback);
    }
  }

  setMusicOn(on) {
    this.musicOn = !!on;
    if (!this.musicOn) {
      this.bgmEl.pause();
      if (this.synth) this.synth.stopBgm();
      return;
    }
    if (!this.currentBgmFile) return;
    if (!this.useFiles || this._unavailable.has(this.currentBgmFile)) {
      if (this.synth) this.synth.playBgm(this.currentBgmFile);
      return;
    }
    const p = this.bgmEl.play();
    if (p && typeof p.catch === 'function') p.catch(() => this._fallbackBgm(this.currentBgmFile));
  }

  setSfxOn(on) {
    this.sfxOn = !!on;
  }

  setMusicVolume(v) {
    this.musicVolume = v;
    this.bgmEl.volume = v;
    if (this.synth) this.synth.setMusicVolume(v);
  }

  setSfxVolume(v) {
    this.sfxVolume = v;
    if (this.synth) this.synth.setSfxVolume(v);
  }
}
