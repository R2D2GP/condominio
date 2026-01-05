document.addEventListener('DOMContentLoaded', () => {
  // --- Modal Control ---
  const ingresoModal = document.getElementById('ingreso-modal');
  const gastoModal = document.getElementById('gasto-modal');
  const registrarIngresoBtn = document.getElementById('registrar-ingreso-btn');
  const registrarGastoBtn = document.getElementById('registrar-gasto-btn');
  const closeButtons = document.querySelectorAll('.close-button, .cancel-button');

  const openModal = (modal) => {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  };

  const closeModal = (modal) => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    const form = modal.querySelector('form');
    if (form) form.reset();
    modal.removeAttribute('data-editing-id');
  };

  if (registrarIngresoBtn) registrarIngresoBtn.addEventListener('click', () => openModal(ingresoModal));
  if (registrarGastoBtn) registrarGastoBtn.addEventListener('click', () => openModal(gastoModal));
  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal(ingresoModal);
      closeModal(gastoModal);
    });
  });

  // --- Calendar Control ---
  const setupFunctionalCalendar = (modalId) => {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    const monthYearDisplay = modal.querySelector('.month-year-display');
    const prevMonthBtn = modal.querySelector('.prev-month-btn');
    const nextMonthBtn = modal.querySelector('.next-month-btn');
    const calendarGrid = modal.querySelector('.calendar-grid');

    if (!monthYearDisplay || !prevMonthBtn || !nextMonthBtn || !calendarGrid) {
      return;
    }

    let currentDate = new Date();
    let selectedDate = null;

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    const renderCalendar = () => {
      const month = currentDate.getMonth();
      const year = currentDate.getFullYear();

      monthYearDisplay.textContent = `${monthNames[month]} ${year}`;
      calendarGrid.innerHTML = '';

      const dayLabels = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
      dayLabels.forEach(day => {
        const dayLabel = document.createElement('span');
        dayLabel.textContent = day;
        dayLabel.classList.add('text-gray-500', 'text-center');
        calendarGrid.appendChild(dayLabel);
      });

      const firstDayOfMonth = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyCell = document.createElement('span');
        calendarGrid.appendChild(emptyCell);
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('span');
        dayCell.textContent = day;
        dayCell.classList.add('p-2', 'text-center', 'cursor-pointer', 'rounded-full', 'hover:bg-gray-200', 'dark:hover:bg-gray-700');
        dayCell.dataset.date = new Date(year, month, day).toISOString().split('T')[0];

        if (selectedDate && new Date(dayCell.dataset.date).toDateString() === new Date(selectedDate).toDateString()) {
          dayCell.classList.add('bg-green-500', 'text-white');
        }

        calendarGrid.appendChild(dayCell);
      }
    };

    prevMonthBtn.addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() + 1);
      renderCalendar();
    });

    calendarGrid.addEventListener('click', (event) => {
      const target = event.target;
      if (target.tagName === 'SPAN' && target.dataset.date) {
        selectedDate = target.dataset.date;
        modal.dataset.selectedDate = selectedDate;
        renderCalendar();
      }
    });

    renderCalendar();
  };

  setupFunctionalCalendar('ingreso-modal');
  setupFunctionalCalendar('gasto-modal');

  // --- Data Handling ---
  const saveIngresoBtn = ingresoModal.querySelector('.save-button');
  const saveGastoBtn = gastoModal.querySelector('.save-button');
  const tableBody = document.querySelector('tbody');
  const tableFooter = document.querySelector('.table-footer');

  const renderMovements = () => {
    const movements = getMovements();
    if (!tableBody) return;
    tableBody.innerHTML = '';

    if (movements.length === 0) {
      if (tableFooter) tableFooter.style.display = 'none';
      const emptyRow = document.createElement('tr');
      emptyRow.innerHTML = `<td colspan="6" class="p-4 text-center text-gray-500">No hay movimientos registrados.</td>`;
      tableBody.appendChild(emptyRow);
    } else {
      if (tableFooter) tableFooter.style.display = 'block';
      movements.forEach(movement => {
        const row = document.createElement('tr');
        row.classList.add('hover:bg-gray-50', 'dark:hover:bg-gray-800/50', 'transition-colors');
        const formattedAmount = movement.type === 'income' ? `+S/${movement.amount.toFixed(2)}` : `-S/${movement.amount.toFixed(2)}`;
        const amountColor = movement.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';

        row.innerHTML = `
          <td class="p-4 text-gray-600 dark:text-gray-300 text-sm whitespace-nowrap">${movement.date}</td>
          <td class="p-4">
            <div class="flex flex-col">
              <span class="font-bold text-[#111418] dark:text-white text-base">${movement.department || 'N/A'}</span>
              <span class="text-xs text-gray-500">${movement.tenant || ''}</span>
            </div>
          </td>
          <td class="p-4">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${movement.type === 'income' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200' : 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200'}">${movement.type === 'income' ? 'Ingreso' : 'Egreso'}</span>
          </td>
          <td class="p-4 text-base text-gray-800 dark:text-gray-200">${movement.description}</td>
          <td class="p-4 text-right font-bold ${amountColor} text-lg">${formattedAmount}</td>
          <td class="p-4 text-center">
            <button class="edit-button p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" data-id="${movement.id}">
              <span class="material-symbols-outlined">edit</span>
            </button>
            <button class="delete-button p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" data-id="${movement.id}">
              <span class="material-symbols-outlined">delete</span>
            </button>
          </td>
        `;
        tableBody.appendChild(row);
      });
    }
  };

  const updateSummary = () => {
    const totals = getTotals();
    const incomeEl = document.getElementById('income-total');
    const expenseEl = document.getElementById('expense-total');
    const balanceEl = document.getElementById('balance-total');

    if (incomeEl) incomeEl.textContent = `S/${totals.income.toFixed(2)}`;
    if (expenseEl) expenseEl.textContent = `S/${totals.expense.toFixed(2)}`;
    if (balanceEl) balanceEl.textContent = `S/${totals.balance.toFixed(2)}`;
  };

  if (saveIngresoBtn) {
    saveIngresoBtn.addEventListener('click', () => {
      const amount = parseFloat(document.getElementById('ingreso-monto').value);
      const date = ingresoModal.dataset.selectedDate;
      const department = document.getElementById('ingreso-departamento').value;
      const tenant = document.getElementById('ingreso-inquilino').value;
      const description = document.getElementById('ingreso-descripcion').value;
      const editingId = parseInt(ingresoModal.getAttribute('data-editing-id'));

      if (!amount || !date || !description) {
        alert('Por favor, complete todos los campos obligatorios.');
        return;
      }

      const movement = { type: 'income', amount, date, department, tenant, description };

      if (editingId) {
        updateMovement(editingId, movement);
      } else {
        saveMovement(movement);
      }

      renderMovements();
      updateSummary();
      closeModal(ingresoModal);
    });
  }

  if (saveGastoBtn) {
    saveGastoBtn.addEventListener('click', () => {
      const amount = parseFloat(document.getElementById('gasto-monto').value);
      const date = gastoModal.dataset.selectedDate;
      const description = document.getElementById('gasto-descripcion').value;
      const notes = document.getElementById('gasto-notas').value;
      const editingId = parseInt(gastoModal.getAttribute('data-editing-id'));

      if (!amount || !date || !description) {
        alert('Por favor, complete todos los campos obligatorios.');
        return;
      }

      const movement = { type: 'expense', amount, date, description, notes };

      if (editingId) {
        updateMovement(editingId, movement);
      } else {
        saveMovement(movement);
      }

      renderMovements();
      updateSummary();
      closeModal(gastoModal);
    });
  }

  if (tableBody) {
    tableBody.addEventListener('click', (event) => {
      const target = event.target;
      const editButton = target.closest('.edit-button');
      const deleteButton = target.closest('.delete-button');

      if (editButton) {
        const movementId = parseInt(editButton.dataset.id);
        const movement = getMovementById(movementId);

        if (movement.type === 'income') {
          ingresoModal.setAttribute('data-editing-id', movement.id);
          document.getElementById('ingreso-monto').value = movement.amount;
          ingresoModal.dataset.selectedDate = movement.date;
          document.getElementById('ingreso-departamento').value = movement.department;
          document.getElementById('ingreso-inquilino').value = movement.tenant;
          document.getElementById('ingreso-descripcion').value = movement.description;
          openModal(ingresoModal);
        } else {
          gastoModal.setAttribute('data-editing-id', movement.id);
          document.getElementById('gasto-monto').value = movement.amount;
          gastoModal.dataset.selectedDate = movement.date;
          document.getElementById('gasto-descripcion').value = movement.description;
          document.getElementById('gasto-notas').value = movement.notes;
          openModal(gastoModal);
        }
      }

      if (deleteButton) {
        const movementId = parseInt(deleteButton.dataset.id);
        if (confirm('¿Está seguro de que desea eliminar este movimiento?')) {
          deleteMovement(movementId);
          renderMovements();
          updateSummary();
        }
      }
    });
  }

  renderMovements();
  updateSummary();
});
