#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const DATA_FILE = '/Users/yanghong/mission-control/subagent-status.json';
const POLL_INTERVAL = 30000; // 30 seconds

function fetchSubagentStatus() {
  try {
    // Get sessions using CLI
    const output = execSync('openclaw sessions list --json 2>/dev/null', {
      encoding: 'utf-8'
    });
    
    const data = JSON.parse(output);
    
    const agents = [];
    const now = Date.now();
    
    // Process sessions - consider recent ones (within 30 min) as active
    if (data.sessions && Array.isArray(data.sessions)) {
      for (const session of data.sessions) {
        const isRecent = session.ageMs < 1800000; // 30 minutes
        
        // Extract a readable name from the session key
        let name = session.key.split(':').pop() || 'Unknown';
        if (name === 'main') name = 'Main Agent';
        
        // Determine role based on session kind
        let role = 'Session';
        if (session.kind === 'direct') role = 'Direct Chat';
        else if (session.kind === 'group') role = 'Group Chat';
        
        agents.push({
          id: session.sessionId,
          name: name,
          role: role,
          status: isRecent ? 'working' : 'idle',
          currentTask: isRecent ? `Tokens: ${(session.totalTokens || 0).toLocaleString()}` : '閒置',
          isSubagent: false,
          lastUpdate: new Date().toISOString(),
          sessionKey: session.key
        });
      }
    }
    
    const result = {
      lastUpdate: new Date().toISOString(),
      agents
    };
    
    // Write to file
    fs.writeFileSync(DATA_FILE, JSON.stringify(result, null, 2));
    
    console.log(`[${new Date().toISOString()}] Updated: ${agents.length} sessions (${agents.filter(a => a.status === 'working').length} active)`);
    
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error:`, error.message);
  }
}

// Initial fetch
fetchSubagentStatus();

// Poll periodically
setInterval(fetchSubagentStatus, POLL_INTERVAL);

console.log(`Subagent status poller started. Polling every ${POLL_INTERVAL/1000} seconds.`);
