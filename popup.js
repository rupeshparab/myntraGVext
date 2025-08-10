document.getElementById('extract').addEventListener('click', async () => {
    chrome.storage.sync.clear(function () {
        var error = chrome.runtime.lastError;
        if (error) {
            console.error(error);
        } else {
            console.log("Storage cleared");
        }
    });
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
    });
});

document.getElementById('fill').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['myscript.js']
    });
});

// Load and display extracted card+PIN pairs
chrome.storage.local.get('codes', (result) => {
    const pairs = result.codes || [];
    const ul = document.getElementById('results');
    ul.innerHTML = '';
    pairs.forEach(pair => {
        const li = document.createElement('li');
        li.textContent = `Card: ${pair.card} | PIN: ${pair.pin}`;
        ul.appendChild(li);
    });
});

document.getElementById('clearStorage').addEventListener('click', clearStorage);

function clearStorage() {
    const ul = document.getElementById('results');
    ul.innerHTML = '';
    chrome.storage.sync.clear(function () {
        var error = chrome.runtime.lastError;
        if (error) {
            console.error(error);
        } else {
            console.log("Storage cleared");
        }
    });
}