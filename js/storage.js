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

// --- Tenant (Inquilino) Data Functions ---

// Function to get all tenants from LocalStorage
function getTenants() {
  const tenants = localStorage.getItem('tenants');
  return tenants ? JSON.parse(tenants) : [];
}

// Function to get a single tenant by their ID
function getTenantById(id) {
  const tenants = getTenants();
  return tenants.find(tenant => tenant.id === id);
}

// Function to save a new tenant to LocalStorage
function saveTenant(tenant) {
  let tenants = getTenants();
  // Assign a unique ID to the new tenant
  tenant.id = Date.now();
  tenants.push(tenant);
  localStorage.setItem('tenants', JSON.stringify(tenants));
}

// Function to update an existing tenant in LocalStorage
function updateTenant(id, updatedTenantData) {
  let tenants = getTenants();
  const tenantIndex = tenants.findIndex(t => t.id === id);
  if (tenantIndex !== -1) {
    // Update the existing tenant, preserving their original ID
    tenants[tenantIndex] = { ...updatedTenantData, id: id };
    localStorage.setItem('tenants', JSON.stringify(tenants));
  }
}

// Function to delete a tenant from LocalStorage
function deleteTenant(id) {
  let tenants = getTenants();
  const updatedTenants = tenants.filter(tenant => tenant.id !== id);
  localStorage.setItem('tenants', JSON.stringify(updatedTenants));
}

// --- General Utility Functions ---

// Function to format a date string to DD - MM - YYYY
function formatDate(dateString) {
    // Appending 'T00:00:00' ensures the date is parsed in UTC
    const date = new Date(dateString + 'T00:00:00');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getUTCFullYear();
    return `${day} - ${month} - ${year}`;
}
