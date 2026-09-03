/**
 * story.js — ACT I: SABAH, ACT II: OKUL
 *
 * ACT I: Kızın sıradan bir okul sabahı. Erkek karakter YOK.
 * ACT II: Okul günü. Perdenin sonuna doğru erkek karakter İLK KEZ,
 * sadece görsel olarak ve çok kısaca beliriyor — hâlâ konuşmuyorlar.
 *
 * ACT III henüz yazılmadı. act2_end'teki 'end' adımına `next: 'act3_start'`
 * eklenip ilgili etiketler tanımlandığında üçüncü perde otomatik olarak
 * bağlanır (bkz. act1_end → act2_start bağlantısı, aynı desen).
 *
 * Kızın adını tek yerden değiştirebilmek için GIRL_NAME sabiti kullanılır.
 * Erkek karakterin adı henüz oyuncuya (ya da kıza) söylenmiyor, bu yüzden
 * bir isim sabiti yok — repliklerinde speaker olarak boş bırakılıyor.
 *
 * Adım (step) tipleri:
 *   bg        { type:'bg', file }            — file boş bırakılırsa ekran siyaha döner
 *   bgm       { type:'bgm', file }
 *   sfx       { type:'sfx', file }
 *   show      { type:'show', id, file, position, transition }
 *   expr      { type:'expr', id, file }       — file bir fonksiyon da olabilir: (game) => dosyaAdı
 *   hide      { type:'hide', id }
 *   camera    { type:'camera', effect }       — 'zoom-in' | 'zoom-out' | 'slide-left' | 'slide-right'
 *   say       { type:'say', speaker, text }   — text bir fonksiyon da olabilir: (game) => metin
 *   choice    { type:'choice', prompt, options:[{text, goto, points?}] }
 *                — points verilirse seçilince game.noteScore'a eklenir (mini oyunlar için)
 *   phone     { type:'phone', time, date, notifications:[{app,from,text}], schedule:[{time,subject,highlight}] }
 *   jump      { type:'jump', goto }
 *   end       { type:'end', next? }           — next bir sonraki perdenin başlangıç etiketidir;
 *                                                verilmez veya STORY'de yoksa hikaye biter ve ana menüye dönülür.
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

  // 12: Perde sonu kartı. ACT II hazır olduğu için doğrudan ona bağlanıyor.
  act1_end: [
    { type: 'say', speaker: '', text: 'ACT I — MORNING' },
    { type: 'say', speaker: '', text: 'END' },
    { type: 'end', next: 'act2_start' }
  ],

  // ================= ACT II: OKUL =================

  // 1: Okula varış. ACT I'in bittiği yerden (okul bahçesi, siyah ekran) devam eder.
  act2_start: [
    { type: 'say', speaker: '', text: 'Okulun kapısından içeri giriyor. Koridor her zamanki gibi kalabalık.' },
    { type: 'show', id: 'girl', file: 'girl_happy.svg', position: 'center', transition: 'fade' },
    { type: 'say', speaker: '', text: `(${GIRL_NAME}'in içinden) Yine aynı yüzler, aynı gürültü.` },
    { type: 'say', speaker: '', text: `(${GIRL_NAME}'in içinden) Bugün ilk ders matematik, sonra...` },
    { type: 'expr', id: 'girl', file: 'girl_annoyed.svg' },
    { type: 'say', speaker: '', text: '(İçinden) ...sonra kimya var. Tabii.' },
    { type: 'jump', goto: 'act2_classroom' }
  ],

  // 2: Ders öncesi — sıradan sınıf detayları, bir sınıf arkadaşıyla kısa konuşma.
  act2_classroom: [
    { type: 'expr', id: 'girl', file: 'girl_happy.svg' },
    { type: 'say', speaker: '', text: 'Sınıfına giriyor, çantasını sırasının yanına bırakıyor.' },
    { type: 'say', speaker: '', text: 'Defterlerini çıkarıp masasına diziyor.' },
    { type: 'say', speaker: 'Sınıf arkadaşı', text: 'Ödevi yaptın mı?' },
    { type: 'say', speaker: GIRL_NAME, text: 'Tabii ki yaptım... dün gece.' },
    { type: 'say', speaker: '', text: '(İçinden) Yeter ki kimse kimya ödevini sormasın.' },
    { type: 'jump', goto: 'act2_chemistry_intro' }
  ],

  // 3: Zor ders başlıyor — öğretmen sadece hızlı/zorlayıcı, kötü değil.
  act2_chemistry_intro: [
    { type: 'say', speaker: '', text: 'Ders zili çalıyor.' },
    { type: 'expr', id: 'girl', file: 'girl_annoyed.svg' },
    { type: 'say', speaker: '', text: '(İçinden) Tabii. Kimya.' },
    { type: 'say', speaker: '', text: 'Öğretmen tahtaya hızlı hızlı bir şeyler yazmaya başlıyor.' },
    { type: 'say', speaker: '', text: '(İçinden) Bunu neden bu kadar hızlı yazıyor ki?' },
    { type: 'expr', id: 'girl', file: 'girl_neutral.svg' },
    { type: 'say', speaker: '', text: '(İçinden) Tamam... bunu kesinlikle not almam lazım.' },
    { type: 'say', speaker: '', text: '(Öğretmen anlattıkça, gerçekten önemli olanları not almaya çalışabilirsin.)' },
    { type: 'jump', goto: 'act2_note1' }
  ],

  // ---- MİNİ OYUN: NOT ALMA ----
  // 5 bilgi parçası art arda geliyor; her birinde "Not al" ya da "Geç"
  // seçilir. Doğru seçim game.noteScore'a +1 ekler (bkz. points alanı).
  // Ne olursa olsun akış her zaman act2_note_result'ta birleşir — kesinlikle
  // "oyun bitti" / başarısızlık durumu yoktur.

  // Önemli: sınav tarihi
  act2_note1: [
    { type: 'say', speaker: 'Öğretmen', text: 'Sınav önümüzdeki Cuma, unutmayın.' },
    {
      type: 'choice',
      prompt: 'Not almalı mı?',
      options: [
        { text: 'Not al', goto: 'act2_note1_write', points: 1 },
        { text: 'Geç', goto: 'act2_note1_skip', points: 0 }
      ]
    }
  ],
  act2_note1_write: [
    { type: 'say', speaker: '', text: '(İçinden) Sınav tarihi. Bunu kesin yazmalıyım.' },
    { type: 'jump', goto: 'act2_note2' }
  ],
  act2_note1_skip: [
    { type: 'say', speaker: '', text: '(İçinden) Eh, sınav tarihini nasılsa hatırlarım... değil mi?' },
    { type: 'jump', goto: 'act2_note2' }
  ],

  // Önemsiz: alakasız anı
  act2_note2: [
    { type: 'say', speaker: 'Öğretmen', text: 'Bu arada, üniversitede bir hocam vardı, çok ilginç biriydi...' },
    {
      type: 'choice',
      prompt: 'Not almalı mı?',
      options: [
        { text: 'Not al', goto: 'act2_note2_write', points: 0 },
        { text: 'Geç', goto: 'act2_note2_skip', points: 1 }
      ]
    }
  ],
  act2_note2_write: [
    { type: 'say', speaker: '', text: '(İçinden) Bunu neden yazdım ki?' },
    { type: 'jump', goto: 'act2_note3' }
  ],
  act2_note2_skip: [
    { type: 'say', speaker: '', text: '(İçinden) Bu kısmı geçebilirim herhalde.' },
    { type: 'jump', goto: 'act2_note3' }
  ],

  // Önemli: ödev
  act2_note3: [
    { type: 'say', speaker: 'Öğretmen', text: "Sayfa 42'deki soruları ödev olarak çözün." },
    {
      type: 'choice',
      prompt: 'Not almalı mı?',
      options: [
        { text: 'Not al', goto: 'act2_note3_write', points: 1 },
        { text: 'Geç', goto: 'act2_note3_skip', points: 0 }
      ]
    }
  ],
  act2_note3_write: [
    { type: 'say', speaker: '', text: '(İçinden) Ödev. Tamam, yazdım.' },
    { type: 'jump', goto: 'act2_note4' }
  ],
  act2_note3_skip: [
    { type: 'say', speaker: '', text: '(İçinden) Ödevi... unutursam kendimi suçlarım.' },
    { type: 'jump', goto: 'act2_note4' }
  ],

  // Önemsiz: bariz bilgi
  act2_note4: [
    { type: 'say', speaker: 'Öğretmen', text: 'Defterlerinizi açık tutun, tabii ki.' },
    {
      type: 'choice',
      prompt: 'Not almalı mı?',
      options: [
        { text: 'Not al', goto: 'act2_note4_write', points: 0 },
        { text: 'Geç', goto: 'act2_note4_skip', points: 1 }
      ]
    }
  ],
  act2_note4_write: [
    { type: 'say', speaker: '', text: '(İçinden) Bunun not olduğuna emin değilim.' },
    { type: 'jump', goto: 'act2_note5' }
  ],
  act2_note4_skip: [
    { type: 'say', speaker: '', text: '(İçinden) Bunu zaten biliyordum.' },
    { type: 'jump', goto: 'act2_note5' }
  ],

  // Önemli: temel formül/kavram
  act2_note5: [
    { type: 'say', speaker: 'Öğretmen', text: 'Ve unutmayın: mol kütlesi hesaplamalarının temeli budur.' },
    {
      type: 'choice',
      prompt: 'Not almalı mı?',
      options: [
        { text: 'Not al', goto: 'act2_note5_write', points: 1 },
        { text: 'Geç', goto: 'act2_note5_skip', points: 0 }
      ]
    }
  ],
  act2_note5_write: [
    { type: 'say', speaker: '', text: '(İçinden) Bu önemliymiş gibi duruyor. Yazayım.' },
    { type: 'jump', goto: 'act2_note_result' }
  ],
  act2_note5_skip: [
    { type: 'say', speaker: '', text: '(İçinden) Sonra birinden bakarım nasılsa.' },
    { type: 'jump', goto: 'act2_note_result' }
  ],

  // Mini oyun sonucu — game.noteScore'a göre değişen, ama hep normal devam eden kapanış.
  act2_note_result: [
    {
      type: 'say',
      speaker: '',
      text: (game) => {
        if (game.noteScore >= 4) return '(İçinden) Fena değil. Sanırım önemli kısımları yakaladım.';
        if (game.noteScore >= 2) return '(İçinden) Bazı yerleri kaçırmış olabilirim ama idare eder.';
        return '(İçinden) Pek çoğunu kaçırmışım galiba... yarın birinden not isterim.';
      }
    },
    {
      type: 'expr',
      id: 'girl',
      file: (game) => {
        if (game.noteScore >= 4) return 'girl_happy.svg';
        if (game.noteScore >= 2) return 'girl_neutral.svg';
        return 'girl_sleepy.svg';
      }
    },
    { type: 'jump', goto: 'act2_after_class' }
  ],

  // 5: Ders sonrası — koridor, kısa okul hayatı anları.
  act2_after_class: [
    { type: 'say', speaker: '', text: 'Ders bitiyor. Herkes aynı anda ayağa kalkıyor.' },
    { type: 'say', speaker: '', text: '(İçinden) Bir ders bitti, kaç ders kaldı...' },
    { type: 'say', speaker: '', text: 'Koridora çıkıyor. Teneffüs kalabalığı her zamanki gibi.' },
    { type: 'jump', goto: 'act2_hallway' }
  ],

  // 6: Erkek karakterin İLK KEZ, çok kısa ve sıradan bir şekilde görünmesi.
  act2_hallway: [
    { type: 'expr', id: 'girl', file: 'girl_neutral.svg' },
    { type: 'say', speaker: '', text: 'Koridorda yürürken karşıdan biri geliyor.' },
    { type: 'show', id: 'boy', file: 'boy_neutral.svg', position: 'right', transition: 'fade' },
    { type: 'say', speaker: '', text: 'Sınıf değiştiren bir öğrenci, o kadar.' },
    { type: 'say', speaker: '', text: `(${GIRL_NAME}'in içinden) Tanımadığım biri.` },
    { type: 'hide', id: 'boy' },
    { type: 'say', speaker: '', text: 'Yollarına devam ediyorlar.' },
    { type: 'jump', goto: 'act2_boy_pov' }
  ],

  // 7: Kısa erkek POV'u — ilk kez onun iç sesini duyuyoruz.
  act2_boy_pov: [
    { type: 'hide', id: 'girl' },
    { type: 'say', speaker: '', text: '— Bakış açısı değişiyor —' },
    { type: 'show', id: 'boy', file: 'boy_neutral.svg', position: 'center', transition: 'fade' },
    { type: 'say', speaker: '', text: '(İçinden) Tamam.' },
    { type: 'say', speaker: '', text: "(İçinden) Sadece 'merhaba' de." },
    { type: 'say', speaker: '', text: '(İçinden) Bu neden söylendiğinden daha zor?' },
    { type: 'say', speaker: '', text: '(İçinden) Belki yarın. Ya da... uygun bir an bulunca.' },
    { type: 'say', speaker: '', text: '(İçinden) Beni tanımıyor bile. Neden tanısın ki.' },
    { type: 'hide', id: 'boy' },
    { type: 'jump', goto: 'act2_end' }
  ],

  // 8: Perde sonu kartı. ACT III henüz yazılmadı; next eklendiğinde otomatik bağlanır.
  act2_end: [
    { type: 'say', speaker: '', text: 'ACT II — SCHOOL' },
    { type: 'say', speaker: '', text: 'END' },
    { type: 'end' }
  ]
};

const STORY_START_LABEL = 'act1_start';
