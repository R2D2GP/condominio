
document.addEventListener('DOMContentLoaded', () => {
  const tenantModal = document.getElementById('tenant-modal');
  const addTenantBtn = document.querySelector('button.flex.items-center.justify-center.gap-2.rounded-xl.h-12.px-6.bg-primary');
  const closeButtons = tenantModal.querySelectorAll('.close-button, .cancel-button');
  const saveTenantBtn = document.getElementById('save-tenant-button');
  const tableBody = document.querySelector('tbody');
  const modalTitle = document.getElementById('modal-title');

  const openModal = () => {
    tenantModal.classList.remove('hidden');
    tenantModal.classList.add('flex');
  };

  const closeModal = () => {
    tenantModal.classList.add('hidden');
    tenantModal.classList.remove('flex');
    resetModal();
  };

  const resetModal = () => {
    modalTitle.textContent = 'Agregar Nuevo Inquilino';
    document.getElementById('tenant-name').value = '';
    document.getElementById('tenant-unit').value = '';
    document.getElementById('tenant-phone').value = '';
    document.getElementById('tenant-type').selectedIndex = 0;
    tenantModal.removeAttribute('data-editing-id');
  };

  const renderTenants = () => {
    const tenants = getTenants();
    tableBody.innerHTML = '';

    if (tenants.length === 0) {
      const emptyRow = `<tr><td colspan="4" class="text-center p-6 text-gray-500">No hay inquilinos registrados.</td></tr>`;
      tableBody.innerHTML = emptyRow;
      return;
    }

    tenants.forEach(tenant => {
      const tenantRow = document.createElement('tr');
      tenantRow.classList.add('group', 'hover:bg-background-light', 'dark:hover:bg-gray-800/30', 'transition-colors');
      const initials = tenant.name.split(' ').map(n => n[0]).join('').toUpperCase();

      tenantRow.innerHTML = `
        <td class="px-6 py-5">
          <div class="flex items-center gap-3">
            <div class="size-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-bold">
              ${initials}
            </div>
            <div>
              <p class="text-[#111417] dark:text-white text-base font-semibold">${tenant.name}</p>
              <p class="text-xs text-[#647587] dark:text-gray-500">${tenant.type}</p>
            </div>
          </div>
        </td>
        <td class="px-6 py-5">
          <div class="inline-flex items-center px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-[#111417] dark:text-gray-200 text-sm font-medium border border-gray-200 dark:border-gray-700">
            Apto ${tenant.unit}
          </div>
        </td>
        <td class="px-6 py-5">
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-2 text-sm text-[#647587] dark:text-gray-400">
              <span class="material-symbols-outlined text-[16px]">call</span>
              ${tenant.phone}
            </div>
          </div>
        </td>
        <td class="px-6 py-5">
          <div class="flex items-center gap-2">
            <button class="edit-button flex items-center justify-center size-10 rounded-lg text-primary hover:bg-primary/10 transition-colors" title="Editar información" data-id="${tenant.id}">
              <span class="material-symbols-outlined">edit</span>
            </button>
            <button class="delete-button flex items-center justify-center size-10 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Eliminar inquilino" data-id="${tenant.id}">
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
        </td>
      `;
      tableBody.appendChild(tenantRow);
    });
  };

  addTenantBtn.addEventListener('click', () => {
    resetModal();
    openModal();
  });

  closeButtons.forEach(button => {
    button.addEventListener('click', closeModal);
  });

  saveTenantBtn.addEventListener('click', () => {
    const name = document.getElementById('tenant-name').value.trim();
    const unit = document.getElementById('tenant-unit').value.trim();
    const phone = document.getElementById('tenant-phone').value.trim();
    const type = document.getElementById('tenant-type').value;
    const editingId = parseInt(tenantModal.getAttribute('data-editing-id'));

    if (!name || !unit || !phone) {
      alert('Por favor, complete todos los campos.');
      return;
    }

    const tenantData = { name, unit, phone, type };

    if (editingId) {
      updateTenant(editingId, tenantData);
    } else {
      saveTenant(tenantData);
    }

    renderTenants();
    closeModal();
  });

  tableBody.addEventListener('click', (event) => {
    const editButton = event.target.closest('.edit-button');
    const deleteButton = event.target.closest('.delete-button');

    if (editButton) {
      const tenantId = parseInt(editButton.dataset.id);
      const tenant = getTenantById(tenantId);

      if (tenant) {
        modalTitle.textContent = 'Editar Inquilino';
        document.getElementById('tenant-name').value = tenant.name;
        document.getElementById('tenant-unit').value = tenant.unit;
        document.getElementById('tenant-phone').value = tenant.phone;
        document.getElementById('tenant-type').value = tenant.type;
        tenantModal.setAttribute('data-editing-id', tenant.id);
        openModal();
      }
    }

    if (deleteButton) {
      const tenantId = parseInt(deleteButton.dataset.id);
      if (confirm('¿Está seguro de que desea eliminar este inquilino?')) {
        deleteTenant(tenantId);
        renderTenants();
      }
    }
  });

  renderTenants();
});
