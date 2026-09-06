/**
 * Bir adım alanı (ör. 'say' metni, 'expr' dosyası) ya sabit bir değer,
 * ya da (game) => değer şeklinde bir fonksiyon olabilir. Fonksiyon ise
 * çalıştırılıp sonucu döndürülür — mini oyun sonucu gibi oyunun anlık
 * durumuna bağlı içerikler için kullanılır.
 */
function resolveDynamic(value, game) {
  return typeof value === 'function' ? value(game) : value;
}

/**
 * İç monolog satırlarındaki "(İçinden)" / "(İnci'nin içinden)" önekini
 * EKRANDA gizler. Hikaye verisi olduğu gibi kalır; iç ses olduğu artık
 * metnin soluk/italik stilinden anlaşılır. Portre katmanı POV'u çözmek
 * için ham metni almaya devam eder.
 */
function stripInnerThoughtPrefix(text) {
  return typeof text === 'string' ? text.replace(/^\([^)]*[İIi]çinden\)\s*/, '') : text;
}

/**
 * Game: hikaye adımlarını (STORY) sırayla oynatan ana motor.
 * Sahne/diyalog/ses yöneticilerini birbirine bağlar.
 */
class Game {
  /**
   * @param {{sceneManager:SceneManager, dialogueManager:DialogueManager, audioManager:AudioManager, phoneManager:PhoneManager, onExitToMenu:Function}} deps
   */
  constructor(deps) {
    this.scene = deps.sceneManager;
    this.dialogue = deps.dialogueManager;
    // Portre katmanı opsiyoneldir; yoksa motor aynen çalışmaya devam eder.
    this.portrait = deps.portraitManager || null;
    // Debate katmanı da opsiyoneldir; yoksa oyun normal modda çalışır.
    this.debate = deps.debateManager || null;
    this.audio = deps.audioManager;
    this.phone = deps.phoneManager;
    this.onExitToMenu = deps.onExitToMenu || function () {};

    this.label = STORY_START_LABEL;
    this.index = 0;
    this.waitingForChoice = false;
    this.waitingForPhone = false;
    this.finished = false;
    this.noteScore = 0; // ACT II not alma mini oyunu için basit puan sayacı
    // Oyuncunun seçimlerinden taşınan durum. Seçenekler 'set' (üzerine yaz) ve
    // 'add' (sayaç artır) ile buraya yazar; ilerleyen sahneler okur.
    this.flags = {};
    this.currentBg = null; // en son gösterilen arka plan (kayıt/yükleme için)
  }

