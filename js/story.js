/**
 * story.js — ACT I: SABAH, ACT II: OKUL, ACT III: KONUŞMA
 *
 * ACT I: Kızın sıradan bir okul sabahı. Erkek karakter YOK.
 * ACT II: Okul günü. Perdenin sonuna doğru erkek karakter İLK KEZ,
 * sadece görsel olarak ve çok kısaca beliriyor — hâlâ konuşmuyorlar.
 * ACT III (SON PERDE): Aynı gün, okul çıkışına doğru. İlk kez konuşuyorlar,
 * erkek karakter kendini tanıtıyor (adı burada öğreniliyor) ve kıza kahve
 * içmeyi teklif ediyor. Üç farklı, saygılı sonuç mümkün; hepsi aynı kapanışta
 * birleşiyor. Bu, oyunun son perdesidir — ACT IV yoktur.
 *
 * Kızın adını tek yerden değiştirebilmek için GIRL_NAME sabiti kullanılır.
 * Erkek karakterin adı ACT III'e kadar oyuncuya söylenmiyordu (ACT I/II'de
 * repliklerinde speaker boş bırakıldı); ACT III'te kendini tanıttığı an
 * BOY_NAME sabiti kullanılmaya başlanıyor.
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
const GIRL_NAME = 'İnci';
const BOY_NAME = 'Yahya';
const TEACHER_NAME = 'Öğretmen';

const STORY = {
  // ---- 1-2-3-4-5: Siyah ekran, alarm, odaya geçiş, uyanış, iç ses ----
  act1_start: [
    { type: 'sfx', file: 'alarm.mp3' },
    { type: 'say', speaker: '', text: '*Trrrn! Trrrn! Trrrn!*' },
    { type: 'bg', file: 'bedroom_morning.svg' },
    { type: 'show', id: 'girl', file: 'girl_sleepy.svg', position: 'center', transition: 'fade' },
    { type: 'bgm', file: 'morning_theme.mp3' },
    { type: 'camera', effect: 'zoom-in' },
    { type: 'say', speaker: '', text: `(${GIRL_NAME}'nin içinden) Bir dakika daha... sadece bir dakika...` },
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
  //
  // Yapı:
  //  1) Yahya POV — dergi kulübü (küçük, hikayeyi kilitlemeyen etkileşimler)
  //  2) Koridor — dergileri sınıflara dağıtmaya giderken küçük etkileşimler
  //  3) İnci + Din Kültürü öğretmeni tartışması (Yahya YOK) — ana sekans,
  //     4 turdan oluşur; her turda İnci'nin cevap ÜSLUBU seçilir (felsefi /
  //     doğrudan / sakin). Bu seçimler doğru/yanlış olarak puanlanmaz,
  //     sadece öğretmenin bir sonraki repliğini ve İnci'nin tonunu etkiler.
  //  4) Yahya, tartışmanın ortasında (2. tur sonunda) sınıfa girer — bu,
  //     iki karakterin BİRBİRİNİ İLK KEZ GÖRDÜĞÜ an.
  //  5) İlk bakış — kısa, sakin, romantikleştirilmemiş.
  //  6) Tartışma 3. ve 4. turla (Yahya sessizce sınıfta) devam edip biter.
  //  7) Yahya dergiyi tanıtır — ilk doğal (romantik olmayan) diyalog.
  //  8) Kısa ders sonrası: Yahya POV + İnci POV, birer küçük gözlem.
  //  9) Perde sonu kartı — mevcut act2_end → act3_start bağlantısı korunur.

  // ---- 1) KEREM POV: DERGİ KULÜBÜ ----
  act2_start: [
    { type: 'say', speaker: '', text: '— Bakış açısı değişiyor —' },
    { type: 'show', id: 'boy', file: 'boy_neutral.svg', position: 'center', transition: 'fade' },
    { type: 'say', speaker: '', text: 'Dergi kulübü odası, öğle arasının hemen öncesi.' },
    { type: 'say', speaker: '', text: 'Masanın üstünde yeni sayının son baskıları duruyor.' },
    { type: 'say', speaker: 'Kulüp arkadaşı', text: 'Bu sefer erken bitirdik, değil mi?' },
    { type: 'say', speaker: BOY_NAME, text: 'Erken bitirdik ama hâlâ dağıtım var. Asıl iş şimdi başlıyor.' },
    { type: 'say', speaker: 'Kulüp arkadaşı', text: 'Yine gönüllü mü oldun dağıtıma?' },
    { type: 'say', speaker: BOY_NAME, text: 'Gönüllü olmadım, sırada bendim.' },
    { type: 'say', speaker: 'Kulüp arkadaşı', text: 'İlginç, sıra hep sana geliyor bir şekilde.' },
    { type: 'say', speaker: '', text: '(İçinden) Aslında dağıtımı sevmiyor değilim. Sınıfları gezmek fena değil.' },
    { type: 'jump', goto: 'act2_club_cover' }
  ],

  act2_club_cover: [
    { type: 'say', speaker: '', text: 'Kapağı eline alıp inceliyor.' },
    {
      type: 'choice',
      prompt: 'Neye baksın önce?',
      options: [
        { text: 'Renklere', goto: 'act2_club_cover_colors' },
        { text: 'Başlık fontuna', goto: 'act2_club_cover_font' }
      ]
    }
  ],
  act2_club_cover_colors: [
    { type: 'say', speaker: BOY_NAME, text: 'Renkler bu sefer iyi çıkmış. Geçen sayı biraz fazla cıvık kaçmıştı.' },
    { type: 'jump', goto: 'act2_club_content' }
  ],
  act2_club_cover_font: [
    { type: 'say', speaker: BOY_NAME, text: 'Font da okunaklı olmuş. Geçen sayıda üçüncü sayfadan sonra göz kanatıyordu.' },
    { type: 'say', speaker: '', text: '(İçinden) Bu sefer baştan dikkat ettik, iyi ki de etmişiz.' },
    { type: 'jump', goto: 'act2_club_content' }
  ],

  act2_club_content: [
    { type: 'say', speaker: '', text: 'Sayfaları hızlıca karıştırıyor.' },
    {
      type: 'choice',
      prompt: 'Hangi bölüme baksın?',
      options: [
        { text: 'Öğrenci yazıları', goto: 'act2_club_content_writing' },
        { text: 'Çizimler', goto: 'act2_club_content_art' }
      ]
    }
  ],
  act2_club_content_writing: [
    { type: 'say', speaker: BOY_NAME, text: 'Bu sayının en iyi yazısı bence şu röportaj olmuş.' },
    { type: 'say', speaker: 'Kulüp arkadaşı', text: 'Onu ben de beğendim, iyi sorular sormuş.' },
    { type: 'jump', goto: 'act2_club_sort' }
  ],
  act2_club_content_art: [
    { type: 'say', speaker: BOY_NAME, text: 'Kapağı yapan bu sefer bir de çizgi roman sayfası göndermiş, güzel olmuş.' },
    { type: 'say', speaker: 'Kulüp arkadaşı', text: 'Önümüzdeki sayı için ondan bir sayfa daha isteyelim mi?' },
    { type: 'jump', goto: 'act2_club_sort' }
  ],

  act2_club_sort: [
    { type: 'say', speaker: '', text: 'Dergileri sınıflara göre paketlere ayırmaya başlıyor.' },
    { type: 'say', speaker: 'Kulüp arkadaşı', text: "12-A'ya fazladan birkaç tane koy, geçen sefer yetmemişti." },
    {
      type: 'choice',
      prompt: 'Kaç tane ayırsın?',
      options: [
        { text: 'Söylediği kadar', goto: 'act2_club_sort_asked' },
        { text: 'Biraz daha fazla', goto: 'act2_club_sort_extra' }
      ]
    }
  ],
  act2_club_sort_asked: [
    { type: 'say', speaker: BOY_NAME, text: 'Tamam, dediğin kadar ayırayım.' },
    { type: 'say', speaker: '', text: 'Paketleri hızlıca bantlayıp kenara diziyor.' },
    { type: 'jump', goto: 'act2_club_route' }
  ],
  act2_club_sort_extra: [
    { type: 'say', speaker: BOY_NAME, text: 'Olsun, birkaç tane daha koyayım, idare eder.' },
    { type: 'say', speaker: 'Kulüp arkadaşı', text: 'Bak sen, çok düşüncelisin.' },
    { type: 'say', speaker: BOY_NAME, text: 'Ya da sonra tekrar buraya gelmek istemiyorum, o kadar.' },
    { type: 'say', speaker: '', text: 'Paketleri hızlıca bantlayıp kenara diziyor.' },
    { type: 'jump', goto: 'act2_club_route' }
  ],

  act2_club_route: [
    { type: 'say', speaker: '', text: 'Paketleri sayıp listeye göz atıyor: bugün üst kat ve doğu koridoru sırada.' },
    {
      type: 'choice',
      prompt: 'Önce hangi taraftan başlasın?',
      options: [
        { text: 'Üst kattan', goto: 'act2_club_route_upstairs' },
        { text: 'Doğu koridorundan', goto: 'act2_club_route_east' }
      ]
    }
  ],
  act2_club_route_upstairs: [
    { type: 'say', speaker: BOY_NAME, text: 'Merdivenleri önce hallederim, sonra düz gidilir.' },
    { type: 'jump', goto: 'act2_club_leave' }
  ],
  act2_club_route_east: [
    { type: 'say', speaker: BOY_NAME, text: 'Doğu tarafı daha yakın, önce oradan başlayayım.' },
    { type: 'jump', goto: 'act2_club_leave' }
  ],

  act2_club_leave: [
    { type: 'say', speaker: '', text: 'Dergi yığınını koluna alıp kapıya yöneliyor.' },
    { type: 'say', speaker: BOY_NAME, text: 'Tamam, sınıflara dağıtmaya başlıyorum.' },
    { type: 'say', speaker: 'Kulüp danışmanı', text: 'Dikkat et, geçen sefer merdivenlerden koşarak inmiştin.' },
    { type: 'say', speaker: BOY_NAME, text: 'O bir kereydi hocam, söz veriyorum.' },
    { type: 'say', speaker: '', text: '(İçinden) İki kereydi aslında, ama bunu şimdi açıklamaya gerek yok.' },
    { type: 'hide', id: 'boy' },
    { type: 'camera', effect: 'slide-right' },
    { type: 'jump', goto: 'act2_hallway1' }
  ],

  // ---- 2) KORİDOR ----
  act2_hallway1: [
    { type: 'show', id: 'boy', file: 'boy_neutral.svg', position: 'center', transition: 'fade' },
    { type: 'say', speaker: '', text: 'Koridor kalabalık, herkes teneffüse çıkmış.' },
    { type: 'say', speaker: '', text: 'Karşıdan tanıdık bir yüz geliyor.' },
    {
      type: 'choice',
      prompt: 'Nasıl selamlasın?',
      options: [
        { text: 'Elini kaldırıp selam ver', goto: 'act2_hallway1_wave' },
        { text: 'Sadece başını salla', goto: 'act2_hallway1_nod' }
      ]
    }
  ],
  act2_hallway1_wave: [
    { type: 'say', speaker: BOY_NAME, text: 'Selam!' },
    { type: 'say', speaker: '', text: 'Karşıdaki de elini kaldırıp karşılık veriyor, yoluna devam ediyor.' },
    { type: 'say', speaker: '', text: '(İçinden) Kısa ve net, tam istediğim gibi.' },
    { type: 'jump', goto: 'act2_hallway2' }
  ],
  act2_hallway1_nod: [
    { type: 'say', speaker: '', text: 'Başıyla selam veriyor, karşı taraf da aynı şekilde karşılık veriyor.' },
    { type: 'say', speaker: '', text: '(İçinden) Eller dolu olunca selamlaşmak biraz tuhaflaşıyor.' },
    { type: 'say', speaker: BOY_NAME, text: 'Neyse, teneffüs kalabalığında bu kadarı yeter.' },
    { type: 'jump', goto: 'act2_hallway2' }
  ],

  act2_hallway2: [
    { type: 'say', speaker: '', text: 'Dergi yığını biraz kaymaya başlıyor.' },
    {
      type: 'choice',
      prompt: 'Ne yapsın?',
      options: [
        { text: 'Tek koluna sıkıştır', goto: 'act2_hallway2_arm' },
        { text: 'Göğsüne yasla', goto: 'act2_hallway2_chest' }
      ]
    }
  ],
  act2_hallway2_arm: [
    { type: 'say', speaker: '', text: 'Yığını tek koluna sıkıştırıyor, birkaçı neredeyse düşüyor ama toparlıyor.' },
    { type: 'say', speaker: BOY_NAME, text: 'Az kalsın.' },
    { type: 'say', speaker: '', text: 'Yoldan geçen biri gülümseyip başını sallıyor, o da hafifçe gülümsüyor.' },
    { type: 'jump', goto: 'act2_hallway3' }
  ],
  act2_hallway2_chest: [
    { type: 'say', speaker: '', text: 'Yığını göğsüne yaslayıp dengeliyor. Bu sefer daha güvenli.' },
    { type: 'say', speaker: '', text: '(İçinden) Bunu baştan böyle taşısaymışım.' },
    { type: 'say', speaker: BOY_NAME, text: 'Tamam, böylesi daha iyiymiş.' },
    { type: 'jump', goto: 'act2_hallway3' }
  ],

  act2_hallway3: [
    { type: 'say', speaker: '', text: 'Bir sınıf kapısının önünde duruyor, tabelaya bakıyor.' },
    {
      type: 'choice',
      prompt: 'Hangi tabelaya baksın?',
      options: [
        { text: 'Kapının üstündeki numaraya', goto: 'act2_hallway3_number' },
        { text: 'Yandaki ders programına', goto: 'act2_hallway3_schedule' }
      ]
    }
  ],
  act2_hallway3_number: [
    { type: 'say', speaker: BOY_NAME, text: '11-B... hayır, bu 11-C.' },
    { type: 'say', speaker: '', text: '(İçinden) Numaralar bazen okulun en kafa karıştırıcı kısmı.' },
    { type: 'jump', goto: 'act2_hallway4' }
  ],
  act2_hallway3_schedule: [
    { type: 'say', speaker: '', text: 'Ders programına bakıp bu saatte burada hangi dersin olduğunu kontrol ediyor.' },
    { type: 'say', speaker: BOY_NAME, text: 'Tamam, burası değil. Bir sonraki.' },
    { type: 'say', speaker: '', text: '(İçinden) Programa bakmak daha güvenilir, kapı numaraları bazen yanlış asılıyor.' },
    { type: 'jump', goto: 'act2_hallway4' }
  ],

  act2_hallway4: [
    { type: 'say', speaker: '', text: 'Birkaç kapı ileride durduğu yer, listedeki sınıflardan biri: hedef burası.' },
    { type: 'camera', effect: 'zoom-in' },
    { type: 'say', speaker: '', text: 'Kapıya yaklaşırken içeriden sesler geliyor.' },
    { type: 'say', speaker: '', text: '(İçinden) Bir şey mi oluyor?' },
    { type: 'say', speaker: '', text: 'İçeride hararetli bir tartışma sürüyor gibi. Sesler kızgın değil, ama yoğun.' },
    { type: 'say', speaker: BOY_NAME, text: 'Hmm. Belki biraz beklesem daha iyi olur.' },
    { type: 'hide', id: 'boy' },
    { type: 'jump', goto: 'act2_debate_start' }
  ],

  // ---- 3) İNCİ + ÖĞRETMEN TARTIŞMASI (Yahya henüz yok) ----
  act2_debate_start: [
    { type: 'say', speaker: '', text: '— Bakış açısı değişiyor —' },
    { type: 'show', id: 'girl', file: 'girl_neutral.svg', position: 'center', transition: 'fade' },
    { type: 'say', speaker: '', text: 'Sınıf, Din Kültürü ve Ahlak Bilgisi dersi.' },
    { type: 'say', speaker: '', text: "Tahtada bir başlık var: 'İnanç ve Teslimiyet'." },
    { type: 'say', speaker: TEACHER_NAME, text: 'Bugün bazı şeyleri hatırlatacağım. Bunlar tartışmaya açık meseleler değil.' },
    { type: 'say', speaker: TEACHER_NAME, text: 'İnanç, önce sorgulanıp sonra kabul edilecek bir şey değildir. Zaten doğrudur; biz sadece onu anlamaya çalışırız.' },
    { type: 'say', speaker: '', text: '(İçinden) Yine mi bu cümle...' },
    { type: 'say', speaker: '', text: 'Sınıftaki birkaç kişi başını sallıyor, kimse itiraz etmiyor.' },
    { type: 'say', speaker: 'Bir öğrenci', text: 'Haklısınız hocam, zaten böyle biliniyor.' },
    { type: 'say', speaker: TEACHER_NAME, text: 'Aferin. Ama bazılarınız hâlâ soru sormayı seviyor galiba.' },
    { type: 'say', speaker: TEACHER_NAME, text: `${GIRL_NAME}, yine mi düşüncelisin bugün?` },
    { type: 'say', speaker: '', text: '(İçinden) Görünüşe göre öyle.' },
    { type: 'say', speaker: '', text: '(İçinden) Bir dakika... defterimi evde bırakmışım.' },
    { type: 'say', speaker: '', text: '(İçinden) Neyse, sözlü de olur.' },
    { type: 'jump', goto: 'act2_debate_turn1' }
  ],

  // Tur 1, aşama A: İnci'nin ilk sorgulaması + öğretmenin kesin cevabı.
  act2_debate_turn1: [
    { type: 'say', speaker: TEACHER_NAME, text: 'Bize aktarılmış açık bilgiler var. Bunlar yüzyıllardır orada; üzerinde durulmuş, sağlamlığı belli gerçekler.' },
    { type: 'say', speaker: TEACHER_NAME, text: 'Bazı şeyleri sürekli sorgulamak zorunda değilsiniz.' },
    { type: 'say', speaker: '', text: `${GIRL_NAME} parmak kaldırıyor.` },
    {
      type: 'choice',
      prompt: `${GIRL_NAME} nasıl sorsun?`,
      options: [
        { text: 'Daha felsefi bir cevap', goto: 'act2_debate_turn1_philo' },
        { text: 'Daha doğrudan bir cevap', goto: 'act2_debate_turn1_direct' },
        { text: 'Daha sakin/ölçülü bir cevap', goto: 'act2_debate_turn1_calm' }
      ]
    }
  ],
  act2_debate_turn1_philo: [
    { type: 'say', speaker: GIRL_NAME, text: 'Bilginin aktarılmış olması, onu sorgulamayacağımız anlamına mı geliyor?' },
    { type: 'say', speaker: TEACHER_NAME, text: 'Hayır, ama bazı konularda cevap zaten bellidir.' },
    { type: 'say', speaker: TEACHER_NAME, text: 'Herkesin tekerleği yeniden icat etmesine gerek yok, İnci.' },
    { type: 'jump', goto: 'act2_debate_turn1b' }
  ],
  act2_debate_turn1_direct: [
    { type: 'expr', id: 'girl', file: 'girl_happy.svg' },
    { type: 'say', speaker: GIRL_NAME, text: 'Yüzyıllardır böyle denmiş olması, doğru olduğu anlamına gelmiyor bence.' },
    { type: 'say', speaker: TEACHER_NAME, text: 'Doğruluğu zaten sabit, İnci. Bu konuda kafanı karıştırmana gerek yok.' },
    { type: 'jump', goto: 'act2_debate_turn1b' }
  ],
  act2_debate_turn1_calm: [
    { type: 'say', speaker: GIRL_NAME, text: 'Ben sadece bunun neden böyle olduğunu anlamaya çalışıyorum, hocam.' },
    { type: 'say', speaker: TEACHER_NAME, text: 'Anlamaya çalışmak güzel. Ama bazı şeyleri olduğu gibi kabul etmek de bir erdemdir.' },
    { type: 'jump', goto: 'act2_debate_turn1b' }
  ],

  // Tur 1, aşama B: İnci cevabın varsayımını sorguluyor, öğretmen daha otoriter.
  act2_debate_turn1b: [
    { type: 'say', speaker: '', text: 'Öğretmenin sesi biraz sertleşiyor, sanki bu tartışmayı daha önce de yaşamış gibi.' },
    {
      type: 'choice',
      prompt: `${GIRL_NAME} buna nasıl karşılık versin?`,
      options: [
        { text: 'Daha felsefi bir cevap', goto: 'act2_debate_turn1b_philo' },
        { text: 'Daha doğrudan bir cevap', goto: 'act2_debate_turn1b_direct' },
        { text: 'Daha sakin/ölçülü bir cevap', goto: 'act2_debate_turn1b_calm' }
      ]
    }
  ],
  act2_debate_turn1b_philo: [
    { type: 'say', speaker: GIRL_NAME, text: "'Cevap zaten belli' demek, sorunun bir daha sorulmaması gerektiği anlamına mı geliyor?" },
    { type: 'say', speaker: TEACHER_NAME, text: 'Bazı şeyler sürekli sorgulanmaz, İnci. İnanç dediğimiz şey zaten bunun üzerine kuruludur.' },
    { type: 'say', speaker: GIRL_NAME, text: 'Peki inanç, sorgulanmadığı için mi güçlü, yoksa doğru olduğu için mi?' },
    { type: 'jump', goto: 'act2_debate_turn2' }
  ],
  act2_debate_turn1b_direct: [
    { type: 'expr', id: 'girl', file: 'girl_happy.svg' },
    { type: 'say', speaker: GIRL_NAME, text: 'Kafamı karıştırmıyorum hocam, sadece nedenini soruyorum.' },
    { type: 'say', speaker: TEACHER_NAME, text: 'Bazı sorular cevap aramaktan çok, itiraz etmek için sorulur. Seninkinin öyle olmadığını umuyorum.' },
    { type: 'say', speaker: GIRL_NAME, text: 'İtiraz etmiyorum, anlamaya çalışıyorum. İkisi aynı şey değil.' },
    { type: 'jump', goto: 'act2_debate_turn2' }
  ],
  act2_debate_turn1b_calm: [
    { type: 'say', speaker: GIRL_NAME, text: 'Kabul etmek bir erdemse, sorgulamak neden erdem olmasın?' },
    { type: 'say', speaker: TEACHER_NAME, text: 'Çünkü bazı konularda sorgulamanın da bir sınırı vardır.' },
    { type: 'say', speaker: GIRL_NAME, text: 'O sınırı kim çiziyor peki?' },
    { type: 'jump', goto: 'act2_debate_turn2' }
  ],

  // Tur 2, aşama A.
  act2_debate_turn2: [
    { type: 'say', speaker: '', text: '(İçinden) Yine aynı yere geldik.' },
    { type: 'say', speaker: '', text: '(İçinden) Ben soru soruyorum, o cevabın zaten belli olduğunu söylüyor.' },
    { type: 'say', speaker: '', text: '(İçinden) Belki de asıl sinir olduğum şey cevap değil.' },
    { type: 'say', speaker: '', text: '(İçinden) Soruyu sormama izin verilmemesi.' },
    { type: 'say', speaker: '', text: 'Öğretmen tahtaya iki kelime daha yazıyor: Bilim ve Sınırları.' },
    { type: 'say', speaker: TEACHER_NAME, text: 'Bilim size nasıl sorusuna cevap verir. Ama bazı konularda cevap zaten dinen bellidir.' },
    { type: 'say', speaker: TEACHER_NAME, text: 'Bilimin buna bir şey söylemesine gerek yoktur.' },
    { type: 'say', speaker: '', text: '(İçinden) Bunu gerçekten söyledi mi şimdi?' },
    {
      type: 'choice',
      prompt: `${GIRL_NAME} nasıl cevap versin?`,
      options: [
        { text: 'Daha felsefi bir cevap', goto: 'act2_debate_turn2_philo' },
        { text: 'Daha doğrudan bir cevap', goto: 'act2_debate_turn2_direct' },
        { text: 'Daha sakin/ölçülü bir cevap', goto: 'act2_debate_turn2_calm' }
      ]
    }
  ],
  act2_debate_turn2_philo: [
    { type: 'say', speaker: GIRL_NAME, text: 'Yani bir konuda bilimsel bir kanıt olmasa bile, o konu kesin kabul edilebilir mi?' },
    { type: 'say', speaker: TEACHER_NAME, text: 'Elbette. Her gerçek laboratuvarda kanıtlanmaz. Bazı gerçekler zaten bize bildirilmiştir.' },
    { type: 'jump', goto: 'act2_debate_turn2b' }
  ],
  act2_debate_turn2_direct: [
    { type: 'expr', id: 'girl', file: 'girl_happy.svg' },
    { type: 'say', speaker: GIRL_NAME, text: 'Kanıt yoksa, neden bu kadar emin olabiliyoruz ki?' },
    { type: 'say', speaker: TEACHER_NAME, text: 'Çünkü emin olmamız gereken bir kaynaktan geliyor. Bunu sürekli sorgulaman gerekmiyor.' },
    { type: 'jump', goto: 'act2_debate_turn2b' }
  ],
  act2_debate_turn2_calm: [
    { type: 'say', speaker: GIRL_NAME, text: 'Ben sadece bilim ile inancın nasıl bir arada durduğunu merak ediyorum.' },
    { type: 'say', speaker: TEACHER_NAME, text: 'Bir arada dururlar, çünkü ikisi de aynı gerçeğe farklı yerlerden bakar. Ama biri diğerinden üstündür.' },
    { type: 'jump', goto: 'act2_debate_turn2b' }
  ],

  // Tur 2, aşama B.
  act2_debate_turn2b: [
    { type: 'say', speaker: '', text: 'Sınıfta birkaç öğrenci rahatsız kıpırdanıyor; öğretmen bunu fark ediyor ama devam ediyor.' },
    {
      type: 'choice',
      prompt: `${GIRL_NAME} buna nasıl karşılık versin?`,
      options: [
        { text: 'Daha felsefi bir cevap', goto: 'act2_debate_turn2b_philo' },
        { text: 'Daha doğrudan bir cevap', goto: 'act2_debate_turn2b_direct' },
        { text: 'Daha sakin/ölçülü bir cevap', goto: 'act2_debate_turn2b_calm' }
      ]
    }
  ],
  act2_debate_turn2b_philo: [
    { type: 'say', speaker: GIRL_NAME, text: 'Üstün olan taraf, kendi üstünlüğünü nasıl kanıtlıyor peki?' },
    { type: 'say', speaker: TEACHER_NAME, text: 'Kanıtlamaya ihtiyacı yok, İnci. Çünkü zaten mutlak olan odur.' },
    { type: 'say', speaker: GIRL_NAME, text: 'Mutlak olduğunu söylemek, onu mutlak yapmıyor ama.' },
    { type: 'jump', goto: 'act2_kerem_arrives' }
  ],
  act2_debate_turn2b_direct: [
    { type: 'expr', id: 'girl', file: 'girl_happy.svg' },
    { type: 'say', speaker: GIRL_NAME, text: 'Bunu sormak gereksiz yere sorgulamak değil hocam, sadece merak.' },
    { type: 'say', speaker: TEACHER_NAME, text: 'Bazı meraklar seni yanlış yöne götürebilir. Dikkatli ol.' },
    { type: 'say', speaker: GIRL_NAME, text: 'Merak etmek yanlış bir yöne mi götürüyor, yoksa sadece rahatsız edici bir yöne mi?' },
    { type: 'jump', goto: 'act2_kerem_arrives' }
  ],
  act2_debate_turn2b_calm: [
    { type: 'say', speaker: GIRL_NAME, text: 'Belki de ikisinin bir üstünlük yarışına girmesine gerek yok.' },
    { type: 'say', speaker: TEACHER_NAME, text: 'Yarış yok, çünkü zaten belli olan bir sıralama var.' },
    { type: 'say', speaker: GIRL_NAME, text: 'Belli olduğunu düşünmek, herkes için aynı anlama gelmiyor olabilir.' },
    { type: 'jump', goto: 'act2_kerem_arrives' }
  ],

  // ---- 4) KEREM'İN SINIFA GİRİŞİ — birbirlerini İLK KEZ görüyorlar ----
  act2_kerem_arrives: [
    { type: 'camera', effect: 'slide-left' },
    { type: 'say', speaker: '', text: 'Kapı hafifçe aralanıyor.' },
    { type: 'say', speaker: '', text: '(İçinden) Umarım ortasına denk gelmemişimdir.' },
    { type: 'hide', id: 'girl' },
    { type: 'show', id: 'girl', file: 'girl_neutral.svg', position: 'left', transition: 'fade' },
    { type: 'show', id: 'boy', file: 'boy_neutral.svg', position: 'right', transition: 'fade' },
    { type: 'say', speaker: '', text: 'Sınıftaki birkaç öğrenci başını çevirip bakıyor, sonra tekrar tahtaya dönüyor.' },
    { type: 'say', speaker: TEACHER_NAME, text: 'Bir şey mi vardı?' },
    { type: 'say', speaker: BOY_NAME, text: 'Dergi kulübünden gelmiştim. Yeni sayıyı tanıtıp dağıtacaktım.' },
    { type: 'say', speaker: TEACHER_NAME, text: 'Tabii, bir dakika bekleyebilirsin.' },
    { type: 'say', speaker: BOY_NAME, text: 'Tabii, sorun değil.' },
    { type: 'say', speaker: '', text: 'Yahya sınıfın kenarında, elinde dergilerle bekliyor.' },
    { type: 'say', speaker: '', text: '(İçinden) Ortasına denk gelmişim işte. Olsun, beklerim.' },
    { type: 'jump', goto: 'act2_first_look' }
  ],

  // ---- 5) İLK BAKIŞ — kısa, sakin, romantikleştirilmemiş ----
  act2_first_look: [
    { type: 'camera', effect: 'zoom-in' },
    { type: 'say', speaker: '', text: 'Konuşma bir anlığına devam ederken, İnci bir an başını çeviriyor.' },
    { type: 'say', speaker: '', text: '(İçinden) Yeni biri mi geldi?' },
    { type: 'say', speaker: '', text: '(İçinden) Dergi kulübünden olmalı, elindekilere bakılırsa.' },
    { type: 'say', speaker: '', text: '(İçinden) Tam da şimdi mi geldiler...' },
    { type: 'say', speaker: '', text: 'Yahya da ona bakıyor. Kısa bir sessizlik.' },
    { type: 'say', speaker: '', text: 'Sınıftaki kimse bu bakışmayı fark etmiyor bile; herkes hâlâ tartışmada.' },
    { type: 'say', speaker: '', text: '(İçinden) Neyse. Konuya dön.' },
    { type: 'camera', effect: 'zoom-out' },
    { type: 'say', speaker: '', text: 'İnci tekrar öğretmene dönüyor.' },
    { type: 'say', speaker: '', text: 'Yahya da dergileri tutarak beklemeye devam ediyor.' },
    { type: 'jump', goto: 'act2_debate_turn3' }
  ],

  // ---- 6) Tartışma devam ediyor (Yahya sınıfta, sessiz) ----
  act2_debate_turn3: [
    { type: 'say', speaker: '', text: 'Öğretmen sıraların arasında yürümeye başlıyor.' },
    { type: 'say', speaker: TEACHER_NAME, text: 'Ahlakın kaynağı konusunda kafanız karışmasın: iyi ve kötü, bize dinen bildirilmiştir.' },
    { type: 'say', speaker: TEACHER_NAME, text: 'Bunun dışında bir zemin aramaya gerek yok.' },
    {
      type: 'choice',
      prompt: `${GIRL_NAME} nasıl cevap versin?`,
      options: [
        { text: 'Daha felsefi bir cevap', goto: 'act2_debate_turn3_philo' },
        { text: 'Daha doğrudan bir cevap', goto: 'act2_debate_turn3_direct' },
        { text: 'Daha sakin/ölçülü bir cevap', goto: 'act2_debate_turn3_calm' }
      ]
    }
  ],
  act2_debate_turn3_philo: [
    { type: 'say', speaker: GIRL_NAME, text: 'Ama insanlar dini bilmeden önce de iyiyi kötüyü ayırt edebiliyordu. Bu nasıl açıklanır?' },
    { type: 'say', speaker: TEACHER_NAME, text: 'O ayrımın kendisi de zaten bu bilginin bir yansımasıdır, farkında olmasalar da.' },
    { type: 'jump', goto: 'act2_debate_turn3b' }
  ],
  act2_debate_turn3_direct: [
    { type: 'expr', id: 'girl', file: 'girl_happy.svg' },
    { type: 'say', speaker: GIRL_NAME, text: 'Yani dinsiz biri gerçekten ahlaklı olamaz mı diyorsunuz?' },
    { type: 'say', speaker: TEACHER_NAME, text: 'Ben öyle demedim. Ama sağlam bir zemine sahip olamayacağını söylüyorum.' },
    { type: 'jump', goto: 'act2_debate_turn3b' }
  ],
  act2_debate_turn3_calm: [
    { type: 'say', speaker: GIRL_NAME, text: 'Ben sadece kaynağın tek olup olmadığını merak ediyorum, hocam.' },
    { type: 'say', speaker: TEACHER_NAME, text: 'Tektir, İnci. Başka bir zemin aramak insanı yanlış yollara sürükleyebilir.' },
    { type: 'jump', goto: 'act2_debate_turn3b' }
  ],

  // Tur 3, aşama B.
  act2_debate_turn3b: [
    { type: 'say', speaker: '', text: 'Öğretmen kollarını kavuşturuyor, sesi biraz daha sertleşiyor.' },
    {
      type: 'choice',
      prompt: `${GIRL_NAME} buna nasıl karşılık versin?`,
      options: [
        { text: 'Daha felsefi bir cevap', goto: 'act2_debate_turn3b_philo' },
        { text: 'Daha doğrudan bir cevap', goto: 'act2_debate_turn3b_direct' },
        { text: 'Daha sakin/ölçülü bir cevap', goto: 'act2_debate_turn3b_calm' }
      ]
    }
  ],
  act2_debate_turn3b_philo: [
    { type: 'say', speaker: GIRL_NAME, text: 'Yansıma olduğunu nasıl ayırt ediyoruz? Tesadüf olmadığını nereden biliyoruz?' },
    { type: 'say', speaker: TEACHER_NAME, text: 'Bunu bilmek için önce inanmış olman gerekir. Dışarıdan bakınca elbette tesadüf gibi görünür.' },
    { type: 'say', speaker: GIRL_NAME, text: 'Yani önce inanmam mı gerekiyor ki mantıklı gelsin?' },
    { type: 'jump', goto: 'act2_debate_turn4' }
  ],
  act2_debate_turn3b_direct: [
    { type: 'expr', id: 'girl', file: 'girl_happy.svg' },
    { type: 'say', speaker: GIRL_NAME, text: 'Bu biraz kestirmeden bir cevap gibi geldi bana.' },
    { type: 'say', speaker: TEACHER_NAME, text: 'Her sorunun uzun bir cevabı olması gerekmez. Bazı gerçekler basittir.' },
    { type: 'say', speaker: GIRL_NAME, text: 'Basit olması, tartışmaya kapalı olduğu anlamına gelmiyor bence.' },
    { type: 'jump', goto: 'act2_debate_turn4' }
  ],
  act2_debate_turn3b_calm: [
    { type: 'say', speaker: GIRL_NAME, text: 'Yanlış yollara sürüklenmekten bahsettiniz, ama sormak da bir yol değil mi?' },
    { type: 'say', speaker: TEACHER_NAME, text: 'Doğru yolu zaten biliyorsan, başka yollara bakmana gerek kalmaz.' },
    { type: 'say', speaker: GIRL_NAME, text: 'Ya doğru yolu bildiğimi düşünüp yanılıyorsam?' },
    { type: 'jump', goto: 'act2_debate_turn4' }
  ],

  // Tur 4, aşama A — son tur.
  act2_debate_turn4: [
    { type: 'say', speaker: TEACHER_NAME, text: 'Son olarak şunu söylemek istiyorum: bazı sorular, sormak için değil, kabul etmek için vardır.' },
    {
      type: 'choice',
      prompt: `${GIRL_NAME} nasıl cevap versin?`,
      options: [
        { text: 'Daha felsefi bir cevap', goto: 'act2_debate_turn4_philo' },
        { text: 'Daha doğrudan bir cevap', goto: 'act2_debate_turn4_direct' },
        { text: 'Daha sakin/ölçülü bir cevap', goto: 'act2_debate_turn4_calm' }
      ]
    }
  ],
  act2_debate_turn4_philo: [
    { type: 'say', speaker: GIRL_NAME, text: "Bir soru nasıl 'kabul etmek için' olabilir? Bu, soru olmaktan çıkmaz mı?" },
    { type: 'say', speaker: TEACHER_NAME, text: 'Bazı sorular biçim olarak sorudur ama aslında bir daveti içerir: teslim olma daveti.' },
    { type: 'jump', goto: 'act2_debate_turn4b' }
  ],
  act2_debate_turn4_direct: [
    { type: 'expr', id: 'girl', file: 'girl_happy.svg' },
    { type: 'say', speaker: GIRL_NAME, text: 'Yani bazı sorulara cevap aramamam mı gerekiyor?' },
    { type: 'say', speaker: TEACHER_NAME, text: 'Cevabı zaten var. Aramak değil, kabul etmek gerekiyor.' },
    { type: 'jump', goto: 'act2_debate_turn4b' }
  ],
  act2_debate_turn4_calm: [
    { type: 'say', speaker: GIRL_NAME, text: 'Bence her soru sorulmayı hak ediyor, cevabı ne olursa olsun.' },
    { type: 'say', speaker: TEACHER_NAME, text: 'Güzel bir düşünce. Ama her sorunun sonunda bir teslimiyet olması gerektiğini de unutma.' },
    { type: 'jump', goto: 'act2_debate_turn4b' }
  ],

  // Tur 4, aşama B — tartışmanın son sözü, hemen ardından kapanış.
  act2_debate_turn4b: [
    { type: 'say', speaker: '', text: 'Ders bitmek üzere, ama öğretmen son sözü söylemek istiyor gibi duruyor.' },
    { type: 'say', speaker: '', text: '(İçinden) Tamam. Şimdi cevap verirsem bu tartışma bir saat daha sürer.' },
    {
      type: 'choice',
      prompt: `${GIRL_NAME} sözlerini nasıl tamamlasın?`,
      options: [
        { text: 'Daha felsefi bir cevap', goto: 'act2_debate_turn4b_philo' },
        { text: 'Daha doğrudan bir cevap', goto: 'act2_debate_turn4b_direct' },
        { text: 'Daha sakin/ölçülü bir cevap', goto: 'act2_debate_turn4b_calm' }
      ]
    }
  ],
  act2_debate_turn4b_philo: [
    { type: 'say', speaker: GIRL_NAME, text: 'Teslim olmak ile ikna olmak aynı şey değil bence.' },
    { type: 'say', speaker: TEACHER_NAME, text: 'Olabilir. Ama ikisi de seni aynı yere götürebilir, İnci.' },
    { type: 'jump', goto: 'act2_debate_end' }
  ],
  act2_debate_turn4b_direct: [
    { type: 'expr', id: 'girl', file: 'girl_happy.svg' },
    { type: 'say', speaker: GIRL_NAME, text: 'Ben ikna olmadan bir şeyi kabul edemem, elimde değil.' },
    { type: 'say', speaker: TEACHER_NAME, text: 'Bu senin şu anki hâlin. Zamanla değişebilir.' },
    { type: 'jump', goto: 'act2_debate_end' }
  ],
  act2_debate_turn4b_calm: [
    { type: 'say', speaker: GIRL_NAME, text: 'Sanırım bunu düşünmeye devam edeceğim, kabul etsem de etmesem de.' },
    { type: 'say', speaker: TEACHER_NAME, text: 'Düşünmeye devam etmen kötü değil. Yeter ki bir yerde durmayı da öğren.' },
    { type: 'jump', goto: 'act2_debate_end' }
  ],

  act2_debate_end: [
    { type: 'say', speaker: TEACHER_NAME, text: 'Neyse, bu konuyu başka bir derste daha açarız.' },
    { type: 'say', speaker: 'Bir öğrenci', text: 'Hocam, bu da mı sınava girecek?' },
    { type: 'say', speaker: TEACHER_NAME, text: 'Girmeyecek, ama unutma: sınavdan daha önemli meseleler var.' },
    { type: 'say', speaker: '', text: 'Sınıftan hafif bir kahkaha yükseliyor.' },
    { type: 'say', speaker: TEACHER_NAME, text: `${GIRL_NAME}, düşünmeye devam et. Ama bir gün bir yerde karar kılman gerekecek.` },
    { type: 'say', speaker: GIRL_NAME, text: 'Belki.' },
    { type: 'say', speaker: '', text: '(İçinden) Ders bitse de şu yazıyı tamamlasam.' },
    { type: 'say', speaker: '', text: '(İçinden) Ya da hiç karar kılmam gerekmez, sadece sormaya devam ederim.' },
    { type: 'jump', goto: 'act2_magazine_intro' }
  ],

  // ---- 7) DERGİ TANITIMI — ilk doğal (romantik olmayan) diyalog ----
  act2_magazine_intro: [
    { type: 'say', speaker: TEACHER_NAME, text: 'Evet, sanırım sıra dergi kulübünde.' },
    { type: 'say', speaker: BOY_NAME, text: 'Teşekkürler hocam.' },
    { type: 'say', speaker: '', text: 'Yahya öne çıkıp dergiyi gösteriyor.' },
    { type: 'say', speaker: BOY_NAME, text: 'Bu ayki sayı çıktı. İçinde öğrenci yazıları, birkaç çizim, okul etkinliklerinden haberler ve kısa hikayeler var.' },
    { type: 'say', speaker: BOY_NAME, text: 'İsteyen teneffüste kulüp masasından alabilir.' },
    { type: 'say', speaker: GIRL_NAME, text: 'Kapak kimin işi?' },
    { type: 'say', speaker: BOY_NAME, text: "Onu 10-D'den biri yaptı. Bu sayı gerçekten iyi çıktı bence." },
    { type: 'say', speaker: GIRL_NAME, text: 'Fena görünmüyor.' },
    {
      type: 'choice',
      prompt: `${GIRL_NAME} hangisini sorsun?`,
      options: [
        { text: 'Kısa hikayeleri', goto: 'act2_magazine_ask_stories' },
        { text: 'Okul etkinliklerini', goto: 'act2_magazine_ask_events' }
      ]
    }
  ],
  act2_magazine_ask_stories: [
    { type: 'say', speaker: GIRL_NAME, text: 'Bu sayıda kısa hikaye de var mı?' },
    { type: 'say', speaker: BOY_NAME, text: 'Var, iki tane. Biri fena değil, diğeri de fena değil.' },
    { type: 'say', speaker: GIRL_NAME, text: 'Yani ikisi de fena değil.' },
    { type: 'say', speaker: BOY_NAME, text: 'Aynen öyle. Objektif eleştirmenlik böyle bir şey.' },
    { type: 'say', speaker: '', text: '(İçinden) Şu kısa hikaye bölümüne bir bakabilirim belki.' },
    { type: 'jump', goto: 'act2_aftermath' }
  ],
  act2_magazine_ask_events: [
    { type: 'say', speaker: GIRL_NAME, text: 'Etkinlik haberlerinde ne var bu sefer?' },
    { type: 'say', speaker: BOY_NAME, text: 'Basketbol turnuvası, bir de resim sergisi haberi var.' },
    { type: 'say', speaker: GIRL_NAME, text: 'Resim sergisini kaçırmışım, ne zamanmış?' },
    { type: 'say', speaker: BOY_NAME, text: 'Geçen hafta bitti galiba, ama dergide fotoğrafları var.' },
    { type: 'say', speaker: '', text: '(İçinden) Bari fotoğraflarına bakarım.' },
    { type: 'jump', goto: 'act2_aftermath' }
  ],

  // ---- 8) KISA DERS SONRASI ----
  act2_aftermath: [
    { type: 'say', speaker: '', text: 'Ders bitiyor, herkes toplanmaya başlıyor.' },
    { type: 'hide', id: 'girl' },
    { type: 'hide', id: 'boy' },
    { type: 'say', speaker: '', text: '— Bakış açısı değişiyor —' },
    { type: 'show', id: 'boy', file: 'boy_neutral.svg', position: 'center', transition: 'fade' },
    { type: 'say', speaker: '', text: 'Yahya koridorda, elinde kalan birkaç dergiyle.' },
    { type: 'say', speaker: '', text: '(İçinden) İçeri girdiğimde böyle bir tartışmanın ortasına düşeceğimi düşünmemiştim.' },
    { type: 'say', speaker: BOY_NAME, text: 'Sınıfın yarısı hocayla tartışıyor sandım, az kalsın geri kapıdan çıkıyordum.' },
    { type: 'say', speaker: '', text: '(İçinden) Ama iyi ki çıkmamışım, ilginç bir dersmiş.' },
    { type: 'say', speaker: BOY_NAME, text: 'Neyse, kalan sınıflara da yetişeyim.' },
    { type: 'hide', id: 'boy' },
    { type: 'say', speaker: '', text: '— Bakış açısı değişiyor —' },
    { type: 'show', id: 'girl', file: 'girl_happy.svg', position: 'center', transition: 'fade' },
    { type: 'say', speaker: '', text: 'İnci çantasını topluyor.' },
    { type: 'say', speaker: '', text: '(İçinden) Yeni çocuk muydu?' },
    { type: 'say', speaker: '', text: '(İçinden) Dergi kulübündeymiş demek.' },
    { type: 'say', speaker: '', text: '(İçinden) Beklediğimden daha rahat konuştu, öğretmene karşı bile.' },
    { type: 'say', speaker: '', text: 'Sıradan bir gündü, dergiyi eline alıp koridora çıkıyor.' },
    { type: 'say', speaker: '', text: '(İçinden) Neyse, sıradaki derse geç kalmayayım.' },
    { type: 'hide', id: 'girl' },
    { type: 'jump', goto: 'act2_end' }
  ],

  // ---- 9) Perde sonu kartı. ACT III hazır olduğu için doğrudan ona bağlanıyor. ----
  act2_end: [
    { type: 'say', speaker: '', text: 'ACT II — SCHOOL' },
    { type: 'say', speaker: '', text: 'END' },
    { type: 'end', next: 'act3_start' }
  ],

  // ================= ACT III: KONUŞMA (SON PERDE) =================

  // Sahne 1 (kız POV) — ACT II'nin bittiği yerden (koridor, siyah ekran) devam.
  act3_start: [
    { type: 'show', id: 'girl', file: 'girl_neutral.svg', position: 'center', transition: 'fade' },
    { type: 'camera', effect: 'slide-left' },
    { type: 'say', speaker: '', text: 'Koridorda yürümeye devam ediyor. Aklında hâlâ biraz kimya, biraz da eve gidince ne yiyeceği var.' },
    { type: 'expr', id: 'girl', file: 'girl_happy.svg' },
    { type: 'say', speaker: '', text: `(${GIRL_NAME}'nin içinden) Bugün fena değildi aslında.` },
    { type: 'expr', id: 'girl', file: 'girl_neutral.svg' },
    { type: 'say', speaker: '', text: 'Az ileride, tanımadığı biri ona doğru yürüyor gibi görünüyor.' },
    { type: 'say', speaker: '', text: '(İçinden) Bu sabah gördüğüm... öğrenci mi neydi?' },
    { type: 'say', speaker: '', text: '(İçinden) Neyse, muhtemelen başka bir yere gidiyordur.' },
    { type: 'jump', goto: 'act3_boy_pov' }
  ],

  // Sahne 2 (erkek POV) — tedirgin, saygılı, hafif esprili bir iç ses.
  act3_boy_pov: [
    { type: 'camera', effect: 'zoom-out' },
    { type: 'hide', id: 'girl' },
    { type: 'say', speaker: '', text: '— Bakış açısı değişiyor —' },
    { type: 'show', id: 'boy', file: 'boy_neutral.svg', position: 'center', transition: 'fade' },
    { type: 'say', speaker: '', text: '(İçinden) Tamam.' },
    { type: 'say', speaker: '', text: "(İçinden) Sadece 'merhaba' de." },
    { type: 'say', speaker: '', text: '(İçinden) Bu neden bu kadar zor geliyor ki?' },
    { type: 'say', speaker: '', text: '(İçinden) Beni tanımıyor. Sorun değil.' },
    { type: 'say', speaker: '', text: '(İçinden) Sadece soracağım.' },
    { type: 'camera', effect: 'zoom-in' },
    { type: 'jump', goto: 'act3_conversation' }
  ],

  // Sahne 3 — ilk kez konuşuyorlar.
  act3_conversation: [
    { type: 'hide', id: 'boy' },
    { type: 'show', id: 'girl', file: 'girl_neutral.svg', position: 'left', transition: 'fade' },
    { type: 'show', id: 'boy', file: 'boy_neutral.svg', position: 'right', transition: 'fade' },
    { type: 'say', speaker: BOY_NAME, text: 'Selam.' },
    { type: 'say', speaker: '', text: '(İçinden) Bana mı diyor?' },
    { type: 'say', speaker: GIRL_NAME, text: 'Selam?' },
    { type: 'say', speaker: BOY_NAME, text: `Ben ${BOY_NAME}. Sanırım daha önce hiç tanışmadık.` },
    { type: 'say', speaker: GIRL_NAME, text: `Hayır, sanmıyorum. Ben ${GIRL_NAME}.` },
    { type: 'say', speaker: BOY_NAME, text: `${GIRL_NAME}. Tamam.` },
    { type: 'say', speaker: BOY_NAME, text: 'Seni birkaç kere görmüştüm, aynı koridorlardan geçiyoruz galiba.' },
    { type: 'say', speaker: '', text: '(İçinden) Normal bir şey aslında. Okul pek büyük değil.' },
    { type: 'say', speaker: GIRL_NAME, text: 'Olabilir. Okul pek büyük değil zaten.' },
    { type: 'expr', id: 'girl', file: 'girl_happy.svg' },
    { type: 'say', speaker: BOY_NAME, text: 'Şey... okulda bir ara kahve içmek ister misin?' },
    {
      type: 'choice',
      prompt: 'Ne cevap verse iyi olur?',
      options: [
        { text: 'Olur.', goto: 'act3_yes' },
        { text: 'Belki... önce biraz tanışsak?', goto: 'act3_getknow' },
        { text: 'Teşekkür ederim ama istemiyorum.', goto: 'act3_no' }
      ]
    }
  ],

  // Sahne 4, seçim 1 — EVET.
  act3_yes: [
    { type: 'say', speaker: GIRL_NAME, text: 'Tamam, olur.' },
    { type: 'say', speaker: BOY_NAME, text: 'Gerçekten mi? Tamam... harika.' },
    { type: 'say', speaker: GIRL_NAME, text: 'Ne zaman istersen, haber ver.' },
    { type: 'say', speaker: '', text: '(İçinden) Fena bir fikir değilmiş aslında.' },
    { type: 'jump', goto: 'act3_ending' }
  ],

  // Sahne 4, seçim 2 — ÖNCE TANIŞALIM.
  act3_getknow: [
    { type: 'say', speaker: GIRL_NAME, text: 'Belki... önce biraz tanışsak?' },
    { type: 'say', speaker: BOY_NAME, text: 'Tabii, sorun değil.' },
    { type: 'say', speaker: BOY_NAME, text: 'Okulda görüşürüz o zaman, biraz konuşuruz.' },
    { type: 'say', speaker: '', text: '(İçinden) Makul bir teklif.' },
    { type: 'jump', goto: 'act3_ending' }
  ],

  // Sahne 4, seçim 3 — HAYIR.
  act3_no: [
    { type: 'say', speaker: GIRL_NAME, text: 'Teşekkür ederim ama istemiyorum.' },
    { type: 'say', speaker: BOY_NAME, text: 'Tabii, sorun değil. Yine de tanıştığımıza memnun oldum.' },
    { type: 'say', speaker: '', text: '(İçinden) Nazikçe karşıladı. İyi biri gibi duruyor.' },
    { type: 'jump', goto: 'act3_ending' }
  ],

  // Kapanış — her üç seçim de buraya bağlanır. Oyunun sonu; ACT IV yoktur.
  act3_ending: [
    { type: 'hide', id: 'girl' },
    { type: 'hide', id: 'boy' },
    { type: 'bg', file: null },
    { type: 'say', speaker: '', text: 'ACT III — THE CONVERSATION' },
    { type: 'say', speaker: '', text: 'END' },
    { type: 'say', speaker: '', text: 'Bazen önemli olan cevabı bilmek değil, ilk adımı atabilmektir.' },
    { type: 'end' }
  ]
};

const STORY_START_LABEL = 'act1_start';
