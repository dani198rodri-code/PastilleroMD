// Estado de la Aplicación
let meds = JSON.parse(localStorage.getItem('pastillero_meds') || '[]');
// logs: { "YYYY-MM-DD": { [medId]: { taken: true, time: "08:15" } } }
let logs = JSON.parse(localStorage.getItem('pastillero_logs') || '{}');

// Tema actual: 'light' o 'dark'
let currentTheme = localStorage.getItem('pastillero_theme') || 'light';

let currentViewDate = new Date();
let selectedDateStr = getFormattedDate(new Date());

// Si no hay medicinas, agregar unas iniciales de demostración
if (meds.length === 0) {
  meds = [
    { id: '1', name: 'Presión / Control', dose: '1 tableta', time: '08:00', notes: 'Tomar con el desayuno' },
    { id: '2', name: 'Vitamina / Suplemento', dose: '1 cápsula', time: '13:00', notes: 'Después del almuerzo' }
  ];
  saveMeds();
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  renderHeaderDate();
  setupEventListeners();
  renderAll();
});

// Inicializar Tema Claro / Oscuro
function initTheme() {
  const btnTheme = document.getElementById('btnThemeToggle');
  if (currentTheme === 'dark') {
    document.body.classList.add('dark-mode');
    btnTheme.textContent = '☀️';
    btnTheme.title = 'Cambiar a Modo Claro';
  } else {
    document.body.classList.remove('dark-mode');
    btnTheme.textContent = '🌙';
    btnTheme.title = 'Cambiar a Modo Oscuro';
  }
}

function toggleTheme() {
  const btnTheme = document.getElementById('btnThemeToggle');
  if (document.body.classList.contains('dark-mode')) {
    document.body.classList.remove('dark-mode');
    currentTheme = 'light';
    btnTheme.textContent = '🌙';
    btnTheme.title = 'Cambiar a Modo Oscuro';
  } else {
    document.body.classList.add('dark-mode');
    currentTheme = 'dark';
    btnTheme.textContent = '☀️';
    btnTheme.title = 'Cambiar a Modo Claro';
  }
  localStorage.setItem('pastillero_theme', currentTheme);
}

function setupEventListeners() {
  // Botón Modo Oscuro / Claro
  document.getElementById('btnThemeToggle').addEventListener('click', toggleTheme);

  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });

  // Botón Rápido "Ya la tomé hoy"
  document.getElementById('btnCheckAllToday').addEventListener('click', () => {
    const today = getFormattedDate(new Date());
    if (!logs[today]) logs[today] = {};
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    meds.forEach(m => {
      logs[today][m.id] = { taken: true, time: nowTime };
    });
    saveLogs();
    renderAll();
  });

  // Reiniciar hoy
  document.getElementById('btnResetToday').addEventListener('click', () => {
    const today = getFormattedDate(new Date());
    if (confirm('¿Deseas reiniciar las tomas registradas el día de hoy?')) {
      delete logs[today];
      saveLogs();
      renderAll();
    }
  });

  // Navegación Calendario
  document.getElementById('btnPrevMonth').addEventListener('click', () => {
    currentViewDate.setMonth(currentViewDate.getMonth() - 1);
    renderCalendar();
  });
  document.getElementById('btnNextMonth').addEventListener('click', () => {
    currentViewDate.setMonth(currentViewDate.getMonth() + 1);
    renderCalendar();
  });

  // Modal
  const modal = document.getElementById('medModal');
  const openModal = () => {
    document.getElementById('medForm').reset();
    document.getElementById('medId').value = '';
    document.getElementById('modalTitle').textContent = 'Agregar Medicamento';
    modal.classList.remove('hidden');
  };
  document.getElementById('btnOpenAddMed').addEventListener('click', openModal);
  document.getElementById('btnAddNewMedInTab').addEventListener('click', openModal);
  document.getElementById('btnCloseModal').addEventListener('click', () => modal.classList.add('hidden'));
  document.getElementById('btnCancelModal').addEventListener('click', () => modal.classList.add('hidden'));

  // Form submit
  document.getElementById('medForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('medId').value || Date.now().toString();
    const name = document.getElementById('medName').value.trim();
    const dose = document.getElementById('medDose').value.trim();
    const time = document.getElementById('medTime').value;
    const notes = document.getElementById('medNotes').value.trim();

    const existingIdx = meds.findIndex(m => m.id === id);
    if (existingIdx >= 0) {
      meds[existingIdx] = { id, name, dose, time, notes };
    } else {
      meds.push({ id, name, dose, time, notes });
    }
    saveMeds();
    modal.classList.add('hidden');
    renderAll();
  });
}

