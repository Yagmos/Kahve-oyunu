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
    this.audio = deps.audioManager;
    this.phone = deps.phoneManager;
    this.onExitToMenu = deps.onExitToMenu || function () {};

    this.label = STORY_START_LABEL;
    this.index = 0;
    this.waitingForChoice = false;
    this.waitingForPhone = false;
    this.finished = false;
    this.noteScore = 0; // ACT II not alma mini oyunu için basit puan sayacı
  }

  newGame() {
    SaveManager.clearSave();
    this.dialogue.clearHistory();
    this.dialogue.hideChoices();
    this.phone.hide();
    this.scene.reset();
    if (this.portrait) this.portrait.reset();
    this.finished = false;
    this.waitingForChoice = false;
    this.waitingForPhone = false;
    this.noteScore = 0;
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
    this.finished = false;
    this.waitingForChoice = false;
    this.waitingForPhone = false;
    this.noteScore = (save.vars && typeof save.vars.noteScore === 'number') ? save.vars.noteScore : 0;

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
    for (let i = 0; i < uptoIndex && i < steps.length; i++) {
      const step = steps[i];
      switch (step.type) {
        case 'say':
          // Metin/daktilo tekrar çalıştırılmaz, sadece portre için gereken
          // konuşmacı ve metin not edilir.
          lastSay = { speaker: step.speaker || '', text: resolveDynamic(step.text, this) };
          break;
        case 'bg':
          this.scene.setBackground(step.file);
          break;
        case 'show':
          this.scene.showCharacter(step.id, step);
          if (this.portrait) this.portrait.noteShown(step.id);
          break;
        case 'expr':
          this.scene.changeExpression(step.id, resolveDynamic(step.file, this));
          break;
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

    switch (step.type) {
      case 'bg':
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

      case 'expr':
        this.scene.changeExpression(step.id, resolveDynamic(step.file, this));
        if (this.portrait) this.portrait.refreshExpression(step.id);
        this._advanceAuto();
        break;

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
        this.dialogue.say(step.speaker, resolveDynamic(step.text, this));
        if (this.portrait) this.portrait.update(step.speaker, resolveDynamic(step.text, this), this.label);
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
    SaveManager.save({ label: this.label, index: this.index, vars: { noteScore: this.noteScore } });
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
    this.onExitToMenu();
  }

  manualSave() {
    if (this.finished) return false;
    this._saveProgress();
    return true;
  }
}
