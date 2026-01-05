// js/storage.js

// Function to get movements from LocalStorage
function getMovements() {
  const movements = localStorage.getItem('movements');
  return movements ? JSON.parse(movements) : [];
}

// Function to save a movement to LocalStorage
function saveMovement(movement) {
  let movements = getMovements();
  movements.push(movement);
  localStorage.setItem('movements', JSON.stringify(movements));
}

// Function to calculate totals
function getTotals() {
  const movements = getMovements();
  const totals = movements.reduce((acc, movement) => {
    if (movement.type === 'income') {
      acc.income += movement.amount;
    } else {
      acc.expense += movement.amount;
    }
    return acc;
  }, { income: 0, expense: 0 });

  totals.balance = totals.income - totals.expense;
  return totals;
}
