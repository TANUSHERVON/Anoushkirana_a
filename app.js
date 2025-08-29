/* Muslim Lite – Enhanced Version
   - Full Quran loader (offline starter + fetch once for all 114 surahs)
   - More accurate prayer times: high‑latitude rules, altitude correction, per‑prayer offsets
   - Same UI & PWA plumbing
*/
const $ = (s, p=document)=>p.querySelector(s);
const $$ = (s, p=document)=>[...p.querySelectorAll(s)];
const LS = (k,v)=> v===undefined ? localStorage.getItem(k) : localStorage.setItem(k, v);

const state = {
  lat: null, lon: null, altitude: +(LS('altitude')||0),
  method: LS('method') || 'MWL',
  asr: LS('asr') || 'Standard',
  highLat: LS('highLat') || 'AngleBased',
  offsets: JSON.parse(LS('offsets') || '{"fajr":0,"sunrise":0,"dhuhr":0,"asr":0,"maghrib":0,"isha":0}'),
  locLabel: '—',
  times: null, nextPrayer: null, bearing: null,
  provider: localStorage.getItem('provider') || 'offline',
  quran: null, surahList: [], currentSurah: 1, bismillah: true,
  searchTerm: ''
};
// ---- I18N ----
const I18N = {
  en: {
    home:"Home", qibla:"Qibla", tasbih:"Tasbih", quran:"Quran", calendar:"Calendar", settings:"Settings",
    today:"Today", next_prayer:"Next prayer", prayer_times:"Prayer times", quick_actions:"Quick actions",
    detect_location:"Detect location", mosques_near_me:"Mosques near me", add_to_calendar:"Add today to calendar (.ics)",
    qibla_direction:"Qibla direction", bearing_to_kaaba:"Bearing to Kaaba", device_heading:"Device heading",
    hijri_date:"Hijri date", gregorian:"Gregorian", location:"Location", latitude:"Latitude", longitude:"Longitude",
    save:"Save", use_dushanbe:"Use Dushanbe, TJ", calculation:"Calculation", method:"Method", asr_method:"Asr method",
    high_lat:"High‑latitude rule", altitude:"Altitude (meters)", offsets:"Fine‑tune offsets (minutes)",
    save_offsets:"Save offsets", reset:"Reset", source:"Source", note:"Note",
    source_offline:"Offline (on-device)", source_online:"Online (by location)",
    install:"Install", update:"Update", qr_title:"Open this site via QR", qr_hint:"Tip: deploy the app and paste its URL."
  },
  ru: {
    home:"Главная", qibla:"Кибла", tasbih:"Тасбих", quran:"Коран", calendar:"Календарь", settings:"Настройки",
    today:"Сегодня", next_prayer:"Следующая молитва", prayer_times:"Время намаза", quick_actions:"Быстрые действия",
    detect_location:"Определить местоположение", mosques_near_me:"Мечети рядом", add_to_calendar:"Добавить в календарь (.ics)",
    qibla_direction:"Направление к Кибле", bearing_to_kaaba:"Азимут к Каабе", device_heading:"Направление устройства",
    hijri_date:"Дата хиджры", gregorian:"Григорианская", location:"Местоположение", latitude:"Широта", longitude:"Долгота",
    save:"Сохранить", use_dushanbe:"Душанбе, Таджикистан", calculation:"Расчёт", method:"Метод", asr_method:"Аср (метод)",
    high_lat:"Правило высоких широт", altitude:"Высота (м)", offsets:"Смещения (минуты)",
    save_offsets:"Сохранить смещения", reset:"Сброс", source:"Источник", note:"Примечание",
    source_offline:"Оффлайн (на устройстве)", source_online:"Онлайн (по локации)",
    install:"Установить", update:"Обновить", qr_title:"Откройте сайт по QR", qr_hint:"Поднимите приложение на хостинг и вставьте URL."
  },
  tg: {
    home:"Асосӣ", qibla:"Қибла", tasbih:"Тасбеҳ", quran:"Қуръон", calendar:"Тақвим", settings:"Танзимот",
    today:"Имрӯз", next_prayer:"Намози навбатӣ", prayer_times:"Вақтҳои намоз", quick_actions:"Амалиёти зуд",
    detect_location:"Муайян кардани макон", mosques_near_me:"Масҷидҳои наздик", add_to_calendar:"Илова ба тақвим (.ics)",
    qibla_direction:"Самти Қибла", bearing_to_kaaba:"Самт ба Каъба", device_heading:"Самти дастгоҳ",
    hijri_date:"Санаи ҳиҷрӣ", gregorian:"Григорианӣ", location:"Макон", latitude:"Арз", longitude:"Тул",
    save:"Захира", use_dushanbe:"Душанбе, Тоҷикистон", calculation:"Ҳисоб", method:"Усул", asr_method:"Аср (усул)",
    high_lat:"Қоидаи паҳноии баланд", altitude:"Баландӣ (м)", offsets:"Танзими иловагӣ (дақ.)",
    save_offsets:"Захира кардани танзимот", reset:"Барқарор", source:"Манбаъ", note:"Ёддошт",
    source_offline:"Офлайн (дар дастгоҳ)", source_online:"Онлайн (бо макон)",
    install:"Насб", update:"Навсозӣ", qr_title:"Кушодани сайт тавассути QR", qr_hint:"Сомонро ҷойгир кунед ва URL-ро ворид намоед."
  },
  id: {
    home:"Beranda", qibla:"Kiblat", tasbih:"Tasbih", quran:"Al‑Qur'an", calendar:"Kalender", settings:"Pengaturan",
    today:"Hari ini", next_prayer:"Salat berikutnya", prayer_times:"Waktu salat", quick_actions:"Aksi cepat",
    detect_location:"Deteksi lokasi", mosques_near_me:"Masjid terdekat", add_to_calendar:"Tambahkan ke kalender (.ics)",
    qibla_direction:"Arah Kiblat", bearing_to_kaaba:"Arah ke Ka'bah", device_heading:"Arah perangkat",
    hijri_date:"Tanggal Hijriah", gregorian:"Gregorian", location:"Lokasi", latitude:"Lintang", longitude:"Bujur",
    save:"Simpan", use_dushanbe:"Gunakan Dushanbe, TJ", calculation:"Perhitungan", method:"Metode", asr_method:"Metode Asar",
    high_lat:"Aturan lintang tinggi", altitude:"Ketinggian (m)", offsets:"Penyesuaian (menit)",
    save_offsets:"Simpan penyesuaian", reset:"Atur ulang", source:"Sumber", note:"Catatan",
    source_offline:"Offline (di perangkat)", source_online:"Online (berdasarkan lokasi)",
    install:"Pasang", update:"Perbarui", qr_title:"Buka situs via QR", qr_hint:"Unggah aplikasi dan tempel URL-nya."
  }
};
let lang = LS('lang') || 'en';
function t(k){ return (I18N[lang] && I18N[lang][k]) || (I18N['en'][k]||k); }
function applyI18N(){
  // Nav
  const map = {
    'nav_home': t('home'), 'nav_qibla': t('qibla'), 'nav_tasbih': t('tasbih'),
    'nav_quran': t('quran'), 'nav_calendar': t('calendar'), 'nav_settings': t('settings'),
    'title_today': t('today'), 'lbl_next_prayer': t('next_prayer'), 'title_prayer_times': t('prayer_times'),
    'title_quick': t('quick_actions'), 'btn_detect': t('detect_location'), 'btn_mosques': t('mosques_near_me'),
    'btn_ics': t('add_to_calendar'), 'title_qibla': t('qibla_direction'),
    'lbl_bearing': t('bearing_to_kaaba'), 'lbl_heading': t('device_heading'), 'title_hijri': t('hijri_date'),
    'lbl_greg': t('gregorian'), 'title_location': t('location'), 'lbl_lat': t('latitude'), 'lbl_lon': t('longitude'),
    'btn_save': t('save'), 'btn_dushanbe': t('use_dushanbe'), 'title_calc': t('calculation'),
    'lbl_method': t('method'), 'lbl_asr': t('asr_method'), 'lbl_highLat': t('high_lat'), 'lbl_altitude': t('altitude'),
    'lbl_offsets': t('offsets'), 'btn_save_offsets': t('save_offsets'), 'btn_reset_offsets': t('reset'),
    'lbl_provider': t('source'), 'lbl_countryNote': t('note'), 'lbl_city': t('city'), 'lbl_country': t('country'),
    'installBtn': t('install'), 'refreshSW': t('update'),
    'qr_title': t('qr_title'), 'qr_hint': t('qr_hint')
  };
  for(const id in map){
    const el = document.getElementById(id);
    if(el){
      if(id==='refreshSW') el.textContent = map[id] + '';
      else el.textContent = map[id] + '';
    }
  }
  // Provider select options
  const provider = document.getElementById('provider');
  if(provider){
    provider.options[0].text = t('source_offline');
    provider.options[1].text = t('source_online');
  }
  // Lang select UI value
  const sel = document.getElementById('langSelect'); if(sel) sel.value = lang;
}


