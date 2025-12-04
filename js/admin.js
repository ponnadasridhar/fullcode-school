const LS_KEYS = {
  announcement: 'schoolAnnouncement',
  announcementUpdatedAt: 'schoolAnnouncementUpdatedAt',
  counts: 'schoolCounts',
  gallery: 'schoolGallery',
  messages: 'contactMessages',
  theme: 'siteTheme'
};
const STUDENTS_KEY = 'studentsData';
const DEFAULT_ADMIN_PW = 'Admin@123';

function getJSON(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function setJSON(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

function applyTheme(theme) { document.documentElement.setAttribute('data-theme', theme); }
function initThemeAdmin() {
  const saved = localStorage.getItem(LS_KEYS.theme) || 'light';
  applyTheme(saved);
  const sw = document.getElementById('themeSwitch');
  if (sw) sw.checked = saved === 'dark';
  sw?.addEventListener('change', () => {
    const next = sw.checked ? 'dark' : 'light';
    applyTheme(next);
    localStorage.setItem(LS_KEYS.theme, next);
  });
}

function initLogin() {
  const form = document.getElementById('loginForm');
  if (!form) return;
  const error = document.getElementById('loginError');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value;
    const stored = localStorage.getItem('adminPassword') || DEFAULT_ADMIN_PW;
    if (!localStorage.getItem('adminPassword')) localStorage.setItem('adminPassword', DEFAULT_ADMIN_PW);
    if (u === 'admin' && p === stored) {
      sessionStorage.setItem('adminLoggedIn', 'true');
      window.location.href = 'admin-dashboard.html';
    } else {
      error.style.display = 'block';
    }
  });
}

function guardDashboard() {
  if (!document.body || !location.pathname.endsWith('admin-dashboard.html')) return;
  const ok = sessionStorage.getItem('adminLoggedIn') === 'true';
  if (!ok) window.location.href = 'admin-login.html';
}

