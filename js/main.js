document.addEventListener('DOMContentLoaded', () => {
  // --- Modal Control ---
  const setupModal = (modalId, openBtnId, closeBtnSelector) => {
    const modal = document.getElementById(modalId);
    const openBtn = document.getElementById(openBtnId);
    if (!modal || !openBtn) return;

    const closeBtns = modal.querySelectorAll(closeBtnSelector);

    const showModal = () => {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    };

    const hideModal = () => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    };

    openBtn.addEventListener('click', showModal);
    closeBtns.forEach(btn => btn.addEventListener('click', hideModal));
  };

  setupModal('ingreso-modal', 'registrar-ingreso-btn', '.close-button, .cancel-button');
  setupModal('gasto-modal', 'registrar-gasto-btn', '.close-button, .cancel-button');

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
  const ingresoForm = document.getElementById('ingreso-modal');
  const gastoForm = document.getElementById('gasto-modal');
  const saveIngresoBtn = ingresoForm.querySelector('.save-button');
  const saveGastoBtn = gastoForm.querySelector('.save-button');

  const renderMovements = () => {
    const movements = getMovements();
    const tableBody = document.querySelector('tbody');
    if (!tableBody) return;
    tableBody.innerHTML = '';

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
          <button class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <span class="material-symbols-outlined">edit</span>
          </button>
          <button class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <span class="material-symbols-outlined">delete</span>
          </button>
        </td>
      `;
      tableBody.appendChild(row);
    });
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
      const date = ingresoForm.dataset.selectedDate;
      const department = document.getElementById('ingreso-departamento').value;
      const tenant = document.getElementById('ingreso-inquilino').value;
      const description = document.getElementById('ingreso-descripcion').value;

      if (!amount || !date || !description) {
        alert('Por favor, complete todos los campos obligatorios.');
        return;
      }

      const movement = { type: 'income', amount, date, department, tenant, description };
      saveMovement(movement);
      renderMovements();
      updateSummary();
      ingresoForm.classList.add('hidden');
    });
  }

  if (saveGastoBtn) {
    saveGastoBtn.addEventListener('click', () => {
      const amount = parseFloat(document.getElementById('gasto-monto').value);
      const date = gastoForm.dataset.selectedDate;
      const description = document.getElementById('gasto-descripcion').value;
      const notes = document.getElementById('gasto-notas').value;

      if (!amount || !date || !description) {
        alert('Por favor, complete todos los campos obligatorios.');
        return;
      }

      const movement = { type: 'expense', amount, date, description, notes };
      saveMovement(movement);
      renderMovements();
      updateSummary();
      gastoForm.classList.add('hidden');
    });
  }

  renderMovements();
  updateSummary();
});
