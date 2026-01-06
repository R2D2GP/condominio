
document.addEventListener('DOMContentLoaded', () => {
    const { jsPDF } = window.jspdf;

    let startDate = null;
    let endDate = null;
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    const calendarContainer = document.querySelector('.flex.flex-wrap.justify-center.gap-8.md\\:gap-12');
    const startDateDisplay = document.querySelector('.text-\\[\\#111417\\] .text-lg.font-medium');
    const endDateDisplay = document.querySelectorAll('.text-\\[\\#111417\\] .text-lg.font-medium')[1];

    function renderCalendar() {
        calendarContainer.innerHTML = '';
        const date = new Date(currentYear, currentMonth);

        const monthDiv = document.createElement('div');
        monthDiv.className = 'flex flex-col gap-4 w-full max-w-[320px]';
        monthDiv.innerHTML = `
            <div class="flex items-center justify-between px-2">
                <button class="prev-month p-2 hover:bg-background-light rounded-full transition-colors">
                    <span class="material-symbols-outlined text-[#111417]">chevron_left</span>
                </button>
                <span class="text-[#111417] text-base font-bold">${monthNames[currentMonth]} ${currentYear}</span>
                <button class="next-month p-2 hover:bg-background-light rounded-full transition-colors">
                    <span class="material-symbols-outlined text-[#111417]">chevron_right</span>
                </button>
            </div>
            <div class="grid grid-cols-7 gap-y-2 text-center">
                ${['D', 'L', 'M', 'M', 'J', 'V', 'S'].map(day => `<div class="text-[#647587] text-xs font-bold uppercase py-2">${day}</div>`).join('')}
            </div>
        `;
        const daysGrid = monthDiv.querySelector('.grid.grid-cols-7');

        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        for (let i = 0; i < firstDay; i++) {
            daysGrid.innerHTML += '<div class="p-1"></div>';
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');
            dayCell.className = 'p-1';
            const dayButton = document.createElement('div');
            dayButton.className = 'day-cell size-9 flex items-center justify-center rounded-full hover:bg-background-light cursor-pointer text-[#111417] text-sm';
            dayButton.textContent = day;
            // Use UTC to prevent timezone-related date shifts
            dayButton.dataset.date = new Date(Date.UTC(currentYear, currentMonth, day)).toISOString().split('T')[0];
            dayCell.appendChild(dayButton);
            daysGrid.appendChild(dayCell);
        }

        calendarContainer.appendChild(monthDiv);
        updateCalendarSelection();
    }

    function updateCalendarSelection() {
        const dayCells = document.querySelectorAll('.day-cell');
        dayCells.forEach(cell => {
            const cellDate = new Date(cell.dataset.date);
            cell.classList.remove('bg-primary', 'text-white', 'font-bold', 'shadow-md');

            if (startDate && cellDate.getTime() === startDate.getTime()) {
                cell.classList.add('bg-primary', 'text-white', 'font-bold', 'shadow-md');
            }
            if (endDate && cellDate.getTime() === endDate.getTime()) {
                cell.classList.add('bg-primary', 'text-white', 'font-bold', 'shadow-md');
            }
        });
    }

    calendarContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('day-cell')) {
            // Append 'T00:00:00' to ensure the date is parsed as UTC
            const selectedDate = new Date(e.target.dataset.date + 'T00:00:00');
            if (!startDate || (startDate && endDate)) {
                startDate = selectedDate;
                endDate = null;
            } else if (selectedDate > startDate) {
                endDate = selectedDate;
            } else {
                startDate = selectedDate;
            }
            updateDateDisplays();
            updateCalendarSelection();
        } else if (e.target.closest('.prev-month')) {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            renderCalendar();
        } else if (e.target.closest('.next-month')) {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderCalendar();
        }
    });

    function updateDateDisplays() {
        if (startDate) {
            startDateDisplay.textContent = `${startDate.getDate()} ${monthNames[startDate.getMonth()]} ${startDate.getFullYear()}`;
        }
        if (endDate) {
            endDateDisplay.textContent = `${endDate.getDate()} ${monthNames[endDate.getMonth()]} ${endDate.getFullYear()}`;
        }
    }

    renderCalendar();

    let lastFilteredMovements = [];

    const generateReportBtn = document.querySelector('.flex.min-w-\\[200px\\].cursor-pointer.items-center.justify-center');
    generateReportBtn.addEventListener('click', () => {
        if (!startDate || !endDate) {
            alert('Por favor, seleccione una fecha de inicio y fin.');
            return;
        }

        const movements = getMovements();
        lastFilteredMovements = movements.filter(m => {
            const moveDate = new Date(m.date);
            return moveDate >= startDate && moveDate <= endDate;
        });

        updateSummary(lastFilteredMovements);
        renderReportTable(lastFilteredMovements);
    });

    function generatePdf(movements, title) {
        if (movements.length === 0) {
            alert(`No hay datos de ${title.toLowerCase()} para generar el PDF.`);
            return;
        }

        const doc = new jsPDF();
        doc.text(title, 14, 16);

        const tableColumn = ["Fecha", "Departamento", "Tipo", "Descripción", "Monto (S/)"];
        const tableRows = movements.map(m => {
            return [
                formatDate(m.date),
                m.department || 'N/A',
                m.type === 'income' ? 'Ingreso' : 'Egreso',
                m.description,
                m.amount.toFixed(2)
            ];
        });

        const income = movements.filter(m => m.type === 'income').reduce((sum, m) => sum + m.amount, 0);
        const expense = movements.filter(m => m.type === 'expense').reduce((sum, m) => sum + m.amount, 0);
        const balance = income - expense;

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 20,
            foot: [['', '', '', 'Saldo Final:', balance.toFixed(2)]],
            footStyles: {
                fontStyle: 'bold',
                fillColor: [230, 230, 230],
                textColor: [0, 0, 0]
            },
        });
        doc.save(`reporte_${title.toLowerCase().replace(/ /g, '_')}.pdf`);
    }

    document.getElementById('download-pdf-all').addEventListener('click', () => {
        generatePdf(lastFilteredMovements, 'Todos los Movimientos');
    });

    document.getElementById('download-pdf-income').addEventListener('click', () => {
        const incomeMovements = lastFilteredMovements.filter(m => m.type === 'income');
        generatePdf(incomeMovements, 'Ingresos');
    });

    document.getElementById('download-pdf-expenses').addEventListener('click', () => {
        const expenseMovements = lastFilteredMovements.filter(m => m.type === 'expense');
        generatePdf(expenseMovements, 'Egresos');
    });

    function updateSummary(movements) {
        const income = movements.filter(m => m.type === 'income').reduce((sum, m) => sum + m.amount, 0);
        const expense = movements.filter(m => m.type === 'expense').reduce((sum, m) => sum + m.amount, 0);
        const balance = income - expense;

        document.querySelectorAll('.text-\\[\\#111417\\] .text-4xl.font-bold')[0].textContent = `S/ ${income.toFixed(2)}`;
        document.querySelectorAll('.text-\\[\\#111417\\] .text-4xl.font-bold')[1].textContent = `S/ ${expense.toFixed(2)}`;
        document.querySelector('.text-white.text-4xl.font-bold').textContent = `S/ ${balance.toFixed(2)}`;
    }

    function renderReportTable(movements) {
        const tableBody = document.querySelector('#report-table tbody');
        tableBody.innerHTML = '';
        if (movements.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center p-4">No hay movimientos en el rango de fechas seleccionado.</td></tr>';
            return;
        }
        movements.forEach(m => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="py-4 px-6">${formatDate(m.date)}</td>
                <td class="py-4 px-6">${m.department || 'N/A'}</td>
                <td class="py-4 px-6">${m.type === 'income' ? 'Ingreso' : 'Egreso'}</td>
                <td class="py-4 px-6">${m.description}</td>
                <td class="py-4 px-6 text-right">S/ ${m.amount.toFixed(2)}</td>
            `;
            tableBody.appendChild(row);
        });
    }
});