  /**
   * Oyunun kullanacağı görselleri ve kafe videosunu arka planda, TEK TEK
   * önden indirir. Sahne değişiminde görsel ilk kez o an yükleniyordu ve
   * geçişte gözle görülür bir takılma oluyordu; giriş mektubu okunurken
   * geçen süre bunun için fazlasıyla yetiyor.
   *
   * Sıra bilinçli: önce arka planlar (en görünür takılma orada), sonra
   * portreler, sonra telefondaki fotoğraflar, en son kafe videosu.
   * Tek tek yüklenir ki ilk sahnelerin kendi istekleriyle yarışmasın.
   */
  _prefetchAssets() {
    if (this._prefetchStarted) return;
    this._prefetchStarted = true;

    const ses = new Set();
    const arkaPlan = new Set();
    const karakter = new Set();
    let video = null;

    Object.keys(STORY).forEach((etiket) => {
      (STORY[etiket] || []).forEach((adim) => {
        if (adim.type === 'bg' && typeof adim.file === 'string') arkaPlan.add(adim.file);
        if (adim.type === 'bgvideo' && typeof adim.file === 'string') video = adim.file;
        if ((adim.type === 'bgm' || adim.type === 'sfx') && typeof adim.file === 'string') ses.add(adim.file);
        if ((adim.type === 'show' || adim.type === 'expr') && typeof adim.file === 'string') {
          // Sahnedeki figür ve portre ayrı görsellerden geliyor; ikisi de ısınsın.
          if (typeof SHOW_STANDING_CHARACTERS === 'undefined' || SHOW_STANDING_CHARACTERS) {
            karakter.add(sceneArt(adim.file, this.flags));
          }
          karakter.add(portraitArt(adim.file));
        }
      });
    });

    // Yazı sesleri ve tıklama sesi hiçbir adımda geçmez; elle eklenir.
    try {
      Object.keys(VOICE_FILES).forEach((k) => ses.add(VOICE_FILES[k]));
      ses.add(VOICE_DEFAULT);
    } catch (e) { /* yoksa atla */ }
    ses.add('click.mp3');

    // Tartışma sahnesi kendi görsellerini ve sesini DebateManager üzerinden
    // çağırıyor; hikaye adımlarında geçmedikleri için ayrıca eklenir.
    try {
      Object.keys(DEBATE_ART).forEach((id) => {
        const set = DEBATE_ART[id] || {};
        Object.keys(set).forEach((ifade) => karakter.add(set[ifade]));
      });
    } catch (e) { /* tartışma katmanı yoksa atla */ }
    if (typeof EMPHASIS_SFX === 'string') ses.add(EMPHASIS_SFX);

    // Sahneye hiç girmeyen karakterin portresi varsayılan ifadeye düşer
    // (ör. Badem Öziş); o dosyalar da yukarıdaki taramada görünmez.
    try {
      Object.keys(PORTRAIT_DEFAULT_EXPRESSION).forEach((id) => {
        karakter.add(portraitArt(id + '_' + PORTRAIT_DEFAULT_EXPRESSION[id] + '.svg'));
      });
    } catch (e) { /* yoksa atla */ }

    const telefon = new Set();
    try {
      const veri = (typeof PHONE_APPS_DATA !== 'undefined') ? PHONE_APPS_DATA : null;
      if (veri) {
        (veri.instagram && veri.instagram.posts || []).forEach((g) => { if (g.image) telefon.add(g.image); if (g.poster) telefon.add(g.poster); });
        const gal = veri.gallery || {};
        (gal.items || []).forEach((g) => telefon.add(g.file));
        ((gal.locked && gal.locked.items) || []).forEach((g) => telefon.add(g.file));
      }
    } catch (e) { /* telefon verisi yoksa sorun değil */ }

    // Sıra bilinçli: müzik başta, çünkü geç yüklenen bir parça fade-in'i
    // sessizliğe açıyor ve en çok orada duyuluyor. Sonra arka planlar,
    // portreler, telefon fotoğrafları; kafe videosu en sonda.
    const sira = []
      .concat([...ses].map((f) => ({ tur: 'ses', url: assetPath('audio', f) })))
      .concat([...arkaPlan].map((f) => ({ tur: 'gorsel', url: assetPath('backgrounds', f) })))
      .concat([...karakter].map((f) => ({ tur: 'gorsel', url: assetPath('characters', f) })))
      .concat([...telefon].map((f) => ({ tur: 'gorsel', url: assetPath('phone', f) })));

    let i = 0;
    const sonraki = () => {
      if (i >= sira.length) { this._prefetchVideo(video); return; }
      const oge = sira[i++];
      let gecti = false;
      const devam = () => { if (gecti) return; gecti = true; setTimeout(sonraki, 40); };
      // Tek bir dosya takılırsa kuyruk durmasın.
      setTimeout(devam, 4000);
      if (oge.tur === 'ses') {
        const a = new Audio();
        a.preload = 'auto';
        a.oncanplaythrough = devam;
        a.onerror = devam;
        a.src = oge.url;
        try { a.load(); } catch (e) { devam(); }
      } else {
        const img = new Image();
        img.onload = devam;
        img.onerror = devam;
        img.src = oge.url;
      }
    };
    setTimeout(sonraki, 400);
  }

