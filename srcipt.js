/* ================================================
   BLADEWORK BARBEARIA — SCRIPT.JS
   Agendamento com LocalStorage, validação e UX completa
================================================ */

'use strict';

/* ================================================
   CONSTANTES
================================================ */

const STORAGE_KEY = 'bladework_appointments';

const TIME_SLOTS = [
  '08:00','08:30','09:00','09:30','10:00','10:30',
  '11:00','11:30','13:00','13:30','14:00','14:30',
  '15:00','15:30','16:00','16:30','17:00','17:30',
  '18:00','18:30',
];

/* ================================================
   STATE
================================================ */

let appointments = [];
let pendingDeleteId = null;
let selectedBarber = null;
let selectedTime   = null;

/* ================================================
   UTILITÁRIOS
================================================ */

/** Retorna el pelo id */
const $ = id => document.getElementById(id);

/** Formata data ISO para exibição (ex: "Ter, 12/08") */
function fmtDate(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const days  = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  return `${days[date.getDay()]}, ${String(d).padStart(2,'0')}/${String(m).padStart(2,'0')}`;
}

/** Retorna o status do agendamento baseado na data/hora */
function getStatus(isoDate, time) {
  const [y, m, d] = isoDate.split('-').map(Number);
  const [h, min]  = time.split(':').map(Number);
  const apptDate  = new Date(y, m - 1, d, h, min);
  const now       = new Date();
  const todayStr  = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

  if (isoDate < todayStr) return 'past';
  if (isoDate === todayStr) return apptDate < now ? 'past' : 'today';
  return 'upcoming';
}

/** Gera ID único */
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* ================================================
   PERSISTÊNCIA
================================================ */

function loadAppointments() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    appointments = raw ? JSON.parse(raw) : [];
  } catch {
    appointments = [];
  }
}

function saveAppointments() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
}

/* ================================================
   SLOTS DE HORÁRIO
================================================ */

/** Retorna os horários ocupados para um barbeiro em uma data */
function getOccupied(barber, date) {
  return appointments
    .filter(a => a.barber === barber && a.date === date)
    .map(a => a.time);
}

/** Renderiza os botões de horário */
function renderTimeSlots() {
  const grid    = $('timeGrid');
  const barber  = selectedBarber;
  const date    = $('dateInput').value;

  if (!barber || !date) {
    grid.innerHTML = `
      <div class="time-placeholder">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
        </svg>
        Selecione barbeiro e data primeiro
      </div>`;
    selectedTime = null;
    return;
  }

  const occupied = getOccupied(barber, date);
  grid.innerHTML = TIME_SLOTS.map(t => {
    const isOccupied = occupied.includes(t);
    const isSelected = t === selectedTime;
    let cls = 'time-slot';
    if (isOccupied) cls += ' occupied';
    if (isSelected && !isOccupied) cls += ' selected';
    return `<button type="button" class="${cls}" data-time="${t}" ${isOccupied ? 'disabled aria-disabled="true" title="Horário ocupado"' : ''}>${t}</button>`;
  }).join('');

  // Evento de clique nos slots
  grid.querySelectorAll('.time-slot:not(.occupied)').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedTime = btn.dataset.time;
      renderTimeSlots();
      clearError('time');
      updateSummary();
    });
  });
}

/* ================================================
   RESUMO
================================================ */

function updateSummary() {
  const box        = $('summaryBox');
  const serviceEl  = $('serviceSelect');
  const dateVal    = $('dateInput').value;

  const service    = serviceEl.value;
  const selOption  = serviceEl.options[serviceEl.selectedIndex];
  const dur        = selOption?.dataset?.dur || '—';

  const hasAll = service && selectedBarber && dateVal && selectedTime;
  box.style.display = hasAll ? 'flex' : 'none';
  if (!hasAll) return;

  $('sum-service').textContent  = service.split(' — ')[0];
  $('sum-barber').textContent   = selectedBarber;
  $('sum-datetime').textContent = `${fmtDate(dateVal)} às ${selectedTime}`;
  $('sum-dur').textContent      = dur;
}

/* ================================================
   VALIDAÇÃO
================================================ */

function setError(field, msg) {
  const el = $(`err-${field}`);
  if (el) el.textContent = msg;
  const fieldEl = $(`field-${field}`);
  if (fieldEl) fieldEl.classList.add('has-error');
}

