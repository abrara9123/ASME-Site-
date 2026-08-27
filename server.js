require("dotenv").config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 8000;
const ROOT = __dirname;
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.SENDER_EMAIL;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'suverymaster9123@gmail.com';

function sendJson(res, status, data) {
  res.writeHead(status, {'Content-Type':'application/json'});
  res.end(JSON.stringify(data));
}

async function createTicket(data) {
  if (!BREVO_API_KEY || !SENDER_EMAIL) throw new Error('Missing Brevo configuration');
  const ticketId = `ASME-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
  const payload = {
    sender: { email: SENDER_EMAIL, name: 'ASME @ UIC' },
    to: [{ email: ADMIN_EMAIL }],
    replyTo: { email: data.email, name: data.name },
    subject: `Sponsorship inquiry — ${data.tier || 'General'} — ${ticketId}`,
    htmlContent: `<h2>New sponsorship ticket</h2><p><b>Ticket ID:</b> ${ticketId}</p><p><b>Name:</b> ${data.name}</p><p><b>Email:</b> ${data.email}</p><p><b>Company:</b> ${data.company}</p><p><b>Phone:</b> ${data.phone || 'Not provided'}</p><p><b>Tier:</b> ${data.tier || 'Not specified'}</p><p><b>Message:</b><br>${(data.message || 'None').replace(/\n/g,'<br>')}</p>`
  };
  const response = await fetch('https://api.brevo.com/v3/smtp/email', { method:'POST', headers:{'api-key':BREVO_API_KEY,'Content-Type':'application/json'}, body:JSON.stringify(payload) });
  if (!response.ok) throw new Error(await response.text());
  return ticketId;
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/api/sponsor-ticket') {
    let body = ''; req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try { const data = JSON.parse(body); const ticketId = await createTicket(data); sendJson(res, 200, {ok:true, ticketId}); }
      catch (e) { console.error(e); sendJson(res, 500, {ok:false, error:'Unable to send ticket. Check the server email settings.'}); }
    }); return;
  }
  let file = req.url === '/'
  ? '/index.html'
  : decodeURIComponent(req.url.split('?')[0]);
const filePath = path.join(ROOT, file);
if (
  !filePath.startsWith(ROOT) ||
  !fs.existsSync(filePath) ||
  fs.statSync(filePath).isDirectory()
) {
  res.writeHead(404);
  return res.end('Not found');
}
const ext = path.extname(filePath).toLowerCase();
const types = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};
res.writeHead(200, {
  'Content-Type': types[ext] || 'application/octet-stream'
});
fs.createReadStream(filePath).pipe(res);
});
server.listen(PORT, '0.0.0.0', () => console.log(`ASME UIC server running on port ${PORT}`));
