/**
 * Merkezi ayar ve dosya yolu tanımları.
 * Gerçek asset'ler eklendiğinde sadece burası veya story.js içindeki
 * dosya adlarının güncellenmesi yeterlidir.
 */
const CONFIG = {
  paths: {
    backgrounds: 'assets/backgrounds/',
    characters: 'assets/characters/',
    cg: 'assets/cg/',
    audio: 'assets/audio/',
    ui: 'assets/ui/',
    phone: 'assets/phone/',
    video: 'assets/video/'
  },

  // Karakter başına harf yazma hızı (ms). Küçük değer = hızlı yazı.
  typingSpeed: {
    slow: 55,
    normal: 28,
    fast: 10
  },

  // Sahne/arka plan ve karakter geçiş süreleri (ms). CSS ile eşleşmeli.
  transitions: {
    bgFade: 500,
    characterFade: 400,
    characterSlide: 450
  },

  // Ses kaynağı:
  //   'auto'   — assets/audio içinde dosya varsa onu çalar, yoksa WebAudio ile
  //              üretir (js/synth.js). Dosyaları tek tek eklemek yeterli.
  //   'files'  — sadece dosyalar; eksik olanlar sessiz kalır.
  //   'synth'  — dosyaları hiç denemez, hep üretilmiş sesi çalar.
  audioMode: 'auto',

  defaultSettings: {
    musicOn: true,
    sfxOn: true,
    textSpeed: 'normal',
    musicVolume: 0.6,
    sfxVolume: 0.8
  }
};

function assetPath(kind, filename) {
  if (!filename) return '';
  return CONFIG.paths[kind] + filename;
}