// ---- Tabs ----
$$('nav button').forEach(b=>b.addEventListener('click', ()=>{
  $$('nav button').forEach(x=>x.classList.remove('active'));
  b.classList.add('active');
  const tab = b.dataset.tab;
  $$('section').forEach(s=>s.classList.add('hidden'));
  $('#'+tab).classList.remove('hidden');
}));

// ---- Utilities ----
function pad(n){ return (n<10?'0':'')+n; }
function fmtHM(d){return pad(d.getHours())+':'+pad(d.getMinutes())}
function clamp(v,a,b){return Math.max(a, Math.min(b, v));}
function toRad(x){return x*Math.PI/180} function toDeg(x){return x*180/Math.PI}

// ---- Geolocation ----
async function detectLocation(){
  try{
    $('#locStr').textContent = 'Detecting…';
    const pos = await new Promise((res,rej)=>navigator.geolocation.getCurrentPosition(res,rej,{enableHighAccuracy:true, timeout:10000}));
    state.lat = pos.coords.latitude; state.lon = pos.coords.longitude;
    LS('lat', state.lat); LS('lon', state.lon);
    state.locLabel = state.lat.toFixed(4)+', '+state.lon.toFixed(4);
    $('#locStr').textContent = state.locLabel;
    renderAll();
  }catch(e){
    $('#locStr').textContent = 'Permission denied. Enter coordinates in Settings.';
  }
}

