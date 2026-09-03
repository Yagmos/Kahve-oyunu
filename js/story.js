/**
 * story.js — TEST SAHNESİ
 *
 * Bu dosya gerçek hikayeyi içermez; sadece motoru sergilemek için
 * küçük bir örnek sahne barındırır. Gerçek senaryo daha sonra
 * buradaki formatta (veya benzer bir yapıda) eklenecektir.
 *
 * Adım (step) tipleri:
 *   bg        { type:'bg', file }
 *   bgm       { type:'bgm', file }
 *   sfx       { type:'sfx', file }
 *   show      { type:'show', id, file, position, transition }
 *   expr      { type:'expr', id, file }
 *   hide      { type:'hide', id }
 *   camera    { type:'camera', effect }
 *   say       { type:'say', speaker, text }
 *   choice    { type:'choice', prompt, options:[{text, goto}] }
 *   jump      { type:'jump', goto }
 *   end       { type:'end' }
 *
 * "goto" bir etiket adıdır ve her zaman ilgili etiketin 0. adımına atlar.
 */
const STORY = {
  start: [
    { type: 'bg', file: 'bedroom_morning.svg' },
    { type: 'bgm', file: 'morning_theme.mp3' },
    { type: 'show', id: 'girl', file: 'girl_sleepy.svg', position: 'center', transition: 'fade' },
    { type: 'sfx', file: 'alarm.mp3' },
    { type: 'camera', effect: 'zoom-in' },
    { type: 'say', speaker: '', text: '*Çınnn çınnn çınnn* — alarm çalıyor.' },
    { type: 'say', speaker: 'Kız', text: 'Ah... beş dakika daha...' },
    { type: 'expr', id: 'girl', file: 'girl_annoyed.svg' },
    { type: 'say', speaker: 'Kız', text: 'Tamam tamam, kalkıyorum!' },
    { type: 'say', speaker: 'Kız', text: '(İçinden) Bugün nasıl bir gün olacak acaba?' },
    {
      type: 'choice',
      prompt: 'Ne yapmalı?',
      options: [
        { text: 'Önce bir kahve iç', goto: 'coffee' },
        { text: 'Vakit kaybetmeden işe koş', goto: 'rush' }
      ]
    }
  ],

  coffee: [
    { type: 'expr', id: 'girl', file: 'girl_happy.svg' },
    { type: 'say', speaker: 'Kız', text: 'Güne güzel bir kahveyle başlamalı.' },
    { type: 'say', speaker: 'Kız', text: 'Yavaşça mutfağa doğru yürüyor...' },
    { type: 'jump', goto: 'end_common' }
  ],

  rush: [
    { type: 'expr', id: 'girl', file: 'girl_surprised.svg' },
    { type: 'camera', effect: 'slide-left' },
    { type: 'say', speaker: 'Kız', text: 'Saat çok geç! Koşmalıyım!' },
    { type: 'say', speaker: 'Kız', text: 'Kapıya doğru fırlıyor...' },
    { type: 'jump', goto: 'end_common' }
  ],

  end_common: [
    { type: 'say', speaker: '', text: '— Test sahnesi sona erdi. Devamı yakında. —' },
    { type: 'end' }
  ]
};

const STORY_START_LABEL = 'start';
