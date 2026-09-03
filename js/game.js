/**
 * Game: hikaye adımlarını (STORY) sırayla oynatan ana motor.
 * Sahne/diyalog/ses yöneticilerini birbirine bağlar.
 */
class Game {
  /**
   * @param {{sceneManager:SceneManager, dialogueManager:DialogueManager, audioManager:AudioManager, onExitToMenu:Function}} deps
   */
  constructor(deps) {
    this.scene = deps.sceneManager;
    this.dialogue = deps.dialogueManager;
    this.audio = deps.audioManager;
    this.onExitToMenu = deps.onExitToMenu || function () {};

    this.label = STORY_START_LABEL;
    this.index = 0;
    this.waitingForChoice = false;
    this.finished = false;
  }

  newGame() {
    SaveManager.clearSave();
    this.dialogue.clearHistory();
    this.dialogue.hideChoices();
    this.scene.reset();
    this.finished = false;
    this.waitingForChoice = false;
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
    this.scene.reset();
    this.finished = false;
    this.waitingForChoice = false;

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
    for (let i = 0; i < uptoIndex && i < steps.length; i++) {
      const step = steps[i];
      switch (step.type) {
        case 'bg':
          this.scene.setBackground(step.file);
          break;
        case 'show':
          this.scene.showCharacter(step.id, step);
          break;
        case 'expr':
          this.scene.changeExpression(step.id, step.file);
          break;
        case 'hide':
          this.scene.hideCharacter(step.id);
          break;
        case 'bgm':
          this.audio.playBgm(step.file);
          break;
        default:
          break; // sfx / camera / say / choice / jump / end tekrar oynatılmaz
      }
    }
  }

  /**
   * Kullanıcının ekrana dokunması/tıklamasıyla çağrılır.
   */
  advance() {
    if (this.waitingForChoice) return;

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
        this._advanceAuto();
        break;

      case 'expr':
        this.scene.changeExpression(step.id, step.file);
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
        this.dialogue.say(step.speaker, step.text);
        this._saveProgress();
        break;

      case 'choice':
        this.waitingForChoice = true;
        this.dialogue.showChoices(step.prompt, step.options, (option) => this._onChoiceSelected(option));
        this._saveProgress();
        break;

      case 'end':
        this._finishStory();
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
    this.label = option.goto;
    this.index = 0;
    this._executeCurrent();
  }

  _saveProgress() {
    SaveManager.save({ label: this.label, index: this.index });
  }

  _finishStory() {
    this.finished = true;
    SaveManager.clearSave();
  }

  _returnToMenu() {
    this.audio.stopBgm();
    this.onExitToMenu();
  }

  manualSave() {
    if (this.finished) return false;
    this._saveProgress();
    return true;
  }
}
