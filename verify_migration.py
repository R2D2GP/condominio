from playwright.sync_api import sync_playwright, expect

def run_verification(page):
    # Go to the page to ensure localStorage is available
    page.goto("http://localhost:8000")

    # 1. Inject old data into localStorage to simulate the user's state
    # This data would have been cleared by the migration script on first load.
    # We clear the migration key to ensure the script runs again for our test.
    page.evaluate("""() => {
        localStorage.removeItem('dataMigration20240105');
        const oldMovements = [
            { id: 1, type: 'income', amount: 150, date: '2023-10-24', description: 'Old Mantenimiento' },
            { id: 2, type: 'expense', amount: 80, date: '2023-10-22', description: 'Old Jardineria' }
        ];
        localStorage.setItem('movements', JSON.stringify(oldMovements));
    }""")
    print("Step 1: Injected old data and cleared migration key.")

    # 2. Reload the page to trigger the migration script
    page.reload()
    print("Step 2: Reloaded page to trigger migration.")

    # Verify that the old data was cleared and the table is empty
    expect(page.locator("tbody td >> text=No hay movimientos registrados.")).to_be_visible()
    movements_after_migration = page.evaluate("localStorage.getItem('movements')")
    assert movements_after_migration is None, "Migration script did not clear old data."
    print("Step 2b: Verified old data was cleared.")

    # 3. Add a new movement to ensure it persists on subsequent loads
    page.click("#registrar-ingreso-btn")
    page.fill("#ingreso-monto", "500")
    page.locator('#ingreso-modal .calendar-grid span:text("10")').click()
    page.select_option("#ingreso-descripcion", "Cuota de Mantenimiento")
    page.click("#ingreso-modal .save-button")

    # Verify the new movement was added
    expect(page.locator("tbody tr")).to_have_count(1)
    expect(page.locator("tbody td >> text=+S/500.00")).to_be_visible()
    print("Step 3: Added a new movement.")

    # 4. Reload the page again
    page.reload()
    print("Step 4: Reloaded page again.")

    # Verify the new movement persists and was not deleted by the migration script
    expect(page.locator("tbody tr")).to_have_count(1)
    expect(page.locator("tbody td >> text=+S/500.00")).to_be_visible()
    migration_key_set = page.evaluate("localStorage.getItem('dataMigration20240105')")
    assert migration_key_set == 'true', "Migration key was not set correctly."
    print("Step 4b: Verified new data persists and migration key is set.")

    # Take a final screenshot
    page.screenshot(path="migration_verification.png")
    print("Verification complete. Screenshot taken.")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    run_verification(page)
    browser.close()
