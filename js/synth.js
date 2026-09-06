/**
 * SynthAudio: oyunun müziği ve efektleri, ses dosyası olmadan WebAudio ile
 * doğrudan üretilir. Böylece hem depoya megabaytlarca mp3 girmiyor hem de
 * telif sorunu olmuyor.
 *
 * AudioManager, CONFIG.useSynthAudio true iken bütün sesleri buraya yönlendirir.
 * İleride gerçek ses dosyaları eklenirse config'teki bayrağı kapatmak yeterli.
 */

/** Müzik parçaları: her akor 4 saniye, dizi başa sararak döner. */
const SYNTH_TRACKS = {
  // ACT I — sabah: ılık, sakin
  morning_theme: { chords: [[220, 329.6, 440], [174.6, 261.6, 349.2], [196, 293.7, 392], [164.8, 246.9, 329.6]], beat: 4.0, cutoff: 900 },
  // ACT II — okul: biraz daha hareketli ve nötr
  school_day: { chords: [[196, 293.7, 392], [220, 329.6, 440], [146.8, 220, 293.7], [174.6, 261.6, 349.2]], beat: 3.2, cutoff: 1100 },
  // ACT III — akşamüstü: yavaş, yumuşak
  evening_walk: { chords: [[174.6, 261.6, 349.2], [130.8, 196, 261.6], [155.6, 233.1, 311.1], [146.8, 220, 293.7]], beat: 5.0, cutoff: 780 }
};

class SynthAudio {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.musicGain = null;
    this.timer = null;
    this.trackName = null;
    this.musicVolume = 0.6;
    this.sfxVolume = 0.7;
    this._resumeBound = false;
  }

  /** AudioContext'i ilk kullanımda kurar; tarayıcı askıya aldıysa dokunuşta devam ettirir. */
  _ensure() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = 1;
      this.master.connect(this.ctx.destination);
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0;
      this.musicGain.connect(this.master);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
      if (!this._resumeBound) {
        this._resumeBound = true;
        const wake = () => { if (this.ctx) this.ctx.resume().catch(() => {}); };
        document.addEventListener('pointerdown', wake, { passive: true });
        document.addEventListener('keydown', wake);
      }
    }
    return this.ctx;
  }

  /**
   * Bir akoru çalar. Zarf bilerek "yumuşak giriş - uzun sürüş - yumuşak çıkış"
   * biçiminde: akorlar üst üste bindiği için arada sessizlik kalmıyor, arka
   * planda sürekli bir ped duyuluyor.
   */
  _chord(freqs, at, dur, cutoff) {
    const ctx = this.ctx;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = cutoff;
    filter.connect(this.musicGain);

    const attack = Math.min(0.9, dur * 0.2);
    const release = Math.min(1.8, dur * 0.35);

    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 0 ? 'triangle' : 'sine';
      osc.frequency.value = f;
      const gain = ctx.createGain();
      const peak = i === 0 ? 0.26 : 0.16;
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.linearRampToValueAtTime(peak, at + attack);
      gain.gain.setValueAtTime(peak, at + Math.max(attack, dur - release));
      gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      osc.connect(gain); gain.connect(filter);
      osc.start(at); osc.stop(at + dur + 0.05);
    });
  }

  /** Bir döngü boyunca akorları planlar. */
  _scheduleLoop(track, startAt) {
    track.chords.forEach((chord, i) => {
      this._chord(chord, startAt + i * track.beat, track.beat * 1.6, track.cutoff);
    });
  }

  playBgm(name) {
    const key = String(name || '').replace(/\.[^.]+$/, '');
    const track = SYNTH_TRACKS[key];
    if (!track) return;
    if (this.trackName === key && this.timer) return;
    this.stopBgm();
    if (!this._ensure()) return;

    this.trackName = key;
    const loopLen = track.chords.length * track.beat;
    this._scheduleLoop(track, this.ctx.currentTime + 0.05);
    this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.musicGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    this.musicGain.gain.linearRampToValueAtTime(0.45 * this.musicVolume, this.ctx.currentTime + 2.5);
    this.timer = setInterval(() => {
      if (!this.ctx) return;
      this._scheduleLoop(track, this.ctx.currentTime + 0.05);
    }, loopLen * 1000);
  }

  stopBgm() {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    this.trackName = null;
    if (this.ctx && this.musicGain) {
      const t = this.ctx.currentTime;
      this.musicGain.gain.cancelScheduledValues(t);
      this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, t);
      this.musicGain.gain.linearRampToValueAtTime(0.0001, t + 0.6);
    }
  }

  setMusicVolume(v) {
    this.musicVolume = v;
    if (this.ctx && this.musicGain && this.trackName) {
      const t = this.ctx.currentTime;
      this.musicGain.gain.cancelScheduledValues(t);
      this.musicGain.gain.linearRampToValueAtTime(0.45 * v, t + 0.2);
    }
  }

  setSfxVolume(v) { this.sfxVolume = v; }

  /** Kısa efektler: çalar saat, ders zili, sayfa çevirme, kapı. */
  playSfx(name) {
    const key = String(name || '').replace(/\.[^.]+$/, '');
    if (!this._ensure()) return;
    const ctx = this.ctx;
    const now = ctx.currentTime + 0.02;
    const vol = this.sfxVolume;

    if (key === 'alarm') {
      for (let i = 0; i < 3; i++) {
        const at = now + i * 0.22;
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.value = 880;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, at);
        g.gain.exponentialRampToValueAtTime(0.24 * vol, at + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, at + 0.16);
        osc.connect(g); g.connect(this.master);
        osc.start(at); osc.stop(at + 0.2);
      }
      return;
    }

    if (key === 'bell') {
      [660, 990, 1320].forEach((f, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = f;
        const g = ctx.createGain();
        const peak = (0.22 / (i + 1)) * vol;
        g.gain.setValueAtTime(0.0001, now);
        g.gain.exponentialRampToValueAtTime(peak, now + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);
        osc.connect(g); g.connect(this.master);
        osc.start(now); osc.stop(now + 1.7);
      });
      return;
    }

    if (key === 'page' || key === 'door') {
      const len = key === 'page' ? 0.22 : 0.35;
      const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * len), ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, key === 'page' ? 2 : 3);
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const filter = ctx.createBiquadFilter();
      filter.type = key === 'page' ? 'bandpass' : 'lowpass';
      filter.frequency.value = key === 'page' ? 2200 : 320;
      const g = ctx.createGain();
      g.gain.value = (key === 'page' ? 0.40 : 0.60) * vol;
      src.connect(filter); filter.connect(g); g.connect(this.master);
      src.start(now);

      if (key === 'door') { // kapı için kısa bir tok vuruş
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.18);
        const og = ctx.createGain();
        og.gain.setValueAtTime(0.34 * vol, now);
        og.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
        osc.connect(og); og.connect(this.master);
        osc.start(now); osc.stop(now + 0.3);
      }
    }
  }
}
