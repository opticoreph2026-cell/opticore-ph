// prisma.config.js
const fs = require('fs');
const path = require('path');

// Manual .env parsing
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)$/);
  if (match) {
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    env[match[1].trim()] = val;
  }
});

module.exports = {
  schema: "prisma/schema.prisma",
  datasource: {
    // This tells Prisma to use the local file for CLI commands
    // Prioritize Cloud (Turso) over Local for CLI alignment
    url: (function() {
      let raw = env.TURSO_DATABASE_URL || env.DATABASE_URL || "file:./dev.db";
      
      // If it's a file path, resolve it to an absolute path for Windows compatibility
      if (raw.startsWith('file:') && !raw.startsWith('file:///') && !raw.startsWith('file://')) {
        const filePath = raw.replace(/^file:/, '');
        const absPath = path.isAbsolute(filePath) ? filePath : path.resolve(__dirname, filePath);
        return `file:${absPath.replace(/\\/g, '/')}`;
      }
      
      // For Turso, we ensure it uses the libsql protocol if it's a remote URL
      if (raw.startsWith('https://')) {
        raw = raw.replace('https://', 'libsql://');
      }
      
      return raw;
    })(),
  },
}