// ---- Settings ----
function loadSettings(){
  const lat = LS('lat'), lon = LS('lon');
  if(lat && lon){ state.lat = parseFloat(lat); state.lon = parseFloat(lon); }
  $('#method').value = state.method;
  $('#asr').value = state.asr;
  $('#highLat').value = state.highLat;
  $('#altitude').value = state.altitude || 0;
  if(state.lat && state.lon){ $('#lat').value = state.lat; $('#lon').value = state.lon; }

  // offsets
  $('#off_fajr').value = state.offsets.fajr||0;
  $('#off_sunrise').value = state.offsets.sunrise||0;
  $('#off_dhuhr').value = state.offsets.dhuhr||0;
  $('#off_asr').value = state.offsets.asr||0;
  $('#off_maghrib').value = state.offsets.maghrib||0;
  $('#off_isha').value = state.offsets.isha||0;
}
function saveLoc(){
  const lat = parseFloat($('#lat').value);
  const lon = parseFloat($('#lon').value);
  if(!isFinite(lat) || !isFinite(lon)) return alert('Enter valid coordinates');
  state.lat = lat; state.lon = lon;
  LS('lat',lat); LS('lon',lon);
  state.locLabel = state.lat.toFixed(4)+', '+state.lon.toFixed(4);
  $('#locStr').textContent = state.locLabel;
  renderAll();
}
function setDushanbe(){
  $('#lat').value = 38.5598; $('#lon').value = 68.7870; saveLoc();
}
$('#saveLoc').addEventListener('click', saveLoc);
$('#useDushanbe').addEventListener('click', setDushanbe);
$('#detectBtn').addEventListener('click', detectLocation);
$('#method').addEventListener('change', e=>{ state.method=e.target.value; LS('method', state.method); renderAll(); });
$('#asr').addEventListener('change', e=>{ state.asr=e.target.value; LS('asr', state.asr); renderAll(); });
$('#highLat').addEventListener('change', e=>{ state.highLat=e.target.value; LS('highLat', state.highLat); renderAll(); });
$('#altitude').addEventListener('change', e=>{ state.altitude=parseFloat(e.target.value||'0'); LS('altitude', state.altitude); renderAll(); });
$('#saveOffsets').addEventListener('click', ()=>{
  const o = {
    fajr:+$('#off_fajr').value||0, sunrise:+$('#off_sunrise').value||0, dhuhr:+$('#off_dhuhr').value||0,
    asr:+$('#off_asr').value||0, maghrib:+$('#off_maghrib').value||0, isha:+$('#off_isha').value||0
  };
  state.offsets = o; LS('offsets', JSON.stringify(o)); renderAll();
});
$('#resetOffsets').addEventListener('click', ()=>{
  state.offsets = {fajr:0,sunrise:0,dhuhr:0,asr:0,maghrib:0,isha:0};
  LS('offsets', JSON.stringify(state.offsets)); loadSettings(); applyI18N(); renderAll();
});

// ---- Live clock & date ----
function updateClock(){
  const now = new Date();
  $('#clock').textContent = pad(now.getHours())+':'+pad(now.getMinutes());
  const greg = now.toLocaleDateString(undefined, {weekday:'long', year:'numeric', month:'long', day:'numeric'});
  $('#dateStr').textContent = greg;
}
setInterval(updateClock, 1000); updateClock();

// ---- Hijri date ----
function hijriDateString(d=new Date()){
  try{
    const s = new Intl.DateTimeFormat('en-TN-u-ca-islamic', {day:'numeric', month:'long', year:'numeric'}).format(d);
    return s;
  }catch(_){
    // simple fallback
    const jd = Math.floor((d/86400000) - (d.getTimezoneOffset()/1440) + 2440587.5);
    let l = jd - 1948440 + 10632;
    let n = Math.floor((l-1)/10631);
    l = l - 10631*n + 354;
    let j = (Math.floor((10985 - l)/5316))*(Math.floor((50*l)/17719)) + (Math.floor(l/5670))*(Math.floor((43*l)/15238));
    l = l - (Math.floor((30 - j)/15))*(Math.floor((17719*j)/50)) - (Math.floor(j/16))*(Math.floor((15238*j)/43)) + 29;
    const m = Math.floor((24*l)/709);
    const day = l - Math.floor((709*m)/24);
    const year = 30*n + j - 30;
    const months = ["Muharram","Safar","Rabiʿ I","Rabiʿ II","Jumada I","Jumada II","Rajab","Shaʿban","Ramadan","Shawwal","Dhul-Qaʿdah","Dhul-Hijjah"];
    return `${day} ${months[m-1]} ${year} AH`;
  }
}
function renderCalendar(){
  $('#hijri').textContent = hijriDateString(new Date());
  $('#greg').textContent = new Date().toLocaleDateString(undefined, {weekday:'long', year:'numeric', month:'long', day:'numeric'});
}

// ---- Prayer Times (enhanced) ----
const D2R = Math.PI/180, R2D = 180/Math.PI;
const Methods = {
  MWL:   { fajr: 18, isha: 17 },
  ISNA:  { fajr: 15, isha: 15 },
  Egypt: { fajr: 19.5, isha: 17.5 },
  Makkah:{ fajr: 18.5, isha: '90 min' }, // Umm al-Qura
  Karachi:{ fajr: 18, isha: 18 },
  Tehran:{ fajr: 17.7, isha: 14, midnight:'Jafari' },
  Jafari:{ fajr: 16, isha: 14, midnight:'Jafari' }
};

