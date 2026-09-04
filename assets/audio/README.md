# Ses dosyaları

Bu klasöre dosya koyman yeterli — oyun otomatik olarak dosyayı çalar.
Dosya yoksa aynı ses oyunun içinde WebAudio ile üretilir (`js/synth.js`),
yani eksik dosya sessizlik bırakmaz. Davranışı `js/config.js` içindeki
`audioMode` belirler: `'auto'` (varsayılan), `'files'`, `'synth'`.

## Beklenen dosya adları

| Dosya                | Nerede çalar                          | Not                          |
|----------------------|---------------------------------------|------------------------------|
| `morning_theme.mp3`  | ACT I — sabah, ev ve yürüyüş          | döngüye girer, sonu başına bağlanmalı |
| `school_day.mp3`     | ACT II — okul (kulüp, koridor, sınıf) | döngüye girer                |
| `evening_walk.mp3`   | ACT III — okul çıkışı, akşamüstü      | döngüye girer                |
| `alarm.mp3`          | Çalar saat (ACT I başı)               | 1–2 sn                       |
| `bell.mp3`           | Ders zili (ACT I sonu, ACT II sonu)   | 1–2 sn                       |
| `page.mp3`           | Dergi sayfası çevirme                 | < 1 sn                       |
| `door.mp3`           | Sınıf kapısının açılması              | < 1 sn                       |

Sadece bazılarını koyabilirsin; koymadıklarında üretilmiş ses devreye girer.

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
