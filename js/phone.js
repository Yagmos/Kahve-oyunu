/**
 * PhoneManager: karakterin telefonunu basit, kurgusal bir arayüz olarak
 * gösterir (gerçek internet/bildirim gerektirmez). Mevcut overlay-panel
 * stilini kullanır; Game.js bunu 'phone' adım tipiyle tetikler.
 *
 * İki görünüm var:
 *   - Ana ekran: bildirimler, ders programı, uygulama satırı.
 *   - Uygulama: Instagram / Galeri / Notlar. Geri tuşuyla ana ekrana dönülür.
 * Uygulama içerikleri story.js'teki 'phone' adımının `apps` alanından gelir;
 * veri verilmeyen uygulama ana ekranda hiç görünmez.
 */

/** Kilitli albümün açık kalması için kayıt anahtarı. */
const GALLERY_UNLOCK_KEY = 'kahveOyunu.galeri.v1';

/** Uygulama tanımları: sıra, ad ve simge burada. */
const PHONE_APPS = [
  { id: 'instagram', label: 'Instagram', icon: '◎', cls: 'ig' },
  { id: 'gallery', label: 'Galeri', icon: '❖', cls: 'gal' },
  { id: 'notes', label: 'Notlar', icon: '✎', cls: 'note' }
];

class PhoneManager {
  constructor(refs) {
    this.panelEl = refs.panelEl;
    this.timeEl = refs.timeEl;
    this.dateEl = refs.dateEl;
    this.notificationsEl = refs.notificationsEl;
    this.scheduleEl = refs.scheduleEl;

    this.appsEl = refs.appsEl || null;
    this.homeEl = refs.homeEl || null;
    this.appEl = refs.appEl || null;
    this.appTitleEl = refs.appTitleEl || null;
    this.appBodyEl = refs.appBodyEl || null;
    this.backBtn = refs.backBtn || null;

    this.apps = {};
    if (this.backBtn) this.backBtn.addEventListener('click', () => this.openHome());
  }

  /**
   * @param {{time?:string, date?:string,
   *          notifications?:{app:string, from?:string, text:string}[],
   *          schedule?:{time:string, subject:string, highlight?:boolean}[],
   *          apps?:{instagram?:object, gallery?:object, notes?:object}}} data
   */
  show(data) {
    this.timeEl.textContent = (data && data.time) || '';
    this.dateEl.textContent = (data && data.date) || '';

    this._renderNotifications((data && data.notifications) || []);
    this._renderSchedule((data && data.schedule) || []);

    this.apps = (data && data.apps) || {};
    this._renderAppRow();
    this.openHome();

    this.panelEl.classList.remove('hidden');
  }

  hide() {
    this._stopMedia();
    this.panelEl.classList.add('hidden');
  }

  /** Ana ekrana dön (uygulamadaki video da durur). */
  openHome() {
    this._stopMedia();
    if (this.homeEl) this.homeEl.classList.remove('hidden');
    if (this.appEl) this.appEl.classList.add('hidden');
  }

  /** Bir uygulamayı aç. */
  openApp(id) {
    const def = PHONE_APPS.find((a) => a.id === id);
    const data = this.apps[id];
    if (!def || !data || !this.appEl) return;

    this.appTitleEl.textContent = def.label;
    this.appBodyEl.innerHTML = '';
    this._seçiliFoto = null;
    this._açıkNot = null;
    if (id === 'instagram') this._renderInstagram(data);
    else if (id === 'gallery') this._renderGallery(data);
    else if (id === 'notes') this._renderNotes(data);

    this.homeEl.classList.add('hidden');
    this.appEl.classList.remove('hidden');
    // Kaydırılan asıl kutu görünümün kendisi; başlık da onun içinde.
    // Sadece gövdeyi sıfırlamak yetmiyordu, uygulama yarı kaydırılmış açılıyordu.
    this.appEl.scrollTop = 0;
    this.appBodyEl.scrollTop = 0;
  }

  /** Panel kapanınca/geri dönülünce açık kalan videoyu durdurur. */
  _stopMedia() {
    if (!this.appBodyEl) return;
    this.appBodyEl.querySelectorAll('video').forEach((v) => {
      try { v.pause(); } catch (e) { /* yoksay */ }
    });
  }