function julian(date){ return (date/86400000) - (date.getTimezoneOffset()/1440) + 2440587.5; }
function sunPosition(jd){
  const D = jd - 2451545.0;
  const g = (357.529 + 0.98560028*D) * D2R;
  const q = (280.459 + 0.98564736*D) % 360;
  const L = (q + 1.915*Math.sin(g) + 0.020*Math.sin(2*g)) * D2R;
  const e = (23.439 - 0.00000036*D) * D2R;
  const RA = Math.atan2(Math.cos(e)*Math.sin(L), Math.cos(L));
  const eqt = (q/15 - (RA*R2D/15));
  const dec = Math.asin(Math.sin(e)*Math.sin(L))*R2D;
  return {declination: dec, equation: eqt};
}
function midDay(t, jd, lon){
  const sp = sunPosition(jd + t);
  return (12 - sp.equation) - lon/15;
}
function hourAngleForAngle(angle, lat, dec){
  const term = (Math.cos(angle*D2R)-Math.sin(lat*D2R)*Math.sin(dec*D2R))/(Math.cos(lat*D2R)*Math.cos(dec*D2R));
  return Math.acos(clamp(term,-1,1))*R2D/15; // hours
}
function solarDepressionWithAltitude(baseAngle, altitudeMeters){
  // Increase the depression angle for horizon dip due to altitude (approx)
  const dip = 0.0347 * Math.sqrt(Math.max(0, altitudeMeters||0)); // degrees
  return baseAngle + dip;
}
function getTimes(date, lat, lon, methodName='MWL', asr='Standard', highLat='AngleBased', altitude=0, offsets={}){
  const method = Methods[methodName] || Methods.MWL;
  const tzOffset = -date.getTimezoneOffset()/60;
  let J = julian(new Date(date.getFullYear(), date.getMonth(), date.getDate()));
  let t = 0;

  let FajrAngle = method.fajr;
  let IshaAngle = method.isha;
  const ishaIsMinutes = typeof IshaAngle === 'string' && IshaAngle.includes('min');
  const ishaMinutes = ishaIsMinutes ? parseFloat(IshaAngle) : null;

  // Initial guess
  let times = {fajr:5, sunrise:6, dhuhr:12, asr:13, sunset:18, maghrib:18, isha:19};
  for(let i=0;i<4;i++){
    const D = sunPosition(J + t);
    const noon = midDay(t, J, lon);
    const sunriseHA = hourAngleForAngle( solarDepressionWithAltitude(90 + 5/60, altitude), lat, D.declination);
    const fajrHA   = hourAngleForAngle( 90 - FajrAngle, lat, D.declination);
    // Asr
    const asrFactor = (asr==='Hanafi'?2:1);
    const asrAngle = R2D*Math.atan(1/(asrFactor + Math.tan(Math.abs(lat-D.declination)*D2R))); // indirect, but will be handled via hour angle
    // Using classic formula from PrayTimes
    const asrHA = hourAngleForAngle( 90 - (R2D*Math.atan(1/(asrFactor + Math.tan(Math.abs(lat-D.declination)*D2R)))) , lat, D.declination);
    const ishaHA = ishaIsMinutes ? null : hourAngleForAngle( 90 - IshaAngle, lat, D.declination);

    times = {
      fajr:    noon - fajrHA,
      sunrise: noon - sunriseHA,
      dhuhr:   noon + 0.0008, // small drift compensation
      asr:     noon + asrHA,
      sunset:  noon + sunriseHA,
      maghrib: noon + sunriseHA,
      isha:    ishaIsMinutes ? (noon + sunriseHA + ishaMinutes/60) : (noon + ishaHA)
    };
    t = Object.values(times).reduce((a,b)=>a+b,0)/Object.keys(times).length/24;
  }

  // High‑latitude adjustments
  const night = ((times.isha - times.maghrib) + 24) % 24 + ((times.fajr - times.sunrise) + 24) % 24; // crude full night around sunset->fajr
  function nightPortion(angle){
    if(highLat==='AngleBased') return angle/60;
    if(highLat==='OneSeventh') return 1/7;
    if(highLat==='Midnight') return 1/2;
    return angle/60;
  }
  const N = ((times.sunrise - times.maghrib) + 24) % 24; // sunset->sunrise
  // Fajr: before sunrise
  const fajrPortion = nightPortion(FajrAngle);
  const maxFajr = times.sunrise - N * fajrPortion;
  if (isNaN(times.fajr) || ((times.sunrise - times.fajr) > N*fajrPortion)) times.fajr = maxFajr;
  // Isha: after maghrib (only when angle based used)
  if(!ishaIsMinutes){
    const ishaPortion = nightPortion(typeof IshaAngle==='number' ? IshaAngle : 17);
    const minIsha = times.maghrib + N * ishaPortion;
    if (isNaN(times.isha) || ((times.isha - times.maghrib) > N*ishaPortion)) times.isha = minIsha;
  }

  // Adjust to local time zone
  for(const k in times) times[k] += tzOffset - lon/15;

  // Apply per‑prayer minute offsets
  const off = Object.assign({fajr:0,sunrise:0,dhuhr:0,asr:0,maghrib:0,isha:0}, offsets||{});
  for(const k of Object.keys(off)){
    times[k] += (off[k]||0)/60;
  }

  // Round and return Date objects
  const result = {};
  for(const k of ['fajr','sunrise','dhuhr','asr','maghrib','isha']){
    const dec = ((times[k]%24)+24)%24;
    const H = Math.floor(dec);
    const M = Math.round((dec - H)*60);
    const d = new Date(date);
    d.setHours(H, M, 0, 0);
    result[k] = d;
  }
  return result;
}

