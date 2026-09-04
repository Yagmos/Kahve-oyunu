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
 *                — emphasis:true verilirse tartışma sahnesinde kısa sarsıntı + flash
 *   choice    { type:'choice', prompt, options:[{text, goto, points?, set?, add?}] }
 *                — points verilirse seçilince game.noteScore'a eklenir (mini oyunlar için)
 *                — set: {anahtar: değer} game.flags'e yazar, add: {anahtar: sayı} sayaç artırır;
 *                  sonraki sahneler bunları okuyup metni değiştirebilir
 *   phone     { type:'phone', time, date, notifications:[{app,from,text}], schedule:[{time,subject,highlight}] }
 *   jump      { type:'jump', goto }
 *   end       { type:'end', next? }           — next bir sonraki perdenin başlangıç etiketidir;
 *                                                verilmez veya STORY'de yoksa hikaye biter ve ana menüye dönülür.
 *
 * "goto" bir etiket adıdır ve her zaman ilgili etiketin 0. adımına atlar.
 */
const ADVISOR_NAME = 'Cemal Hoca';
const GIRL_NAME = 'İnci';
const BOY_NAME = 'Yahya';
const TEACHER_NAME = 'Badem Öziş';

/**
 * Tartışmada en çok seçilen tavır. Seçenekler 'add' ile sayaç artırdığı için
 * ACT III'ün kapanışı oyuncunun nasıl tartıştığını hatırlayabiliyor.
 * @returns {'felsefi'|'dogrudan'|'sakin'}
 */
function baskinTavir(game) {
  const f = (game && game.flags) || {};
  const sirali = [['felsefi', f.felsefi || 0], ['dogrudan', f.dogrudan || 0], ['sakin', f.sakin || 0]];
  sirali.sort((a, b) => b[1] - a[1]);
  return sirali[0][1] > 0 ? sirali[0][0] : 'felsefi';
}

/** Bir bayrağa göre metin seçer; bayrak yoksa ilk seçeneğe düşer. */
function bayragaGore(game, key, secenekler, varsayilan) {
  const deger = ((game && game.flags) || {})[key];
  if (deger !== undefined && secenekler[String(deger)] !== undefined) return secenekler[String(deger)];
  return varsayilan;
}