function clearError(field) {
  const el = $(`err-${field}`);
  if (el) el.textContent = '';
  const fieldEl = $(`field-${field}`);
  if (fieldEl) fieldEl.classList.remove('has-error');
}

function clearAllErrors() {
  ['name','service','barber','date','time'].forEach(clearError);
}

function validate() {
  clearAllErrors();
  let valid = true;

  const name    = $('clientName').value.trim();
  const service = $('serviceSelect').value;
  const date    = $('dateInput').value;

  if (name.length < 3) {
    setError('name', 'Informe seu nome completo (mín. 3 caracteres).');
    valid = false;
  }
  if (!service) {
    setError('service', 'Selecione um serviço para continuar.');
    valid = false;
  }
  if (!selectedBarber) {
    setError('barber', 'Escolha um barbeiro para continuar.');
    valid = false;
  }
  if (!date) {
    setError('date', 'Selecione uma data.');
    valid = false;
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [y, m, d] = date.split('-').map(Number);
    const chosen = new Date(y, m - 1, d);
    if (chosen < today) {
      setError('date', 'Não é possível agendar em datas passadas.');
      valid = false;
    }
  }
  if (!selectedTime) {
    setError('time', 'Selecione um horário disponível.');
    valid = false;
  } else {
    // Dupla verificação de conflito
    const occupied = getOccupied(selectedBarber, date);
    if (occupied.includes(selectedTime)) {
      setError('time', 'Este horário acabou de ser ocupado. Escolha outro.');
      renderTimeSlots();
      valid = false;
    }
  }

  return valid;
}

/* ================================================
   AGENDAR
================================================ */

function handleSubmit(e) {
  e.preventDefault();
  if (!validate()) return;

  const name    = $('clientName').value.trim();
  const service = $('serviceSelect').value;
  const date    = $('dateInput').value;

  const appt = {
    id:      genId(),
    name,
    service,
    barber:  selectedBarber,
    date,
    time:    selectedTime,
    created: Date.now(),
  };

  appointments.push(appt);
  saveAppointments();

  // Reset form
  $('bookingForm').reset();
  selectedBarber = null;
  selectedTime   = null;
  document.querySelectorAll('.barber-card').forEach(c => c.classList.remove('selected'));
  renderTimeSlots();
  updateSummary();
  clearAllErrors();

  // Set date to today as default for next booking
  setMinDate();

  renderList();
  showToast('success', '🎉', `Agendamento de <strong>${name}</strong> confirmado!`);
}

/* ================================================
   CANCELAR
================================================ */

function confirmDelete(id) {
  const appt = appointments.find(a => a.id === id);
  if (!appt) return;
  pendingDeleteId = id;
  $('modalDesc').innerHTML = `Deseja cancelar o agendamento de <strong>${appt.name}</strong> — ${fmtDate(appt.date)} às ${appt.time}?`;
  openModal();
}

function executeDelete() {
  if (!pendingDeleteId) return;
  const appt = appointments.find(a => a.id === pendingDeleteId);
  appointments = appointments.filter(a => a.id !== pendingDeleteId);
  saveAppointments();
  pendingDeleteId = null;
  closeModal();
  renderList();
  renderTimeSlots(); // atualiza slots caso a data/barbeiro atual sejam os mesmos
  if (appt) showToast('info', '🗑️', `Agendamento de ${appt.name} cancelado.`);
}

function clearAll() {
  if (!appointments.length) return;
  appointments = [];
  saveAppointments();
  renderList();
  renderTimeSlots();
  showToast('info', '🧹', 'Todos os agendamentos foram removidos.');
}

/* ================================================
   RENDER LISTA
================================================ */