// ---- Render prayer times, next prayer, countdown ----


// Reverse geocode via Nominatim (OpenStreetMap) to get city & country
async function reverseGeocode(lat, lon){
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
  const r = await fetch(url, {headers:{'Accept-Language': 'en'}});
  const j = await r.json();
  const addr = j.address || {};
  const city = addr.city || addr.town || addr.village || addr.state || '';
  const country = addr.country || '';
  return {city, country};
}
$('#btn_fill_city_country').addEventListener('click', async ()=>{
  if(!(state.lat && state.lon)) return alert('Set or detect your location first.');
  try{
    const g = await reverseGeocode(state.lat, state.lon);
    if(g.city) $('#cityInput').value = g.city;
    if(g.country) $('#countryInput').value = g.country;
  }catch(e){ alert('Failed to reverse geocode.'); }
});

async function getTimesOnlineByCity(date, city, country, methodName){
  const AladhanMethodMap = { MWL:3, ISNA:2, Egypt:5, Makkah:4, Karachi:1, Tehran:7, Jafari:0 };
  const method = AladhanMethodMap[methodName] || 3;
  const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}&iso8601=true`;
  const r = await fetch(url);
  const j = await r.json();
  if(!j || j.code!==200 || !j.data || !j.data.timings) throw new Error('API error');
  const tt = j.data.timings;
  function parseHM(s){
    const m = /(\\d{1,2}):(\\d{2})/.exec(s||''); if(!m) return null;
    const d = new Date(date); d.setHours(+m[1], +m[2], 0, 0); return d;
  }
  return { fajr: parseHM(tt.Fajr), sunrise: parseHM(tt.Sunrise), dhuhr: parseHM(tt.Dhuhr), asr: parseHM(tt.Asr), maghrib: parseHM(tt.Maghrib), isha: parseHM(tt.Isha) };
}
// ---- Online provider (Aladhan) ----
const AladhanMethodMap = { MWL:3, ISNA:2, Egypt:5, Makkah:4, Karachi:1, Tehran:7, Jafari:0 };
async function getTimesOnline(date, lat, lon, methodName){
  const method = AladhanMethodMap[methodName] || 3;
  const url = `https://api.aladhan.com/v1/timings?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&method=${method}&iso8601=true`;
  const r = await fetch(url);
  const j = await r.json();
  if(!j || j.code!==200 || !j.data || !j.data.timings) throw new Error('API error');
  const tt = j.data.timings;
  function parseHM(s){
    const m = /(\d{1,2}):(\d{2})/.exec(s||''); if(!m) return null;
    const d = new Date(date); d.setHours(+m[1], +m[2], 0, 0); return d;
  }
  return {
    fajr: parseHM(tt.Fajr),
    sunrise: parseHM(tt.Sunrise),
    dhuhr: parseHM(tt.Dhuhr),
    asr: parseHM(tt.Asr),
    maghrib: parseHM(tt.Maghrib),
    isha: parseHM(tt.Isha)
  };
}
async function renderTimes(){
  if(!(state.lat && state.lon)){ $('#times').innerHTML = '<div class="muted">Set your location (Settings) or Detect location.</div>'; return; }
  const now = new Date();
  let times;
  if((state.provider||'offline')==='aladhan'){
    $('#times').innerHTML = '<div class="muted">Loading online timetable…</div>';
    try{
      times = await getTimesOnline(now, state.lat, state.lon, state.method);
    }catch(e){
      console.warn(e); // fallback to offline
      times = getTimes(now, state.lat, state.lon, state.method, state.asr, state.highLat, state.altitude, state.offsets);
    }
  } else if ((state.provider||'offline')==='aladhan_city'){
    const city = ($('#cityInput')?.value||'').trim();
    const country = ($('#countryInput')?.value||'').trim();
    if(!city || !country){
      $('#times').innerHTML = '<div class="muted">Enter city & country, or use the fill button.</div>';
      return;
    }
    $('#times').innerHTML = '<div class="muted">Loading city/country timetable…</div>';
    try{
      times = await getTimesOnlineByCity(now, city, country, state.method);
    }catch(e){
      console.warn(e);
      times = getTimes(now, state.lat, state.lon, state.method, state.asr, state.highLat, state.altitude, state.offsets);
    }
    $('#times').innerHTML = '<div class="muted">Loading online timetable…</div>';
    try{
      times = await getTimesOnline(now, state.lat, state.lon, state.method);
    }catch(e){
      console.warn(e); // fallback to offline
      times = getTimes(now, state.lat, state.lon, state.method, state.asr, state.highLat, state.altitude, state.offsets);
    }
  } else {
    times = getTimes(now, state.lat, state.lon, state.method, state.asr, state.highLat, state.altitude, state.offsets);
  }
  state.times = times;
  const rows = [
    ['Fajr', times.fajr],
    ['Sunrise', times.sunrise],
    ['Dhuhr', times.dhuhr],
    ['Asr', times.asr],
    ['Maghrib', times.maghrib],
    ['Isha', times.isha],
  ].map(([n,d])=>`<div class="row"><span>${n}</span><strong>${fmtHM(d)}</strong></div>`).join('');
  $('#times').innerHTML = rows;

  const order = ['fajr','sunrise','dhuhr','asr','maghrib','isha'];
  const nowMs = now.getTime();
  let next = null;
  for(const k of order){ if (times[k].getTime() - nowMs > 60*1000){ next = k; break; } }
  if(!next) next = 'fajr';
  state.nextPrayer = next;
  $('#nextPrayer').textContent = next.toUpperCase();
  function up(){
    const target = times[next];
    let diff = target.getTime() - Date.now();
    if(diff<0){ renderTimes(); return; }
    const h = Math.floor(diff/3600000); diff%=3600000;
    const m = Math.floor(diff/60000); diff%=60000;
    const s = Math.floor(diff/1000);
    $('#countdown').textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
  }
  clearInterval(window._cd); window._cd = setInterval(up, 1000); up();
}

