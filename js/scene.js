/**
 * SceneManager: arka plan, karakter ve basit kamera efektlerini yönetir.
 * DOM'da iki adet arka plan katmanı (crossfade için) ve
 * left/center/right konumlarında sabit karakter slotları kullanılır.
 */
class SceneManager {
  constructor(refs) {
    this.sceneLayer = refs.sceneLayer;
    this.bgLayers = [refs.bgA, refs.bgB];
    this.activeBgIndex = 0;

    this.slots = {
      left: refs.slotLeft,
      center: refs.slotCenter,
      right: refs.slotRight
    };

    // characterId -> { position, file }
    this.occupied = {};
  }

  reset() {
    const screen = document.getElementById('screen-game');
    if (screen) screen.classList.remove('blacked', 'waking');
    this.bgLayers.forEach((el) => {
      el.style.backgroundImage = '';
      el.classList.remove('visible');
    });
    this.activeBgIndex = 0;
    Object.keys(this.slots).forEach((pos) => this._clearSlot(pos));
    this.occupied = {};
  }

  _clearSlot(position) {
    const el = this.slots[position];
    if (!el) return;
    el.style.backgroundImage = '';
    delete el.dataset.char;
    el.classList.remove('visible', 'slide-in-left', 'slide-in-right', 'slide-in-center');
  }

  /**
   * @param {string} [filename] Boş bırakılırsa (ör. sahne geçişlerinde
   * ekranı siyaha düşürmek için) arka plan görseli olmadan düz renge döner.
   */
  setBackground(filename) {
    const nextIndex = this.activeBgIndex === 0 ? 1 : 0;
    const nextLayer = this.bgLayers[nextIndex];
    const prevLayer = this.bgLayers[this.activeBgIndex];

    nextLayer.style.backgroundImage = filename ? `url("${assetPath('backgrounds', filename)}")` : 'none';
    // Bir sonraki frame'de görünür yap ki CSS transition tetiklensin.
    requestAnimationFrame(() => {
      nextLayer.classList.add('visible');
      prevLayer.classList.remove('visible');
    });

    this.activeBgIndex = nextIndex;
  }

  showCharacter(id, options) {
    const position = (options && options.position) || 'center';
    const file = options && options.file;
    const transition = (options && options.transition) || 'fade';
    const slotEl = this.slots[position];
    if (!slotEl || !file) return;

    slotEl.style.backgroundImage = `url("${assetPath('characters', file)}")`;
    // Karakter başına kadraj farkı CSS'ten ayarlanabilsin (portre çizim vs tam boy).
    slotEl.dataset.char = id;
    slotEl.classList.remove('visible', 'slide-in-left', 'slide-in-right', 'slide-in-center');

    requestAnimationFrame(() => {
      if (transition === 'slide') {
        slotEl.classList.add(`slide-in-${position}`);
      }
      slotEl.classList.add('visible');
    });

    this.occupied[id] = { position, file };
  }

  changeExpression(id, file) {
    const info = this.occupied[id];
    if (!info) return;
    const slotEl = this.slots[info.position];
    if (!slotEl || !file) return;

    slotEl.classList.remove('visible');
    requestAnimationFrame(() => {
      slotEl.style.backgroundImage = `url("${assetPath('characters', file)}")`;
      slotEl.classList.add('visible');
    });

    info.file = file;
  }

  hideCharacter(id) {
    const info = this.occupied[id];
    if (!info) return;
    this._clearSlot(info.position);
    delete this.occupied[id];
  }

  /**
   * Ekran efekti: şimdilik yalnızca 'wake' (gözlerin yavaşça açılması).
   * Animasyon bitince sınıf temizlenir; hikaye akışını bekletmez.
   */
  /** 'blackout' = ekranı karart ve bekle, 'wake' = gözler yavaşça açılır. */
  playEffect(name) {
    const screen = document.getElementById('screen-game');
    if (!screen) return;

    if (name === 'blackout') {                 // ekran tamamen siyah, arayüz gizli
      screen.classList.remove('waking');
      screen.classList.add('blacked');
      return;
    }
    // 'clear': karartmayı animasyonsuz kaldırır (perde geçişlerinin çıkışı).
    if (name === 'clear') {
      if (this._fxTimer) { clearTimeout(this._fxTimer); this._fxTimer = null; }
      screen.classList.remove('blacked', 'waking');
      return;
    }
    if (name !== 'wake') return;

    screen.classList.remove('blacked', 'waking');
    void screen.offsetWidth;                 // reflow: animasyon yeniden başlasın
    screen.classList.add('waking');
    if (this._fxTimer) clearTimeout(this._fxTimer);
    this._fxTimer = setTimeout(() => screen.classList.remove('waking'), 4400);
  }

  /**
   * Basit kamera efektleri: 'zoom-in' | 'zoom-out' | 'slide-left' | 'slide-right'
   */
  cameraEffect(type) {
    if (!this.sceneLayer) return;
    const className = `cam-${type}`;
    this.sceneLayer.classList.remove('cam-zoom-in', 'cam-zoom-out', 'cam-slide-left', 'cam-slide-right');
    // Reflow tetikleyerek animasyonun tekrar başlamasını garanti et.
    void this.sceneLayer.offsetWidth;
    this.sceneLayer.classList.add(className);

    const onEnd = () => {
      this.sceneLayer.classList.remove(className);
      this.sceneLayer.removeEventListener('animationend', onEnd);
    };
    this.sceneLayer.addEventListener('animationend', onEnd);
  }
}
