document.addEventListener('DOMContentLoaded', () => {
  // --- Modal Control ---
  const setupModal = (modalId, openBtn, closeBtnSelector) => {
    const modal = document.getElementById(modalId);
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

  const openIngresoBtn = document.getElementById('registrar-ingreso-btn');
  const openGastoBtn = document.getElementById('registrar-gasto-btn');

  setupModal('ingreso-modal', openIngresoBtn, '.close-button, .cancel-button');
  setupModal('gasto-modal', openGastoBtn, '.close-button, .cancel-button');

  // --- Calendar Control ---
  const setupFunctionalCalendar = (modalId) => {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    const monthYearDisplay = modal.querySelector('.month-year-display');
    const prevMonthBtn = modal.querySelector('.prev-month-btn');
    const nextMonthBtn = modal.querySelector('.next-month-btn');
    const calendarGrid = modal.querySelector('.calendar-grid');

    if (!monthYearDisplay || !prevMonthBtn || !nextMonthBtn || !calendarGrid) {
      console.error('Calendar elements not found in modal:', modalId);
      return;
    }

    let currentDate = new Date();
    let selectedDate = null;

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    const renderCalendar = () => {
      const month = currentDate.getMonth();
      const year = currentDate.getFullYear();

      monthYearDisplay.textContent = `${monthNames[month]} ${year}`;
      calendarGrid.innerHTML = ''; // Clear previous calendar days

      // Add day labels
      const dayLabels = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
      dayLabels.forEach(day => {
        const dayLabel = document.createElement('span');
        dayLabel.textContent = day;
        dayLabel.classList.add('text-gray-500', 'text-center');
        calendarGrid.appendChild(dayLabel);
      });

      const firstDayOfMonth = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      // Add empty cells for days before the first of the month
      for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyCell = document.createElement('span');
        calendarGrid.appendChild(emptyCell);
      }

      // Add day cells
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
        renderCalendar(); // Re-render to show selection
      }
    });

    renderCalendar();
  };

  setupFunctionalCalendar('ingreso-modal');
  setupFunctionalCalendar('gasto-modal');
});
