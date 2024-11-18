let websocket;

    const connectBtn = document.getElementById('connectBtn');
    const disconnectBtn = document.getElementById('disconnectBtn');
    const sendBtn = document.getElementById('sendBtn');
    const serverUrl = document.getElementById('serverUrl');
    const authToken = document.getElementById('authToken');
    const message = document.getElementById('message');
    const clearLogBtn = document.getElementById('clearBtn');
    const log = document.getElementById('log');
    const addHeaderBtn = document.getElementById('addHeaderBtn');
    const headersContainer = document.getElementById('headersContainer');

    // Utility to log messages
    function logMessage(type, msg) {
      const entry = document.createElement('div');
      entry.classList.add('small', 'mb-2', type === 'info' ? 'text-primary' : type === 'sent' ? 'text-success' : type === 'received' ? 'text-info' : 'text-danger');
      entry.textContent = `[${type.toUpperCase()}] ${msg}`;
      log.appendChild(entry);
      log.scrollTop = log.scrollHeight; // Auto-scroll to the bottom
    }

    // Add a new header input row
    function addHeaderRow(key = '', value = '', selected = true) {
      const headerRow = document.createElement('div');
      headerRow.className = 'row align-items-center g-2 mb-2';

      const selectCol = document.createElement('div');
      selectCol.className = 'col-auto';
      const selectInput = document.createElement('input');
      selectInput.type = 'checkbox';
      selectInput.className = 'form-check-input';
      selectInput.checked = selected;
      selectCol.appendChild(selectInput);

      const keyCol = document.createElement('div');
      keyCol.className = 'col';
      const keyInput = document.createElement('input');
      keyInput.type = 'text';
      keyInput.className = 'form-control';
      keyInput.placeholder = 'Header Key';
      keyInput.value = key;
      keyCol.appendChild(keyInput);

      const valueCol = document.createElement('div');
      valueCol.className = 'col';
      const valueInput = document.createElement('input');
      valueInput.type = 'text';
      valueInput.className = 'form-control';
      valueInput.placeholder = 'Header Value';
      valueInput.value = value;
      valueCol.appendChild(valueInput);

      const deleteCol = document.createElement('div');
      deleteCol.className = 'col-auto';
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn btn-danger btn-sm';
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', () => {
        headersContainer.removeChild(headerRow);
      });
      deleteCol.appendChild(deleteBtn);

      headerRow.append(selectCol, keyCol, valueCol, deleteCol);
      headersContainer.appendChild(headerRow);
    }

    addHeaderBtn.addEventListener('click', () => {
      addHeaderRow();
    });

    // Collect selected headers
    function getHeaders() {
      const headers = {};
      const headerRows = headersContainer.querySelectorAll('.row');

      // check if there are any headers
      if (headerRows.length === 0) {
        return headers;
      }
      headerRows.forEach(row => {
        const selected = row.querySelector('input[type="checkbox"]').checked;
        const elementKey = row.querySelector('input:nth-child(1)')
        const elementValue = row.querySelector('input:nth-child(2)')
        if (!elementKey || !elementValue) {
          return;
        }

        const key = elementKey.value.trim();
        const value = elementValue.value.trim();
  
        if (selected && key && value) {
          headers[key] = value;
        } else {
          return
        }
      });
      return headers;
    }

    // Connect to WebSocket with authentication and headers
    connectBtn.addEventListener('click', () => {
      if (!serverUrl.value) {
        alert('Please enter a WebSocket server URL.');
        return;
      }

      const url = serverUrl.value.trim();
      const token = authToken.value.trim();
      const headers = getHeaders();

      try {
        if (token) headers['Authorization'] = token;

        const subprotocols = Object.entries(headers)
          .map(([key, value]) => `${key}: ${value}`)
          .join('; ');

        if (Object.keys(headers).length > 0) {
          websocket = new WebSocket(url, subprotocols);
        } else {
          websocket = new WebSocket(url);
        }

        websocket.onopen = () => {
          logMessage('info', 'Connected to WebSocket server.');
          connectBtn.disabled = true;
          disconnectBtn.disabled = false;
          sendBtn.disabled = false;
        };

        websocket.onmessage = (event) => {
          logMessage('received', event.data);
        };

        websocket.onerror = () => {
          logMessage('error', 'An error occurred.');
        };

        websocket.onclose = () => {
          logMessage('info', 'Disconnected from WebSocket server.');
          connectBtn.disabled = false;
          disconnectBtn.disabled = true;
          sendBtn.disabled = true;
        };
      } catch (error) {
        logMessage('error', `Failed to connect: ${error.message}`);
      }
    });

    // Disconnect from WebSocket
    disconnectBtn.addEventListener('click', () => {
      if (websocket) websocket.close();
    });

    // Send a message to WebSocket
    sendBtn.addEventListener('click', () => {
      if (!websocket || websocket.readyState !== WebSocket.OPEN) {
        alert('WebSocket is not connected.');
        return;
      }

      const msg = message.value;
      if (msg) {
        websocket.send(msg);
        logMessage('sent', msg);
        message.value = '';
      } else {
        alert('Please enter a message to send.');
      }
    });

    clearLogBtn.addEventListener('click', () => {
      log.innerHTML = '';
    });