  /** Kafe animasyonu doruk noktasında takılmasın diye en sonda ısıtılır. */
  _prefetchVideo(dosya) {
    if (!dosya) return;
    try {
      const v = document.createElement('video');
      v.preload = 'auto';
      v.muted = true;
      v.src = assetPath('video', dosya);
      v.load();
      this._prefetchedVideo = v;   // çöp toplayıcı almasın diye tutuluyor
    } catch (e) { /* video ısıtılamazsa oyun aynen çalışır */ }
  }

  newGame() {
    SaveManager.clearSave();
    this.dialogue.clearHistory();
    this.dialogue.hideChoices();
    this.phone.hide();
    this.scene.reset();
    if (this.portrait) this.portrait.reset();
    if (this.debate) this.debate.reset();
    this.finished = false;
    this.waitingForChoice = false;
    this.waitingForPhone = false;
    this.noteScore = 0;
    this.flags = {};
    this.currentBg = null;
    this.scene.flags = this.flags;
    this.label = STORY_START_LABEL;
    this.index = 0;
    this._executeCurrent();
    this._prefetchAssets();
  }

  continueGame() {
    const save = SaveManager.load();
    if (!save || !STORY[save.label]) {
      this.newGame();
      return;
    }

    this.dialogue.clearHistory();
    this.dialogue.hideChoices();
    this.phone.hide();
    this.scene.reset();
    if (this.portrait) this.portrait.reset();
    if (this.debate) this.debate.reset();
    this.finished = false;
    this.waitingForChoice = false;
    this.waitingForPhone = false;
    this.noteScore = (save.vars && typeof save.vars.noteScore === 'number') ? save.vars.noteScore : 0;
    this.flags = (save.vars && save.vars.flags && typeof save.vars.flags === 'object')
      ? Object.assign({}, save.vars.flags) : {};

    this.scene.flags = this.flags;
    this.currentBg = (save.vars && typeof save.vars.bg === 'string') ? save.vars.bg : null;
    if (this.currentBg) this.scene.setBackground(this.currentBg);
    this._replayInstantly(save.label, save.index);
    this.label = save.label;
    this.index = save.index;
    this._executeCurrent();
    this._prefetchAssets();
  }

  /**
   * Kayıtlı noktaya kadar olan görsel/işitsel adımları animasyonsuz uygular.
   * (say/choice/end/sfx/jump adımları burada tekrar oynatılmaz.)
   */
  _replayInstantly(label, uptoIndex) {
    const steps = STORY[label] || [];
    // Kayıt bir 'choice'/'phone' adımındaysa öncesindeki 'say' tekrar
    // oynatılmaz; portrenin boş kalmaması için son konuşmacıyı hatırlıyoruz.
    let lastSay = null;
    // Debate sahnesi tek görsel gösterdiği için son ADI OLAN konuşmacı ayrıca tutulur;
    // kayıt bir anlatım satırındaysa sahne boş kalmaz.
    let lastNamedSpeaker = '';
    for (let i = 0; i < uptoIndex && i < steps.length; i++) {
      const step = steps[i];
      switch (step.type) {
        case 'say':
          // Metin/daktilo tekrar çalıştırılmaz, sadece portre için gereken
          // konuşmacı ve metin not edilir.
          lastSay = { speaker: step.speaker || '', text: resolveDynamic(step.text, this) };
          if (step.speaker) lastNamedSpeaker = step.speaker;
          break;
        case 'bg':
          this.scene.clearBackgroundVideo();
          this.currentBg = step.file || null;
          this.scene.setBackground(step.file);
          break;
        case 'bgvideo':
          // Kayıt kafe sahnesindeyken alınmışsa video da geri gelmeli;
          // yoksa seçim ekranı bomboş bir arka planın üstünde açılıyordu.
          this.scene.setBackgroundVideo(step.file);
          break;
        case 'show':
          this.scene.showCharacter(step.id, step);
          if (this.portrait) this.portrait.noteShown(step.id);
          break;
        case 'expr': {
          const exprFile = resolveDynamic(step.file, this);
          this.scene.changeExpression(step.id, exprFile);
          if (this.debate) this.debate.noteExpression(step.id, exprFile);
          break;
        }
        case 'hide':
          this.scene.hideCharacter(step.id);
          break;
        case 'bgm':
          if (step.stop) this.audio.fadeOutBgm(0.1);
          else this.audio.playBgm(step.file, { volume: step.volume });
          break;
        default:
          break; // sfx / camera / choice / phone / jump / end tekrar oynatılmaz
      }
    }

    // Sahne durumu (occupied) tamamlandıktan sonra portreyi sessizce geri yükle.
    if (this.portrait && lastSay) {
      this.portrait.update(lastSay.speaker, lastSay.text, label);
    }
    // Kayıt bir choice/phone adımındaysa tartışma sahnesi de boş kalmasın.
    if (this.debate) {
      this.debate.syncMode(label);
      if (lastSay) this.debate.update(lastNamedSpeaker || lastSay.speaker, label, { silent: true });
    }
  }

