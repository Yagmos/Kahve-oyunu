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

/**
 * Sahnede duran BÜYÜK karakter figürü. Kapalıyken karakterler yalnızca
 * diyalog kutusundaki portrede ve tartışma sahnesinde görünür; hikaye
 * verisine dokunulmaz, 'show'/'expr' adımları kaydı tutmaya devam eder
 * (portre bu kayıttan besleniyor). Tek satırla geri açılabilir.
 */
const SHOW_STANDING_CHARACTERS = false;

/**
 * Yeni çizimler eski dosya adlarının üstüne biner: hikayedeki yüzlerce
 * 'show'/'expr' adımına dokunmadan sahnedeki figür ve portre değişir.
 *
 * Sahne = boy tam boy figür; portre = baş çizimi. İkisi ayrı görsel olduğu
 * için iki ayrı harita var.
 */
const SCENE_ART = {
  'boy_neutral.svg': 'boy_stand.png',
  'boy_happy.svg': 'boy_stand.png',
  'boy_annoyed.svg': 'boy_stand.png',
  'boy_serious.svg': 'boy_stand.png',
  'boy_skeptic.svg': 'boy_stand.png',
  'girl_neutral.svg': 'girl_stand.png',
  'girl_happy.svg': 'girl_stand.png',
  'girl_annoyed.svg': 'girl_stand.png',
  'girl_surprised.svg': 'girl_stand.png',
  'girl_sleepy.svg': 'girl_stand.png'
};

const PORTRAIT_ART = {
  'boy_neutral.svg': 'head_boy_neutral.png',
  'boy_happy.svg': 'head_boy_happy.png',
  'boy_serious.svg': 'head_boy_neutral.png',
  'boy_annoyed.svg': 'head_boy_x.png',
  'boy_skeptic.svg': 'head_boy_x.png'
};

/** İnci kıyafetini seçtikten sonra beyaz kıyafetli çizime geçer. */
function sceneArt(file, flags) {
  let yeni = SCENE_ART[file] || file;
  if (yeni === 'girl_stand.png' && flags && flags.giyindi) yeni = 'girl_stand_white.png';
  return yeni;
}

/** Portre için baş çizimi; karşılığı yoksa dosya olduğu gibi kullanılır. */
function portraitArt(file) {
  return PORTRAIT_ART[file] || file;
}
