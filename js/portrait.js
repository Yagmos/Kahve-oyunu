/**
 * PortraitManager: diyalog kutusunun sol üstünde, o an konuşan karakterin
 * portresini gösterir (Stardew tarzı).
 *
 * Tasarım notları:
 *  - Kendi karakter/ifade durumunu TUTMAZ. Tek doğruluk kaynağı
 *    SceneManager.occupied'dır; portre oradan okunur. Böylece 'expr'
 *    adımları story.js'e hiç dokunmadan portreyi de sürer.
 *  - MVP: ayrı portre görseli üretilmez; mevcut karakter SVG'leri
 *    CSS ile (background-size + background-position) baş hizasından
 *    kırpılarak kullanılır.
 *  - Portre mutlak konumlandırılmıştır; dialogue-box'ın yüksekliğini ve
 *    metin genişliğini etkilemez, dolayısıyla görünüp kaybolurken
 *    layout zıplamaz.
 */

/**
 * Bir karakter için GERÇEKTEN var olan ifade dosyaları.
 * Eksik dosyalar CSS background'da sessizce 404 verdiği için
 * (hata fırlatmaz, portre görünmez olur) fallback zinciri bu listeye dayanır.
 */
const PORTRAIT_ASSETS = {
  girl: ['neutral', 'happy', 'annoyed', 'surprised', 'sleepy'],
  boy: ['neutral']
};

class PortraitManager {
  /**
   * @param {{frameEl:HTMLElement, imageEl:HTMLElement, boxEl:HTMLElement, sceneManager:SceneManager}} refs
   */
  constructor(refs) {
    this.frameEl = refs.frameEl;
    this.imageEl = refs.imageEl;
    this.boxEl = refs.boxEl;
    this.scene = refs.sceneManager;

    this.speakerToId = this._buildSpeakerMap();
    this.currentId = null;
    // Seçim butonları açıkken portre gizlenir (choice-layer ile çakışmasın diye).
    this.choiceMode = false;
  }

  /**
   * Konuşmacı adı -> karakter id eşlemesi. Adlar story.js'teki sabitlerden
   * türetilir, elle yazılmaz; sabit tanımlı değilse o karakter atlanır.
   */
  _buildSpeakerMap() {
    const map = {};
    if (typeof GIRL_NAME !== 'undefined') map[GIRL_NAME] = 'girl';
    if (typeof BOY_NAME !== 'undefined') map[BOY_NAME] = 'boy';
    return map;
  }

  /**
   * 'girl_happy.svg' -> { id: 'girl', expression: 'happy' }
   */
  _parseFile(file) {
    if (!file) return null;
    const base = String(file).replace(/\.[^.]+$/, '');
    const parts = base.split('_');
    if (parts.length < 2) return null;
    return { id: parts[0], expression: parts.slice(1).join('_') };
  }

  /**
   * Fallback zinciri: istenen ifade -> neutral -> null (portre gizlenir).
   * @returns {string|null} Kullanılacak dosya adı.
   */
  _resolveFile(id) {
    const available = PORTRAIT_ASSETS[id];
    if (!available || !available.length) return null;

    // 1) Karakter sahnedeyse SceneManager'ın gösterdiği dosyayı kullan.
    const occupant = this.scene && this.scene.occupied ? this.scene.occupied[id] : null;
    if (occupant && occupant.file) {
      const parsed = this._parseFile(occupant.file);
      if (parsed && available.indexOf(parsed.expression) !== -1) {
        return occupant.file;
      }
    }

    // 2) Sahnede değilse ya da ifadesinin portresi yoksa neutral'a düş.
    if (available.indexOf('neutral') !== -1) return id + '_neutral.svg';

    // 3) Hiçbiri yoksa portre gösterilmez.
    return null;
  }

  /**
   * Konuşmacıya göre portreyi güncelle. Konuşmacı boşsa (anlatım / iç monolog)
   * veya görseli olmayan biriyse (Öğretmen vb.) portre gizlenir.
   */
  showForSpeaker(speaker) {
    // Bir 'say' adımı çalıştıysa seçim ekranı kapanmış demektir.
    this.choiceMode = false;
    const id = speaker ? this.speakerToId[speaker] : null;
    if (!id) {
      this.currentId = null;
      this._apply(null);
      return;
    }
    this.currentId = id;
    this._apply(this._resolveFile(id));
  }

  /**
   * 'expr' adımından sonra çağrılır. Sadece konuşan karakterin ifadesi
   * değiştiyse portre yenilenir.
   */
  refreshExpression(id) {
    if (!id || id !== this.currentId) return;
    this._apply(this._resolveFile(id));
  }

  /** Seçim katmanı açıkken portreyi gizler, kapanınca geri getirir. */
  setChoiceMode(active) {
    this.choiceMode = !!active;
    this._apply(this.currentId ? this._resolveFile(this.currentId) : null);
  }

  _apply(file) {
    const visible = !!file && !this.choiceMode;

    if (file) {
      const url = `url("${assetPath('characters', file)}")`;
      if (this.imageEl.style.backgroundImage !== url) {
        this.imageEl.style.backgroundImage = url;
      }
    }

    // Seçim katmanı açılırken portre animasyonsuz kaybolur; aksi halde
    // 220ms'lik fade boyunca butonların arkasında görünmeye devam eder.
    this.frameEl.classList.toggle('instant', this.choiceMode);
    this.frameEl.classList.toggle('visible', visible);
    if (this.boxEl) this.boxEl.classList.toggle('has-portrait', visible);
  }

  /** Yeni oyun / devam / menüye dönüş sırasında portre durumunu temizler. */
  reset() {
    this.currentId = null;
    this.choiceMode = false;
    this.imageEl.style.backgroundImage = '';
    this.frameEl.classList.remove('visible');
    if (this.boxEl) this.boxEl.classList.remove('has-portrait');
  }
}
