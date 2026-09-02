import crypto from 'crypto';

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.SENDER_EMAIL;
const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL || 'suverymaster9123@gmail.com';


async function createTicket(data) {

  if (!BREVO_API_KEY || !SENDER_EMAIL) {
    throw new Error('Missing Brevo configuration');
  }

  const ticketId =
    `ASME-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

  const payload = {
    sender: {
      email: SENDER_EMAIL,
      name: 'ASME @ UIC'
    },

    to: [
      {
        email: ADMIN_EMAIL
      }
    ],

    replyTo: {
      email: data.email,
      name: data.name
    },

    subject:
      `Sponsorship inquiry — ${data.tier || 'General'} — ${ticketId}`,

    htmlContent: `
      <h2>New sponsorship ticket</h2>

      <p><b>Ticket ID:</b> ${ticketId}</p>
      <p><b>Name:</b> ${data.name}</p>
      <p><b>Email:</b> ${data.email}</p>
      <p><b>Company:</b> ${data.company}</p>
      <p><b>Phone:</b> ${data.phone || 'Not provided'}</p>
      <p><b>Tier:</b> ${data.tier || 'Not specified'}</p>

      <p>
        <b>Message:</b><br>
        ${(data.message || 'None').replace(/\n/g, '<br>')}
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

    const ticketId = await createTicket(data);

    return Response.json({
      ok: true,
      ticketId: ticketId
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