  /**
   * Kullanıcının ekrana dokunması/tıklamasıyla çağrılır.
   */
  advance() {
    if (this.waitingForChoice || this.waitingForPhone) return;

    if (this.finished) {
      this._returnToMenu();
      return;
    }

    const consumedTyping = this.dialogue.consumeTap();
    if (consumedTyping) return; // sadece yazıyı tamamladı, adım ilerlemedi

    this.index++;
    this._executeCurrent();
  }

  _executeCurrent() {
    const steps = STORY[this.label];
    const step = steps ? steps[this.index] : null;

    if (!step) {
      this._returnToMenu();
      return;
    }

    // Debate Mode yalnızca etiket adından çözülür; story.js'e dokunulmaz.
    if (this.debate) this.debate.syncMode(this.label);

    switch (step.type) {
      case 'bg':
        // Sahne değişiyor: önceki sahnenin zili/kapısı yeni sahneye taşmasın.
        this.audio.stopSfx();
        this.scene.clearBackgroundVideo();
        this.currentBg = step.file || null;
        this.scene.setBackground(step.file);
        this._advanceAuto();
        break;

      case 'bgm':
        // stop: bilerek sessizlik (aynı parça sonradan baştan başlayabilir).
        if (step.stop) this.audio.fadeOutBgm(step.fadeOut);
        else this.audio.playBgm(step.file, { fadeIn: step.fadeIn, fadeOut: step.fadeOut, volume: step.volume });
        this._advanceAuto();
        break;

      case 'sfx':
        this.audio.playSfx(step.file, { track: true });
        this._advanceAuto();
        break;

      case 'show':
        this.scene.showCharacter(step.id, step);
        if (this.portrait) this.portrait.noteShown(step.id);
        this._advanceAuto();
        break;

      case 'expr': {
        const exprFile = resolveDynamic(step.file, this);
        this.scene.changeExpression(step.id, exprFile);
        if (this.portrait) this.portrait.refreshExpression(step.id);
        // Öğretmen sahneye 'show' edilmediği için pozu dosya adından gider.
        if (this.debate) this.debate.refreshExpression(step.id, exprFile);
        this._advanceAuto();
        break;
      }

      case 'hide':
        this.scene.hideCharacter(step.id);
        this._advanceAuto();
        break;

      case 'fx':
        this.scene.playEffect(step.effect);
        this._advanceAuto();
        break;

      case 'camera':
        this.scene.cameraEffect(step.effect);
        this._advanceAuto();
        break;

      case 'jump':
        // goto bir fonksiyon olabilir: bayraklara göre farklı sahneye dallanır.
        this.label = resolveDynamic(step.goto, this);
        this.index = 0;
        this._executeCurrent();
        break;

      case 'say':
        this.dialogue.hideChoices();
        {
          const rawText = resolveDynamic(step.text, this);
          // Portre ÖNCE çözülür: yazı sesi konuşanın kim olduğunu buradan okur.
          if (this.portrait) this.portrait.update(step.speaker, rawText, this.label, step.pov);
          this.dialogue.say(step.speaker, stripInnerThoughtPrefix(rawText), { titleCard: !!step.titleCard, note: !!step.note, credits: !!step.credits });
          if (this.debate) this.debate.update(step.speaker, this.label);
          if (step.emphasis && this.debate) this.debate.emphasize();
        }
        this._saveProgress();
        break;

      case 'choice':
        this.waitingForChoice = true;
        // Portre artık diyalog kutusunun İÇİNDE olduğu ve seçim katmanı
        // kutunun üstünde konumlandığı için çakışma yapısal olarak imkânsız;
        // portre seçim sırasında da görünür kalır.
        this.dialogue.showChoices(step.prompt, step.options, (option) => this._onChoiceSelected(option));
        this._saveProgress();
        break;

      case 'phone':
        this.waitingForPhone = true;
        this.phone.show(step);
        this._saveProgress();
        break;

      case 'bgvideo':
        // Sahne videosu arka planda döner; diyalog ve seçimler ÜSTÜNDE kalır.
        // currentBg BİLEREK sıfırlanmıyor: video altındaki sahne kayıtta
        // korunsun ki yükleme sonrası (ya da video oynatılamazsa) ekran
        // boş kalmasın, altta o sahne dursun.
        this.scene.setBackgroundVideo(step.file);
        this._advanceAuto();
        break;

      case 'end':
        this._finishStory(step.next);
        break;

      default:
        console.warn('[Game] Bilinmeyen adım tipi:', step.type);
        this._advanceAuto();
        break;
    }
  }

