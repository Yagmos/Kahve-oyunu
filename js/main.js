/**
 * main.js — Uygulamayı başlatır, ekranlar arası geçişi ve
 * ana menü / ayarlar arayüzünü yönetir.
 */
document.addEventListener('DOMContentLoaded', () => {
  // ---- Ekranlar ----
  const screens = {
    menu: document.getElementById('screen-main-menu'),
    game: document.getElementById('screen-game'),
    settings: document.getElementById('screen-settings')
  };

  function showScreen(key) {
    Object.keys(screens).forEach((k) => {
      screens[k].classList.toggle('active', k === key);
    });
  }

  // ---- Yönetici referansları ----
  const sceneManager = new SceneManager({
    sceneLayer: document.getElementById('scene-layer'),
    bgA: document.getElementById('bg-a'),
    bgB: document.getElementById('bg-b'),
    slotLeft: document.getElementById('character-left'),
    slotCenter: document.getElementById('character-center'),
    slotRight: document.getElementById('character-right')
  });

  const dialogueManager = new DialogueManager({
    nameEl: document.getElementById('speaker-name'),
    textEl: document.getElementById('dialogue-text'),
    tapIndicatorEl: document.getElementById('tap-indicator'),
    choiceLayerEl: document.getElementById('choice-layer'),
    historyListEl: document.getElementById('history-list')
  });

  const portraitManager = new PortraitManager({
    frameEl: document.getElementById('portrait-frame'),
    imageEl: document.getElementById('portrait-image'),
    boxEl: document.getElementById('dialogue-box'),
    sceneManager
  });

  const audioManager = new AudioManager();

  const phoneManager = new PhoneManager({
    panelEl: document.getElementById('phone-panel'),
    timeEl: document.getElementById('phone-time'),
    dateEl: document.getElementById('phone-date'),
    notificationsEl: document.getElementById('phone-notifications'),
    scheduleEl: document.getElementById('phone-schedule')
  });

  const game = new Game({
    sceneManager,
    dialogueManager,
    portraitManager,
    audioManager,
    phoneManager,
    onExitToMenu: () => {
      showScreen('menu');
      updateContinueButton();
    }
  });

  // ---- Ayarları yükle ve uygula ----
  let settings = SaveManager.loadSettings();
  dialogueManager.setSpeed(settings.textSpeed);
  audioManager.applySettings(settings);

  // ---- Ana menü ----
  const btnNewGame = document.getElementById('btn-new-game');
  const btnContinue = document.getElementById('btn-continue');
  const btnSettingsFromMenu = document.getElementById('btn-settings');

  function updateContinueButton() {
    btnContinue.disabled = !SaveManager.hasSave();
  }
  updateContinueButton();

  btnNewGame.addEventListener('click', () => {
    game.newGame();
    showScreen('game');
  });

  btnContinue.addEventListener('click', () => {
    if (btnContinue.disabled) return;
    game.continueGame();
    showScreen('game');
  });

  let settingsReturnScreen = 'menu';
  btnSettingsFromMenu.addEventListener('click', () => {
    settingsReturnScreen = 'menu';
    showScreen('settings');
  });

  // ---- Oyun ekranı: dokunarak ilerleme ----
  const screenGameEl = screens.game;
  const historyPanel = document.getElementById('history-panel');
  const gameMenuPanel = document.getElementById('game-menu-panel');

  screenGameEl.addEventListener('click', (e) => {
    if (e.target.closest('button')) return;
    if (!historyPanel.classList.contains('hidden')) return;
    if (!gameMenuPanel.classList.contains('hidden')) return;
    game.advance();
  });

  // ---- Geçmiş paneli ----
  const btnHistory = document.getElementById('btn-history');
  const btnCloseHistory = document.getElementById('btn-close-history');

  btnHistory.addEventListener('click', () => {
    dialogueManager.renderHistory();
    historyPanel.classList.remove('hidden');
  });
  btnCloseHistory.addEventListener('click', () => {
    historyPanel.classList.add('hidden');
  });

  // ---- Oyun içi menü (duraklat) ----
  const btnGameMenu = document.getElementById('btn-game-menu');
  const btnResume = document.getElementById('btn-resume');
  const btnSaveGame = document.getElementById('btn-save-game');
  const btnGameSettings = document.getElementById('btn-game-settings');
  const btnQuitToMenu = document.getElementById('btn-quit-to-menu');

  btnGameMenu.addEventListener('click', () => {
    gameMenuPanel.classList.remove('hidden');
  });
  btnResume.addEventListener('click', () => {
    gameMenuPanel.classList.add('hidden');
  });
  btnSaveGame.addEventListener('click', () => {
    const ok = game.manualSave();
    const originalText = btnSaveGame.textContent;
    btnSaveGame.textContent = ok ? 'KAYDEDİLDİ ✓' : 'KAYDEDİLEMEDİ';
    updateContinueButton();
    setTimeout(() => {
      btnSaveGame.textContent = originalText;
    }, 1000);
  });
  btnGameSettings.addEventListener('click', () => {
    settingsReturnScreen = 'game';
    gameMenuPanel.classList.add('hidden');
    showScreen('settings');
  });
  btnQuitToMenu.addEventListener('click', () => {
    gameMenuPanel.classList.add('hidden');
    audioManager.stopBgm();
    showScreen('menu');
    updateContinueButton();
  });

  // ---- Telefon ekranı ----
  const btnClosePhone = document.getElementById('btn-close-phone');
  btnClosePhone.addEventListener('click', () => {
    game.closePhone();
  });

  // ---- Ayarlar ekranı ----
  const toggleMusic = document.getElementById('toggle-music');
  const toggleSfx = document.getElementById('toggle-sfx');
  const speedBtns = Array.from(document.querySelectorAll('.speed-btn'));
  const btnSettingsBack = document.getElementById('btn-settings-back');

  function refreshSettingsUI() {
    toggleMusic.dataset.on = String(settings.musicOn);
    toggleMusic.textContent = settings.musicOn ? 'AÇIK' : 'KAPALI';

    toggleSfx.dataset.on = String(settings.sfxOn);
    toggleSfx.textContent = settings.sfxOn ? 'AÇIK' : 'KAPALI';

    speedBtns.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.speed === settings.textSpeed);
    });
  }
  refreshSettingsUI();

  toggleMusic.addEventListener('click', () => {
    settings.musicOn = !settings.musicOn;
    audioManager.setMusicOn(settings.musicOn);
    SaveManager.saveSettings(settings);
    refreshSettingsUI();
  });

  toggleSfx.addEventListener('click', () => {
    settings.sfxOn = !settings.sfxOn;
    audioManager.setSfxOn(settings.sfxOn);
    SaveManager.saveSettings(settings);
    refreshSettingsUI();
  });

  speedBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      settings.textSpeed = btn.dataset.speed;
      dialogueManager.setSpeed(settings.textSpeed);
      SaveManager.saveSettings(settings);
      refreshSettingsUI();
    });
  });

  btnSettingsBack.addEventListener('click', () => {
    showScreen(settingsReturnScreen);
  });

  // ---- Başlangıç ekranı ----
  showScreen('menu');
});
