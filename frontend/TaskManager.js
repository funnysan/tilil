const STATUS = {
  upcoming:{label:'Upcoming',cls:'upcoming'}, review:{label:'In Review',cls:'review'},
  cancelled:{label:'Cancelled',cls:'cancelled'}, overdue:{label:'Overdue',cls:'overdue'},
  published:{label:'Published',cls:'published'}
};
const PALETTE = ['#6d28d9','#2f6df6','#e0457b','#16a06a','#e0a317','#0ea5e9','#db2777','#475569'];
const initials = n => n.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();

let tasks = [];
let nextId = 1;
let query = '';
let editingId = null; // null = creating, otherwise id of task being edited

const list = document.getElementById('list');
const empty = document.getElementById('empty');
const addRow = document.getElementById('addRow');
const saveBtn = document.getElementById('saveTask');
const titleInput = document.getElementById('i-title');

document.getElementById('toggleAdd').onclick = () => {
  const willShow = addRow.classList.contains('hidden');
  if (willShow) openForm(null);
  else closeForm();
};
saveBtn.onclick = saveTask;
titleInput.addEventListener('keydown', e => { if (e.key==='Enter') saveTask(); });
document.getElementById('search').oninput = e => { query = e.target.value.toLowerCase(); render(); };

function openForm(task) {
  editingId = task ? task.id : null;
  if (task) {
    titleInput.value = task.title;
    document.getElementById('i-status').value = task.status;
    document.getElementById('i-date').value = task.date === '—' ? '' : task.date;
    document.getElementById('i-priority').value = task.priority;
    document.getElementById('i-notes').value = task.notes === '—' ? '' : task.notes;
    saveBtn.textContent = 'Update';
  } else {
    titleInput.value = '';
    document.getElementById('i-status').value = 'upcoming';
    document.getElementById('i-date').value = '';
    document.getElementById('i-priority').value = 'Medium';
    document.getElementById('i-notes').value = '';
    saveBtn.textContent = 'Save';
  }
  addRow.classList.remove('hidden');
  titleInput.focus();
}

function closeForm() {
  addRow.classList.add('hidden');
  editingId = null;
  saveBtn.textContent = 'Save';
}

function saveTask() {
  const title = titleInput.value.trim();
  if (!title) { titleInput.focus(); return; }

  const data = {
    title,
    status: document.getElementById('i-status').value,
    date: document.getElementById('i-date').value || '—',
    priority: document.getElementById('i-priority').value,
    notes: document.getElementById('i-notes').value.trim() || '—',
  };

  if (editingId !== null) {
    const t = tasks.find(x => x.id === editingId);
    if (t) Object.assign(t, data);
  } else {
    tasks.push({ id: nextId++, ...data, people: ['You'], done: data.status === 'published' });
  }

  closeForm();
  render();
}

function fmtDate(d){ if(!d||d==='—')return '—'; const dt=new Date(d); return isNaN(dt)?d:dt.toLocaleDateString('en-US',{day:'2-digit',month:'short',year:'numeric'}); }

function avatars(people){
  const shown = people.slice(0,3);
  let html = shown.map((p,i)=>`<span class="av" style="background:${PALETTE[(p.length+i)%PALETTE.length]}" title="${p}">${initials(p)}</span>`).join('');
  if (people.length>3) html += `<span class="av more">+${people.length-3}</span>`;
  return html;
}

function render() {
  const filtered = tasks.filter(t => t.title.toLowerCase().includes(query));
  list.innerHTML = '';
  filtered.forEach(t => {
    const s = STATUS[t.status];
    const row = document.createElement('div');
    row.className = 'row' + (t.done?' done':'');
    row.innerHTML = `
      <div class="agenda">
        <span class="check"><svg viewBox="0 0 24 24" fill="none"><polyline points="20 6 9 17 4 12"/></svg></span>
        <span class="title">${esc(t.title)}</span>
      </div>
      <div class="status ${s.cls}">${s.label}</div>
      <div class="cell c-date">${fmtDate(t.date)}</div>
      <div class="cell c-time">${esc(t.priority)}</div>
      <div class="cell link c-points">${t.notes==='—'?'—':`<a href="#">${esc(t.notes)}</a>`}</div>
      <div class="assignees">${avatars(t.people)}
        <span class="row-actions">
          <button class="mini edit" title="Edit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg></button>
          <button class="mini del" title="Delete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
        </span>
      </div>`;
    row.querySelector('.check').onclick = () => { t.done=!t.done; if(t.done)t.status='published'; render(); };
    row.querySelector('.edit').onclick = () => openForm(t);
    row.querySelector('.del').onclick = () => {
      tasks = tasks.filter(x=>x.id!==t.id);
      if (editingId === t.id) closeForm();
      render();
    };
    list.appendChild(row);
  });
  empty.classList.toggle('hidden', filtered.length>0);
}
function esc(s){ return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
render();