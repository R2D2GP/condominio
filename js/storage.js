// js/storage.js

// Function to get all movements from LocalStorage
function getMovements() {
  const movements = localStorage.getItem('movements');
  return movements ? JSON.parse(movements) : [];
}

// Function to get a single movement by its ID
function getMovementById(id) {
  const movements = getMovements();
  return movements.find(movement => movement.id === id);
}

// Function to save a new movement to LocalStorage
function saveMovement(movement) {
  let movements = getMovements();
  // Assign a unique ID to the new movement
  movement.id = Date.now();
  movements.push(movement);
  localStorage.setItem('movements', JSON.stringify(movements));
}

// Function to update an existing movement in LocalStorage
function updateMovement(id, updatedMovementData) {
  let movements = getMovements();
  const movementIndex = movements.findIndex(m => m.id === id);
  if (movementIndex !== -1) {
    // Update the existing movement, preserving its original ID
    movements[movementIndex] = { ...updatedMovementData, id: id };
    localStorage.setItem('movements', JSON.stringify(movements));
  }
}

// Function to delete a movement from LocalStorage
function deleteMovement(id) {
  let movements = getMovements();
  const updatedMovements = movements.filter(movement => movement.id !== id);
  localStorage.setItem('movements', JSON.stringify(updatedMovements));
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
