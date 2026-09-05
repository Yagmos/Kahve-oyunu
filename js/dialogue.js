/**
 * DialogueManager: konuşmacı adı, yazı efektiyle diyalog metni,
 * geçmiş kaydı ve seçim (choice) arayüzünü yönetir.
 *
 * Yazı sesi: metin yazılırken karaktere özel kısa bir "bip" çalar. Hangi
 * karakterin konuştuğunu PortraitManager çözdüğü için (iç monologlarda bile)
 * ses de doğru karakterden gelir.
 */

/** Karakter -> yazı sesi dosyası. Listede olmayan herkes VOICE_DEFAULT kullanır. */
const VOICE_FILES = {
  girl: 'voice_girl.mp3',
  boy: 'voice_boy.mp3',
  teacher: 'voice_teacher.mp3'
};
const VOICE_DEFAULT = 'voice_other.mp3';

/** Kaç karakterde bir bip çalsın (her harfte çalarsa gürültü oluyor). */
const VOICE_EVERY = 3;
/** Yazı sesi efekt seviyesinin çarpanı: arka planda kalmalı. */
const VOICE_GAIN = 0.30;
class DialogueManager {
  constructor(refs) {
    this.nameEl = refs.nameEl;
    this.textEl = refs.textEl;
    this.tapIndicatorEl = refs.tapIndicatorEl;
    this.choiceLayerEl = refs.choiceLayerEl;
    this.historyListEl = refs.historyListEl;

    this.audio = refs.audioManager || null;
    /** () => karakter kimliği ('girl' | 'boy' | 'teacher' | null) */
    this.voiceIdProvider = refs.voiceIdProvider || null;

    this.charDelay = CONFIG.typingSpeed.normal;
    this.typing = false;
    this.fullText = '';
    this.timer = null;
    this.history = [];
  }

  setSpeed(speedKey) {
    this.charDelay = CONFIG.typingSpeed[speedKey] != null ? CONFIG.typingSpeed[speedKey] : CONFIG.typingSpeed.normal;
  }

  /**
   * Diyaloğu yazı efektiyle göster.
   * @param {string} speaker
   * @param {string} text
   */
  say(speaker, text) {
    this._clearTimer();

    this.nameEl.textContent = speaker || '';
    this.nameEl.style.visibility = speaker ? 'visible' : 'hidden';
    this.textEl.textContent = '';
    this.tapIndicatorEl.classList.add('hidden');

    this.fullText = text || '';
    this.currentSpeaker = speaker || '';
    this.typing = true;

    if (this.charDelay <= 0) {
      this._finishTyping();
      return;
    }

    const sesDosyası = this._voiceFile(this.currentSpeaker);
    let i = 0;
    let sonBip = -VOICE_EVERY;
    this.timer = setInterval(() => {
      i++;
      const harf = this.fullText.charAt(i - 1);
      this.textEl.textContent = this.fullText.slice(0, i);
      // Boşluk ve noktalama sessiz kalsın; konuşma daha doğal duyuluyor.
      if (this.audio && sesDosyası && /[^\s.,!?;:…"'()\-]/.test(harf) && i - sonBip >= VOICE_EVERY) {
        sonBip = i;
        this.audio.playSfx(sesDosyası, { volume: VOICE_GAIN });
      }
      if (i >= this.fullText.length) {
        this._finishTyping();
      }
    }, this.charDelay);
  }

  /**
   * O anki satır kimin? Portre yöneticisi iç monologları da çözüyor.
   * Adı olan ama portresi olmayan yan karakterler (kulüp arkadaşı, öğrenciler,
   * Cemal Hoca) ortak sesi kullanır; anlatım satırları sessizdir.
   */
  _voiceFile(speaker) {
    const id = this.voiceIdProvider ? this.voiceIdProvider() : null;
    if (id && VOICE_FILES[id]) return VOICE_FILES[id];
    if (speaker) return VOICE_DEFAULT;
    return id ? VOICE_DEFAULT : null;
  }

  _finishTyping() {
    this._clearTimer();
    this.textEl.textContent = this.fullText;
    this.typing = false;
    this.tapIndicatorEl.classList.remove('hidden');
  }

  _clearTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  isTyping() {
    return this.typing;
  }

  /**
   * Tap işleminde çağrılır. Yazı hala yazılıyorsa tamamlar ve true döner
   * (yani "tüketildi", bir sonraki adıma geçilmemeli). Yazı bittiyse
   * geçmişe ekler ve false döner (bir sonraki adıma geçilebilir).
   */
  consumeTap() {
    if (this.typing) {
      this._finishTyping();
      return true;
    }
    if (this.fullText) {
      this._addHistory(this.currentSpeaker, this.fullText);
    }
    return false;
  }

  _addHistory(speaker, text) {
    this.history.push({ speaker, text });
  }

  renderHistory() {
    this.historyListEl.innerHTML = '';
    this.history.forEach((entry) => {
      const item = document.createElement('div');
      item.className = 'history-entry';
      if (entry.speaker) {
        const nameSpan = document.createElement('span');
        nameSpan.className = 'history-speaker';
        nameSpan.textContent = entry.speaker + ': ';
        item.appendChild(nameSpan);
      }
      const textSpan = document.createElement('span');
      textSpan.textContent = entry.text;
      item.appendChild(textSpan);
      this.historyListEl.appendChild(item);
    });
    this.historyListEl.scrollTop = this.historyListEl.scrollHeight;
  }

  clearHistory() {
    this.history = [];
  }

  /**
   * @param {string} prompt Opsiyonel üst başlık.
   * @param {{text:string, goto:string}[]} options
   * @param {(option:object)=>void} onSelect
   */
  showChoices(prompt, options, onSelect) {
    this.choiceLayerEl.innerHTML = '';

    if (prompt) {
      const promptEl = document.createElement('div');
      promptEl.className = 'choice-prompt';
      promptEl.textContent = prompt;
      this.choiceLayerEl.appendChild(promptEl);
    }

    options.forEach((option) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.type = 'button';
      btn.textContent = option.text;
      btn.addEventListener('click', () => onSelect(option));
      this.choiceLayerEl.appendChild(btn);
    });

    this.choiceLayerEl.classList.remove('hidden');
  }

  hideChoices() {
    this.choiceLayerEl.classList.add('hidden');
    this.choiceLayerEl.innerHTML = '';
  }
}
