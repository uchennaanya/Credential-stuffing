import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendSOCAlert(
  username: string,
  ip: string,
  country: string,
  riskScore: number,
  riskLevel: string,
  reasons: string[]
) {
  try {
    const socEmail = process.env.SOC_EMAIL;
    if (!socEmail) {
      console.warn("SOC_EMAIL not configured in .env");
      return false;
    }

    await resend.emails.send({
      from: 'CredentialGuard Security <alert@credentialguard.com>',
      to: socEmail,
      subject: `🚨 ${riskLevel} Risk Alert - Credential Stuffing Attempt`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #ef4444;">⚠️ Credential Stuffing Alert</h2>
          <p>A suspicious login attempt was detected by the system.</p>

          <div style="background-color: #1f2937; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #f3f4f6;">Attempt Details</h3>
            <p><strong>Username:</strong> ${username}</p>
            <p><strong>IP Address:</strong> ${ip}</p>
            <p><strong>Location:</strong> ${country}</p>
            <p><strong>Risk Score:</strong> ${riskScore}% (${riskLevel})</p>
          </div>

          <h4>Detected Reasons:</h4>
          <ul style="background: #374151; padding: 15px; border-radius: 8px;">
            ${reasons.map(r => `<li style="margin: 8px 0;">• ${r}</li>`).join('')}
          </ul>

          <p style="margin-top: 25px; color: #9ca3af;">
            This alert was generated automatically by CredentialGuard Detection System.<br>
            <strong>Time:</strong> ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    });

    console.log(`✅ SOC Alert sent for user: ${username}`);
    return true;
  } catch (error) {
    console.error("Failed to send SOC email:", error);
    return false;
  }
}