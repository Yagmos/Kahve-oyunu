/**
 * DebateManager: Act II'deki İnci–Öğretmen tartışması için tam ekran
 * "Debate Mode" sunumunu yönetir.
 *
 * Tasarım notları:
 *  - Oyunun geri kalanı (Act I, Act II'nin diğer bölümleri, Act III) normal
 *    sahne + Stardew tarzı portre sistemiyle çalışmaya DEVAM eder. Debate Mode
 *    yalnızca aşağıdaki etiketlerde devreye girer.
 *  - İkinci bir ifade sistemi KURMAZ. Hangi karakterin hangi ifade dosyasını
 *    kullanacağını PortraitManager'a sorar; o da tek doğruluk kaynağı olan
 *    SceneManager.occupied'ı okur.
 *  - story.js'e hiç dokunulmaz; mod tamamen etiket adından çözülür.
 */

/** Tartışmanın geçtiği etiketler: act2_debate* + Yahya'nın girdiği iki sahne. */
const DEBATE_LABEL_PREFIX = 'act2_debate';
const DEBATE_EXTRA_LABELS = ['act2_kerem_arrives', 'act2_first_look'];

/** Sahnedeki roller: solda tartışan öğrenci, sağda öğretmen. */
const DEBATE_LEFT_ID = 'girl';
const DEBATE_RIGHT_ID = 'teacher';
/** Tartışmanın ortasında içeri giren karakter (küçük, kenarda). */
const DEBATE_ENTRANT_ID = 'boy';

/** İnci'nin seçilen karşı çıkış repliği bu etiketlerin ilk sözüdür. */
const REBUTTAL_LABEL_RE = /_(philo|direct|calm)$/;

class DebateManager {
  /**
   * @param {{layerEl:HTMLElement, screenEl:HTMLElement,
   *          portraitManager:PortraitManager, sceneManager:SceneManager}} refs
   */
  constructor(refs) {
    this.layerEl = refs.layerEl;
    this.screenEl = refs.screenEl;
    this.portrait = refs.portraitManager;
    this.scene = refs.sceneManager;

    this.active = false;
    this.slots = {};
    this.shakeTimer = null;

    if (this.layerEl) {
      [DEBATE_LEFT_ID, DEBATE_RIGHT_ID, DEBATE_ENTRANT_ID].forEach((id) => {
        this.slots[id] = {
          root: this.layerEl.querySelector(`[data-slot="${id}"]`),
          art: this.layerEl.querySelector(`[data-slot="${id}"] .debate-char-art`),
          name: this.layerEl.querySelector(`[data-slot="${id}"] .debate-char-name`)
        };
      });
    }
  }

  /** Bu etiket tartışmanın parçası mı? */
  isDebateLabel(label) {
    if (!label) return false;
    return label.indexOf(DEBATE_LABEL_PREFIX) === 0 || DEBATE_EXTRA_LABELS.indexOf(label) !== -1;
  }

  /** Etikete göre Debate Mode'u açar/kapatır (idempotent). */
  syncMode(label) {
    const want = this.isDebateLabel(label);
    if (want === this.active) return;
    this.active = want;
    if (this.screenEl) this.screenEl.classList.toggle('debate-mode', want);
    if (!want) this._clearSlots();
  }

  /**
   * Bir 'say' adımı için tartışma sahnesini güncelle.
   * @param {string} speaker Konuşmacı adı ('' ise anlatım/iç monolog).
   * @param {string} label O anki etiket.
   * @param {number} index Etiket içindeki adım sırası (vurgu için).
   */
  update(speaker, label, index) {
    if (!this.active) return;

    const speakingId = speaker && this.portrait ? this.portrait.idForSpeaker(speaker) : null;

    this._renderSlot(DEBATE_LEFT_ID, speakingId);
    this._renderSlot(DEBATE_RIGHT_ID, speakingId);
    // Yahya yalnızca sahneye girdikten sonra, kenarda ve küçük görünür.
    const boyOnStage = !!(this.scene && this.scene.occupied && this.scene.occupied[DEBATE_ENTRANT_ID]);
    this._renderSlot(DEBATE_ENTRANT_ID, speakingId, !boyOnStage);

    // Vurgu: İnci'nin seçilen karşı çıkış repliği (branch etiketinin ilk sözü).
    if (index === 0 && REBUTTAL_LABEL_RE.test(label || '') &&
        speakingId === DEBATE_LEFT_ID) {
      this._emphasize();
    }
  }

  /** 'expr' adımından sonra çağrılır; ifade PortraitManager üzerinden çözülür. */
  refreshExpression(id) {
    if (!this.active || !this.slots[id]) return;
    this._renderSlot(id, this._activeId);
  }

  _renderSlot(id, speakingId, forceHide) {
    const slot = this.slots[id];
    if (!slot || !slot.root) return;

    if (forceHide) {
      slot.root.classList.remove('present', 'active', 'dim');
      return;
    }

    const file = this.portrait ? this.portrait.resolveFileFor(id) : null;
    if (!file) {
      slot.root.classList.remove('present', 'active', 'dim');
      return;
    }

    const url = `url("${assetPath('characters', file)}")`;
    if (slot.art.style.backgroundImage !== url) slot.art.style.backgroundImage = url;
    if (slot.name && this.portrait) {
      const label = this.portrait.nameForId(id);
      if (label && slot.name.textContent !== label) slot.name.textContent = label;
    }

    slot.root.classList.add('present');
    // Konuşan öne çıkar, dinleyen soluklaşır. Kimse konuşmuyorsa (anlatım /
    // iç monolog) ikisi de nötr kalır.
    const isSpeaking = !!speakingId && speakingId === id;
    slot.root.classList.toggle('active', isSpeaking);
    slot.root.classList.toggle('dim', !!speakingId && !isSpeaking);
    if (isSpeaking) this._activeId = id;
  }

  /** Kısa, tek seferlik vurgu: hafif sarsıntı + flash. */
  _emphasize() {
    if (!this.layerEl) return;
    this.layerEl.classList.remove('emphasis');
    void this.layerEl.offsetWidth; // reflow: animasyon tekrar başlasın
    this.layerEl.classList.add('emphasis');
    if (this.shakeTimer) clearTimeout(this.shakeTimer);
    this.shakeTimer = setTimeout(() => {
      this.layerEl.classList.remove('emphasis');
      this.shakeTimer = null;
    }, 480);
  }

  _clearSlots() {
    Object.keys(this.slots).forEach((id) => {
      const slot = this.slots[id];
      if (slot && slot.root) slot.root.classList.remove('present', 'active', 'dim');
    });
    this._activeId = null;
    if (this.layerEl) this.layerEl.classList.remove('emphasis');
  }

  /** Yeni oyun / devam / menüye dönüş. */
  reset() {
    this.active = false;
    this._activeId = null;
    if (this.shakeTimer) { clearTimeout(this.shakeTimer); this.shakeTimer = null; }
    if (this.screenEl) this.screenEl.classList.remove('debate-mode');
    this._clearSlots();
    Object.keys(this.slots).forEach((id) => {
      const slot = this.slots[id];
      if (slot && slot.art) slot.art.style.backgroundImage = '';
    });
  }
}
