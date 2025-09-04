// Check server status
fetch('http://localhost:3737/api/health')
    .then(response => response.json())
    .then(data => {
        const statusEl = document.getElementById('server-status');
        statusEl.innerHTML = `
            <span class="active">✅ Server Active</span><br>
            Version: ${data.version}<br>
            Sessions: ${data.activeSessions}
        `;
        statusEl.classList.add('active');
    })
    .catch(err => {
        const statusEl = document.getElementById('server-status');
        statusEl.innerHTML = `
            <span class="inactive">❌ Server Offline</span><br>
            Please start the server with START.command
        `;
        statusEl.classList.add('inactive');
    });
