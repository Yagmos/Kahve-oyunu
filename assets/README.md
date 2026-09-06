# Assets

Tüm dosya yolları `js/config.js` içindeki `CONFIG.paths` üzerinden merkezi olarak yönetilir.
Bir dosyayı değiştirmek için sadece aynı isimde yeni dosyayı ilgili klasöre koymanız,
veya `js/story.js` içindeki dosya adını güncellemeniz yeterlidir.

- `backgrounds/` — Sahne arka planları. `js/story.js` içinde `{ type:'bg', file:'...' }` ile kullanılır.
- `characters/` — Karakter sprite'ları (ifade başına bir dosya, ör. `girl_happy.svg`). `{ type:'show'|'expr', file:'...' }`
- `cg/` — Özel olay/CG görselleri (henüz kullanılmıyor, ileride eklenecek).
- `audio/` — Müzik ve ses efektleri (`.mp3`, `.ogg` vb.). `{ type:'bgm'|'sfx', file:'...' }`
- `ui/` — Arayüz ikon/görselleri (şu an metin/emoji kullanılıyor, ileride eklenebilir).

Şu anki içerikler **placeholder**'dır (basit SVG çizimler). Gerçek görseller eklendiğinde
aynı dosya adlarını kullanırsanız kodda hiçbir değişiklik gerekmez. Farklı isim/uzantı
kullanırsanız sadece `js/story.js` içindeki `file` değerlerini güncellemeniz yeterlidir.

Ses dosyaları henüz eklenmedi; `AudioManager` eksik ses dosyalarını sessizce atlayacak
şekilde tasarlandı, bu yüzden oyun sesler olmadan da sorunsuz çalışır.
