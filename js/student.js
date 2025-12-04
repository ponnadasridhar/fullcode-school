const STUDENTS_KEY = 'studentsData';
const THEME_KEY = 'siteTheme';

function applyTheme(t) { document.documentElement.setAttribute('data-theme', t); }
function initTheme() { const s = localStorage.getItem(THEME_KEY)||'light'; applyTheme(s); const sw=document.getElementById('themeSwitch'); if(sw) sw.checked=s==='dark'; sw?.addEventListener('change',()=>{const n=sw.checked?'dark':'light'; applyTheme(n); localStorage.setItem(THEME_KEY,n);}); }

function getStudents(){ try{ const v=localStorage.getItem(STUDENTS_KEY); return v?JSON.parse(v):[]; }catch{ return []; } }
function setStudents(arr){ localStorage.setItem(STUDENTS_KEY, JSON.stringify(arr)); }

function initStudentLogin(){ const f=document.getElementById('studentLoginForm'); if(!f) return; const err=document.getElementById('studentLoginError'); f.addEventListener('submit', e=>{ e.preventDefault(); const roll=document.getElementById('studentRoll').value.trim(); const pw=document.getElementById('studentPassword').value; const list=getStudents(); const s=list.find(x=>x.roll===roll); if(s && s.studentPassword===pw){ sessionStorage.setItem('loggedStudentRoll', roll); sessionStorage.setItem('loginRole','student'); window.location.href='student-dashboard.html'; } else { err.style.display='block'; } }); }

function initParentLogin(){ const f=document.getElementById('parentLoginForm'); if(!f) return; const err=document.getElementById('parentLoginError'); f.addEventListener('submit', e=>{ e.preventDefault(); const roll=document.getElementById('parentRoll').value.trim(); const pw=document.getElementById('parentPassword').value; const list=getStudents(); const s=list.find(x=>x.roll===roll); if(s && s.parentPassword===pw){ sessionStorage.setItem('loggedStudentRoll', roll); sessionStorage.setItem('loginRole','parent'); window.location.href='student-dashboard.html'; } else { err.style.display='block'; } }); }

function renderStudentDashboard(){ const role=sessionStorage.getItem('loginRole'); const roll=sessionStorage.getItem('loggedStudentRoll'); const list=getStudents(); const s=list.find(x=>x.roll===roll); if(!s) return; const nm=document.getElementById('studentName'); const pr=document.getElementById('profileRoll'); const pc=document.getElementById('profileClass'); const pp=document.getElementById('profileParent'); if(nm) nm.textContent = s.name?`${s.name} • Student Dashboard`:'Student Dashboard'; if(pr) pr.textContent=s.roll||''; if(pc) pc.textContent=s.class||''; if(pp) pp.textContent=s.parentName||''; const att=document.getElementById('attendanceValue'); const perf=document.getElementById('performanceValue'); const feed=document.getElementById('feedbackValue'); const notes=document.getElementById('notesValue'); if(att) att.textContent = s.attendance!=null ? s.attendance : ''; if(perf) perf.textContent = s.performance||''; if(feed) feed.textContent = s.feedback||''; if(notes) notes.textContent = s.notes||''; const tbody=document.querySelector('#progressTableView tbody'); if(tbody){ const items=s.progress||[]; tbody.innerHTML = items.map(i=>`<tr><td>${i.subject}</td><td>${i.marks??''}</td><td>${i.term??''}</td><td>${i.remarks??''}</td></tr>`).join(''); }
}

document.addEventListener('DOMContentLoaded',()=>{ initTheme(); initStudentLogin(); initParentLogin(); renderStudentDashboard(); });
