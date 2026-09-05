/**
 * DebateManager: Act II'deki İnci–Öğretmen tartışması için tam ekran
 * "Debate Mode" sunumunu yönetir.
 *
 * Tasarım notları:
 *  - Sahnede TEK görsel vardır: o an konuşan karakter. Altta ince diyalog
 *    kutusu durur. Karakterler yer/boyut değiştirmez; bütün pozlar aynı
 *    kadraja (aynı tuval, aynı kafa boyutu ve konumu) göre üretilmiştir.
 *  - İkinci bir ifade sistemi KURMAZ. Tek sinyal kaynağı story.js'teki 'expr'
 *    adımlarıdır: İnci'nin ifadesi PortraitManager (SceneManager.occupied)
 *    üzerinden, sahneye hiç 'show' edilmeyen öğretmenin pozu 'expr' adımının
 *    dosya adından çözülür.
 *  - Modun açılması tamamen etiket adından gelir; story.js'te mod anahtarı yok.
 */

/**
 * Tartışmanın geçtiği etiketler: act2_debate* + Yahya'nın girdiği iki sahne.
 * Dersin açılışı (act2_debate_start) BİLEREK dışarıda: hoca daha ders anlatırken
 * oyun normal sahne + portre düzeninde kalır, karşılıklı tartışma başlayınca
 * (İnci parmak kaldırdığında) tam ekran düzene geçilir.
 */
const DEBATE_LABEL_PREFIX = 'act2_debate';
const DEBATE_EXCLUDED_LABELS = ['act2_debate_start'];
const DEBATE_EXTRA_LABELS = ['act2_kerem_arrives', 'act2_first_look'];

/** İnci'nin seçilen karşı çıkış repliği bu etiketlerin ilk sözüdür. */
const REBUTTAL_LABEL_RE = /_(philo|direct|calm)$/;

/**
 * Debate Mode'a özel tam ekran görseller. Diyalog kutusundaki küçük portre
 * ayrı bir görsel ailesi kullandığı için bu dosyalar yalnızca tartışma
 * sahnesinde görünür.
 *  - Öğretmen: poz adı doğrudan 'expr' dosyasından gelir.
 *  - İnci: PortraitManager'ın çözdüğü ifade (neutral/annoyed/surprised) eşlenir.
 */
const DEBATE_ART = {
  teacher: {
    calm: 'teacher_debate_calm.png',
    stern: 'teacher_debate_stern.png',
    point: 'teacher_debate_point.png',
    smug: 'teacher_debate_smug.png'
  },
  girl: {
    neutral: 'girl_debate_neutral.png',
    annoyed: 'girl_debate_annoyed.png',
    surprised: 'girl_debate_surprised.png',
    point: 'girl_debate_point.png'
  }
};

/**
 * Vurgu anında (sarsıntı + flash) karakterin geçici duruşu. İnci karşı çıkışını
 * söylerken parmağını uzatır; replik bitip sıradaki söz gelince normal ifadesine
 * döner. Öğretmenin vurgusu kendi 'expr' pozuyla geldiği için burada yer almaz.
 */
const DEBATE_EMPHASIS_POSE = { girl: 'girl_debate_point.png' };

/** Vurgu anında çalan kısa efekt (iki taraf için de). */
const EMPHASIS_SFX = 'objection.mp3';

