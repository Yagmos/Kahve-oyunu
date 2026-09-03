/**
 * story.js — ACT I: SABAH (MORNING)
 *
 * Kızın sıradan bir okul sabahı. Erkek karakter bu perdede YOK — henüz
 * tanışmadılar ve burada tanıştırılmıyor. Amaç kızı ve günlük hayatını
 * tanıtmak; hikayeyi erkenden romantikleştirmemek.
 *
 * Karakter adını tek yerden değiştirebilmek için GIRL_NAME sabiti kullanılır.
 *
 * Adım (step) tipleri:
 *   bg        { type:'bg', file }            — file boş bırakılırsa ekran siyaha döner
 *   bgm       { type:'bgm', file }
 *   sfx       { type:'sfx', file }
 *   show      { type:'show', id, file, position, transition }
 *   expr      { type:'expr', id, file }
 *   hide      { type:'hide', id }
 *   camera    { type:'camera', effect }       — 'zoom-in' | 'zoom-out' | 'slide-left' | 'slide-right'
 *   say       { type:'say', speaker, text }
 *   choice    { type:'choice', prompt, options:[{text, goto}] }
 *   phone     { type:'phone', time, date, notifications:[{app,from,text}], schedule:[{time,subject,highlight}] }
 *   jump      { type:'jump', goto }
 *   end       { type:'end' }
 *
 * "goto" bir etiket adıdır ve her zaman ilgili etiketin 0. adımına atlar.
 */
const GIRL_NAME = 'Elif';

