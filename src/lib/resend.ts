import { Resend } from 'resend'

let _resend: Resend | null = null
function getResend() {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY!)
  }
  return _resend
}

export async function sendEmail(to: string, subject: string, html: string) {
  const { data, error } = await getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject,
    html,
  })
  if (error) throw error
  return data
}

export async function sendWelcomeEmail(user: { email: string; fullName: string }) {
  return sendEmail(
    user.email,
    'Welcome to PROPATI',
    `<h2>Welcome, ${user.fullName.split(' ')[0]}!</h2>
     <p>You're now on Nigeria's most trusted property platform.</p>
     <a href="https://propati.ng/dashboard">Get Started</a>`
  )
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  return sendEmail(
    email,
    'Reset your PROPATI password',
    `<h2>Reset your password</h2>
     <p>Click below to reset your password. This link expires in 1 hour.</p>
     <a href="${resetUrl}">Reset Password</a>
     <p>If you didn't request this, ignore this email.</p>`
  )
}

export async function sendAgreementSigningEmail(opts: {
  to: string
  recipientName: string
  role: string
  propertyTitle: string
  signingUrl: string
  pdfUrl: string
  otherPartyName: string
  rentAmount: number
  rentPeriod: string
}) {
  const fromEmail = process.env.RESEND_FROM_AGREEMENTS ?? process.env.RESEND_FROM_EMAIL!
  const { data, error } = await getResend().emails.send({
    from: fromEmail,
    to: opts.to,
    subject: `Sign Your Tenancy Agreement — ${opts.propertyTitle}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="text-align:center;padding:20px 0">
        <span style="font-size:24px;font-weight:900"><span style="color:#c9952a">P</span>ROPATI</span>
      </div>
      <h2>Hello ${opts.recipientName.split(' ')[0]},</h2>
      <p>A tenancy agreement for <strong>${opts.propertyTitle}</strong> is ready for your signature.</p>
      <div style="background:#f5f5f5;padding:15px;border-radius:8px;margin:20px 0">
        <p style="margin:5px 0"><strong>Property:</strong> ${opts.propertyTitle}</p>
        <p style="margin:5px 0"><strong>Rent:</strong> ₦${opts.rentAmount.toLocaleString('en-NG')}/${opts.rentPeriod}</p>
        <p style="margin:5px 0"><strong>Other Party:</strong> ${opts.otherPartyName}</p>
        <p style="margin:5px 0"><strong>Your Role:</strong> ${opts.role.charAt(0).toUpperCase() + opts.role.slice(1)}</p>
      </div>
      <p>You will need to verify your identity using your NIN, Driver's License, or Voter's Card before signing.</p>
      <div style="text-align:center;margin:25px 0">
        <a href="${opts.signingUrl}" style="background:#0e7c6a;color:white;padding:12px 30px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">
          Review & Sign Agreement
        </a>
      </div>
      <p style="font-size:12px;color:#999">
        <a href="${opts.pdfUrl}" style="color:#666">View Draft Agreement PDF</a><br>
        This signing link expires in 7 days.
      </p>
      <hr style="border:none;border-top:1px solid #eee;margin:20px 0">
      <p style="font-size:11px;color:#aaa;text-align:center">
        PROPATI — Nigeria's Verified Property Platform
      </p>
    </div>`,
  })
  if (error) throw error
  return data
}

export async function sendSignedAgreementEmail(opts: {
  to: string
  recipientName: string
  propertyTitle: string
  signedPdfUrl: string
  otherPartyName: string
}) {
  const fromEmail = process.env.RESEND_FROM_AGREEMENTS ?? process.env.RESEND_FROM_EMAIL!
  const { data, error } = await getResend().emails.send({
    from: fromEmail,
    to: opts.to,
    subject: `Agreement Fully Signed — ${opts.propertyTitle}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="text-align:center;padding:20px 0">
        <span style="font-size:24px;font-weight:900"><span style="color:#c9952a">P</span>ROPATI</span>
      </div>
      <h2>Agreement Complete!</h2>
      <p>Hello ${opts.recipientName.split(' ')[0]},</p>
      <p>Great news — the tenancy agreement for <strong>${opts.propertyTitle}</strong> has been fully signed by both parties.</p>
      <div style="background:#f0fdf4;padding:15px;border-radius:8px;margin:20px 0;border:1px solid #bbf7d0">
        <p style="margin:5px 0;color:#166534"><strong>✓ Both parties have signed</strong></p>
        <p style="margin:5px 0"><strong>Property:</strong> ${opts.propertyTitle}</p>
        <p style="margin:5px 0"><strong>Other Party:</strong> ${opts.otherPartyName}</p>
      </div>
      <div style="text-align:center;margin:25px 0">
        <a href="${opts.signedPdfUrl}" style="background:#0e7c6a;color:white;padding:12px 30px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">
          Download Signed Agreement
        </a>
      </div>
      <p style="font-size:12px;color:#999">
        This signed document includes an electronic signature certificate with identity verification details for all parties.
      </p>
      <hr style="border:none;border-top:1px solid #eee;margin:20px 0">
      <p style="font-size:11px;color:#aaa;text-align:center">
        PROPATI — Nigeria's Verified Property Platform
      </p>
    </div>`,
  })
  if (error) throw error
  return data
}
