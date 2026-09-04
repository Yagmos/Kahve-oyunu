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
    ui: 'assets/ui/'
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

  // Müzik ve efektler ses dosyası yerine WebAudio ile üretilir (js/synth.js).
  // Depoya gerçek mp3'ler eklenirse bunu false yapmak yeterli.
  useSynthAudio: true,

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