const STORY = {
  // ---- 1-2-3-4-5: Siyah ekran, alarm, odaya geçiş, uyanış, iç ses ----
  act1_start: [
    { type: 'sfx', file: 'alarm.mp3' },
    { type: 'say', speaker: '', text: '*Trrrn! Trrrn! Trrrn!*' },
    { type: 'bg', file: 'bedroom_morning.svg' },
    { type: 'show', id: 'girl', file: 'girl_sleepy.svg', position: 'center', transition: 'fade' },
    { type: 'bgm', file: 'morning_theme.mp3' },
    { type: 'camera', effect: 'zoom-in' },
    { type: 'say', speaker: '', text: `(${GIRL_NAME}'in içinden) Bir dakika daha... sadece bir dakika...` },
    { type: 'expr', id: 'girl', file: 'girl_annoyed.svg' },
    { type: 'say', speaker: GIRL_NAME, text: 'Ah, of... yine mi.' },
    { type: 'say', speaker: GIRL_NAME, text: 'Tamam, tamam. Duydum seni.' },
    {
      type: 'choice',
      prompt: 'Alarm hâlâ çalıyor.',
      options: [
        { text: 'Kalk', goto: 'act1_getup' },
        { text: 'Beş dakika daha', goto: 'act1_snooze' }
      ]
    }
  ],

  // "Beş dakika daha" seçilirse: kısa, komik bir gecikme sahnesi.
  act1_snooze: [
    { type: 'expr', id: 'girl', file: 'girl_sleepy.svg' },
    { type: 'say', speaker: GIRL_NAME, text: 'Sadece beş dakika. Kimse fark etmez.' },
    { type: 'sfx', file: 'alarm.mp3' },
    { type: 'say', speaker: '', text: '*Trrrn! Trrrn!*' },
    { type: 'expr', id: 'girl', file: 'girl_surprised.svg' },
    { type: 'camera', effect: 'zoom-in' },
    { type: 'say', speaker: GIRL_NAME, text: 'Bu... bu beş dakika değildi galiba.' },
    { type: 'say', speaker: GIRL_NAME, text: 'Tamam, cidden kalkmam lazım.' },
    { type: 'jump', goto: 'act1_getup' }
  ],

  // 6-7: Kalkış ve kıyafet seçimi (küçük etkileşim).
  act1_getup: [
    { type: 'expr', id: 'girl', file: 'girl_annoyed.svg' },
    { type: 'say', speaker: '', text: `${GIRL_NAME} esneyerek yataktan kalkıyor.` },
    { type: 'say', speaker: GIRL_NAME, text: 'Bugün ne giysem...' },
    {
      type: 'choice',
      prompt: 'Ne giyse iyi olur?',
      options: [
        { text: 'Favori tişörtü', goto: 'act1_outfit_fav' },
        { text: 'İlk eline geleni', goto: 'act1_outfit_casual' }
      ]
    }
  ],

  act1_outfit_fav: [
    { type: 'expr', id: 'girl', file: 'girl_happy.svg' },
    { type: 'say', speaker: GIRL_NAME, text: 'Favori tişörtümü giyeyim. Gün daha iyi geçecekmiş gibi hissettiriyor.' },
    { type: 'jump', goto: 'act1_breakfast' }
  ],

  act1_outfit_casual: [
    { type: 'expr', id: 'girl', file: 'girl_annoyed.svg' },
    { type: 'say', speaker: GIRL_NAME, text: 'Neyse, ilk eline geleni giysin. Zaman kaybetmeye gerek yok.' },
    { type: 'say', speaker: '', text: '(İçinden) Kot ile çizgili tişört... olsun, kimse fark etmez herhalde.' },
    { type: 'jump', goto: 'act1_breakfast' }
  ],

  // 7: Kahvaltı — kişilik detayları.
  act1_breakfast: [
    { type: 'expr', id: 'girl', file: 'girl_happy.svg' },
    { type: 'say', speaker: '', text: `${GIRL_NAME} mutfağa iniyor, aceleyle bir şeyler atıştırıyor.` },
    { type: 'say', speaker: GIRL_NAME, text: 'Kahve olmadan hiçbir şey yapamam ben.' },
    { type: 'say', speaker: '', text: `(İçinden) Bardağı yıkamayı unutma ${GIRL_NAME}, dün de unutmuştun.` },
    { type: 'jump', goto: 'act1_phone' }
  ],

  // 8: Telefon kontrolü — kurgusal, basit arayüz. ACT II'yi üstü kapalı olarak sezdirir.
  act1_phone: [
    { type: 'say', speaker: GIRL_NAME, text: 'Bu arada telefonuma bir bakayım.' },
    {
      type: 'phone',
      time: '07:42',
      date: 'Salı',
      notifications: [
        { app: 'Mesajlar', from: 'Annem', text: 'Süt almayı unutma, tamam mı? :)' },
        { app: 'Hatırlatıcı', text: 'Kimya ödevini teslim etmeyi unutma!' }
      ],
      schedule: [
        { time: '09:00', subject: 'Matematik' },
        { time: '10:00', subject: 'Türkçe Edebiyatı' },
        { time: '11:00', subject: 'Kimya', highlight: true },
        { time: '13:00', subject: 'Beden Eğitimi' }
      ]
    },
    { type: 'expr', id: 'girl', file: 'girl_annoyed.svg' },
    { type: 'say', speaker: GIRL_NAME, text: 'Ugh... yine o ders.' },
    { type: 'say', speaker: '', text: '(İçinden) Bugünkü kimya dersini hiç düşünmek istemiyorum.' },
    { type: 'jump', goto: 'act1_bag' }
  ],

  // 9: Çanta hazırlığı — küçük bir seçim daha.
  act1_bag: [
    { type: 'say', speaker: '', text: `${GIRL_NAME} çantasını topluyor.` },
    {
      type: 'choice',
      prompt: 'Şemsiyeyi alsın mı?',
      options: [
        { text: 'Şemsiyeyi al', goto: 'act1_umbrella_yes' },
        { text: 'Almadan çık', goto: 'act1_umbrella_no' }
      ]
    }
  ],

  act1_umbrella_yes: [
    { type: 'expr', id: 'girl', file: 'girl_happy.svg' },
    { type: 'say', speaker: GIRL_NAME, text: 'Yağmur yağarsa diye şemsiyeyi de alayım. Tedbiri elden bırakmayalım.' },
    { type: 'jump', goto: 'act1_leave' }
  ],

  act1_umbrella_no: [
    { type: 'expr', id: 'girl', file: 'girl_happy.svg' },
    { type: 'say', speaker: GIRL_NAME, text: 'Hava açık görünüyor. Şemsiyeye gerek yok herhalde.' },
    { type: 'jump', goto: 'act1_leave' }
  ],

  // 10: Evden çıkış.
  act1_leave: [
    { type: 'say', speaker: '', text: 'Ayakkabılarını giyip kapıya yöneliyor.' },
    { type: 'say', speaker: GIRL_NAME, text: 'Tamam... bugün de başlıyoruz.' },
    { type: 'hide', id: 'girl' },
    { type: 'bg', file: null },
    { type: 'jump', goto: 'act1_walk' }
  ],

  // 11: Kısa yürüyüş / geçiş sahnesi, sonra okula varış.
  act1_walk: [
    { type: 'say', speaker: '', text: 'Sokaklar hâlâ yeni uyanıyor; birkaç kişi telaşla yürüyor, bir kedi kaldırımda geriniyor.' },
    { type: 'say', speaker: '', text: `${GIRL_NAME} kulaklığını takıyor, adımlarını hızlandırıyor.` },
    { type: 'say', speaker: '', text: 'Birkaç dakika sonra okulun bahçesine giriyor.' },
    { type: 'jump', goto: 'act1_end' }
  ],

  // 12: Perde sonu kartı.
  act1_end: [
    { type: 'say', speaker: '', text: 'ACT I — MORNING' },
    { type: 'say', speaker: '', text: 'END' },
    { type: 'end' }
  ]
};

const STORY_START_LABEL = 'act1_start';