  _advanceAuto() {
    this.index++;
    this._executeCurrent();
  }

  _onChoiceSelected(option) {
    this.waitingForChoice = false;
    this.dialogue.hideChoices();
    if (typeof option.points === 'number') {
      this.noteScore += option.points;
    }
    if (option.set) {
      Object.keys(option.set).forEach((key) => { this.flags[key] = option.set[key]; });
    }
    this.scene.flags = this.flags;
    if (option.add) {
      Object.keys(option.add).forEach((key) => {
        this.flags[key] = (this.flags[key] || 0) + option.add[key];
      });
    }
    this.label = option.goto;
    this.index = 0;
    this._executeCurrent();
  }

  closePhone() {
    if (!this.waitingForPhone) return;
    this.waitingForPhone = false;
    this.phone.hide();
    this._advanceAuto();
  }

  _saveProgress() {
    SaveManager.save({
      label: this.label,
      index: this.index,
      vars: { noteScore: this.noteScore, flags: this.flags, bg: this.currentBg }
    });
  }

  /**
   * @param {string} [nextLabel] Belirtilirse (ör. bir sonraki perdenin
   * başlangıç etiketi) hikaye orada devam eder. Belirtilmez veya etiket
   * henüz STORY içinde yoksa (o perde henüz yazılmadıysa) hikaye burada
   * biter ve ana menüye dönülür.
   */
  _finishStory(nextLabel) {
    if (nextLabel && STORY[nextLabel]) {
      this.label = nextLabel;
      this.index = 0;
      this._executeCurrent();
      return;
    }
    this.finished = true;
    SaveManager.clearSave();
  }

  _returnToMenu() {
    // Menüye dönerken müzik aniden kesilmesin; son kartın havası korunuyor.
    this.audio.fadeOutBgm(1.2);
    if (this.portrait) this.portrait.reset();
    if (this.debate) this.debate.reset();
    if (this.debate) this.debate.reset();
    this.onExitToMenu();
  }

  manualSave() {
    if (this.finished) return false;
    this._saveProgress();
    return true;
  }
}