const STORY = {
  // ---- 1-2-3-4-5: Siyah ekran, alarm, odaya geçiş, uyanış, iç ses ----
  act1_start: [
    { type: 'sfx', file: 'alarm.mp3' },
    { type: 'say', speaker: '', text: '*Trrrn! Trrrn! Trrrn!*' },
    { type: 'bg', file: 'bedroom_morning.svg' },
    { type: 'show', id: 'girl', file: 'girl_sleepy.svg', position: 'center', transition: 'fade' },
    { type: 'bgm', file: 'morning_theme.mp3' },
    { type: 'camera', effect: 'zoom-in' },
    { type: 'say', speaker: '', text: `(${GIRL_NAME}'nin içinden) Bir dakika daha. Sadece bir dakika.` },
    { type: 'expr', id: 'girl', file: 'girl_annoyed.svg' },
    { type: 'say', speaker: '', text: '(İçinden) Her sabah aynı pazarlığı yapıyorum ve her sabah kaybediyorum.' },
    { type: 'say', speaker: GIRL_NAME, text: 'Tamam. Duydum seni.' },
    {
      type: 'choice',
      prompt: 'Alarm hâlâ çalıyor.',
      options: [
        { text: 'Kalk', goto: 'act1_getup', set: { alarm: 'kalkti' } },
        { text: 'Beş dakika daha', goto: 'act1_snooze', set: { alarm: 'erteledi' } }
      ]
    }
  ],

  // "Beş dakika daha" seçilirse: kısa, komik bir gecikme sahnesi.
  act1_snooze: [
    { type: 'expr', id: 'girl', file: 'girl_sleepy.svg' },
    { type: 'say', speaker: GIRL_NAME, text: 'Beş dakika. Bu sefer gerçekten beş dakika.' },
    { type: 'sfx', file: 'alarm.mp3' },
    { type: 'say', speaker: '', text: '*Trrrn! Trrrn!*' },
    { type: 'expr', id: 'girl', file: 'girl_surprised.svg' },
    { type: 'camera', effect: 'zoom-in' },
    { type: 'say', speaker: GIRL_NAME, text: 'Bu beş dakika değildi.' },
    { type: 'say', speaker: '', text: '(İçinden) Kendime bile yalan söylüyorum, bari inandırıcı olsaydı.' },
    { type: 'jump', goto: 'act1_getup' }
  ],

  // 6-7: Kalkış ve kıyafet seçimi (küçük etkileşim).
  act1_getup: [
    { type: 'expr', id: 'girl', file: 'girl_annoyed.svg' },
    { type: 'say', speaker: '', text: `${GIRL_NAME} esneyerek yataktan kalkıyor.` },
    { type: 'say', speaker: '', text: '(İçinden) Dolabın önünde en fazla on saniye harcayacağım.' },
    { type: 'say', speaker: GIRL_NAME, text: 'Ne giysem...' },
    {
      type: 'choice',
      prompt: 'Ne giyse iyi olur?',
      options: [
        { text: 'Favori tişörtü', goto: 'act1_outfit_fav', set: { kiyafet: 'favori' } },
        { text: 'İlk eline geleni', goto: 'act1_outfit_casual', set: { kiyafet: 'rastgele' } }
      ]
    }
  ],

  act1_outfit_fav: [
    { type: 'expr', id: 'girl', file: 'girl_happy.svg' },
    { type: 'say', speaker: GIRL_NAME, text: 'Favori tişört olsun.' },
    { type: 'say', speaker: '', text: '(İçinden) Bilimsel bir dayanağı yok ama günü kurtardığı kesin.' },
    { type: 'jump', goto: 'act1_breakfast' }
  ],

  act1_outfit_casual: [
    { type: 'expr', id: 'girl', file: 'girl_annoyed.svg' },
    { type: 'say', speaker: '', text: '(İçinden) Kot, çizgili tişört, bitti.' },
    { type: 'say', speaker: '', text: '(İçinden) Sabahın yedisinde estetik kaygı fazla lüks.' },
    { type: 'jump', goto: 'act1_breakfast' }
  ],

  // 7: Kahvaltı — kişilik detayları.
  act1_breakfast: [
    { type: 'expr', id: 'girl', file: 'girl_happy.svg' },
    { type: 'say', speaker: '', text: `${GIRL_NAME} mutfağa iniyor, aceleyle bir şeyler atıştırıyor.` },
    { type: 'say', speaker: GIRL_NAME, text: 'Önce kahve.' },
    { type: 'say', speaker: '', text: '(İçinden) Düşünebilmem için bir bardak gerekiyor, bu kadar basit.' },
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
        { app: 'Hatırlatıcı', text: "İngilizce bilgi yarışması bugün 15.00 — sen de yarışıyorsun, geç kalma." },
        { app: 'Hatırlatıcı', text: 'Matematik ödevini çantaya koy!' },
        { app: 'Notlar', text: 'Yarışma: geçen sene soruların yarısı elektrik konusundan gelmişti.' }
      ],
      schedule: [
        { time: '09:00', subject: 'Matematik' },
        { time: '10:00', subject: 'Türkçe Edebiyatı' },
        { time: '11:00', subject: 'Din Kültürü', highlight: true },
        { time: '13:00', subject: 'Beden Eğitimi' }
      ]
    },
    { type: 'say', speaker: '', text: '(İçinden) Yarışma bugünmüş. Hatırlatıcıyı kendim kurmuşum, demek ki gerçekten gideceğim.' },
    { type: 'expr', id: 'girl', file: 'girl_annoyed.svg' },
    { type: 'say', speaker: GIRL_NAME, text: 'Bir de bu var tabii.' },
    { type: 'say', speaker: '', text: '(İçinden) Geçen hafta soru sorduğumda Badem Hoca "bu tartışmaya açık bir konu değil" demişti.' },
    { type: 'say', speaker: '', text: '(İçinden) Bakalım bugün ne kadar dayanabileceğim.' },
    { type: 'jump', goto: 'act1_bag' }
  ],

  // 9: Çanta hazırlığı — küçük bir seçim daha.
  act1_bag: [
    { type: 'say', speaker: '', text: `${GIRL_NAME} çantasını topluyor.` },
    {
      type: 'choice',
      prompt: 'Şemsiyeyi alsın mı?',
      options: [
        { text: 'Şemsiyeyi al', goto: 'act1_umbrella_yes', set: { semsiye: true } },
        { text: 'Almadan çık', goto: 'act1_umbrella_no', set: { semsiye: false } }
      ]
    }
  ],

  act1_umbrella_yes: [
    { type: 'expr', id: 'girl', file: 'girl_happy.svg' },
    { type: 'say', speaker: GIRL_NAME, text: 'Şemsiyeyi alayım.' },
    { type: 'say', speaker: '', text: '(İçinden) Sonra pişman olmaktansa gün boyu taşırım.' },
    { type: 'jump', goto: 'act1_leave' }
  ],

  act1_umbrella_no: [
    { type: 'expr', id: 'girl', file: 'girl_happy.svg' },
    { type: 'say', speaker: GIRL_NAME, text: 'Hava açık, gerek yok.' },
    { type: 'say', speaker: '', text: '(İçinden) Islanırsam da kendi hatam olur.' },
    { type: 'jump', goto: 'act1_leave' }
  ],

  // 10: Evden çıkış.
  act1_leave: [
    { type: 'say', speaker: '', text: 'Ayakkabılarını giyip kapıya yöneliyor.' },
    { type: 'say', speaker: GIRL_NAME, text: 'Tamam. Bugün de başlıyoruz.' },
    { type: 'hide', id: 'girl' },
    { type: 'bg', file: null },
    { type: 'jump', goto: 'act1_walk' }
  ],

  // 11: Kısa yürüyüş / geçiş sahnesi, sonra okula varış.
  act1_walk: [
    { type: 'bg', file: 'street_morning.svg' },
    { type: 'show', id: 'girl', file: 'girl_neutral.svg', position: 'center', transition: 'fade' },
    { type: 'say', speaker: '', text: 'Sokaklar hâlâ yeni uyanıyor; birkaç kişi telaşla yürüyor, bir kedi kaldırımda geriniyor.' },
    { type: 'say', speaker: '', text: `${GIRL_NAME} kulaklığını takıyor, adımlarını hızlandırıyor.` },
    { type: 'say', speaker: '', text: '(İçinden) On dakika erken varırsam kütüphanede oturabilirim.' },
    { type: 'say', speaker: '', text: 'Köşedeki büfenin önünden geçerken kahve kokusu geliyor.' },
    { type: 'expr', id: 'girl', file: 'girl_neutral.svg' },
    {
      type: 'choice',
      prompt: 'Kahve alsın mı?',
      options: [
        { text: 'Bir kahve al', goto: 'act1_coffee_yes', set: { sabah_kahve: true } },
        { text: 'Boş ver, okulda içerim', goto: 'act1_coffee_no', set: { sabah_kahve: false } }
      ]
    }
  ],

  // 11b: Sabah kahvesi — ACT III'teki kahve teklifine ve finale bağlanıyor.
  act1_coffee_yes: [
    { type: 'say', speaker: GIRL_NAME, text: 'Bir orta boy, sade.' },
    { type: 'say', speaker: '', text: '(İçinden) Haftalığımın epey bir kısmı buraya gidiyor ama bu pazarlığı da çoktan kaybettim.' },
    { type: 'say', speaker: '', text: 'Bardağı iki eliyle tutarak yürümeye devam ediyor.' },
    { type: 'expr', id: 'girl', file: 'girl_happy.svg' },
    { type: 'say', speaker: '', text: '(İçinden) Günün en iyi on dakikası galiba bu.' },
    { type: 'expr', id: 'girl', file: 'girl_neutral.svg' },
    { type: 'jump', goto: 'act1_schoolyard' }
  ],

  act1_coffee_no: [
    { type: 'say', speaker: '', text: '(İçinden) Kuyruk uzun, kahve de sıcak olur; yürürken içemem zaten.' },
    { type: 'say', speaker: '', text: '(İçinden) Okulda bir yerden bir bardak bulurum.' },
    { type: 'jump', goto: 'act1_schoolyard' }
  ],

  // 11c: Okul bahçesi — zilden önceki on dakika. İnci'nin yazarlığı burada kuruluyor.
  act1_schoolyard: [
    { type: 'bg', file: 'school_yard.jpg' },
    { type: 'say', speaker: '', text: 'Birkaç dakika sonra okulun bahçesinde. Zile daha var.' },
    { type: 'say', speaker: '', text: 'Bahçede birkaç kişi: kimi ödev yetiştiriyor, kimi sadece bekliyor.' },
    { type: 'say', speaker: '', text: '(İçinden) On dakika. Ya kütüphanede yarışma için son bir tekrar yaparım, ya burada oturur beklerim.' },
    {
      type: 'choice',
      prompt: 'On dakikayı nasıl geçirsin?',
      options: [
        { text: 'Kütüphanede tekrar yap', goto: 'act1_library', set: { sabah_tekrar: 'kutuphane' } },
        { text: 'Bahçede otur', goto: 'act1_yard', set: { sabah_tekrar: 'bahce' } }
      ]
    }
  ],

  act1_library: [
    { type: 'say', speaker: '', text: 'Kütüphane sabahları neredeyse boş; ışıkların yarısı bile yanmıyor.' },
    { type: 'say', speaker: '', text: `${GIRL_NAME} defterini açıp geçen seneki yarışma sorularına bakıyor.` },
    { type: 'say', speaker: '', text: '(İçinden) Sorular İngilizce ama konular fen; geçen sene yarısı elektrikten gelmişti.' },
    { type: 'say', speaker: '', text: '(İçinden) Direnç, gerilim, akım... İngilizce karşılıkları hâlâ tuhaf oturuyor.' },
    { type: 'say', speaker: '', text: '(İçinden) Ezberlemiyorum, sadece gözüm alışsın istiyorum.' },
    { type: 'say', speaker: '', text: 'Bir sayfa çevirip defteri kapatıyor.' },
    { type: 'sfx', file: 'bell.mp3' },
    { type: 'say', speaker: '', text: 'Zil çalıyor.' },
    { type: 'jump', goto: 'act1_end' }
  ],

  act1_yard: [
    { type: 'say', speaker: '', text: 'Duvarın dibindeki banka oturuyor.' },
    { type: 'say', speaker: '', text: '(İçinden) Yarışma aklımda ama şimdi tekrar yapsam daha çok karışır.' },
    { type: 'say', speaker: '', text: 'Bahçenin uğultusunu dinliyor: bir gülüşme, uzaktan bir top sesi.' },
    { type: 'say', speaker: '', text: '(İçinden) Bazen sadece oturmak da bir şey yapmak sayılır.' },
    { type: 'sfx', file: 'bell.mp3' },
    { type: 'say', speaker: '', text: 'Zil çalıyor.' },
    { type: 'jump', goto: 'act1_end' }
  ],

  // 12: Perde sonu kartı. ACT II hazır olduğu için doğrudan ona bağlanıyor.
  act1_end: [
    { type: 'hide', id: 'girl' },
    { type: 'bg', file: null },
    { type: 'say', speaker: '', text: 'Perde I — Sabah' },
    { type: 'say', speaker: '', text: 'Perde II — Okul' },
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
    { type: 'bg', file: 'club_room.svg' },
    { type: 'bgm', file: 'school_day.mp3' },
    { type: 'say', speaker: '', text: '— Bakış açısı değişiyor —' },
    { type: 'show', id: 'boy', file: 'boy_neutral.svg', position: 'center', transition: 'fade' },
    { type: 'say', speaker: '', text: 'Dergi kulübü odası, öğle arasının hemen öncesi.' },
    { type: 'say', speaker: '', text: 'Masanın üstünde yeni sayının son baskıları duruyor.' },
    { type: 'say', speaker: 'Kulüp arkadaşı', text: 'Bu sefer erken bitirdik, değil mi?' },
    { type: 'say', speaker: BOY_NAME, text: 'Erken bitirdik ama hâlâ dağıtım var. Asıl iş şimdi başlıyor.' },
    { type: 'say', speaker: 'Kulüp arkadaşı', text: 'Yine gönüllü mü oldun dağıtıma?' },
    { type: 'say', speaker: BOY_NAME, text: 'Gönüllü olmadım, sırada bendim.' },
    { type: 'say', speaker: 'Kulüp arkadaşı', text: 'İlginç, sıra hep sana geliyor bir şekilde.' },
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
    { type: 'jump', goto: 'act2_club_leave' }
  ],
  act2_club_cover_font: [
    { type: 'say', speaker: BOY_NAME, text: 'Font da okunaklı olmuş. Geçen sayıda üçüncü sayfadan sonra göz kanatıyordu.' },
    { type: 'say', speaker: '', text: '(İçinden) Bu sefer baştan dikkat ettik, iyi ki de etmişiz.' },
    { type: 'jump', goto: 'act2_club_leave' }
  ],




  act2_club_leave: [
    { type: 'bg', file: 'hallway.svg' },
    { type: 'say', speaker: '', text: 'Dergi yığınını koluna alıp kapıya yöneliyor.' },
    { type: 'say', speaker: BOY_NAME, text: 'Tamam, sınıflara dağıtmaya başlıyorum.' },
    { type: 'say', speaker: ADVISOR_NAME, text: 'Dikkat et, geçen sefer merdivenlerden koşarak inmiştin.' },
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
    { type: 'jump', goto: 'act2_hallway4' }
  ],
  act2_hallway1_nod: [
    { type: 'say', speaker: '', text: 'Başıyla selam veriyor, karşı taraf da aynı şekilde karşılık veriyor.' },
    { type: 'say', speaker: '', text: '(İçinden) Eller dolu olunca selamlaşmak biraz tuhaflaşıyor.' },
    { type: 'say', speaker: BOY_NAME, text: 'Neyse, teneffüs kalabalığında bu kadarı yeter.' },
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
    { type: 'bg', file: 'classroom.svg' },
    { type: 'say', speaker: '', text: '— Bakış açısı değişiyor —' },
    { type: 'show', id: 'girl', file: 'girl_neutral.svg', position: 'center', transition: 'fade' },
    { type: 'say', speaker: '', text: 'Sınıf, Din Kültürü ve Ahlak Bilgisi dersi.' },
    { type: 'say', speaker: '', text: "Tahtada bir başlık var: 'İnanç ve Teslimiyet'." },
    { type: 'expr', id: 'teacher', file: 'teacher_debate_calm.png' }, // derse sakin başlıyor
    { type: 'say', speaker: TEACHER_NAME, text: 'Bugün bazı şeyleri hatırlatacağım. Bunlar tartışmaya açık meseleler değil.' },
    { type: 'say', speaker: TEACHER_NAME, text: 'İnanç, önce sorgulanıp sonra kabul edilecek bir şey değildir. Zaten doğrudur; biz sadece onu anlamaya çalışırız.' },
    { type: 'say', speaker: '', text: '(İçinden) Yine mi bu cümle...' },
    { type: 'say', speaker: '', text: 'Sınıftaki birkaç kişi başını sallıyor, kimse itiraz etmiyor.' },
    { type: 'say', speaker: 'Bir öğrenci', text: 'Haklısınız hocam, zaten böyle biliniyor.' },
    { type: 'say', speaker: TEACHER_NAME, text: 'Aferin. Ama bazılarınız hâlâ soru sormayı seviyor galiba.' },
    { type: 'say', speaker: TEACHER_NAME, text: `${GIRL_NAME}, yine mi düşüncelisin bugün?` },
    { type: 'say', speaker: '', text: '(İçinden) Görünüşe göre öyle.' },
    { type: 'jump', goto: 'act2_debate_turn1' }
  ],

  // Tur 1, aşama A: İnci'nin ilk sorgulaması + öğretmenin kesin cevabı.
  act2_debate_turn1: [
    { type: 'expr', id: 'teacher', file: 'teacher_debate_stern.png' }, // konumunu sabitliyor
    { type: 'say', speaker: TEACHER_NAME, text: 'Bize aktarılmış açık bilgiler var. Bunlar yüzyıllardır orada; üzerinde durulmuş, sağlamlığı belli gerçekler.' },
    { type: 'say', speaker: TEACHER_NAME, text: 'Bazı şeyleri sürekli sorgulamak zorunda değilsiniz.', emphasis: true },
    { type: 'say', speaker: '', text: `${GIRL_NAME} parmak kaldırıyor.` },
    {
      type: 'choice',
      prompt: `${GIRL_NAME} nasıl sorsun?`,
      options: [
        { text: 'Sorgulamak neden yasak?', goto: 'act2_debate_turn1_philo', add: { felsefi: 1 } },
        { text: 'Eskiden beri böyle olması kanıt değil', goto: 'act2_debate_turn1_direct', add: { dogrudan: 1 } },
        { text: 'Sadece nedenini anlamak istiyorum', goto: 'act2_debate_turn1_calm', add: { sakin: 1 } }
      ]
    }
  ],
  act2_debate_turn1_philo: [
    { type: 'say', speaker: GIRL_NAME, text: 'Bilginin aktarılmış olması, onu sorgulamayacağımız anlamına mı geliyor?' },
    { type: 'say', speaker: TEACHER_NAME, text: 'Hayır, ama bazı konularda cevap zaten bellidir.' },
    { type: 'say', speaker: TEACHER_NAME, text: 'Herkesin tekerleği yeniden icat etmesine gerek yok, İnci.' },
    { type: 'jump', goto: 'act2_debate_turn2' }
  ],
  act2_debate_turn1_direct: [
    { type: 'expr', id: 'girl', file: 'girl_annoyed.svg' },
    { type: 'say', speaker: GIRL_NAME, text: 'Yüzyıllardır böyle denmiş olması, doğru olduğu anlamına gelmiyor bence.' },
    { type: 'expr', id: 'teacher', file: 'teacher_debate_point.png' }, // doğrudan itiraza parmak sallıyor
    { type: 'say', speaker: TEACHER_NAME, text: 'Doğruluğu zaten sabit, İnci. Bu konuda kafanı karıştırmana gerek yok.' },
    { type: 'jump', goto: 'act2_debate_turn2' }
  ],
  act2_debate_turn1_calm: [
    { type: 'say', speaker: GIRL_NAME, text: 'Ben sadece bunun neden böyle olduğunu anlamaya çalışıyorum, hocam.' },
    { type: 'say', speaker: TEACHER_NAME, text: 'Anlamaya çalışmak güzel. Ama bazı şeyleri olduğu gibi kabul etmek de bir erdemdir.' },
    { type: 'jump', goto: 'act2_debate_turn2' }
  ],


  // Tur 2, aşama A.
  act2_debate_turn2: [
    { type: 'say', speaker: '', text: 'Öğretmenin sesi biraz sertleşiyor, sanki bu tartışmayı daha önce de yaşamış gibi.' },
    { type: 'expr', id: 'girl', file: 'girl_annoyed.svg' }, // ilk gerçek rahatsızlık
    { type: 'say', speaker: '', text: '(İçinden) Yine aynı yere geldik.' },
    { type: 'say', speaker: '', text: '(İçinden) Ben soru soruyorum, o cevabın zaten belli olduğunu söylüyor.' },
    { type: 'say', speaker: '', text: '(İçinden) Belki de asıl sinir olduğum şey cevap değil.' },
    { type: 'say', speaker: '', text: '(İçinden) Soruyu sormama izin verilmemesi.' },
    { type: 'say', speaker: '', text: 'Badem Hoca tahtaya iki kelime daha yazıyor: Bilim ve Sınırları.' },
    { type: 'expr', id: 'teacher', file: 'teacher_debate_point.png' }, // sınıfa dönüp iddiayı vurguluyor
    { type: 'say', speaker: TEACHER_NAME, text: 'Bilim size nasıl sorusuna cevap verir. Ama bazı konularda cevap zaten dinen bellidir.' },
    { type: 'say', speaker: TEACHER_NAME, text: 'Bilimin buna bir şey söylemesine gerek yoktur.', emphasis: true },
    { type: 'expr', id: 'girl', file: 'girl_surprised.svg' }, // beklemediği cevap
    { type: 'say', speaker: '', text: '(İçinden) Bunu gerçekten söyledi mi şimdi?' },
    {
      type: 'choice',
      prompt: `${GIRL_NAME} nasıl cevap versin?`,
      options: [
        { text: 'Kanıtsız da kesinlik olur mu?', goto: 'act2_debate_turn2_philo', add: { felsefi: 1 } },
        { text: 'Kanıt yoksa bu eminlik nereden?', goto: 'act2_debate_turn2_direct', add: { dogrudan: 1 } },
        { text: 'İkisi nasıl bir arada duruyor?', goto: 'act2_debate_turn2_calm', add: { sakin: 1 } }
      ]
    }
  ],
  act2_debate_turn2_philo: [
    { type: 'say', speaker: GIRL_NAME, text: 'Yani bir konuda bilimsel bir kanıt olmasa bile, o konu kesin kabul edilebilir mi?' },
    { type: 'say', speaker: TEACHER_NAME, text: 'Elbette. Her gerçek laboratuvarda kanıtlanmaz. Bazı gerçekler zaten bize bildirilmiştir.' },
    { type: 'jump', goto: 'act2_kerem_arrives' }
  ],
  act2_debate_turn2_direct: [
    { type: 'expr', id: 'girl', file: 'girl_annoyed.svg' },
    { type: 'say', speaker: GIRL_NAME, text: 'Kanıt yoksa, neden bu kadar emin olabiliyoruz ki?' },
    { type: 'say', speaker: TEACHER_NAME, text: 'Çünkü emin olmamız gereken bir kaynaktan geliyor. Bunu sürekli sorgulaman gerekmiyor.' },
    { type: 'jump', goto: 'act2_kerem_arrives' }
  ],
  act2_debate_turn2_calm: [
    { type: 'say', speaker: GIRL_NAME, text: 'Ben sadece bilim ile inancın nasıl bir arada durduğunu merak ediyorum.' },
    { type: 'say', speaker: TEACHER_NAME, text: 'Bir arada dururlar, çünkü ikisi de aynı gerçeğe farklı yerlerden bakar. Ama biri diğerinden üstündür.' },
    { type: 'jump', goto: 'act2_kerem_arrives' }
  ],


  // ---- 4) KEREM'İN SINIFA GİRİŞİ — birbirlerini İLK KEZ görüyorlar ----
  act2_kerem_arrives: [
    { type: 'camera', effect: 'slide-left' },
    { type: 'sfx', file: 'door.mp3' },
    { type: 'say', speaker: '', text: 'Sınıfta birkaç öğrenci rahatsız kıpırdanıyor; öğretmen bunu fark ediyor ama devam ediyor.' },
    { type: 'say', speaker: '', text: 'Kapı hafifçe aralanıyor.' },
    { type: 'say', speaker: '', text: '(İçinden) Umarım ortasına denk gelmemişimdir.' },
    { type: 'hide', id: 'girl' },
    { type: 'show', id: 'girl', file: 'girl_neutral.svg', position: 'left', transition: 'fade' },
    { type: 'show', id: 'boy', file: 'boy_neutral.svg', position: 'right', transition: 'fade' },
    { type: 'say', speaker: '', text: 'Sınıftaki birkaç öğrenci başını çevirip bakıyor, sonra tekrar tahtaya dönüyor.' },
    { type: 'expr', id: 'teacher', file: 'teacher_debate_calm.png' }, // kapıya dönüyor, ton düşüyor
    { type: 'say', speaker: TEACHER_NAME, text: 'Bir şey mi vardı?' },
    { type: 'say', speaker: BOY_NAME, text: 'Dergi kulübünden gelmiştim. Yeni sayıyı tanıtıp dağıtacaktım.' },
    { type: 'say', speaker: TEACHER_NAME, text: 'Tabii, bir dakika bekleyebilirsin.' },
    { type: 'say', speaker: BOY_NAME, text: 'Tabii, sorun değil.' },
    { type: 'expr', id: 'boy', file: 'boy_skeptic.svg' }, // tartışmanın ortasına denk geldi, kenarda bekliyor
    { type: 'say', speaker: '', text: 'Yahya sınıfın kenarında, elinde dergilerle bekliyor.' },
    { type: 'say', speaker: '', text: '(İçinden) Ortasına denk gelmişim işte. Olsun, beklerim.' },
    { type: 'jump', goto: 'act2_first_look' }
  ],

  // ---- 5) İLK BAKIŞ — kısa, sakin, romantikleştirilmemiş ----
  act2_first_look: [
    { type: 'camera', effect: 'zoom-in' },
    { type: 'say', speaker: '', text: 'Konuşma bir anlığına devam ederken, İnci bir an başını çeviriyor.' },
    { type: 'expr', id: 'girl', file: 'girl_surprised.svg' }, // Yahya içeri girdi
    { type: 'say', speaker: '', text: '(İçinden) Yeni biri mi geldi?' },
    { type: 'say', speaker: '', text: '(İçinden) Dergi kulübünden olmalı, elindekilere bakılırsa.' },
    { type: 'say', speaker: '', text: 'Yahya da ona bakıyor. Kısa bir sessizlik.' },
    { type: 'say', speaker: '', text: 'Sınıftaki kimse bu bakışmayı fark etmiyor bile; herkes hâlâ tartışmada.' },
    { type: 'expr', id: 'girl', file: 'girl_neutral.svg' }, // dikkatini tartışmaya verir
    { type: 'say', speaker: '', text: '(İçinden) Neyse. Konuya dön.' },
    { type: 'camera', effect: 'zoom-out' },
    { type: 'say', speaker: '', text: 'İnci tekrar öğretmene dönüyor.' },
    { type: 'jump', goto: 'act2_debate_turn3' }
  ],

  // ---- 6) Tartışma devam ediyor (Yahya sınıfta, sessiz) ----
  act2_debate_turn3: [
    { type: 'say', speaker: '', text: 'Badem Hoca sıraların arasında yürümeye başlıyor.' },
    { type: 'expr', id: 'teacher', file: 'teacher_debate_stern.png' }, // tartışmaya geri dönüş
    { type: 'say', speaker: TEACHER_NAME, text: 'Ahlakın kaynağı konusunda kafanız karışmasın: iyi ve kötü, bize dinen bildirilmiştir.' },
    { type: 'say', speaker: TEACHER_NAME, text: 'Bunun dışında bir zemin aramaya gerek yok.', emphasis: true },
    {
      type: 'choice',
      prompt: `${GIRL_NAME} nasıl cevap versin?`,
      options: [
        { text: 'Dinden önce de ahlak vardı', goto: 'act2_debate_turn3_philo', add: { felsefi: 1 } },
        { text: 'Dinsiz biri ahlaklı olamaz mı?', goto: 'act2_debate_turn3_direct', add: { dogrudan: 1 } },
        { text: 'Kaynak tek mi, onu merak ediyorum', goto: 'act2_debate_turn3_calm', add: { sakin: 1 } }
      ]
    }
  ],
  act2_debate_turn3_philo: [
    { type: 'say', speaker: GIRL_NAME, text: 'Ama insanlar dini bilmeden önce de iyiyi kötüyü ayırt edebiliyordu. Bu nasıl açıklanır?' },
    { type: 'say', speaker: TEACHER_NAME, text: 'O ayrımın kendisi de zaten bu bilginin bir yansımasıdır, farkında olmasalar da.' },
    { type: 'jump', goto: 'act2_debate_turn4' }
  ],
  act2_debate_turn3_direct: [
    { type: 'expr', id: 'girl', file: 'girl_annoyed.svg' },
    { type: 'say', speaker: GIRL_NAME, text: 'Yani dinsiz biri gerçekten ahlaklı olamaz mı diyorsunuz?' },
    { type: 'say', speaker: TEACHER_NAME, text: 'Ben öyle demedim. Ama sağlam bir zemine sahip olamayacağını söylüyorum.' },
    { type: 'jump', goto: 'act2_debate_turn4' }
  ],
  act2_debate_turn3_calm: [
    { type: 'say', speaker: GIRL_NAME, text: 'Ben sadece kaynağın tek olup olmadığını merak ediyorum, hocam.' },
    { type: 'say', speaker: TEACHER_NAME, text: 'Tektir, İnci. Başka bir zemin aramak insanı yanlış yollara sürükleyebilir.' },
    { type: 'jump', goto: 'act2_debate_turn4' }
  ],


  // Tur 4, aşama A — son tur.
  act2_debate_turn4: [
    { type: 'say', speaker: '', text: 'Öğretmen kollarını kavuşturuyor, sesi biraz daha sertleşiyor.' },
    { type: 'expr', id: 'girl', file: 'girl_annoyed.svg' }, // öğretmen sertleşiyor
    { type: 'expr', id: 'teacher', file: 'teacher_debate_point.png' }, // tartışmanın tepe noktası
    { type: 'say', speaker: TEACHER_NAME, text: 'Son olarak şunu söylemek istiyorum: bazı sorular, sormak için değil, kabul etmek için vardır.', emphasis: true },
    { type: 'expr', id: 'girl', file: 'girl_surprised.svg' }, // beklenmedik iddia
    {
      type: 'choice',
      prompt: `${GIRL_NAME} nasıl cevap versin?`,
      options: [
        { text: 'Soru, soru olmaktan çıkar mı?', goto: 'act2_debate_turn4_philo', add: { felsefi: 1 } },
        { text: 'Cevap aramamam mı gerekiyor?', goto: 'act2_debate_turn4_direct', add: { dogrudan: 1 } },
        { text: 'Her soru sorulmayı hak eder', goto: 'act2_debate_turn4_calm', add: { sakin: 1 } }
      ]
    }
  ],
  act2_debate_turn4_philo: [
    { type: 'say', speaker: GIRL_NAME, text: "Bir soru nasıl 'kabul etmek için' olabilir? Bu, soru olmaktan çıkmaz mı?" },
    { type: 'say', speaker: TEACHER_NAME, text: 'Bazı sorular biçim olarak sorudur ama aslında bir daveti içerir: teslim olma daveti.' },
    { type: 'jump', goto: 'act2_debate_end' }
  ],
  act2_debate_turn4_direct: [
    { type: 'expr', id: 'girl', file: 'girl_annoyed.svg' },
    { type: 'say', speaker: GIRL_NAME, text: 'Yani bazı sorulara cevap aramamam mı gerekiyor?' },
    { type: 'say', speaker: TEACHER_NAME, text: 'Cevabı zaten var. Aramak değil, kabul etmek gerekiyor.' },
    { type: 'jump', goto: 'act2_debate_end' }
  ],
  act2_debate_turn4_calm: [
    { type: 'say', speaker: GIRL_NAME, text: 'Bence her soru sorulmayı hak ediyor, cevabı ne olursa olsun.' },
    { type: 'say', speaker: TEACHER_NAME, text: 'Güzel bir düşünce. Ama her sorunun sonunda bir teslimiyet olması gerektiğini de unutma.' },
    { type: 'jump', goto: 'act2_debate_end' }
  ],


  act2_debate_end: [
    { type: 'say', speaker: '', text: 'Ders bitmek üzere, ama öğretmen son sözü söylemek istiyor gibi duruyor.' },
    { type: 'say', speaker: '', text: '(İçinden) Şimdi cevap verirsem bu tartışma bir saat daha sürer.' },
    { type: 'sfx', file: 'bell.mp3' },
    { type: 'expr', id: 'teacher', file: 'teacher_debate_calm.png' }, // tartışma kapanıyor
    { type: 'say', speaker: TEACHER_NAME, text: 'Neyse, bu konuyu başka bir derste daha açarız.' },
    { type: 'say', speaker: 'Bir öğrenci', text: 'Hocam, bu da mı sınava girecek?' },
    { type: 'say', speaker: TEACHER_NAME, text: 'Girmeyecek, ama unutma: sınavdan daha önemli meseleler var.' },
    { type: 'say', speaker: '', text: 'Sınıftan hafif bir kahkaha yükseliyor.' },
    { type: 'say', speaker: TEACHER_NAME, text: `${GIRL_NAME}, düşünmeye devam et. Ama bir gün bir yerde karar kılman gerekecek.` },
    { type: 'expr', id: 'girl', file: 'girl_neutral.svg' }, // tartışma biterken sakinleşir
    { type: 'say', speaker: GIRL_NAME, text: 'Belki.' },
    { type: 'say', speaker: '', text: '(İçinden) Ders bitse de şu yazıyı tamamlasam.' },
    { type: 'say', speaker: '', text: '(İçinden) Ya da hiç karar kılmam gerekmez, sadece sormaya devam ederim.' },
    { type: 'jump', goto: 'act2_magazine_intro' }
  ],

  // ---- 7) DERGİ TANITIMI — ilk doğal (romantik olmayan) diyalog ----
  act2_magazine_intro: [
    { type: 'say', speaker: TEACHER_NAME, text: 'Evet, sanırım sıra dergi kulübünde.' },
    { type: 'say', speaker: BOY_NAME, text: 'Teşekkürler hocam.' },
    { type: 'expr', id: 'boy', file: 'boy_neutral.svg' }, // sıra ona geldi, işine döner
    { type: 'sfx', file: 'page.mp3' },
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
        { text: 'Kısa hikayeleri', goto: 'act2_magazine_ask_stories', set: { dergi: 'hikaye' } },
        { text: 'Okul etkinliklerini', goto: 'act2_magazine_ask_events', set: { dergi: 'etkinlik' } }
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
    { type: 'say', speaker: '', text: '(İçinden) Tartışmanın ortasına düştü ama hiç sıkılmış görünmedi.' },
    { type: 'say', speaker: '', text: '(İçinden) Üçte yarışma var. Şu son tur sorularına bir daha bakayım.' },
    { type: 'hide', id: 'girl' },
    { type: 'jump', goto: 'act2_end' }
  ],

  // ---- 9) Perde sonu kartı. ACT III hazır olduğu için doğrudan ona bağlanıyor. ----
  act2_end: [
    { type: 'say', speaker: '', text: 'Perde II — Okul' },
    { type: 'say', speaker: '', text: 'Perde III — Konuşma' },
    { type: 'end', next: 'act3_start' }
  ],

  // ================= ACT III: KONUŞMA (SON PERDE) =================
  //
  // Süreklilik notu: Yahya ve İnci ACT II'de zaten karşılaşmış, birbirini
  // görmüş ve kısaca konuşmuştu (dergi tanıtımı, sınıftaki tartışma).
  // Yani burada "yabancı -> ilk tanışma" değil, "tanıdık bir yüz -> ilk
  // gerçek sohbet" var. Yeniden "Ben X, Ben Y, tanışmamıştık" sahnesi YOK.
  // Yahya, ACT II'de öğretmenin İnci'yi adıyla defalarca çağırmasından
  // dolayı onun adını zaten biliyor; İnci ise Yahya'nın adını hiç
  // duymamıştı (Yahya sınıfa girerken sadece "dergi kulübünden geldim"
  // demişti) — bu yüzden "Bu arada, adın neydi?" sorusu İnci'den doğal ve
  // gerekçeli şekilde geliyor, yapay bir yeniden tanışma değil.

  // Sahne 1 (İnci POV) — ACT II'nin bittiği yerden devam. Önce kendi gününe dair düşünceler.
  act3_start: [
    { type: 'bg', file: 'school_gate_evening.svg' },
    { type: 'bgm', file: 'evening_walk.mp3' },
    { type: 'show', id: 'girl', file: 'girl_neutral.svg', position: 'center', transition: 'fade' },
    { type: 'camera', effect: 'slide-left' },
    { type: 'say', speaker: '', text: 'Ders bitmiş, koridorlar yavaş yavaş boşalıyor.' },
    { type: 'say', speaker: '', text: 'Yarışma da bitti; konferans salonundan çıkan son gruptu.' },
    {
      type: 'say', speaker: '',
      text: (game) => bayragaGore(game, 'sabah_tekrar', {
        kutuphane: '(İçinden) Sabah baktığım direnç sorularından ikisi çıktı. İyi ki bakmışım.',
        bahce: '(İçinden) Sabah tekrar etseydim o iki soruyu da bilirdim herhalde.'
      }, '(İçinden) Fena gitmedi sayılır.')
    },
    { type: 'expr', id: 'girl', file: 'girl_happy.svg' },
    { type: 'say', speaker: '', text: '(İçinden) Dergideki kısa hikayeye bir göz atmayı unutmamalıyım.' },
    { type: 'expr', id: 'girl', file: 'girl_neutral.svg' },
    { type: 'say', speaker: '', text: 'Çantasını omzuna atıp yürümeye devam ediyor.' },
    { type: 'say', speaker: '', text: '(İçinden) Eve gidince önce biraz uzanmak var planda.' },
    { type: 'say', speaker: '', text: 'Az ileride, tanıdık bir siluet dikkatini çekiyor.' },
    { type: 'jump', goto: 'act3_girl_notices' }
  ],

  // Sahne 2 (İnci POV) — Yahya'yı fark edip ACT II'den hatırlaması.
  act3_girl_notices: [
    { type: 'camera', effect: 'zoom-in' },
    { type: 'say', speaker: '', text: '(İçinden) Dergi kulübündeki çocuk.' },
    { type: 'say', speaker: '', text: '(İçinden) Bu sefer elinde dergi yok.' },
    { type: 'say', speaker: '', text: '(İçinden) Tartışmanın tam ortasına girip hiç bozuntuya vermemişti.' },
    { type: 'say', speaker: '', text: 'Aynı yöne doğru yürüyorlar galiba.' },
    { type: 'jump', goto: 'act3_boy_pov' }
  ],

  // Sahne 3 (Yahya POV) — yaklaşmadan önce, özgüvenli ama doğal. ACT II'ye açık referans var.
  act3_boy_pov: [
    { type: 'camera', effect: 'zoom-out' },
    { type: 'hide', id: 'girl' },
    { type: 'say', speaker: '', text: '— Bakış açısı değişiyor —' },
    { type: 'show', id: 'boy', file: 'boy_neutral.svg', position: 'center', transition: 'fade' },
    { type: 'say', speaker: '', text: '(İçinden) Az önce sınıfta konuşmuştuk zaten, bahaneye gerek yok.' },
    { type: 'expr', id: 'boy', file: 'boy_serious.svg' }, // kendini toparlıyor
    { type: 'say', speaker: '', text: "(İçinden) Sadece 'selam' demek bu kadar zor olmamalı." },
    { type: 'camera', effect: 'zoom-in' },
    { type: 'jump', goto: 'act3_greeting' }
  ],

  // Sahne 4 — doğal bir selamlaşma, yeniden tanışma yok. İsim asimetrisi burada doğal şekilde kapanıyor.
  act3_greeting: [
    { type: 'hide', id: 'boy' },
    { type: 'show', id: 'girl', file: 'girl_neutral.svg', position: 'left', transition: 'fade' },
    { type: 'show', id: 'boy', file: 'boy_neutral.svg', position: 'right', transition: 'fade' },
    { type: 'say', speaker: BOY_NAME, text: 'Selam.' },
    { type: 'say', speaker: GIRL_NAME, text: 'Selam.' },
    { type: 'expr', id: 'boy', file: 'boy_happy.svg' }, // şakayla açılış
    { type: 'say', speaker: BOY_NAME, text: 'Bu sefer dergi yok, azıcık daha hafif geziyorum.' },
    { type: 'say', speaker: GIRL_NAME, text: 'Sınıfa girdiğinde ortalık biraz karışıktı.' },
    { type: 'say', speaker: BOY_NAME, text: 'Fark ettim. Kapıyı açtığımda bir an geri çıkmayı düşündüm.' },
    { type: 'say', speaker: BOY_NAME, text: 'Ama sen hiç geri adım atmıyordun, o yüzden kaldım.' },
    { type: 'expr', id: 'boy', file: 'boy_neutral.svg' }, // konu ciddileşiyor
    { type: 'say', speaker: GIRL_NAME, text: 'Hoca da atmıyor. Sorun da orada zaten.' },
    { type: 'say', speaker: GIRL_NAME, text: 'Bu arada, adın neydi?' },
    { type: 'say', speaker: BOY_NAME, text: 'Yahya.' },
    { type: 'say', speaker: GIRL_NAME, text: 'Yahya. Tamam.' },
    { type: 'jump', goto: 'act3_talk_magazine' }
  ],

  // Sahne 5 — dergi/okul üzerinden doğal sohbet. İnci en az bir kez kendi isteğiyle soru soruyor.
  act3_talk_magazine: [
    { type: 'say', speaker: BOY_NAME, text: 'Dergiyi okudun mu bu arada?' },
    { type: 'say', speaker: GIRL_NAME, text: 'Kısa hikaye bölümüne bakacaktım ama vakit olmadı.' },
    { type: 'say', speaker: BOY_NAME, text: 'Acele etme, dergi kaçmıyor bir yere.' },
    { type: 'expr', id: 'girl', file: 'girl_happy.svg' },
    { type: 'say', speaker: GIRL_NAME, text: 'Sen hep dağıtıma gönüllü mü oluyorsun, yoksa illa sana mı kalıyor?' },
    { type: 'say', speaker: BOY_NAME, text: 'Aslında sırada ben değildim, ama kimse gitmek istemeyince ben çıkıyorum.' },
    { type: 'say', speaker: BOY_NAME, text: 'Sınıfları gezmek hoşuma gidiyor, o kadar.' },
    { type: 'expr', id: 'girl', file: 'girl_neutral.svg' },
    { type: 'say', speaker: GIRL_NAME, text: 'Yani severek yapıyorsun ama itiraf etmiyorsun.' },
    { type: 'say', speaker: BOY_NAME, text: 'Belki.' },
    { type: 'expr', id: 'boy', file: 'boy_happy.svg' }, // yazıyı gerçekten okumuş
    { type: 'say', speaker: BOY_NAME, text: 'Bu arada, geçen sayıdaki jokeylik yazısı senindi değil mi?' },
    { type: 'expr', id: 'girl', file: 'girl_surprised.svg' },
    { type: 'say', speaker: '', text: '(İçinden) Okumuş demek.' },
    { type: 'say', speaker: GIRL_NAME, text: 'Benimdi. Kimsenin okuduğunu sanmıyordum.' },
    { type: 'say', speaker: BOY_NAME, text: 'Ben okudum. Jokeylerin kilo tutma kısmını üç kere okudum, hâlâ inanamıyorum.' },
    { type: 'expr', id: 'girl', file: 'girl_happy.svg' },
    { type: 'say', speaker: GIRL_NAME, text: 'O kısmı ben de üç kere yazdım zaten.' },
    { type: 'expr', id: 'girl', file: 'girl_neutral.svg' },
    { type: 'jump', goto: 'act3_talk_personal' }
  ],

  // Sahne 6 — sohbet kişisel ama hâlâ gündelik bir noktaya kayıyor. İnci aktif katılıyor.
  act3_talk_personal: [
    { type: 'say', speaker: BOY_NAME, text: 'Sınıftaki tartışma hep böyle mi geçiyor?' },
    { type: 'say', speaker: GIRL_NAME, text: 'Genelde daha sakin ama hoca bazen resmen kışkırtıyor.' },
    { type: 'expr', id: 'girl', file: 'girl_happy.svg' },
    { type: 'say', speaker: GIRL_NAME, text: 'Ben de fırsatı kaçırmıyorum tabii.' },
    { type: 'say', speaker: BOY_NAME, text: 'Belli oluyordu.' },
    { type: 'say', speaker: '', text: '(İçinden) Beklediğimden daha kolay konuşuluyor.' },
    { type: 'say', speaker: BOY_NAME, text: 'Dergi kulübüne katılmayı hiç düşündün mü?' },
    { type: 'say', speaker: GIRL_NAME, text: 'Pek sayılmaz, ama yazı kısmına bakmayı seviyorum.' },
    { type: 'say', speaker: BOY_NAME, text: 'Sen hep böyle mi soru sormayı seversin?' },
    { type: 'say', speaker: GIRL_NAME, text: 'Galiba hep. Cevap verilmeyen bir soru beni rahatsız ediyor.' },
    { type: 'expr', id: 'girl', file: 'girl_neutral.svg' },
    { type: 'jump', goto: 'act3_pause' }
  ],

  // Sahne 7 — kısa sessizlik / doğal ayrılma sinyali.
  act3_pause: [
    { type: 'say', speaker: '', text: 'Kısa bir sessizlik oluyor, ikisi de bir şey söylemiyor.' },
    { type: 'say', speaker: '', text: 'Koridordaki kalabalık iyice azalmış.' },
    { type: 'say', speaker: BOY_NAME, text: 'Herhalde senin de gitmen gerekiyordur.' },
    { type: 'say', speaker: GIRL_NAME, text: 'Birazdan, evet.' },
    { type: 'jump', goto: 'act3_coffee_offer' }
  ],

  // Sahne 8 — kahve teklifi, sohbetin doğal bir sonucu olarak (hazır bir bahane cümlesi değil).
  act3_coffee_offer: [
    { type: 'say', speaker: '', text: 'Yahya bir an duraksıyor, sanki söyleyip söylememek arasında kararsız.' },
    { type: 'say', speaker: BOY_NAME, text: 'Bu arada... seninle konuşmak iyi geldi.' },
    { type: 'say', speaker: BOY_NAME, text: 'Bir ara kahve içmek ister misin?' },
    { type: 'say', speaker: '', text: '(İçinden) Bunu bekliyor muydum, beklemiyor muydum, emin değilim.' },
    {
      type: 'say', speaker: '',
      text: (game) => bayragaGore(game, 'sabah_kahve', {
        'true': '(İçinden) Bugünün ikinci kahvesi olurdu.',
        'false': '(İçinden) Sabah almadım zaten; bugün hiç kahve içmedim.'
      }, '(İçinden) Kahve kısmına itirazım yok.')
    },
    {
      type: 'choice',
      prompt: 'Ne cevap verse iyi olur?',
      options: [
        { text: 'Olur.', goto: 'act3_yes', set: { kahve: 'olur' } },
        { text: 'Belki... önce biraz tanışsak?', goto: 'act3_getknow', set: { kahve: 'belki' } },
        { text: 'Teşekkür ederim ama istemiyorum.', goto: 'act3_no', set: { kahve: 'hayir' } }
      ]
    }
  ],

  // Sahne 9, seçim 1 — EVET. Sakin, gündelik, aşk ilanı değil.
  act3_yes: [
    { type: 'say', speaker: GIRL_NAME, text: 'Olur.' },
    { type: 'expr', id: 'boy', file: 'boy_happy.svg' }, // teklifi kabul edildi
    { type: 'say', speaker: BOY_NAME, text: 'Cidden mi? Güzel.' },
    { type: 'say', speaker: GIRL_NAME, text: 'Ama önce kısa hikayeyi okuyayım, sonra ne zaman olacağını konuşuruz.' },
    { type: 'say', speaker: BOY_NAME, text: 'Tabii, acelesi yok.' },
    { type: 'say', speaker: '', text: '(İçinden) Fena bir fikir değilmiş, kahveyi zaten seviyorum.' },
    { type: 'jump', goto: 'act3_end_olur' }
  ],

  // Sahne 9, seçim 2 — ÖNCE TANIŞALIM. Sınır koyuyor ama kapıyı kapatmıyor; gizli bir "evet" değil.
  act3_getknow: [
    { type: 'say', speaker: GIRL_NAME, text: 'Belki... önce biraz tanışsak?' },
    { type: 'expr', id: 'boy', file: 'boy_happy.svg' }, // acele ettirmiyor
    { type: 'say', speaker: BOY_NAME, text: 'Olur, sorun değil.' },
    { type: 'say', speaker: BOY_NAME, text: 'Zaten sınıflarımız yakın, sık karşılaşırız herhalde.' },
    { type: 'say', speaker: GIRL_NAME, text: 'Muhtemelen.' },
    { type: 'say', speaker: '', text: '(İçinden) Acele etmeme gerek yok, zaman var.' },
    { type: 'jump', goto: 'act3_end_belki' }
  ],

  // Sahne 9, seçim 3 — HAYIR. Kötü son değil; karşılıklı saygı korunuyor.
  act3_no: [
    { type: 'say', speaker: GIRL_NAME, text: 'Teşekkür ederim ama istemiyorum.' },
    { type: 'say', speaker: BOY_NAME, text: 'Tamam, sorun değil.' },
    { type: 'say', speaker: BOY_NAME, text: 'Yine de konuşmak iyiydi, dergiyi de unutma.' },
    { type: 'expr', id: 'girl', file: 'girl_happy.svg' },
    { type: 'say', speaker: GIRL_NAME, text: 'Unutmam, merak etme.' },
    { type: 'say', speaker: '', text: '(İçinden) Rahat biriymiş, cevabımı hiç dert etmedi.' },
    { type: 'jump', goto: 'act3_end_hayir' }
  ],

  // Kapanış — her üç seçim de buraya bağlanır. Sade final; oyuncuya doğrudan mesaj veren meta cümle yok.
  // ---- Kapanış: kahve cevabına göre üç ayrı sahne, sonra ortak final ----

  act3_end_olur: [
    { type: 'say', speaker: '', text: 'İkisi bahçe kapısına doğru yürümeye başlıyor.' },
    { type: 'say', speaker: BOY_NAME, text: 'Peki nasıl haberleşiyoruz? Kulüp masasına not mu bırakayım?' },
    { type: 'expr', id: 'girl', file: 'girl_happy.svg' },
    { type: 'say', speaker: GIRL_NAME, text: 'Not bırakmak sana daha çok yakışır ama numara daha hızlı.' },
    { type: 'expr', id: 'boy', file: 'boy_happy.svg' },
    { type: 'say', speaker: BOY_NAME, text: 'Haftaya bir gün derim o zaman.' },
    { type: 'expr', id: 'girl', file: 'girl_neutral.svg' },
    { type: 'say', speaker: GIRL_NAME, text: '"Bir gün" demek yerine gün söyle, ben ona göre bakayım.' },
    { type: 'say', speaker: BOY_NAME, text: 'Perşembe.' },
    { type: 'say', speaker: GIRL_NAME, text: 'Perşembe olur.' },
    { type: 'jump', goto: 'act3_ending' }
  ],

  act3_end_belki: [
    { type: 'say', speaker: '', text: 'Acelesi olmayan bir tempoyla kapıya doğru yürüyorlar.' },
    { type: 'say', speaker: BOY_NAME, text: 'Dergiyi kulüp masasında bırakırım, teneffüste uğrarsın.' },
    { type: 'say', speaker: GIRL_NAME, text: 'Uğrarım.' },
    { type: 'expr', id: 'boy', file: 'boy_happy.svg' },
    { type: 'say', speaker: BOY_NAME, text: 'Bir de şu jokeylik yazısının devamı gelecek mi?' },
    { type: 'expr', id: 'girl', file: 'girl_happy.svg' },
    { type: 'say', speaker: GIRL_NAME, text: 'Gelirse haber veririm.' },
    { type: 'expr', id: 'girl', file: 'girl_neutral.svg' },
    { type: 'jump', goto: 'act3_ending' }
  ],

  act3_end_hayir: [
    { type: 'say', speaker: '', text: 'Yahya çantasını omzuna atıyor; ısrar etmiyor, konuyu da uzatmıyor.' },
    { type: 'say', speaker: BOY_NAME, text: 'Dergiyi yine de bırakırım. Bu sayıda kısa hikayeler fena değil.' },
    { type: 'say', speaker: GIRL_NAME, text: 'Bakarım.' },
    { type: 'say', speaker: '', text: 'Kapıda ayrılıyorlar. İkisi de tuhaf hissetmiyor.' },
    { type: 'jump', goto: 'act3_ending' }
  ],

  // Ortak final: oyuncunun bugün verdiği kararları hatırlar.
  act3_ending: [
    { type: 'hide', id: 'girl' },
    { type: 'hide', id: 'boy' },
    { type: 'camera', effect: 'zoom-out' },
    { type: 'say', speaker: '', text: 'Okulun bahçe kapısı. Gün, sabah düşündüğünden uzun sürdü.' },
    {
      type: 'say', speaker: '',
      text: (game) => bayragaGore(game, 'semsiye', {
        'true': 'Şemsiye bütün gün çantanın dibinde durdu; bir kez bile açılmadı.',
        'false': 'Hava kapanmadı. Şemsiyeyi almamak bugünlük doğru karar çıktı.'
      }, 'Hava akşama doğru serinlemiş.')
    },
    {
      type: 'say', speaker: '',
      text: (game) => ({
        felsefi: '(İçinden) Sorduğum soruların cevabını alamadım. Soruları geri de almadım.',
        dogrudan: '(İçinden) Bugün lafı dolandırmadım. Yarın da dolandırmam herhalde.',
        sakin: '(İçinden) Sesimi hiç yükseltmeden söyleyeceğimi söyledim.'
      })[baskinTavir(game)]
    },
    {
      type: 'say', speaker: '',
      text: (game) => bayragaGore(game, 'dergi', {
        hikaye: '(İçinden) Akşam şu kısa hikayelere bakarım.',
        etkinlik: '(İçinden) Sergi fotoğraflarına bakarım bari.'
      }, '(İçinden) Dergiyi çantadan çıkarmayı unutmasam.')
    },
    {
      type: 'say', speaker: '',
      text: (game) => bayragaGore(game, 'kahve', {
        olur: '(İçinden) Perşembe. Tamam, not aldım sayılır.',
        belki: '(İçinden) Acelesi yok. Zaten olacaksa acelesi olmaz.',
        hayir: '(İçinden) Bugün birkaç kez hayır dedim. Hepsi aynı sebepten değildi.'
      }, '(İçinden) Uzun bir gündü.')
    },
    { type: 'say', speaker: '', text: 'Çantasını omzuna alıp kapıdan çıkıyor.' },
    {
      type: 'say', speaker: GIRL_NAME,
      text: (game) => bayragaGore(game, 'sabah_kahve', {
        'true': 'Eve giderken bir kahve daha alırım.',
        'false': 'Eve giderken bir kahve alırım. Bugün hiç içmedim.'
      }, 'Eve giderken bir kahve alırım.')
    },
    { type: 'bg', file: null },
    { type: 'say', speaker: '', text: 'Kahve Oyunu' },
    { type: 'say', speaker: '', text: '— Son —' },
    { type: 'end' }
  ]
};

const STORY_START_LABEL = 'act1_start';
