/**
 * PhoneManager: karakterin telefonunu basit, kurgusal bir arayüz olarak
 * gösterir (gerçek internet/bildirim gerektirmez). Mevcut overlay-panel
 * stilini kullanır; Game.js bunu 'phone' adım tipiyle tetikler.
 */
class PhoneManager {
  constructor(refs) {
    this.panelEl = refs.panelEl;
    this.timeEl = refs.timeEl;
    this.dateEl = refs.dateEl;
    this.notificationsEl = refs.notificationsEl;
    this.scheduleEl = refs.scheduleEl;
  }

  /**
   * @param {{time?:string, date?:string,
   *          notifications?:{app:string, from?:string, text:string}[],
   *          schedule?:{time:string, subject:string, highlight?:boolean}[]}} data
   */
  show(data) {
    this.timeEl.textContent = (data && data.time) || '';
    this.dateEl.textContent = (data && data.date) || '';

    this._renderNotifications((data && data.notifications) || []);
    this._renderSchedule((data && data.schedule) || []);

    this.panelEl.classList.remove('hidden');
  }

  hide() {
    this.panelEl.classList.add('hidden');
  }

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
