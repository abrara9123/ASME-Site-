import crypto from 'crypto';

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.SENDER_EMAIL;

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map(email => email.trim())
  .filter(Boolean);
function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
async function createTicket(data) {
  if (!BREVO_API_KEY || !SENDER_EMAIL || ADMIN_EMAILS.length === 0) {
    throw new Error('Missing Brevo configuration');
  }
  const ticketId =
    `ASME-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
  const name = escapeHtml(data.name);
  const email = escapeHtml(data.email);
  const company = escapeHtml(data.company);
  const tier = escapeHtml(data.tier || 'Not specified');
  const message = escapeHtml(data.message || 'None').replace(/\n/g, '<br>');
  const payload = {
    sender: {
      email: SENDER_EMAIL,
      name: 'ASME @ UIC'
    },
    to: ADMIN_EMAILS.map(email => ({ email })),
    replyTo: {
      email: data.email,
      name: data.name
    },
    subject:
      `Sponsorship inquiry — ${data.tier || 'General'} — ${ticketId}`,
    htmlContent: `
      <h2>New sponsorship ticket</h2>
      <p><b>Ticket ID:</b> ${ticketId}</p>
      <p><b>Name:</b> ${name}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Company:</b> ${company}</p>
      <p><b>Tier:</b> ${tier}</p>
      <p>
        <b>Message:</b><br>
        ${message}
      </p>
    `
  };
  const response = await fetch(
    'https://api.brevo.com/v3/smtp/email',
    {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    }
  );
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return ticketId;
}
export default async (request) => {
  if (request.method !== 'POST') {
    return Response.json(
      {
        ok: false,
        error: 'Method not allowed'
      },
      {
        status: 405
      }
    );
  }
  try {
    const data = await request.json();
    const company = String(data.company || '').trim();
    const name = String(data.name || '').trim();
    const email = String(data.email || '').trim();
    const tier = String(data.tier || '').trim();
    const message = String(data.message || '').trim();
    if (!company || !name || !email) {
      return Response.json(
        {
          ok: false,
          error: 'Company, name, and email are required.'
        },
        {
          status: 400
        }
      );
    }
    if (!isValidEmail(email)) {
      return Response.json(
        {
          ok: false,
          error: 'Invalid email address.'
        },
        {
          status: 400
        }
      );
    }
    if (
      company.length > 150 ||
      name.length > 100 ||
      email.length > 254 ||
      tier.length > 50 ||
      message.length > 5000
    ) {
      return Response.json(
        {
          ok: false,
          error: 'Submitted information is too long.'
        },
        {
          status: 400
        }
      );
    }
    const ticketId = await createTicket({
      company,
      name,
      email,
      tier,
      message
    });
    return Response.json({
      ok: true,
      ticketId
    });
  } catch (error) {
    console.error('Sponsor ticket error:', error);
    return Response.json(
      {
        ok: false,
        error: 'Unable to send ticket.'
      },
      {
        status: 500
      }
    );
  }
};