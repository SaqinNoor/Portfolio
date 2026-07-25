export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, message } = req.body || {};
  const errors = [];
  if (!name || !name.trim()) errors.push('Name is required');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Valid email is required');
  if (!message || !message.trim()) errors.push('Message is required');

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join('; ') });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server mail not configured' });
  }

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Portfolio Contact <onboarding@resend.dev>',
        to: 'contact@saqin.is-a.dev',
        replyTo: email,
        subject: `Portfolio Contact from ${name.trim()}`,
        text: `Name: ${name.trim()}\nEmail: ${email}\n\nMessage:\n${message.trim()}`,
      }),
    });

    if (!r.ok) {
      const body = await r.text().catch(() => '');
      throw new Error(`Resend API: ${r.status} ${body.slice(0, 200)}`);
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to send message', detail: err.message });
  }
}
