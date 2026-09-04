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
    this.label = STORY_START_LABEL;
    this.index = 0;
    this._executeCurrent();
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

    this.currentBg = (save.vars && typeof save.vars.bg === 'string') ? save.vars.bg : null;
    if (this.currentBg) this.scene.setBackground(this.currentBg);
    this._replayInstantly(save.label, save.index);
    this.label = save.label;
    this.index = save.index;
    this._executeCurrent();
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
    let lastSayIndex = 0;
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
          lastSayIndex = i;
          if (step.speaker) lastNamedSpeaker = step.speaker;
          break;
        case 'bg':
          this.currentBg = step.file || null;
          this.scene.setBackground(step.file);
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
          this.audio.playBgm(step.file);
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
      if (lastSay) this.debate.update(lastNamedSpeaker || lastSay.speaker, label, lastSayIndex);
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
        this.currentBg = step.file || null;
        this.scene.setBackground(step.file);
        this._advanceAuto();
        break;

      case 'bgm':
        this.audio.playBgm(step.file);
        this._advanceAuto();
        break;

      case 'sfx':
        this.audio.playSfx(step.file);
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

      case 'camera':
        this.scene.cameraEffect(step.effect);
        this._advanceAuto();
        break;

      case 'jump':
        this.label = step.goto;
        this.index = 0;
        this._executeCurrent();
        break;

      case 'say':
        this.dialogue.hideChoices();
        {
          const rawText = resolveDynamic(step.text, this);
          this.dialogue.say(step.speaker, stripInnerThoughtPrefix(rawText));
          if (this.portrait) this.portrait.update(step.speaker, rawText, this.label);
          if (this.debate) this.debate.update(step.speaker, this.label, this.index);
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
    this.audio.stopBgm();
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
