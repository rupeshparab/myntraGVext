chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'CODES_FOUND') {
      chrome.storage.local.set({ codes: message.data });
    }
  });
  