/** Poz/ifade çözülemezse kullanılacak duruş. */
const DEBATE_DEFAULT_POSE = { teacher: 'stern', girl: 'neutral' };

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
    this.audio = refs.audioManager || null;

    this.active = false;
    this.poses = {};
    this.currentId = null;
    this.currentFile = null;
    this.shakeTimer = null;
    this._emphasizedLabel = null;

    this.stageEl = this.layerEl ? this.layerEl.querySelector('[data-slot="stage"]') : null;
    this.artEl = this.layerEl ? this.layerEl.querySelector('.debate-char-art') : null;
  }

  /** Bu etiket tartışmanın parçası mı? */
  isDebateLabel(label) {
    if (!label) return false;
    if (DEBATE_EXCLUDED_LABELS.indexOf(label) !== -1) return false;
    return label.indexOf(DEBATE_LABEL_PREFIX) === 0 || DEBATE_EXTRA_LABELS.indexOf(label) !== -1;
  }

  /** Etikete göre Debate Mode'u açar/kapatır (idempotent). */
  syncMode(label) {
    const want = this.isDebateLabel(label);
    if (want === this.active) return;
    this.active = want;
    if (this.screenEl) this.screenEl.classList.toggle('debate-mode', want);
    if (!want) this._clearStage();
  }

  /**
   * Bir 'say' adımı için sahneyi güncelle: konuşan karakterin görseli.
   * Anlatım/iç monolog satırlarında görsel değişmez (son konuşan kalır).
   * @param {string} speaker Konuşmacı adı ('' ise anlatım/iç monolog).
   * @param {string} label O anki etiket.
   * @param {{silent?:boolean}} [opts] silent: kayıttan geri yüklerken vurgu çalmasın.
   */
  update(speaker, label, opts) {
    if (!this.active) return;

    const speakingId = speaker && this.portrait ? this.portrait.idForSpeaker(speaker) : null;
    if (speakingId) this.currentId = speakingId;
    // Anlatımla başlayan bir sahneye kayıttan dönüldüyse boş kalmasın: tartışma İnci'nin sahnesi.
    if (!this.currentId) this.currentId = 'girl';
    this._render();

    // Vurgu: İnci'nin seçilen karşı çıkışı, yani branch etiketindeki ilk sözü.
    // Adım sırasına bakmıyoruz: bazı branch'ler bir 'expr' adımıyla başlıyor,
    // o yüzden etiket başına bir kez tetiklemek daha güvenilir.
    if (speakingId === 'girl' && this._emphasizedLabel !== label &&
        REBUTTAL_LABEL_RE.test(label || '')) {
      this._emphasizedLabel = label;
      if (!(opts && opts.silent)) this.emphasize();
    }
  }

  /**
   * 'expr' adımından sonra çağrılır.
   * @param {string} id Karakter id'si.
   * @param {string} [file] 'expr' adımının dosya adı.
   */
  refreshExpression(id, file) {
    this.noteExpression(id, file);
    if (!this.active) return;
    this._render();
  }

  /** Pozu kaydeder ama çizim yapmaz (kayıttan yükleme sırasında kullanılır). */
  noteExpression(id, file) {
    const poses = DEBATE_ART[id];
    if (!poses || !file) return;
    const pose = Object.keys(poses).filter((key) => poses[key] === file)[0];
    if (pose) this.poses[id] = pose;
  }

  /** Karakterin o anki tam ekran görseli. */
  _artFor(id) {
    const poses = DEBATE_ART[id];
    if (!poses) {
      // Yahya'nın tartışma görseli yok; portre çizimine düşülür.
      return this.portrait ? this.portrait.resolveFileFor(id) : null;
    }
    let pose = this.poses[id];
    // İnci'nin pozu sahnedeki ifadesinden gelir (girl_annoyed.svg -> annoyed).
    if (id === 'girl' && this.portrait) {
      const file = this.portrait.resolveFileFor('girl');
      const expr = file ? String(file).replace(/\.[^.]+$/, '').split('_').slice(1).join('_') : '';
      if (poses[expr]) pose = expr;
    }
    return poses[pose || DEBATE_DEFAULT_POSE[id]] || poses[DEBATE_DEFAULT_POSE[id]] || null;
  }

  _render() {
    if (!this.stageEl || !this.artEl || !this.currentId) return;
    const file = this._artFor(this.currentId);
    if (!file) return;
    if (file !== this.currentFile) {
      this.artEl.style.backgroundImage = `url("${assetPath('characters', file)}")`;
      this.currentFile = file;
    }
    if (this.stageEl.dataset.char !== this.currentId) this.stageEl.dataset.char = this.currentId;
    this.stageEl.classList.add('present');
  }

  /**
   * Kısa, tek seferlik vurgu: hafif sarsıntı + flash.
   * İnci'nin seçilen karşı çıkışında otomatik, hocanın iddialı repliklerinde
   * story.js'teki `emphasis: true` alanıyla tetiklenir.
   */
  emphasize() {
    if (!this.layerEl) return;
    // Argümanı sunan taraf: kısa "İtiraz ederim!" efekti.
    if (this.audio) this.audio.playSfx(EMPHASIS_SFX);
    const pose = DEBATE_EMPHASIS_POSE[this.currentId];
    if (pose && this.artEl && pose !== this.currentFile) {
      // Doğrudan yazıyoruz; currentFile'ı da güncellediğimiz için bir sonraki
      // _render() ifadeden gelen normal görsele kendiliğinden geri döner.
      this.artEl.style.backgroundImage = `url("${assetPath('characters', pose)}")`;
      this.currentFile = pose;
    }
    this.layerEl.classList.remove('emphasis');
    void this.layerEl.offsetWidth; // reflow: animasyon tekrar başlasın
    this.layerEl.classList.add('emphasis');
    if (this.shakeTimer) clearTimeout(this.shakeTimer);
    this.shakeTimer = setTimeout(() => {
      this.layerEl.classList.remove('emphasis');
      this.shakeTimer = null;
    }, 480);
  }

  _clearStage() {
    if (this.stageEl) this.stageEl.classList.remove('present');
    this.currentId = null;
    this.currentFile = null;
    this._emphasizedLabel = null;
    if (this.artEl) this.artEl.style.backgroundImage = '';
    if (this.layerEl) this.layerEl.classList.remove('emphasis');
  }

  /** Yeni oyun / devam / menüye dönüş. */
  reset() {
    this.active = false;
    this.poses = {};
    this._emphasizedLabel = null;
    if (this.shakeTimer) { clearTimeout(this.shakeTimer); this.shakeTimer = null; }
    if (this.screenEl) this.screenEl.classList.remove('debate-mode');
    this._clearStage();
  }
}