// ---- Qibla ----
const KAABA = {lat:21.4225, lon:39.8262};
function qiblaBearing(lat, lon){
  const φ1 = toRad(lat), λ1 = toRad(lon);
  const φ2 = toRad(KAABA.lat), λ2 = toRad(KAABA.lon);
  const y = Math.sin(λ2-λ1)*Math.cos(φ2);
  const x = Math.cos(φ1)*Math.sin(φ2) - Math.sin(φ1)*Math.cos(φ2)*Math.cos(λ2-λ1);
  const brng = Math.atan2(y, x);
  return (toDeg(brng)+360)%360;
}
function renderQibla(){
  if(!(state.lat && state.lon)){ $('#bearing').textContent = '—'; return; }
  const b = qiblaBearing(state.lat, state.lon);
  state.bearing = b;
  $('#bearing').textContent = `${b.toFixed(1)}°`;
  function redraw(heading){
    const rel = (b - heading + 360) % 360;
    $('#needle').style.transform = `translate(-50%,-90%) rotate(${rel}deg)`;
  }
  redraw(window._heading||0);
}
window.addEventListener('deviceorientationabsolute', e=>{
  if(e.alpha!=null){ window._heading = e.alpha; $('#heading').textContent = `${e.alpha.toFixed(1)}°`; renderQibla(); }
});
window.addEventListener('deviceorientation', e=>{
  if(e.alpha!=null && window._heading==null){ window._heading = e.alpha; $('#heading').textContent = `${e.alpha.toFixed(1)}°`; renderQibla(); }
});

// ---- Tasbih ----
let count = parseInt(LS('tasbih')||'0',10);
function renderCount(){ $('#count').textContent = count; LS('tasbih', count); }
$('#inc').addEventListener('click', ()=>{ count++; renderCount(); });
$('#reset').addEventListener('click', ()=>{ if(confirm('Reset counter?')){ count=0; renderCount(); } });
$('#set33').addEventListener('click', ()=>{ count=33; renderCount(); });
$('#set99').addEventListener('click', ()=>{ count=99; renderCount(); });
renderCount();

// ---- Quran Loader ----
async function loadStarterPack(){
  const j = await fetch('data/quran-pack.json').then(r=>r.json());
  return j;
}
function buildSurahList(qjson){
  if(!qjson || !qjson.surahs) return [];
  return qjson.surahs.map(s=>({number:s.number, name:s.name, count:s.ayahs.length})).sort((a,b)=>a.number-b.number);
}
  $('#surahMeta').textContent = `Surah ${s.number} • ${s.name} • ${s.ayahs.length} ayah(s)`;
  const showB = $('#showBismillah').checked;
  let ayahs = s.ayahs.slice();
  // For surahs except 9 (at‑Tawbah) the bismillah is usually present as the first line in Uthmani
  if(!showB && ayahs.length && s.number!==9){
    const first = ayahs[0];
    if(first && first.indexOf('بِسْمِ اللَّهِ')===0) ayahs = ayahs.slice(1);
  }
  if(state.searchTerm){
    const term = state.searchTerm.trim();
    ayahs = ayahs.filter(a=>a.includes(term));
  }
  $('#surah').innerHTML = ayahs.map((a,i)=>`<div><span class="muted small">${i+1}</span> ${a}</div>`).join('');
}


let currentLang = LS('quran_lang') || 'ar';
async function loadQuran(){
  const q = await ensureQuranFor(currentLang);
  state.quran = q;
  state.surahList = (q.surahs||[]).map(s=>({number:s.number,name:s.name,count:s.ayahs.length})).sort((a,b)=>a.number-b.number);
}
function populateSurahSelect(){
  const sel = $('#surahSelect'); if(!sel) return;
  sel.innerHTML = state.surahList.map(s=>`<option value="${s.number}">${s.number}. ${s.name} (${s.count})</option>`).join('');
  sel.value = state.currentSurah;
  const langSel = $('#quranLang'); if(langSel) langSel.value = currentLang;
}
async function showSurah(n){
  // Main text for currentLang
  if(!state.quran) return;
  const s = state.quran.surahs.find(x=>x.number===n);
  const showAr = $('#showArabic').checked;
  const container = $('#surah'); const meta = $('#surahMeta');
  if(!s){ meta.textContent='Surah not available in this language pack.'; container.innerHTML=''; return; }
  meta.textContent = `Surah ${s.number} • ${s.name} • ${s.ayahs.length} ayah(s) • ${currentLang.toUpperCase()}`;

  // Prepare lines
  let lines = s.ayahs.slice();
  // Filter by search
  const term = (state.searchTerm||'').trim();
  if(term){ lines = lines.filter(a=>a.includes(term)); }

  // If translation language is not Arabic and "Show Arabic" is checked, load Arabic for side-by-side
  let arLines = null;
  if(showAr && currentLang!=='ar'){
    try{
      const ar = await ensureQuranFor('ar');
      const sAr = ar.surahs.find(x=>x.number===n);
      arLines = sAr ? sAr.ayahs : null;
    }catch{}
  }

  // Render
  if(showAr && arLines){
    container.innerHTML = lines.map((a,i)=>{
      const ar = arLines[i] || '';
      return `<div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; align-items:start">
        <div class="ayah" style="text-align:right; direction:rtl"><span class="muted small">${i+1}</span> ${ar}</div>
        <div><span class="muted small">${i+1}</span> ${a}</div>
      </div>`;
    }).join('');
  }else{
    // Single column (Arabic or translation)
    const rtl = currentLang==='ar';
    container.innerHTML = lines.map((a,i)=>`<div class="${rtl?'ayah':''}" style="${rtl?'text-align:right; direction:rtl':''}"><span class="muted small">${i+1}</span> ${a}</div>`).join('');
  }
}

