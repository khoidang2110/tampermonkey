// ==UserScript==
// @name         SignalR Multi-Device Manager
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Compact SignalR manager with multiple device support
// @author       Marta
// @match        *://localhost:5112/*
// @grant        none
// @require      https://cdn.jsdelivr.net/npm/@microsoft/signalr@7.0.5/dist/browser/signalr.min.js
// ==/UserScript==

(function () {
  'use strict';

  // Load saved config
  const savedConfig = localStorage.getItem('signalr_devices_config') || '[]';
  let devicesConfig = [];

  try {
    devicesConfig = JSON.parse(savedConfig);
  } catch (e) {
    devicesConfig = [];
  }

  // Store connections
  const connections = new Map();

  // === MAIN CONTAINER ===
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '20px';
  container.style.right = '20px';
  container.style.zIndex = '9999';
  container.style.backgroundColor = '#2c3e50';
  container.style.border = '1px solid #34495e';
  container.style.borderRadius = '8px';
  container.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
  container.style.fontFamily = 'Consolas, monospace';
  container.style.fontSize = '12px';

  // === TOGGLE BUTTON (COMPACT) ===
  const toggleBtn = document.createElement('button');
  toggleBtn.textContent = '⚙️';
  toggleBtn.style.width = '40px';
  toggleBtn.style.height = '40px';
  toggleBtn.style.backgroundColor = '#3498db';
  toggleBtn.style.color = '#fff';
  toggleBtn.style.border = 'none';
  toggleBtn.style.borderRadius = '8px';
  toggleBtn.style.cursor = 'pointer';
  toggleBtn.style.fontSize = '16px';
  toggleBtn.style.display = 'block';

  // === EXPANDED PANEL ===
  const panel = document.createElement('div');
  panel.style.display = 'none';
  panel.style.width = '400px';
  panel.style.padding = '16px';
  panel.style.backgroundColor = '#2c3e50';
  panel.style.color = '#ecf0f1';

  // === DEVICES LIST ===
  const devicesContainer = document.createElement('div');
  devicesContainer.style.marginBottom = '12px';

  // === CONFIG INPUT ===
  const configLabel = document.createElement('div');
  configLabel.textContent = 'Devices Config (JSON):';
  configLabel.style.marginBottom = '4px';
  configLabel.style.color = '#bdc3c7';

  const configTextarea = document.createElement('textarea');
  configTextarea.placeholder = '[{"token":"your_token","sessionId":"session1"},{"token":"your_token2","sessionId":"session2"}]';
  configTextarea.value = JSON.stringify(devicesConfig, null, 2);
  configTextarea.style.width = '100%';
  configTextarea.style.height = '120px';
  configTextarea.style.backgroundColor = '#34495e';
  configTextarea.style.color = '#ecf0f1';
  configTextarea.style.border = '1px solid #7f8c8d';
  configTextarea.style.borderRadius = '4px';
  configTextarea.style.padding = '8px';
  configTextarea.style.fontSize = '11px';
  configTextarea.style.fontFamily = 'Consolas, monospace';
  configTextarea.style.resize = 'vertical';

  const saveConfigBtn = document.createElement('button');
  saveConfigBtn.textContent = '💾 Save Config';
  saveConfigBtn.style.marginTop = '8px';
  saveConfigBtn.style.padding = '6px 12px';
  saveConfigBtn.style.backgroundColor = '#27ae60';
  saveConfigBtn.style.color = '#fff';
  saveConfigBtn.style.border = 'none';
  saveConfigBtn.style.borderRadius = '4px';
  saveConfigBtn.style.cursor = 'pointer';

  // === LOG AREA ===
  const logContainer = document.createElement('div');
  logContainer.style.marginTop = '12px';
  logContainer.style.height = '200px';
  logContainer.style.backgroundColor = '#1a252f';
  logContainer.style.border = '1px solid #34495e';
  logContainer.style.borderRadius = '4px';
  logContainer.style.padding = '8px';
  logContainer.style.overflow = 'auto';
  logContainer.style.fontSize = '10px';
  logContainer.style.fontFamily = 'Consolas, monospace';

  // Build panel
  panel.appendChild(devicesContainer);
  panel.appendChild(configLabel);
  panel.appendChild(configTextarea);
  panel.appendChild(saveConfigBtn);
  panel.appendChild(logContainer);

  container.appendChild(toggleBtn);
  container.appendChild(panel);
  document.body.appendChild(container);

  // === TOGGLE FUNCTIONALITY ===
  let panelVisible = false;
  toggleBtn.onclick = () => {
    panelVisible = !panelVisible;
    panel.style.display = panelVisible ? 'block' : 'none';
    container.style.backgroundColor = panelVisible ? '#2c3e50' : 'transparent';
    container.style.border = panelVisible ? '1px solid #34495e' : 'none';
    // Updated toggle button styling - no background when expanded, white color
    toggleBtn.style.backgroundColor = panelVisible ? 'transparent' : '#3498db';
    toggleBtn.style.color = panelVisible ? '#fff' : '#fff';
    toggleBtn.textContent = panelVisible ? '✖' : '⚙️';
  };

  // === LOGGING FUNCTION ===
  function addLog(deviceIndex, message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const colors = {
      info: '#3498db',
      success: '#27ae60',
      error: '#e74c3c',
      warning: '#f39c12'
    };

    const logEntry = document.createElement('div');
    logEntry.innerHTML = `<span style="color:#7f8c8d">[${timestamp}]</span> <span style="color:${colors[type]}">[Device ${deviceIndex + 1}]</span> ${message}`;
    logEntry.style.marginBottom = '2px';
    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight;
  }

  // === CREATE DEVICE ROW ===
  function createDeviceRow(device, index) {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.marginBottom = '8px';
    row.style.padding = '8px';
    row.style.backgroundColor = '#34495e';
    row.style.borderRadius = '4px';

    const deviceName = document.createElement('span');
    deviceName.textContent = `Device ${index + 1}`;
    deviceName.style.flex = '1';
    deviceName.style.color = '#ecf0f1';
    deviceName.style.fontWeight = 'bold';

    const statusIndicator = document.createElement('span');
    statusIndicator.textContent = '⚫';
    statusIndicator.style.marginLeft = '8px';
    statusIndicator.id = `status-${index}`;

    const connectBtn = document.createElement('button');
    connectBtn.textContent = 'Connect';
    connectBtn.style.marginLeft = '8px';
    connectBtn.style.padding = '4px 8px';
    connectBtn.style.backgroundColor = '#27ae60';
    connectBtn.style.color = '#fff';
    connectBtn.style.border = 'none';
    connectBtn.style.borderRadius = '3px';
    connectBtn.style.cursor = 'pointer';
    connectBtn.id = `connect-btn-${index}`;

    const disconnectBtn = document.createElement('button');
    disconnectBtn.textContent = 'Stop';
    disconnectBtn.style.marginLeft = '8px';
    disconnectBtn.style.padding = '4px 8px';
    disconnectBtn.style.backgroundColor = '#e74c3c';
    disconnectBtn.style.color = '#fff';
    disconnectBtn.style.border = 'none';
    disconnectBtn.style.borderRadius = '3px';
    disconnectBtn.style.cursor = 'pointer';
    disconnectBtn.style.display = 'none';
    disconnectBtn.id = `disconnect-btn-${index}`;

    // Toggle functionality
    connectBtn.onclick = () => {
      connectDevice(device, index);
      connectBtn.style.display = 'none';
      disconnectBtn.style.display = 'inline-block';
    };

    disconnectBtn.onclick = () => {
      disconnectDevice(index);
      disconnectBtn.style.display = 'none';
      connectBtn.style.display = 'inline-block';
    };

    row.appendChild(deviceName);
    row.appendChild(statusIndicator);
    row.appendChild(connectBtn);
    row.appendChild(disconnectBtn);

    return row;
  }

  // === CONNECTION FUNCTIONS ===
  function connectDevice(device, index) {
    if (connections.has(index)) {
      addLog(index, 'Already connected', 'warning');
      return;
    }

    const hubUrl = `http://localhost:5112/hubs/store-service?sessionId=${device.sessionId}`;
    addLog(index, `Connecting to: ${hubUrl}`, 'info');

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => device.token
      })
      .configureLogging(signalR.LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    connection.on('OrderUpdated', function (data) {
      addLog(index, `OrderUpdated: ${JSON.stringify(data)}`, 'success');
    });

    connection.onreconnecting(() => {
      addLog(index, 'Reconnecting...', 'warning');
      updateStatus(index, '🟡');
    });

    connection.onreconnected(() => {
      addLog(index, 'Reconnected successfully', 'success');
      updateStatus(index, '🟢');
    });

    connection.onclose(() => {
      addLog(index, 'Connection closed', 'error');
      updateStatus(index, '🔴');
      connections.delete(index);
    });

    connection
      .start()
      .then(() => {
        addLog(index, 'Connected successfully!', 'success');
        updateStatus(index, '🟢');
        connections.set(index, connection);
      })
      .catch((err) => {
        addLog(index, `Connection failed: ${err.message}`, 'error');
        updateStatus(index, '🔴');
      });
  }

  function disconnectDevice(index) {
    const connection = connections.get(index);
    if (connection) {
      connection.stop();
      connections.delete(index);
      addLog(index, 'Disconnected manually', 'info');
      updateStatus(index, '⚫');
    }
  }

  function updateStatus(index, status) {
    const statusEl = document.getElementById(`status-${index}`);
    if (statusEl) statusEl.textContent = status;
  }

  // === REFRESH DEVICES LIST ===
  function refreshDevicesList() {
    devicesContainer.innerHTML = '';
    devicesConfig.forEach((device, index) => {
      const row = createDeviceRow(device, index);
      devicesContainer.appendChild(row);
    });
  }

  // === SAVE CONFIG ===
  saveConfigBtn.onclick = () => {
    try {
      const newConfig = JSON.parse(configTextarea.value);
      devicesConfig = newConfig;
      localStorage.setItem('signalr_devices_config', JSON.stringify(devicesConfig));
      refreshDevicesList();
      addLog(-1, `Configuration saved. ${devicesConfig.length} devices loaded.`, 'success');
    } catch (e) {
      addLog(-1, `Invalid JSON format: ${e.message}`, 'error');
    }
  };

  // === CLEANUP ON UNLOAD ===
  window.addEventListener('beforeunload', () => {
    connections.forEach(connection => connection.stop());
  });

  // Initialize
  refreshDevicesList();
  addLog(-1, 'SignalR Manager initialized', 'info');

})();
