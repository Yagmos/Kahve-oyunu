/**
 * PortraitManager: diyalog kutusunun sağında, o an konuşan (ya da içinden
 * geçiren) karakterin büyük kare portresini gösterir.
 *
 * Tasarım notları:
 *  - Kendi ifade durumunu TUTMAZ. Tek doğruluk kaynağı SceneManager.occupied'dır;
 *    mevcut 'expr' adımları story.js'e dokunmadan portreyi de sürer.
 *  - Portre görselleri mevcut karakter SVG'lerinden CSS ile kırpılır.
 *  - İç monolog satırlarının hangi karaktere ait olduğu LABEL_POV haritasından,
 *    orada tanımlı değilse en son sahneye giren karakterden çözülür.
 *    Böylece story.js'e tek satır eklemeden POV belirlenebiliyor.
 */

/** Bir karakter için gerçekten var olan ifade dosyaları (fallback bu listeye dayanır). */
const PORTRAIT_ASSETS = {
  girl: ['neutral', 'happy', 'annoyed', 'surprised', 'sleepy'],
  boy: ['neutral', 'happy', 'annoyed', 'serious', 'skeptic'],
  teacher: ['neutral', 'serious']
};

/** Karakter sahnede değilken kullanılacak varsayılan ifade. */
const PORTRAIT_DEFAULT_EXPRESSION = {
  girl: 'neutral',
  boy: 'neutral',
  teacher: 'serious'
};

/**
 * İç monolog ("(İçinden) ...") satırlarının POV sahibi, etiket bazında.
 * Sadece iç monolog içeren etiketler listelenir. Burada olmayan etiketlerde
 * POV, en son gösterilen karakterden çözülür — act2_aftermath gibi kendi
 * içinde POV değiştiren sahneler bilinçli olarak listeye alınmamıştır.
 */
const LABEL_POV = {
  // ---- ACT I: tamamı İnci ----
  act1_start: 'girl',
  act1_snooze: 'girl',
  act1_getup: 'girl',
  act1_outfit_fav: 'girl',
  act1_outfit_casual: 'girl',
  act1_breakfast: 'girl',
  act1_phone: 'girl',
  act1_umbrella_yes: 'girl',
  act1_umbrella_no: 'girl',
  act1_walk: 'girl',
  act1_coffee_yes: 'girl',
  act1_coffee_no: 'girl',
  act1_schoolyard: 'girl',
  act1_kamelya: 'girl',
  act1_yard: 'girl',

  // ---- ACT II: Yahya POV (kulüp + koridor + sınıfa giriş) ----
  act2_start: 'boy',
  act2_club_cover_font: 'boy',
  act2_club_leave: 'boy',
  act2_hallway1_wave: 'boy',
  act2_hallway1_nod: 'boy',
  act2_hallway4: 'boy',
  // Sınıfa girerken İnci sahnede olduğu için "son gösterilen" yanıltıcı olur.
  act2_kerem_arrives: 'boy',

  // ---- ACT II: İnci POV (tartışma + dergi) ----
  act2_debate_start: 'girl',
  act2_debate_turn2: 'girl',
  act2_first_look: 'girl',
  act2_debate_end: 'girl',
  act2_magazine_ask_stories: 'girl',
  act2_magazine_ask_events: 'girl',
  // act2_aftermath: BİLEREK yok — içinde Yahya POV -> İnci POV geçişi var,
  // sahnedeki show adımlarından doğru şekilde çözülüyor.

  // ---- ACT III ----
  act3_start: 'girl',
  act3_girl_notices: 'girl',
  act3_boy_pov: 'boy',
  act3_greeting: 'girl',
  act3_talk_magazine: 'girl',
  act3_talk_personal: 'girl',
  act3_talk_books: 'girl',
  act3_pause: 'girl',
  act3_coffee_offer: 'girl',
  act3_yes: 'girl',
  act3_getknow: 'girl',
  act3_no: 'girl',
  act3_end_hayir: 'boy'
};

/**
 * "(İçinden) ..." ve "(İnci'nin içinden) ..." biçimlerinin ikisini de yakalar.
 * Türkçe'de 'İ' harfinin küçültülmesi ortama göre değiştiği için büyük/küçük
 * varyantlar regex içinde açıkça yazılıyor; /i bayrağına güvenilmiyor.
 */
const INNER_THOUGHT_RE = /[İIi]çinden\)/;

class PortraitManager {
  /**
   * @param {{frameEl:HTMLElement, imageEl:HTMLElement, colEl:HTMLElement,
   *          nameplateEl:HTMLElement, boxEl:HTMLElement,
   *          sceneManager:SceneManager}} refs
   */
  constructor(refs) {
    this.frameEl = refs.frameEl;
    this.imageEl = refs.imageEl;
    this.colEl = refs.colEl;
    this.nameplateEl = refs.nameplateEl;
    this.boxEl = refs.boxEl;
    this.scene = refs.sceneManager;

    this.speakerToId = this._buildSpeakerMap();
    this.idToName = {};
    Object.keys(this.speakerToId).forEach((name) => { this.idToName[this.speakerToId[name]] = name; });
    this.currentId = null;
    this.lastShownId = null;
  }