// Quran UI events
$('#fetchQuran').addEventListener('click', async()=>{
  try{
    const q = await ensureQuranFor(currentLang);
    // Save to LS (ensureQuran already caches)
    state.quran = q; state.surahList = (q.surahs||[]).map(s=>({number:s.number,name:s.name,count:s.ayahs.length})).sort((a,b)=>a.number-b.number);
    populateSurahSelect();
    await showSurah(state.currentSurah);
    alert('Downloaded & cached: '+currentLang.toUpperCase());
  }catch(e){ alert('Failed to fetch Quran for '+currentLang.toUpperCase()); }
});
$('#surahSelect').addEventListener('change', async e=>{
  state.currentSurah = +e.target.value;
  await showSurah(state.currentSurah);
});
$('#prevSurah').addEventListener('click', ()=>{
  const idx = state.surahList.findIndex(s=>s.number===state.currentSurah);
  if(idx>0){ state.currentSurah = state.surahList[idx-1].number; $('#surahSelect').value = state.currentSurah; await showSurah(state.currentSurah); }
});
$('#nextSurah').addEventListener('click', ()=>{
  const idx = state.surahList.findIndex(s=>s.number===state.currentSurah);
  if(idx>=0 && idx < state.surahList.length-1){ state.currentSurah = state.surahList[idx+1].number; $('#surahSelect').value = state.currentSurah; await showSurah(state.currentSurah); }
});
$('#showBismillah').addEventListener('change', ()=> showSurah(state.currentSurah));
$('#ayahSearch').addEventListener('input', e=>{ state.searchTerm = e.target.value; await showSurah(state.currentSurah); });
$('#clearSearch').addEventListener('click', ()=>{ state.searchTerm=''; $('#ayahSearch').value=''; await showSurah(state.currentSurah); });



// ---- Quran translations per language ----
// LocalStorage keys: quran_full_<lang>
const QuranEditions = {
  ar: 'quran-uthmani',
  en: 'en.sahih',
  ru: 'ru.kuliev',
  id: 'id.indonesian'
  // Tajik (tg) not available via alquran.cloud; we use a starter JSON offline.
};
async function ensureQuranFor(lang){
  // Check LS cache
  try{
    const cached = LS('quran_full_'+lang);
    if(cached){ return JSON.parse(cached); }
  }catch{}
  if(lang==='tg'){
    // Load starter only
    const j = await fetch('data/quran-tg-starter.json').then(r=>r.json());
    return j;
  }
  const ed = QuranEditions[lang];
  if(!ed) throw new Error('Unsupported language: '+lang);
  const url = `https://api.alquran.cloud/v1/quran/${ed}`;
  const resp = await fetch(url);
  const data = await resp.json();
  if(!data || !data.data || !data.data.surahs) throw new Error('Invalid Quran API response');
  const q = {surahs: data.data.surahs.map(s=>({
    number: s.number,
    name: s.name || s.englishName || ('Surah '+s.number),
    ayahs: s.ayahs.map(a=>a.text)
  }))};
  // cache
  try{ LS('quran_full_'+lang, JSON.stringify(q)); }catch{}
  return q;
}
// Bind static IDs to existing elements (assign ids dynamically where needed)
(function setupIds(){
  // Nav
  const navMap = [['home','nav_home'],['qibla','nav_qibla'],['tasbih','nav_tasbih'],['quran','nav_quran'],['calendar','nav_calendar'],['settings','nav_settings']];
  const btns = document.querySelectorAll('nav button');
  navMap.forEach((pair, idx)=>{ if(btns[idx]) btns[idx].id = pair[1]; });
  // Titles and labels
  $('#home .title').id = 'title_today';
  $('#home .card .card .title')?.setAttribute('id','title_prayer_times');
  document.querySelector('#home .card + .card .title').id = 'title_quick';
  $('#detectBtn').id = 'btn_detect'; $('#openMosques').id = 'btn_mosques'; $('#addToCalendar').id = 'btn_ics';
  $('#qibla .title').id = 'title_qibla';
  document.querySelector('#qibla .row span').id = 'lbl_bearing';
  document.querySelectorAll('#qibla .row span')[1].id = 'lbl_heading';
  document.querySelector('#calendar .title').id = 'title_hijri';
  document.querySelectorAll('#calendar .row span')[1].id = 'lbl_greg';
  // Settings labels
  document.querySelector('#settings .card .title').id = 'title_location';
  document.querySelectorAll('#settings label')[0].id='lbl_lat';
  document.querySelectorAll('#settings label')[1].id='lbl_lon';
  $('#saveLoc').id = 'btn_save'; $('#useDushanbe').id='btn_dushanbe';
  document.querySelectorAll('#settings .card .title')[1].id = 'title_calc';
  document.querySelectorAll('#settings label')[2].id='lbl_method';
  document.querySelectorAll('#settings label')[3].id='lbl_asr';
  document.querySelector('#highLat').previousElementSibling.id='lbl_highLat';
  document.querySelector('#altitude').previousElementSibling.id='lbl_altitude';
  document.querySelector('#settings .muted.small').id='lbl_offsets';
  document.getElementById('saveOffsets').id='btn_save_offsets';
  document.getElementById('resetOffsets').id='btn_reset_offsets';
  // Buttons already have ids (installBtn, refreshSW)
})();

