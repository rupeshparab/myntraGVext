chrome.storage.local.get('codes', async (result) => {
    const data = result.codes;
    if (!data || data.length === 0) return;

    // Use the first result for demo
    const { card, pin } = data[0];

    // --- 1. CUSTOMIZE THESE VALUES ---

    // Replace with the actual CSS selector and text for the button to click
    const CLICK_BUTTON_SELECTOR = '.balance-blueIcon';
    const CLICK_BUTTON_TEXT = 'Add Gift Card';

    // Replace with the actual CSS selector for the text field
    const CODE_FIELD_SELECTOR = 'input[name="gcnumber"]';
    const PIN_FIELD_SELECTOR = 'input[name="gcpin"]';

    // Replace with the actual CSS selector for the submit button
    const SUBMIT_BUTTON_SELECTOR = 'div.addCard-showButton';

    // Error detection selector
    const ERROR_SELECTOR = '.addCard-error.addCard-visible';

    // Balance amount selector
    const BALANCE_SELECTOR = '.balance-amount';

    const DELAY_MS = 6000; // 6 seconds delay between each iteration

    // Helper function to create a delay
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // Helper function to remove voucher from storage
    const removeVoucherFromStorage = async (cardToRemove) => {
        try {
            const currentData = await new Promise((resolve) => {
                chrome.storage.local.get('codes', (result) => resolve(result.codes || []));
            });

            const updatedData = currentData.filter(item => item.card !== cardToRemove);

            await new Promise((resolve) => {
                chrome.storage.local.set({ codes: updatedData }, resolve);
            });

            console.log(`Removed voucher ${cardToRemove} from storage. Remaining vouchers: ${updatedData.length}`);
        } catch (error) {
            console.error('Error removing voucher from storage:', error);
        }
    };

    // Helper function to check for error
    const checkForError = () => {
        const errorElement = document.querySelector(ERROR_SELECTOR);
        if (errorElement && errorElement.textContent.includes('Gift Card has already been added to user')) {
            return true;
        }
        return false;
    };

    // Helper function to get current balance
    const getCurrentBalance = () => {
        const balanceElement = document.querySelector(BALANCE_SELECTOR);
        if (balanceElement) {
            // Extract the numeric value from the balance text (remove ₹ and commas)
            const balanceText = balanceElement.textContent.trim();
            const numericValue = balanceText.replace(/[₹,\s]/g, '');
            return parseFloat(numericValue) || 0;
        }
        return 0;
    };

    // --- 2. AUTOMATION LOGIC (No need to edit below this line) ---
    console.log(`Starting automation for ${data.length} items...`);

    for (const gc of data) {
        try {
            console.log(`--- Processing: "${gc.card}" ---`);

            // Find and click the initial button
            const clickButton = Array.from(
                document.querySelectorAll(CLICK_BUTTON_SELECTOR),
            ).find((el) => el.textContent.includes(CLICK_BUTTON_TEXT));

            if (!clickButton) {
                console.error(
                    `Error: Could not find the initial button with selector: "${CLICK_BUTTON_SELECTOR}". Stopping.`,
                );
                return;
            }
            console.log('Step 1: Clicking the initial button.');
            clickButton.click();

            typeInElement(CODE_FIELD_SELECTOR, `${gc.card}`);

            typeInElement(PIN_FIELD_SELECTOR, `${gc.pin}`);

            // Find and click the submit button
            const submitButton = document.querySelector(SUBMIT_BUTTON_SELECTOR);
            if (!submitButton) {
                console.error(
                    `Error: Could not find the submit button with selector: "${SUBMIT_BUTTON_SELECTOR}". Stopping.`,
                );
                return;
            }
            console.log('Step 3: Clicking submit.');

            // Get the balance before submitting
            const balanceBefore = getCurrentBalance();
            console.log(`Balance before adding voucher: ₹${balanceBefore.toLocaleString('en-IN')}`);

            submitButton.click();

            // Wait a bit for the error to appear if it's going to
            await sleep(2000);

            // Check for the "already added" error
            if (checkForError()) {
                console.log(`Error detected: Gift Card ${gc.card} has already been added to user. Removing from storage.`);
                await removeVoucherFromStorage(gc.card);

                // Close the modal by clicking the cross button
                const crossButton = document.querySelector('.addCard-crossSign');
                if (crossButton) {
                    crossButton.click();
                    console.log('Closed the error modal.');
                }
            } else {
                // No error detected - check if balance changed to confirm successful addition
                const balanceAfter = getCurrentBalance();
                console.log(`Balance after adding voucher: ₹${balanceAfter.toLocaleString('en-IN')}`);

                if (balanceAfter > balanceBefore) {
                    console.log(`Success: Gift Card ${gc.card} was successfully added. Balance increased by ₹${(balanceAfter - balanceBefore).toLocaleString('en-IN')}. Removing from storage.`);
                    await removeVoucherFromStorage(gc.card);
                } else {
                    console.log(`Warning: Gift Card ${gc.card} - No error detected but balance didn't increase. Keeping in storage for retry.`);
                    // Don't remove from storage if balance didn't change
                }
            }

            // Wait for the specified delay before the next iteration
            console.log(`Waiting for ${DELAY_MS / 1000} seconds...`);
            await sleep(DELAY_MS);
        } catch (error) {
            console.error(
                `An unexpected error occurred while processing "${gc}":`,
                error,
            );
            console.log('Stopping script due to error.');
            return; // Stop the script if any step fails
        }
    }

    console.log('--- Automation Complete! ---');

});


function typeInElement(selector, textToType) {
    // 1. Find the element using the provided CSS selector.
    const element = document.querySelector(selector);

    // 2. Check if the element was found.
    if (!element) {
        console.error(`Error: Element with selector "${selector}" not found.`);
        return;
    }

    // 3. Simulate a click/focus on the element.
    element.focus();
    element.click();

    // 4. Set the element's value.
    // We need to set the property directly for frameworks like React to pick it up.
    // Using a native setter preserves the element's prototype chain.
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value',
    ).set;
    nativeInputValueSetter.call(element, textToType);

    // 5. Dispatch events to make the website's JavaScript recognize the change.
    // This is crucial for frameworks that listen to user input events.
    const inputEvent = new Event('input', { bubbles: true });
    const changeEvent = new Event('change', { bubbles: true });

    element.dispatchEvent(inputEvent);
    element.dispatchEvent(changeEvent);

    // 6. (Optional) Simulate the user leaving the input field.
    element.blur();

    console.log(
        `Successfully typed "${textToType}" into element with selector "${selector}".`,
    );
}