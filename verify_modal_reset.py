
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto("http://localhost:8000")

        # Open the modal
        await page.click("#registrar-ingreso-btn")
        await page.wait_for_selector("#ingreso-modal", state="visible")

        # Fill the form
        await page.fill("#ingreso-monto", "100")
        await page.fill("#ingreso-departamento", "101")
        await page.fill("#ingreso-inquilino", "Juan Perez")
        await page.select_option("#ingreso-descripcion", "Cuota de Mantenimiento")

        # Close the modal
        await page.click("#ingreso-modal .cancel-button")
        await page.wait_for_selector("#ingreso-modal", state="hidden")

        # Reopen the modal
        await page.click("#registrar-ingreso-btn")
        await page.wait_for_selector("#ingreso-modal", state="visible")

        # Take a screenshot
        await page.screenshot(path="modal_reset_verification.png")

        await browser.close()

asyncio.run(main())