function renderAll() {
  renderTodayStatus();
  renderCalendar();
  renderDayDetail(selectedDateStr);
  renderTodayList();
  renderInventoryList();
}

function renderHeaderDate() {
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  const d = new Date().toLocaleDateString('es-ES', options);
  document.getElementById('todayDateStr').textContent = d.charAt(0).toUpperCase() + d.slice(1);
}

function renderTodayStatus() {
  const today = getFormattedDate(new Date());
  const todayLogs = logs[today] || {};
  const totalMeds = meds.length;
  let takenCount = 0;

  meds.forEach(m => {
    if (todayLogs[m.id] && todayLogs[m.id].taken) takenCount++;
  });

  const percentage = totalMeds > 0 ? (takenCount / totalMeds) * 100 : 0;
  document.getElementById('todayProgressBar').style.width = `${percentage}%`;
  document.getElementById('todayProgressText').textContent = `${takenCount} de ${totalMeds} tomas registradas hoy`;

  const btnCheckAll = document.getElementById('btnCheckAllToday');
  const title = document.getElementById('todayStatusTitle');
  const sub = document.getElementById('todayStatusSubtitle');

  if (totalMeds > 0 && takenCount === totalMeds) {
    title.textContent = '🎉 ¡Todo tomado por hoy!';
    sub.textContent = 'Has cumplido satisfactoriamente tu tratamiento del día.';
    btnCheckAll.textContent = '✓ Dosis completas hoy';
    btnCheckAll.style.background = '#059669';
  } else {
    title.textContent = '¿Ya tomaste tu medicación de hoy?';
    sub.textContent = 'Marca tus dosis con un toque para actualizar el calendario.';
    btnCheckAll.textContent = '✓ ¡Sí, ya la tomé hoy!';
    btnCheckAll.style.background = 'linear-gradient(135deg, #10b981, #047857)';
  }

  // Racha
  calculateStreak();
}

function calculateStreak() {
  let streak = 0;
  let d = new Date();
  
  while (true) {
    const dStr = getFormattedDate(d);
    const dayLog = logs[dStr];
    if (dayLog && meds.length > 0 && meds.every(m => dayLog[m.id] && dayLog[m.id].taken)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      if (dStr === getFormattedDate(new Date())) {
        d.setDate(d.getDate() - 1);
        continue;
      }
      break;
    }
  }
  document.getElementById('streakCount').textContent = `${streak} ${streak === 1 ? 'día' : 'días'}`;
}

function renderCalendar() {
  const year = currentViewDate.getFullYear();
  const month = currentViewDate.getMonth();
  
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  document.getElementById('calMonthYearTitle').textContent = `${monthNames[month]} ${year}`;

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  let startDayOfWeek = firstDay.getDay() - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6;

  const grid = document.getElementById('calDaysGrid');
  grid.innerHTML = '';

  for (let i = 0; i < startDayOfWeek; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'cal-day-cell other-month';
    grid.appendChild(emptyCell);
  }

  const todayStr = getFormattedDate(new Date());

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const cellDate = new Date(year, month, day);
    const dateStr = getFormattedDate(cellDate);

    const cell = document.createElement('div');
    cell.className = 'cal-day-cell';
    cell.textContent = day;

    if (dateStr === todayStr) cell.classList.add('today');
    if (dateStr === selectedDateStr) cell.classList.add('selected');

    const dayLog = logs[dateStr];
    if (dayLog && meds.length > 0) {
      let count = 0;
      meds.forEach(m => {
        if (dayLog[m.id] && dayLog[m.id].taken) count++;
      });

      if (count === meds.length) {
        cell.classList.add('status-all');
      } else if (count > 0) {
        cell.classList.add('status-partial');
      } else {
        cell.classList.add('status-missed');
      }
    }

    cell.addEventListener('click', () => {
      selectedDateStr = dateStr;
      document.querySelectorAll('.cal-day-cell').forEach(c => c.classList.remove('selected'));
      cell.classList.add('selected');
      renderDayDetail(selectedDateStr);
    });

    grid.appendChild(cell);
  }
}