  /**
   * Konuşmacı adı -> karakter id eşlemesi. Adlar story.js'teki sabitlerden
   * türetilir, elle yazılmaz.
   */
  _buildSpeakerMap() {
    const map = {};
    if (typeof GIRL_NAME !== 'undefined') map[GIRL_NAME] = 'girl';
    if (typeof BOY_NAME !== 'undefined') map[BOY_NAME] = 'boy';
    if (typeof TEACHER_NAME !== 'undefined') map[TEACHER_NAME] = 'teacher';
    return map;
  }

  /** Konuşmacı adından karakter id'si (DebateManager da kullanır). */
  idForSpeaker(speaker) {
    return speaker ? (this.speakerToId[speaker] || null) : null;
  }

  /** Karakter id'sinden görünen ad. */
  nameForId(id) {
    return this.idToName[id] || '';
  }

  /** 'show' adımlarında çağrılır; POV çözümlemesinin yedek kaynağı. */
  noteShown(id) {
    if (id) this.lastShownId = id;
  }

  /** 'girl_happy.svg' -> { id: 'girl', expression: 'happy' } */
  _parseFile(file) {
    if (!file) return null;
    const base = String(file).replace(/\.[^.]+$/, '');
    const parts = base.split('_');
    if (parts.length < 2) return null;
    return { id: parts[0], expression: parts.slice(1).join('_') };
  }

  /**
   * Fallback zinciri: sahnedeki ifade -> karakterin varsayılan ifadesi -> null.
   * DebateManager da ifadeyi buradan çözer; ikinci bir ifade sistemi yoktur.
   * @returns {string|null} Kullanılacak dosya adı.
   */
  resolveFileFor(id) {
    const available = PORTRAIT_ASSETS[id];
    if (!available || !available.length) return null;

    // 1) Karakter sahnedeyse SceneManager'ın gösterdiği ifadeyi kullan.
    const occupant = this.scene && this.scene.occupied ? this.scene.occupied[id] : null;
    if (occupant && occupant.file) {
      const parsed = this._parseFile(occupant.file);
      if (parsed && available.indexOf(parsed.expression) !== -1) return occupant.file;
    }

    // 2) Sahnede değilse (ör. Öğretmen hiç 'show' edilmiyor) varsayılana düş.
    const fallback = PORTRAIT_DEFAULT_EXPRESSION[id];
    if (fallback && available.indexOf(fallback) !== -1) return id + '_' + fallback + '.svg';
    return id + '_' + available[0] + '.svg';
  }

  /**
   * Bir 'say' adımı için portreyi güncelle.
   * @param {string} speaker Konuşmacı adı ('' ise anlatım veya iç monolog).
   * @param {string} text Replik metni (iç monolog tespiti için).
   * @param {string} label O anki hikaye etiketi (POV çözümlemesi için).
   */
  update(speaker, text, label) {
    // İç ses, metnin kendi stiliyle (soluk + italik) belli edilir; bu yüzden
    // portre çözülemese bile kutuya inner-thought sınıfı uygulanır.
    const isInner = !speaker && typeof text === 'string' && INNER_THOUGHT_RE.test(text);
    if (this.boxEl) this.boxEl.classList.toggle('inner-thought', isInner);

    // 1) Adı olan konuşmacı: doğrudan eşle.
    const named = speaker ? this.speakerToId[speaker] : null;
    if (named) {
      this.currentId = named;
      this._apply(this.resolveFileFor(named), false, speaker);
      return;
    }

    // 2) Adı yok ama iç monologsa, POV sahibinin portresi ve adı gösterilir.
    if (isInner) {
      const povId = LABEL_POV[label] || this.lastShownId;
      if (povId && PORTRAIT_ASSETS[povId]) {
        this.currentId = povId;
        this._apply(this.resolveFileFor(povId), true, this.idToName[povId] || '');
        return;
      }
    }

    // 3) Anlatım, perde kartı veya görseli olmayan konuşmacı: portre yok.
    this.currentId = null;
    this._apply(null, false, '');
  }

  /** 'expr' adımından sonra; sadece portresi görünen karakter için yeniler. */
  refreshExpression(id) {
    if (!id || id !== this.currentId) return;
    const inner = this.colEl.classList.contains('inner');
    this._apply(this.resolveFileFor(id), inner, this.nameplateEl.textContent);
  }

  _apply(file, isInner, label) {
    const visible = !!file;

    if (file) {
      const url = `url("${assetPath('characters', file)}")`;
      if (this.imageEl.style.backgroundImage !== url) {
        this.imageEl.style.backgroundImage = url;
      }
      const parsed = this._parseFile(file);
      this.imageEl.setAttribute('data-char', parsed ? parsed.id : '');
    }

    if (this.nameplateEl) this.nameplateEl.textContent = visible ? (label || '') : '';
    if (this.colEl) this.colEl.classList.toggle('inner', visible && !!isInner);
    if (this.boxEl) this.boxEl.classList.toggle('has-portrait', visible);
  }

  /** Yeni oyun / devam / menüye dönüş sırasında portre durumunu temizler. */
  reset() {
    this.currentId = null;
    this.lastShownId = null;
    this.imageEl.style.backgroundImage = '';
    this.imageEl.removeAttribute('data-char');
    if (this.nameplateEl) this.nameplateEl.textContent = '';
    if (this.colEl) this.colEl.classList.remove('inner');
    if (this.boxEl) this.boxEl.classList.remove('has-portrait', 'inner-thought');
  }
}
