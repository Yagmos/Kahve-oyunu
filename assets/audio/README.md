# Ses dosyaları

Bu klasöre dosya koyman yeterli — oyun otomatik olarak dosyayı çalar.
Dosya yoksa aynı ses oyunun içinde WebAudio ile üretilir (`js/synth.js`),
yani eksik dosya sessizlik bırakmaz. Davranışı `js/config.js` içindeki
`audioMode` belirler: `'auto'` (varsayılan), `'files'`, `'synth'`.

## Şu an kullanılan dosyalar

| Dosya                | Nerede çalar                                   |
|----------------------|------------------------------------------------|
| `alarm_loop.mp3`     | ACT I — açılış; oyuncu ekrana dokunana kadar döner |
| `alarm.mp3`          | Erteleyince kısa bir kez daha çalar              |
| `bedroom_theme.mp3`  | ACT I — ilk dokunuştan sonra, İnci'nin odası     |
| `club_room.mp3`      | ACT II — dergi kulübü odası                     |
| `debate.mp3`         | ACT II — İnci ile Badem Öziş'in tartışması      |
| `objection.mp3`      | ACT II — iddialı replikte kısa itiraz efekti    |
| `offer.mp3`          | ACT III — kahve teklifi anı                     |
| `accept.mp3`         | ACT III — teklif kabul edilirse                 |
| `maybe.mp3`          | ACT III — "önce biraz tanışsak" denirse         |
| `decline.mp3`        | ACT III — teklif reddedilirse                   |

Hepsi mono / 32 kHz / 64 kbps'e çevrildi, 100-130 saniyeye kırpıldı ve
loudnorm ile -16 LUFS'a eşitlendi; başta 1.5 sn açılma, sonda 2.5 sn kapanma
var (döngüye girdiğinde sert kesmesin diye). Tek dosyalık paylaşılabilir
sürüme bu boyutlarla sığıyor.

## Henüz dosyası olmayanlar (üretilmiş sesle çalıyor)

| Dosya                | Nerede çalar                          | Not                          |
|----------------------|---------------------------------------|------------------------------|
| `morning_theme.mp3`  | ACT I — sokak, okul bahçesi           | döngüye girer                |
| `school_day.mp3`     | ACT II — okul (kulüp, koridor, sınıf) | döngüye girer                |
| `evening_walk.mp3`   | ACT III — okul çıkışı (teklif öncesi) | döngüye girer                |
| `bell.mp3`           | Ders zili (ACT I sonu, ACT II sonu)   | 1–2 sn                       |
| `page.mp3`           | Dergi sayfası çevirme                 | < 1 sn                       |
| `door.mp3`           | Sınıf kapısının açılması              | < 1 sn                       |

Sadece bazılarını koyabilirsin; koymadıklarında üretilmiş ses devreye girer.

## Geçişler

Parçalar arasında çapraz geçiş var: yeni parça yumuşakça açılırken eski parça
kısılıyor. Varsayılan süreler 2.2 sn açılma / 1.2 sn kapanma; hikâyede bir
`bgm` adımına `fadeIn` / `fadeOut` (saniye) yazarak değiştirilebilir.

## Öneriler

- **Uzunluk/boyut:** Müzikler tek dosyalık paylaşılabilir sürüme (base64
  olarak) gömülüyor. Parça başına **1–2 MB**'ı geçmemeye çalış; 60–90 saniyelik
  bir döngü, mono, 96–128 kbps fazlasıyla yeterli. Toplam paket 16 MB'ı
  aşmamalı.
- **Döngü:** Müzikler `loop` ile çalıyor; başı ve sonu birbirine bağlanan
  parçalar seç, yoksa her turda duyulur bir kesinti olur.
- **Seviye:** Müzikler fon; efektlerden belirgin şekilde kısık olmalı. Çok
  yüksek masterlanmış parçalarda oyun içi ses ayarını kısman gerekebilir.
- **Telif:** Oyunu birine göndereceksen kullanım hakkı sende olan ya da
  telifsiz parçalar seç.