function initDashboard() {
  if (!location.pathname.endsWith('admin-dashboard.html')) return;
  const logoutBtn = document.getElementById('logoutBtn');
  logoutBtn?.addEventListener('click', () => { sessionStorage.removeItem('adminLoggedIn'); window.location.href = 'admin-login.html'; });

  const annInput = document.getElementById('announcementInput');
  const saveAnn = document.getElementById('saveAnnouncement');
  annInput.value = localStorage.getItem(LS_KEYS.announcement) || '';
  saveAnn.addEventListener('click', () => {
    const v = annInput.value.trim();
    localStorage.setItem(LS_KEYS.announcement, v);
    localStorage.setItem(LS_KEYS.announcementUpdatedAt, new Date().toISOString());
    alert('Announcement saved');
  });

  const counts = getJSON(LS_KEYS.counts, { students: '', teachers: '', support: '' });
  const sIn = document.getElementById('studentsInput');
  const tIn = document.getElementById('teachersInput');
  const spIn = document.getElementById('supportInput');
  sIn.value = counts.students;
  tIn.value = counts.teachers;
  spIn.value = counts.support;
  document.getElementById('saveCounts').addEventListener('click', () => {
    const obj = { students: Number(sIn.value) || 0, teachers: Number(tIn.value) || 0, support: Number(spIn.value) || 0 };
    setJSON(LS_KEYS.counts, obj);
    alert('Counts saved');
  });

  const fileIn = document.getElementById('galleryFileInput');
  const catIn = document.getElementById('galleryCategoryInput');
  const addBtn = document.getElementById('addImageBtn');
  const listEl = document.getElementById('galleryAdminList');

  function renderGalleryAdmin() {
    const items = getJSON(LS_KEYS.gallery, []);
    listEl.innerHTML = items.map(i => (
      `<div class="admin-thumb"><div class="gallery-item"><img src="${i.dataUrl}" alt="${i.category}" /></div><div class="thumb-actions"><span class="badge">${i.category}</span><button class="btn" data-del="${i.id}">Delete</button></div></div>`
    )).join('');
  }
  renderGalleryAdmin();
  listEl.addEventListener('click', e => {
    const btn = e.target.closest('button[data-del]');
    if (!btn) return;
    const id = btn.dataset.del;
    const items = getJSON(LS_KEYS.gallery, []);
    const next = items.filter(x => x.id !== id);
    setJSON(LS_KEYS.gallery, next);
    renderGalleryAdmin();
  });

  addBtn.addEventListener('click', () => {
    const f = fileIn.files?.[0];
    if (!f) { alert('Select an image'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const items = getJSON(LS_KEYS.gallery, []);
      const id = 'img_' + Date.now() + '_' + Math.random().toString(36).slice(2,8);
      const entry = { id, category: catIn.value || 'Events', dataUrl, date: new Date().toISOString() };
      items.push(entry);
      setJSON(LS_KEYS.gallery, items);
      fileIn.value = '';
      renderGalleryAdmin();
      alert('Image added');
    };
    reader.readAsDataURL(f);
  });

  const tableBody = document.querySelector('#messagesTable tbody');
  function renderMessages() {
    const msgs = getJSON(LS_KEYS.messages, []);
    tableBody.innerHTML = msgs.map((m, idx) => (
      `<tr><td>${m.name}</td><td>${m.email}</td><td>${m.phone}</td><td>${m.message}</td><td>${new Date(m.date).toLocaleString()}</td><td><button class="btn" data-delmsg="${idx}">Delete</button></td></tr>`
    )).join('');
  }
  renderMessages();
  tableBody.addEventListener('click', e => {
    const btn = e.target.closest('button[data-delmsg]');
    if (!btn) return;
    const idx = Number(btn.dataset.delmsg);
    const msgs = getJSON(LS_KEYS.messages, []);
    msgs.splice(idx, 1);
    setJSON(LS_KEYS.messages, msgs);
    renderMessages();
  });

  const lastMaskedEl = document.getElementById('lastPassMasked');
  const revealBtn = document.getElementById('revealPassBtn');
  const oldIn = document.getElementById('oldPassword');
  const newIn = document.getElementById('newPassword');
  const confIn = document.getElementById('confirmPassword');
  const savePwBtn = document.getElementById('savePasswordBtn');
  const currentPw = localStorage.getItem('adminPassword') || DEFAULT_ADMIN_PW;
  if (!localStorage.getItem('adminPassword')) localStorage.setItem('adminPassword', DEFAULT_ADMIN_PW);
  function mask(s) { return '*'.repeat(Math.max(8, s.length)); }
  if (lastMaskedEl) lastMaskedEl.textContent = mask(currentPw);
  revealBtn?.addEventListener('click', () => {
    if (!lastMaskedEl) return;
    const showing = lastMaskedEl.dataset.showing === 'true';
    lastMaskedEl.textContent = showing ? mask(currentPw) : currentPw;
    lastMaskedEl.dataset.showing = showing ? 'false' : 'true';
    revealBtn.textContent = showing ? 'Show' : 'Hide';
  });
  savePwBtn?.addEventListener('click', () => {
    const oldV = oldIn.value;
    const newV = newIn.value;
    const confV = confIn.value;
    const cur = localStorage.getItem('adminPassword') || DEFAULT_ADMIN_PW;
    if (oldV !== cur) { alert('Current password is incorrect'); return; }
    if (!newV || newV.length < 6) { alert('New password must be at least 6 characters'); return; }
    if (newV !== confV) { alert('New password and confirm do not match'); return; }
    localStorage.setItem('adminPassword', newV);
    alert('Password updated successfully');
    oldIn.value = ''; newIn.value = ''; confIn.value = '';
    if (lastMaskedEl) lastMaskedEl.textContent = mask(newV);
    if (revealBtn) { revealBtn.textContent = 'Show'; lastMaskedEl.dataset.showing = 'false'; }
  });

  const tabHome = document.getElementById('tabHomeAdmin');
  const tabStudent = document.getElementById('tabStudentAdmin');
  const homeSec = document.getElementById('homeAdminSection');
  const stuSec = document.getElementById('studentAdminSection');
  function switchTab(target){ if(target==='home'){ tabHome.classList.add('active'); tabStudent.classList.remove('active'); homeSec.style.display='block'; stuSec.style.display='none'; } else { tabStudent.classList.add('active'); tabHome.classList.remove('active'); homeSec.style.display='none'; stuSec.style.display='block'; } }
  tabHome?.addEventListener('click',()=>switchTab('home'));
  tabStudent?.addEventListener('click',()=>switchTab('student'));

  const stuRoll = document.getElementById('stuRoll');
  const stuName = document.getElementById('stuName');
  const stuClass = document.getElementById('stuClass');
  const parentName = document.getElementById('parentName');
  const stuPassword = document.getElementById('stuPassword');
  const parentPassword = document.getElementById('parentPassword');
  const saveStudentBtn = document.getElementById('saveStudentBtn');
  const studentsList = document.getElementById('studentsList');
  const progressCard = document.getElementById('progressCard');
  const progressTitle = document.getElementById('progressTitle');
  const progSubject = document.getElementById('progSubject');
  const progMarks = document.getElementById('progMarks');
  const progTerm = document.getElementById('progTerm');
  const progRemarks = document.getElementById('progRemarks');
  const addProgressBtn = document.getElementById('addProgressBtn');
  const progressTableBody = document.querySelector('#progressTable tbody');
  const classFilterInput = document.getElementById('classFilter');
  const applyClassFilterBtn = document.getElementById('applyClassFilter');
  const clearClassFilterBtn = document.getElementById('clearClassFilter');
  const stuAttendance = document.getElementById('stuAttendance');
  const stuPerformance = document.getElementById('stuPerformance');
  const stuFeedback = document.getElementById('stuFeedback');
  const stuNotes = document.getElementById('stuNotes');

  function getStudents(){ try{ const v=localStorage.getItem(STUDENTS_KEY); return v?JSON.parse(v):[]; }catch{ return []; } }
  function setStudents(arr){ localStorage.setItem(STUDENTS_KEY, JSON.stringify(arr)); }

  let classFilterValue = '';
  function renderStudents(){ const list=getStudents(); const filtered = classFilterValue ? list.filter(s => ((s.class||'').toLowerCase().includes(classFilterValue.toLowerCase()))) : list; studentsList.innerHTML = filtered.map(s=>`<div class="card glass"><div class="card-body"><strong>${s.name||'(No name)'} (${s.roll})</strong><div class="muted">${s.class||''}</div><div class="muted">Progress entries: ${(Array.isArray(s.progress)?s.progress.length:0)}</div><div style="margin-top:8px"><button class="btn" data-edit="${s.roll}">Edit</button> <button class="btn" data-del="${s.roll}">Delete</button></div></div></div>`).join(''); }
  function loadStudent(roll){ const list=getStudents(); const s=list.find(x=>x.roll===roll); if(!s) return; stuRoll.value=s.roll; stuName.value=s.name||''; stuClass.value=s.class||''; parentName.value=s.parentName||''; stuPassword.value=s.studentPassword||''; parentPassword.value=s.parentPassword||''; stuAttendance.value = (s.attendance!=null? s.attendance : ''); stuPerformance.value = s.performance||''; stuFeedback.value = s.feedback||''; stuNotes.value = s.notes||''; renderProgress(s); progressCard.style.display='block'; progressTitle.textContent=`Progress • ${s.name||roll}`; }
  function renderProgress(s){ const items=s.progress||[]; progressTableBody.innerHTML = items.map((p,idx)=>`<tr><td>${p.subject}</td><td>${p.marks ?? ''}</td><td>${p.term||''}</td><td>${p.remarks||''}</td><td><button class="btn" data-delp="${idx}">Delete</button></td></tr>`).join(''); }

  addProgressBtn?.addEventListener('click',()=>{ const roll=stuRoll.value.trim(); if(!roll){ alert('Enter roll number'); return; } const list=getStudents(); const i=list.findIndex(x=>x.roll===roll); if(i<0){ alert('Save student first'); return; } const s=list[i]; const entry={ subject: progSubject.value.trim(), marks: Number(progMarks.value)||0, term: progTerm.value.trim(), remarks: progRemarks.value.trim() }; if(!entry.subject){ alert('Enter subject'); return; } s.progress = Array.isArray(s.progress)?s.progress:[]; s.progress.push(entry); setStudents(list); renderProgress(s); progSubject.value=''; progMarks.value=''; progTerm.value=''; progRemarks.value=''; });
  progressTableBody?.addEventListener('click',e=>{ const btn=e.target.closest('button[data-delp]'); if(!btn) return; const idx=Number(btn.dataset.delp); const roll=stuRoll.value.trim(); const list=getStudents(); const i=list.findIndex(x=>x.roll===roll); if(i<0) return; const s=list[i]; if(Array.isArray(s.progress)){ s.progress.splice(idx,1); setStudents(list); renderProgress(s); }
  });

  saveStudentBtn?.addEventListener('click',()=>{ const roll=stuRoll.value.trim(); if(!roll){ alert('Roll is required'); return; } const list=getStudents(); const idx=list.findIndex(x=>x.roll===roll); const obj={ roll, name:stuName.value.trim(), class:stuClass.value.trim(), parentName:parentName.value.trim(), studentPassword:stuPassword.value, parentPassword:parentPassword.value, attendance: Number(stuAttendance.value)||0, performance: stuPerformance.value.trim(), feedback: stuFeedback.value.trim(), notes: (stuNotes.value||'').trim(), progress: idx>=0?list[idx].progress||[]:[] }; if(idx>=0) list[idx]=obj; else list.push(obj); setStudents(list); renderStudents(); alert('Student saved'); });
  applyClassFilterBtn?.addEventListener('click',()=>{ classFilterValue = (classFilterInput?.value||'').trim(); renderStudents(); });
  clearClassFilterBtn?.addEventListener('click',()=>{ classFilterValue = ''; if(classFilterInput) classFilterInput.value=''; renderStudents(); });
  studentsList?.addEventListener('click',e=>{ const ed=e.target.closest('button[data-edit]'); const del=e.target.closest('button[data-del]'); if(ed){ loadStudent(ed.dataset.edit); } else if(del){ const roll=del.dataset.del; const list=getStudents(); const next=list.filter(x=>x.roll!==roll); setStudents(next); renderStudents(); if(stuRoll.value===roll){ stuRoll.value=''; stuName.value=''; stuClass.value=''; parentName.value=''; stuPassword.value=''; parentPassword.value=''; progressCard.style.display='none'; } }
  });

  renderStudents();
}

document.addEventListener('DOMContentLoaded', () => {
  initThemeAdmin();
  initLogin();
  guardDashboard();
  initDashboard();
});