function renderDayDetail(dateStr) {
  const parts = dateStr.split('-');
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  const dateFormatted = d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  
  document.getElementById('selectedDayTitle').textContent = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);
  const pill = document.getElementById('selectedDayTag');
  const list = document.getElementById('selectedDayList');
  list.innerHTML = '';

  const dayLog = logs[dateStr] || {};
  let taken = 0;

  meds.forEach(m => {
    const isTaken = dayLog[m.id] && dayLog[m.id].taken;
    if (isTaken) taken++;

    const item = document.createElement('div');
    item.className = 'med-item-card';
    item.innerHTML = `
      <div class="med-info">
        <h4>${m.name}</h4>
        <p>${m.dose || 'Dosis regular'} • Hora habitual: ${m.time || '--:--'} ${isTaken ? `(Tomada a las ${dayLog[m.id].time})` : ''}</p>
      </div>
      <button class="med-check-btn ${isTaken ? 'checked' : ''}" data-id="${m.id}">
        ✓
      </button>
    `;

    item.querySelector('.med-check-btn').addEventListener('click', () => {
      toggleMedForDate(dateStr, m.id);
    });

    list.appendChild(item);
  });

  if (meds.length === 0) {
    list.innerHTML = '<p class="empty-msg">No hay medicamentos registrados.</p>';
    pill.textContent = 'Sin medicinas';
    pill.className = 'status-pill';
    return;
  }

  if (taken === meds.length) {
    pill.textContent = 'Completado ✓';
    pill.className = 'status-pill taken';
  } else if (taken > 0) {
    pill.textContent = `${taken}/${meds.length} Tomadas`;
    pill.className = 'status-pill';
  } else {
    pill.textContent = 'Sin registrar';
    pill.className = 'status-pill missed';
  }
}

function toggleMedForDate(dateStr, medId) {
  if (!logs[dateStr]) logs[dateStr] = {};
  
  const current = logs[dateStr][medId];
  if (current && current.taken) {
    delete logs[dateStr][medId];
  } else {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    logs[dateStr][medId] = { taken: true, time: nowTime };
  }
  saveLogs();
  renderAll();
}

function renderTodayList() {
  const today = getFormattedDate(new Date());
  const todayLogs = logs[today] || {};
  const container = document.getElementById('todayMedsList');
  container.innerHTML = '';

  meds.forEach(m => {
    const isTaken = todayLogs[m.id] && todayLogs[m.id].taken;
    const item = document.createElement('div');
    item.className = 'med-item-card';
    item.innerHTML = `
      <div class="med-info">
        <h4>${m.name}</h4>
        <p>${m.dose || ''} ${m.time ? '• ' + m.time : ''} ${m.notes ? '• ' + m.notes : ''}</p>
      </div>
      <button class="med-check-btn ${isTaken ? 'checked' : ''}">✓</button>
    `;

    item.querySelector('.med-check-btn').addEventListener('click', () => {
      toggleMedForDate(today, m.id);
    });

    container.appendChild(item);
  });

  if (meds.length === 0) {
    container.innerHTML = '<p class="empty-msg">No tienes medicamentos registrados. Presiona "+ Nuevo" para agregar.</p>';
  }
}

function renderInventoryList() {
  const container = document.getElementById('myMedsList');
  container.innerHTML = '';

  meds.forEach(m => {
    const item = document.createElement('div');
    item.className = 'med-item-card';
    item.innerHTML = `
      <div class="med-info">
        <h4>${m.name}</h4>
        <p>${m.dose || 'Sin dosis especificada'} • ${m.time || 'Sin hora fija'}</p>
        ${m.notes ? `<p style="color:#10b981; font-size:11px;">📝 ${m.notes}</p>` : ''}
      </div>
      <div>
        <button class="btn-text btn-delete-med" style="color: #ef4444;" data-id="${m.id}">Eliminar</button>
      </div>
    `;

    item.querySelector('.btn-delete-med').addEventListener('click', () => {
      if (confirm(`¿Eliminar ${m.name}?`)) {
        meds = meds.filter(x => x.id !== m.id);
        saveMeds();
        renderAll();
      }
    });

    container.appendChild(item);
  });

  if (meds.length === 0) {
    container.innerHTML = '<p class="empty-msg">No hay medicamentos configurados.</p>';
  }
}

function getFormattedDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function saveMeds() {
  localStorage.setItem('pastillero_meds', JSON.stringify(meds));
}

function saveLogs() {
  localStorage.setItem('pastillero_logs', JSON.stringify(logs));
}