// Language select
$('#langSelect').addEventListener('change', (e)=>{ lang = e.target.value; LS('lang', lang); applyI18N(); });

// Apply i18n once on load (later again after loadSettings binds)
applyI18N();

// ---- QR modal (uses Google Chart API) ----
const qrModal = $('#qrModal'), qrImg = $('#qrImg'), qrUrlInput = $('#qrUrl');
$('#qrBtn').addEventListener('click', ()=>{
  qrUrlInput.value = location.href;
  qrImg.src = `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chld=M|0&chl=${encodeURIComponent(qrUrlInput.value)}`;
  qrModal.style.display='flex';
});
$('#qrGen').addEventListener('click', ()=>{
  const u = qrUrlInput.value.trim() || location.href;
  qrImg.src = `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chld=M|0&chl=${encodeURIComponent(u)}`;
});
$('#qrClose').addEventListener('click', ()=>{ qrModal.style.display='none'; });

// ---- Provider (offline / online) ----
$('#provider').addEventListener('change', e=>{
  state.provider = e.target.value;
  localStorage.setItem('provider', state.provider);
  renderTimes();
});

$('#quranLang').addEventListener('change', async (e)=>{
  currentLang = e.target.value; LS('quran_lang', currentLang);
  await loadQuran();
  state.currentSurah = (state.quran?.surahs?.[0]?.number) || 1;
  populateSurahSelect();
  await showSurah(state.currentSurah);
});
$('#showArabic').addEventListener('change', async ()=>{ await showSurah(state.currentSurah); });
// ---- Mosques link ----
$('#openMosques').addEventListener('click', ()=>{
  if(!(state.lat && state.lon)) return alert('Set or detect your location first.');
  const url = `https://www.openstreetmap.org/?mlat=${state.lat}&mlon=${state.lon}#map=15/${state.lat}/${state.lon}&q=mosque`;
  window.open(url, '_blank');
});

// ---- ICS export ----
$('#addToCalendar').addEventListener('click', ()=>{
  if(!state.times) return alert('Calculate times first.');
  const evs = [['Fajr', state.times.fajr],['Dhuhr', state.times.dhuhr],['Asr', state.times.asr],['Maghrib', state.times.maghrib],['Isha', state.times.isha]];
  const esc = s=>s.replace(/[,;]/g,'\\$&');
  const lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Muslim Lite//Prayer Times//EN'];
  evs.forEach(([name,dt])=>{
    const z = dt.toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';
    lines.push('BEGIN:VEVENT','UID:'+z+'-'+name+'@muslim-lite','DTSTAMP:'+z,'DTSTART:'+z,'SUMMARY:'+esc(name+' prayer'),'END:VEVENT');
  });
  lines.push('END:VCALENDAR');
  const blob = new Blob([lines.join('\\r\\n')], {type:'text/calendar'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'prayer-times.ics'; a.click();
  setTimeout(()=>URL.revokeObjectURL(url), 5000);
});

// ---- PWA: install/update ----
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; $('#installBtn').disabled = false; });
$('#installBtn').addEventListener('click', async()=>{ if(deferredPrompt){ deferredPrompt.prompt(); deferredPrompt = null; } });
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('./service-worker.js');
  $('#refreshSW').addEventListener('click', async ()=>{
    const regs = await navigator.serviceWorker.getRegistrations();
    for (const r of regs){ r.update(); }
    location.reload();
  });
}

// ---- Initial ----
function renderAll(){
  $('#locStr').textContent = state.lat && state.lon ? `${state.lat.toFixed(4)}, ${state.lon.toFixed(4)}` : 'No location set';
  renderTimes(); renderQibla(); renderCalendar();
}
(async function init(){
  // Settings preload
  (function preload(){
    const lat = LS('lat'), lon = LS('lon');
    if(lat && lon){ state.lat = +lat; state.lon = +lon; }
  })();
  // Quran
  await loadQuran();
  // Default current surah
  state.currentSurah = (state.quran?.surahs?.[0]?.number) || 1;
  populateSurahSelect();
  await showSurah(state.currentSurah);
  // Location flow
  if(!(state.lat && state.lon)) detectLocation(); else renderAll();
  // Restore UI fields
  loadSettings(); applyI18N();
})();
