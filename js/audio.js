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

    // Çapraz geçiş için iki eleman: biri kısılırken diğeri açılır.
    this.bgmEls = [new Audio(), new Audio()];
    this.bgmEls.forEach((el) => { el.loop = true; el.volume = 0; el.preload = 'auto'; });
    this.active = 0;
    this.currentBgmFile = null;
    this._fadeTimers = [null, null];

    this.musicOn = CONFIG.defaultSettings.musicOn;
    this.sfxOn = CONFIG.defaultSettings.sfxOn;
    this.musicVolume = CONFIG.defaultSettings.musicVolume;
    this.sfxVolume = CONFIG.defaultSettings.sfxVolume;


    // Daha önce yüklenemediği görülen dosyalar tekrar denenmez.
    this._unavailable = new Set();

    this.bgmEls.forEach((el) => {
      el.addEventListener('error', () => {
        if (this.currentBgmFile && el.src && el.src.indexOf(this.currentBgmFile) !== -1) {
          this._fallbackBgm(this.currentBgmFile);
        }
      });
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

  /** Bir <audio> elemanının sesini yumuşakça hedef değere taşır. */
  _fade(index, target, seconds, onDone) {
    const el = this.bgmEls[index];
    if (this._fadeTimers[index]) clearInterval(this._fadeTimers[index]);
    const start = el.volume;
    const dur = Math.max(0.05, seconds) * 1000;
    const t0 = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    this._fadeTimers[index] = setInterval(() => {
      const now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
      const t = Math.min(1, (now - t0) / dur);
      // yumuşak giriş/çıkış eğrisi
      const k = t * t * (3 - 2 * t);
      el.volume = Math.max(0, Math.min(1, start + (target - start) * k));
      if (t >= 1) {
        clearInterval(this._fadeTimers[index]);
        this._fadeTimers[index] = null;
        if (onDone) onDone();
      }
    }, 40);
  }

  /** Dosya çalınamadı: aynı parçayı sentezle sürdür. */
  _fallbackBgm(filename) {
    this._markUnavailable(filename);
    this.bgmEls.forEach((el, i) => { if (this._fadeTimers[i]) clearInterval(this._fadeTimers[i]); el.pause(); el.volume = 0; });
    if (this.synth && this.musicOn && this.currentBgmFile === filename) {
      this.synth.playBgm(filename);
    }
  }

  /**
   * @param {string} filename
   * @param {{fadeIn?:number, fadeOut?:number}} [opts] Saniye cinsinden geçiş süreleri.
   */
  playBgm(filename, opts) {
    if (!filename) return;
    if (this.currentBgmFile === filename && this.musicOn) return;
    const fadeIn = (opts && typeof opts.fadeIn === 'number') ? opts.fadeIn : 2.2;
    const fadeOut = (opts && typeof opts.fadeOut === 'number') ? opts.fadeOut : 1.2;
    const prev = this.currentBgmFile;
    this.currentBgmFile = filename;

    // Dosya yoksa sentez (onun kendi yumuşak girişi var)
    if (!this.useFiles || this._unavailable.has(filename)) {
      this._fadeOutCurrent(fadeOut);
      if (this.synth) { if (this.musicOn) this.synth.playBgm(filename); else this.synth.stopBgm(); }
      return;
    }
    if (this.synth && prev) this.synth.stopBgm();

    const next = 1 - this.active;
    const el = this.bgmEls[next];
    el.src = assetPath('audio', filename);
    el.currentTime = 0;
    el.volume = 0;
    if (!this.musicOn) return;

    const playPromise = el.play();
    const start = () => {
      this._fadeOutCurrent(fadeOut);
      this.active = next;
      this._fade(next, this.musicVolume, fadeIn);
    };
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.then(start).catch(() => this._fallbackBgm(filename));
    } else {
      start();
    }
  }

  /** Çalmakta olan parçayı kısarak durdurur. */
  _fadeOutCurrent(seconds) {
    const el = this.bgmEls[this.active];
    if (!el.src || el.paused) return;
    const i = this.active;
    this._fade(i, 0, seconds, () => { el.pause(); });
  }

  /**
   * Müziği yumuşakça susturur ama hangi parçanın çaldığını unutur; böylece
   * aynı dosya sonradan tekrar `playBgm` ile baştan başlatılabilir.
   * Hikâyede bilerek sessizlik istenen anlar için (bkz. story.js 'bgm' + stop).
   * @param {number} [seconds]
   */
  fadeOutBgm(seconds) {
    const sec = typeof seconds === 'number' ? seconds : 0.8;
    this._fadeOutCurrent(sec);
    if (this.synth) this.synth.stopBgm();
    this.currentBgmFile = null;
  }

  stopBgm() {
    this.bgmEls.forEach((el, i) => {
      if (this._fadeTimers[i]) { clearInterval(this._fadeTimers[i]); this._fadeTimers[i] = null; }
      el.pause(); el.currentTime = 0; el.volume = 0;
    });
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
      this._fadeOutCurrent(0.4);
      if (this.synth) this.synth.stopBgm();
      return;
    }
    if (!this.currentBgmFile) return;
    if (!this.useFiles || this._unavailable.has(this.currentBgmFile)) {
      if (this.synth) this.synth.playBgm(this.currentBgmFile);
      return;
    }
    const el = this.bgmEls[this.active];
    const p = el.play();
    const up = () => this._fade(this.active, this.musicVolume, 1.2);
    if (p && typeof p.catch === 'function') p.then(up).catch(() => this._fallbackBgm(this.currentBgmFile));
    else up();
  }

  setSfxOn(on) {
    this.sfxOn = !!on;
  }

  setMusicVolume(v) {
    this.musicVolume = v;
    const el = this.bgmEls[this.active];
    if (el && !el.paused) this._fade(this.active, v, 0.25);
    if (this.synth) this.synth.setMusicVolume(v);
  }

  setSfxVolume(v) {
    this.sfxVolume = v;
    if (this.synth) this.synth.setSfxVolume(v);
  }
}