function renderList() {
  const container = $('appointmentsList');
  const searchVal = $('searchInput').value.toLowerCase().trim();
  const filterBrb = $('filterBarber').value;

  let filtered = [...appointments];

  if (searchVal) {
    filtered = filtered.filter(a =>
      a.name.toLowerCase().includes(searchVal) ||
      a.service.toLowerCase().includes(searchVal)
    );
  }
  if (filterBrb) {
    filtered = filtered.filter(a => a.barber === filterBrb);
  }

  // Ordena: mais próximos primeiro
  filtered.sort((a, b) => {
    const da = new Date(`${a.date}T${a.time}`);
    const db = new Date(`${b.date}T${b.time}`);
    return da - db;
  });

  // Atualiza contador
  const count = filtered.length;
  $('listCount').textContent = `${count} ${count === 1 ? 'agendamento' : 'agendamentos'}`;
  $('btnClearAll').style.display = appointments.length ? 'inline-block' : 'none';

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="list-empty">
        <div class="empty-icon">${searchVal || filterBrb ? '🔍' : '📅'}</div>
        <h3>${searchVal || filterBrb ? 'Nenhum resultado' : 'Sem agendamentos'}</h3>
        <p>${searchVal || filterBrb ? 'Tente outros filtros.' : 'Os horários marcados aparecerão aqui.'}</p>
      </div>`;
    return;
  }

  container.innerHTML = filtered.map(a => {
    const status   = getStatus(a.date, a.time);
    const labelMap = { upcoming: 'Confirmado', today: 'Hoje', past: 'Concluído' };
    const label    = labelMap[status];
    return `
      <div class="appt-card status-${status}" data-id="${a.id}">
        <div class="appt-time-col">
          <div class="appt-time-hour">${a.time}</div>
          <div class="appt-time-date">${fmtDate(a.date)}</div>
        </div>
        <div class="appt-divider"></div>
        <div class="appt-info">
          <div class="appt-name">${escHtml(a.name)}</div>
          <div class="appt-service">${escHtml(a.service.split(' — ')[0])}</div>
          <div class="appt-tags">
            <span class="appt-tag tag-barber">✂️ ${escHtml(a.barber)}</span>
            <span class="appt-tag tag-status ${status}">${label}</span>
          </div>
        </div>
        <button class="appt-del-btn" data-del="${a.id}" title="Cancelar agendamento" aria-label="Cancelar agendamento de ${escHtml(a.name)}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
          </svg>
        </button>
      </div>`;
  }).join('');

  // Delegation: botões deletar
  container.querySelectorAll('[data-del]').forEach(btn => {
    btn.addEventListener('click', () => confirmDelete(btn.dataset.del));
  });
}

/* ===== Escape HTML ===== */
function escHtml(str) {
  return str
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

/* ================================================
   TOAST
================================================ */

function showToast(type, emoji, html) {
  const container = $('toastContainer');
  const el        = document.createElement('div');
  el.className    = `toast toast-${type}`;
  el.innerHTML    = `<span class="toast-emoji">${emoji}</span><span>${html}</span>`;
  container.appendChild(el);

  setTimeout(() => {
    el.classList.add('out');
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }, 3500);
}

/* ================================================
   MODAL
================================================ */

function openModal()  { $('modalOverlay').classList.add('open'); }
function closeModal() { $('modalOverlay').classList.remove('open'); pendingDeleteId = null; }

/* ================================================
   SETUP DE DATA MÍNIMA
================================================ */

function setMinDate() {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  $('dateInput').min = `${y}-${m}-${d}`;
}

/* ================================================
   EVENT LISTENERS
================================================ */

function initEvents() {
  // Formulário
  $('bookingForm').addEventListener('submit', handleSubmit);

  // Barbeiros
  document.getElementById('barberGrid').addEventListener('click', e => {
    const card = e.target.closest('[data-barber]');
    if (!card) return;
    document.querySelectorAll('.barber-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedBarber = card.dataset.barber;
    selectedTime   = null; // reset horário ao trocar barbeiro
    renderTimeSlots();
    clearError('barber');
    updateSummary();
  });

  // Data
  $('dateInput').addEventListener('change', () => {
    selectedTime = null;
    renderTimeSlots();
    clearError('date');
    updateSummary();
  });

  // Serviço
  $('serviceSelect').addEventListener('change', () => {
    clearError('service');
    updateSummary();
  });

  // Nome
  $('clientName').addEventListener('input', () => {
    if ($('clientName').value.trim().length >= 3) clearError('name');
  });

  // Busca / filtro
  $('searchInput').addEventListener('input', renderList);
  $('filterBarber').addEventListener('change', renderList);

  // Limpar todos
  $('btnClearAll').addEventListener('click', clearAll);

  // Modal
  $('modalCancel').addEventListener('click', closeModal);
  $('modalConfirm').addEventListener('click', executeDelete);
  $('modalOverlay').addEventListener('click', e => {
    if (e.target === $('modalOverlay')) closeModal();
  });

  // Tecla Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
}

/* ================================================
   INIT
================================================ */

function init() {
  loadAppointments();
  setMinDate();
  renderTimeSlots();
  renderList();
  initEvents();
}

document.addEventListener('DOMContentLoaded', init);