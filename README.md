# Selam Ben Yahya

Mobil öncelikli, üç perdelik bir görsel roman. Tek bir okul gününü
İnci'nin ve Yahya'nın gözünden anlatır; oyuncunun gün içinde verdiği
kararlar finalde karşılık bulur.

## Oynamak

Oyun tamamen statik bir site: sunucu, derleme adımı veya bağımlılık yok.

**GitHub Pages ile (paylaşılabilir bağlantı)**
1. Settings → Pages
2. Source: *Deploy from a branch*, dal: `claude/session-804rw5`, klasör: `/ (root)`
3. Birkaç dakika sonra `https://<kullanıcı>.github.io/Kahve-oyunu/` hazır olur

**Bilgisayarda**
```bash
python3 -m http.server 8000
# tarayıcıda http://localhost:8000
```

`index.html` dosyasına çift tıklamak **çalışmaz**: tarayıcı `file://`
üzerinden ses ve görselleri engeller, mutlaka bir sunucu üzerinden açılmalı.

## Yapı

```
index.html            tek sayfa; tüm ekranlar burada
css/style.css         arayüz, sahne ve telefon stilleri
js/config.js          yollar, ayar varsayılanları, çizim eşlemeleri
js/story.js           HİKAYE — tüm sahneler, replikler ve seçimler
js/game.js            adım yorumlayıcısı, kayıt, varlık önyükleme
js/scene.js           arka plan, karakter slotları, kamera efektleri
js/dialogue.js        yazı efekti, seçim arayüzü, geçmiş
js/portrait.js        konuşana göre portre ve POV çözümlemesi
js/debate.js          tartışma sahnesinin kendi görsel katmanı
js/phone.js           telefon arayüzü (Instagram, galeri, notlar)
js/audio.js           müzik/efekt, çapraz geçiş, dosya→synth yedeği
assets/               görseller, sesler, video
```

Hikayeyi değiştirmek için yalnızca `js/story.js` yeterlidir; sahneler
etiketlerden (label) oluşur, her etiket sıralı adımlardan meydana gelir.
Adım tipleri dosyanın başındaki açıklamada listelidir.

## Notlar

- Karakterler sahnede tam boy figür olarak değil, diyalog kutusundaki
  portrede ve tartışma sahnesinde görünür. Tam boy figürler
  `js/config.js` içindeki `SHOW_STANDING_CHARACTERS` ile geri açılabilir.
- Oyun başlarken tüm görseller, müzikler ve kafe videosu arka planda
  önden indirilir; oynanış sırasında ağdan dosya çekilmez.
- İlerleme her replikte tarayıcıya kaydedilir, ana menüdeki *Devam Et*
  ile sürdürülür.