  _renderAppRow() {
    if (!this.appsEl) return;
    this.appsEl.innerHTML = '';
    const görünen = PHONE_APPS.filter((a) => this.apps[a.id]);
    this.appsEl.parentElement.classList.toggle('hidden', görünen.length === 0);

    görünen.forEach((app) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'phone-app-btn';
      btn.dataset.app = app.id;

      const icon = document.createElement('span');
      icon.className = 'phone-app-icon ' + app.cls;
      icon.textContent = app.icon;
      btn.appendChild(icon);

      const rozet = this.apps[app.id].badge;
      if (rozet) {
        const b = document.createElement('span');
        b.className = 'phone-app-badge';
        b.textContent = String(rozet);
        btn.appendChild(b);
      }

      const label = document.createElement('span');
      label.textContent = app.label;
      btn.appendChild(label);

      btn.addEventListener('click', () => this.openApp(app.id));
      this.appsEl.appendChild(btn);
    });
  }

  // ---- Instagram ----

  _renderInstagram(data) {
    const kullanıcı = data.user || 'kullanici';
    (data.posts || []).forEach((post) => {
      const kart = document.createElement('article');
      kart.className = 'ig-post';

      const baş = document.createElement('div');
      baş.className = 'ig-head';
      const avatar = document.createElement('span');
      avatar.className = 'ig-avatar';
      baş.appendChild(avatar);
      baş.appendChild(document.createTextNode(post.user || kullanıcı));
      kart.appendChild(baş);

      const medya = document.createElement('div');
      medya.className = 'ig-media';
      if (post.video) {
        const v = document.createElement('video');
        v.src = assetPath('video', post.video);
        v.controls = true;
        v.playsInline = true;
        v.preload = 'metadata';
        if (post.poster) v.poster = assetPath('phone', post.poster);
        medya.appendChild(v);
      } else if (post.image) {
        const img = document.createElement('img');
        img.src = assetPath('phone', post.image);
        img.alt = post.caption || '';
        medya.appendChild(img);
      } else {
        medya.className = 'ig-empty';
        medya.textContent = post.placeholder || 'Gönderi yüklenemedi.';
      }
      kart.appendChild(medya);

      if (post.caption) {
        const alt = document.createElement('div');
        alt.className = 'ig-caption';
        const ad = document.createElement('b');
        ad.textContent = (post.user || kullanıcı) + ' ';
        alt.appendChild(ad);
        alt.appendChild(document.createTextNode(post.caption));
        kart.appendChild(alt);
      }

      // Yorumlar: gönderinin altında, gerçek uygulamadaki gibi kısa liste.
      if (post.comments && post.comments.length) {
        const yorumlar = document.createElement('div');
        yorumlar.className = 'ig-comments';
        post.comments.forEach((yorum) => {
          const satır = document.createElement('div');
          satır.className = 'ig-comment';
          const ad = document.createElement('b');
          ad.textContent = (yorum.user || '') + ' ';
          satır.appendChild(ad);
          satır.appendChild(document.createTextNode(yorum.text || ''));
          yorumlar.appendChild(satır);
        });
        kart.appendChild(yorumlar);
      }

      this.appBodyEl.appendChild(kart);
    });
  }

  // ---- Galeri ----

  _renderGallery(data) {
    // Seçilen fotoğraf ızgaranın üstünde büyür; liste ekranda kalır, böylece
    // diğer fotoğraflara bakmak için geri gitmek gerekmez.
    if (this._seçiliFoto) this.appBodyEl.appendChild(this._büyükFoto(data));
    this._grid(data.items || [], data, data.note);

    // Kilitli albüm: doğru kod girilene kadar hücreler "?" olarak durur.
    const kilitli = data.locked;
    if (!kilitli || !(kilitli.items || []).length) return;

    const başlık = document.createElement('div');
    başlık.className = 'gal-caption';
    başlık.style.marginTop = '6px';
    başlık.textContent = kilitli.title || 'Kilitli albüm';
    this.appBodyEl.appendChild(başlık);

    if (this._isUnlocked(kilitli)) {
      this._grid(kilitli.items, data, kilitli.openNote || '');
      return;
    }

    const ızgara = document.createElement('div');
    ızgara.className = 'gal-grid';
    kilitli.items.forEach(() => {
      const hücre = document.createElement('div');
      hücre.className = 'gal-cell gal-locked';
      ızgara.appendChild(hücre);
    });
    this.appBodyEl.appendChild(ızgara);
    this.appBodyEl.appendChild(this._codeForm(kilitli, data));
  }

  /** Fotoğraf ızgarası (hem açık hem çözülmüş albüm için). */
  _grid(öğeler, data, not) {
    const ızgara = document.createElement('div');
    ızgara.className = 'gal-grid';
    öğeler.forEach((öğe, i) => {
      const hücre = document.createElement('button');
      hücre.type = 'button';
      hücre.className = 'gal-cell';
      if (öğe.file) hücre.style.backgroundImage = `url("${assetPath('phone', öğe.file)}")`;
      hücre.setAttribute('aria-label', öğe.caption || `Fotoğraf ${i + 1}`);
      if (this._seçiliFoto === öğe) hücre.classList.add('gal-cell-active');
      hücre.addEventListener('click', () => {
        this._seçiliFoto = (this._seçiliFoto === öğe) ? null : öğe;
        this.appBodyEl.innerHTML = '';
        this._renderGallery(data);
        this.appEl.scrollTop = 0;
        this.appBodyEl.scrollTop = 0;
      });
      ızgara.appendChild(hücre);
    });
    this.appBodyEl.appendChild(ızgara);
    if (not) {
      const n = document.createElement('div');
      n.className = 'gal-caption';
      n.textContent = not;
      this.appBodyEl.appendChild(n);
    }
  }

  _isUnlocked(kilitli) {
    if (this._unlocked) return true;
    try {
      return localStorage.getItem(GALLERY_UNLOCK_KEY) === String(kilitli.code);
    } catch (e) {
      return false;   // gizli sekmede kayıt yoksa kilitli kalır
    }
  }

  _codeForm(kilitli, data) {
    const sarmal = document.createElement('div');
    sarmal.className = 'gal-code';

    const ipucu = document.createElement('div');
    ipucu.className = 'gal-caption';
    ipucu.textContent = kilitli.hint || 'Bu albüm kilitli.';
    sarmal.appendChild(ipucu);

    const satır = document.createElement('div');
    satır.className = 'gal-code-row';

    const giriş = document.createElement('input');
    giriş.type = 'text';
    giriş.inputMode = 'numeric';
    giriş.autocomplete = 'off';
    giriş.maxLength = String(kilitli.code).length;
    giriş.placeholder = '••••'.slice(0, String(kilitli.code).length);
    giriş.className = 'gal-code-input';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'gal-code-btn';
    btn.textContent = 'AÇ';

    const uyarı = document.createElement('div');
    uyarı.className = 'gal-caption';

    const dene = () => {
      if (giriş.value.trim() === String(kilitli.code)) {
        this._unlocked = true;
        try { localStorage.setItem(GALLERY_UNLOCK_KEY, String(kilitli.code)); } catch (e) { /* yoksay */ }
        this.appBodyEl.innerHTML = '';
        this._renderGallery(data);
      } else {
        uyarı.textContent = kilitli.wrongText || 'Kod yanlış.';
        giriş.value = '';
        sarmal.classList.remove('shake');
        void sarmal.offsetWidth;
        sarmal.classList.add('shake');
      }
    };
    btn.addEventListener('click', dene);
    giriş.addEventListener('keydown', (e) => { if (e.key === 'Enter') dene(); });

    satır.appendChild(giriş);
    satır.appendChild(btn);
    sarmal.appendChild(satır);
    sarmal.appendChild(uyarı);
    return sarmal;
  }

  /** Seçili fotoğrafın büyük hâli + açıklaması (ızgaranın üstünde durur). */
  _büyükFoto(data) {
    const öğe = this._seçiliFoto;
    const sarmal = document.createElement('div');
    sarmal.className = 'gal-open';

    if (öğe.file) {
      const img = document.createElement('img');
      img.src = assetPath('phone', öğe.file);
      img.alt = öğe.caption || '';
      sarmal.appendChild(img);
    }
    if (öğe.caption) {
      const alt = document.createElement('div');
      alt.className = 'gal-caption';
      alt.textContent = öğe.caption;
      sarmal.appendChild(alt);
    }

    const kapat = document.createElement('button');
    kapat.type = 'button';
    kapat.className = 'gal-close';
    kapat.textContent = 'Kapat';
    kapat.addEventListener('click', () => {
      this._seçiliFoto = null;
      this.appBodyEl.innerHTML = '';
      this._renderGallery(data);
    });
    sarmal.appendChild(kapat);
    return sarmal;
  }

  // ---- Notlar ----

  _renderNotes(data) {
    (data.items || []).forEach((not, i) => {
      const açık = this._açıkNot === i;

      const satır = document.createElement('button');
      satır.type = 'button';
      satır.className = 'note-row' + (açık ? ' note-row-open' : '');

      const başlık = document.createElement('div');
      başlık.className = 'note-row-title';
      başlık.textContent = not.title || 'Not';

      const tarih = document.createElement('div');
      tarih.className = 'note-row-date';
      tarih.textContent = not.date || '';

      satır.appendChild(başlık);
      satır.appendChild(tarih);
      // Akordiyon: açılan not listeyi silmez, sadece altında açılır.
      satır.addEventListener('click', () => {
        this._açıkNot = açık ? null : i;
        this.appBodyEl.innerHTML = '';
        this._renderNotes(data);
      });
      this.appBodyEl.appendChild(satır);

      if (açık) {
        const gövde = document.createElement('div');
        gövde.className = 'note-body';
        gövde.textContent = not.body || '';
        this.appBodyEl.appendChild(gövde);
      }
    });
  }

  // ---- Ana ekran listeleri ----

  _renderNotifications(notifications) {
    this.notificationsEl.innerHTML = '';
    notifications.forEach((n) => {
      const row = document.createElement('div');
      row.className = 'phone-row';

      const title = document.createElement('div');
      title.className = 'phone-row-title';
      title.textContent = n.from ? `${n.app} · ${n.from}` : n.app;

      const text = document.createElement('div');
      text.className = 'phone-row-text';
      text.textContent = n.text;

      row.appendChild(title);
      row.appendChild(text);
      this.notificationsEl.appendChild(row);
    });
  }

  _renderSchedule(schedule) {
    this.scheduleEl.innerHTML = '';
    schedule.forEach((entry) => {
      const row = document.createElement('div');
      row.className = 'phone-row phone-schedule-row' + (entry.highlight ? ' highlight' : '');

      const time = document.createElement('span');
      time.className = 'phone-schedule-time';
      time.textContent = entry.time;

      const subject = document.createElement('span');
      subject.className = 'phone-schedule-subject';
      subject.textContent = entry.subject;

      row.appendChild(time);
      row.appendChild(subject);
      this.scheduleEl.appendChild(row);
    });
  }
}
