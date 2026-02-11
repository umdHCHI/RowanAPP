/**
 * Bug-report middleware: receives form submissions from BugReportingModal,
 * then sends the report to you via Resend.
 */
import 'dotenv/config'
import { Resend } from 'resend'

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('RESEND_API_KEY is not set. Ensure .env is loaded or set the env var where this API runs.')
    return Response.json(
      { error: 'Email not configured' },
      { status: 503 }
    )
  }

  const resend = new Resend(apiKey)

  try {
    const body = await request.json()
    const { description, email, timestamp, platform } = body

    const dateString = new Date(timestamp).toLocaleDateString()

    const { data, error } = await resend.emails.send({
      from: 'Bug Reports <onboarding@resend.dev>', //add domain
      to: [ 'strat238@d.umn.edu'],//add email'schm5669@d.umn.edu'
      subject: `Bug Report - ${dateString}`,
      html: `
        <h2>New Bug Report</h2>
        <p><strong>Timestamp:</strong> ${dateString}</p>
        <p><strong>Platform:</strong> ${platform}</p>
        <p><strong>User Email:</strong> ${
          email === 'anonymous' ? 'Not provided' : email
        }</p>
        <hr />
        <h3>Description:</h3>
        <p>${description.replace(/\n/g, '<br />')}</p>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return Response.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return Response.json({ success: true, data })
  } catch (error) {
    console.error('API error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
