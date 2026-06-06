const fs = require('fs');

const action = process.argv[2];
const param = process.argv[3];

async function getActivePage() {
  const res = await fetch('http://localhost:9222/json');
  const targets = await res.json();
  const page = targets.find(t => t.type === 'page');
  if (!page) {
    throw new Error('No active browser page target found.');
  }
  return page;
}

function connectWS(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    ws.onopen = () => resolve(ws);
    ws.onerror = (err) => reject(err);
  });
}

async function run() {
  try {
    const page = await getActivePage();
    const ws = await connectWS(page.webSocketDebuggerUrl);

    let messageId = 1;
    const pendingRequests = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && pendingRequests.has(msg.id)) {
        const { resolve, reject } = pendingRequests.get(msg.id);
        pendingRequests.delete(msg.id);
        if (msg.error) {
          reject(new Error(msg.error.message || JSON.stringify(msg.error)));
        } else {
          resolve(msg.result);
        }
      }
    };

    function sendCommand(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = messageId++;
        pendingRequests.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    if (action === 'navigate') {
      const url = param;
      console.error(`Navigating active tab to: ${url}`);
      
      // We can use Page.navigate to navigate the active tab directly
      await sendCommand('Page.navigate', { url });
      
      // Wait 6 seconds for navigation and content to settle
      await new Promise(r => setTimeout(r, 6000));
      console.log(JSON.stringify({ success: true }));
      ws.close();
      process.exit(0);

    } else if (action === 'eval') {
      // Read JS script from stdin
      let script = '';
      if (param) {
        script = param;
      } else {
        script = fs.readFileSync(0, 'utf-8');
      }

      let expression = script.trim();
      if (expression.startsWith('async () =>') || expression.startsWith('() =>')) {
        expression = `(${expression})()`;
      }

      // Evaluate the script in the page
      const result = await sendCommand('Runtime.evaluate', {
        expression: expression,
        returnByValue: true,
        awaitPromise: true,
        userGesture: true
      });

      if (result.exceptionDetails) {
        console.error('JS Execution Exception:', result.exceptionDetails);
        process.exit(1);
      }

      const value = result.result.value;
      if (typeof value === 'object') {
        console.log(JSON.stringify(value));
      } else {
        console.log(value);
      }
      ws.close();
      process.exit(0);

    } else {
      console.error('Unknown action:', action);
      ws.close();
      process.exit(1);
    }

  } catch (err) {
    console.error('CDP Helper Error:', err.message);
    process.exit(1);
  }
}

run();
