import nodemailer from 'nodemailer';

export default function apiRoutesPlugin() {
  return {
    name: 'api-routes',
    configureServer(server) {
      server.middlewares.use('/api/send-notification', async (req, res, next) => {
        if (req.method !== 'POST' && req.method !== 'OPTIONS') {
          return next();
        }

        // Handle CORS preflight
        if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          res.statusCode = 200;
          return res.end();
        }

        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Content-Type', 'application/json');

        try {
          // Read request body
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });

          req.on('end', async () => {
            try {
              const data = JSON.parse(body);
              const { notification, notificationDetails, recipientType, noOfApplicants, userId, recipients } = data;

              // Validate required fields
              if (!notification || !notificationDetails || !userId || !recipients || recipients.length === 0) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ error: 'Missing required fields' }));
              }

              // Get email credentials from environment variables
              const emailUser = process.env.EMAIL_USER || process.env.VITE_EMAIL_USER || 'manasparwani397@gmail.com';
              const emailPassword = process.env.EMAIL_PASSWORD || process.env.VITE_EMAIL_PASSWORD || 'cfun kbct fclz ujsa';

              // Create transporter
              const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: emailUser,
                  pass: emailPassword,
                },
              });

              // Prepare email content function
              const createEmailContent = (recipientName) => {
                const subject = notification;
                const htmlContent = `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6;">
                    <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
                      Hi ${recipientName},
                    </p>
                    <p style="color: #555; font-size: 15px; margin-bottom: 20px;">
                      This email is to notify you regarding the following:
                    </p>
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #4f46e5;">
                      <h2 style="color: #333; font-size: 20px; margin: 0 0 15px 0; font-weight: 600;">
                        ${notification}
                      </h2>
                      <div style="color: #555; font-size: 15px; white-space: pre-wrap;">
                        ${notificationDetails.replace(/\n/g, '<br>')}
                      </div>
                    </div>
                    ${recipientType ? `<p style="color: #777; font-size: 14px; margin: 10px 0;"><strong>Recipient Type:</strong> ${recipientType}</p>` : ''}
                    ${noOfApplicants ? `<p style="color: #777; font-size: 14px; margin: 10px 0;"><strong>Number of Applicants:</strong> ${noOfApplicants}</p>` : ''}
                    <p style="color: #333; font-size: 16px; margin-top: 30px;">
                      Thanks,<br>
                      <span style="color: #4f46e5; font-weight: 600;">ClaimConnect Legal Team</span>
                    </p>
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px;">
                      <p>This is an automated notification from ClaimConnect Legal.</p>
                    </div>
                  </div>
                `;

                const textContent = `Hi ${recipientName},

This email is to notify you regarding the following:

${notification}

${notificationDetails}

${recipientType ? `Recipient Type: ${recipientType}` : ''}
${noOfApplicants ? `Number of Applicants: ${noOfApplicants}` : ''}

Thanks,
ClaimConnect Legal Team

---
This is an automated notification from ClaimConnect Legal.`.trim();

                return { subject, htmlContent, textContent };
              };

              // Send emails to all recipients
              const emailPromises = recipients.map((recipient) => {
                const { subject, htmlContent, textContent } = createEmailContent(recipient.name);
                return transporter.sendMail({
                  from: `"ClaimConnect Legal" <${emailUser}>`,
                  to: recipient.email,
                  subject: subject,
                  text: textContent,
                  html: htmlContent,
                });
              });

              // Wait for all emails to be sent
              const results = await Promise.allSettled(emailPromises);
              
              // Count successful and failed sends
              const successful = results.filter(r => r.status === 'fulfilled').length;
              const failed = results.filter(r => r.status === 'rejected').length;

              res.statusCode = 200;
              res.end(JSON.stringify({
                success: true,
                message: `Notification sent to ${successful} recipient(s)${failed > 0 ? `, ${failed} failed` : ''}`,
                successful,
                failed,
              }));
            } catch (error) {
              console.error('Error sending notification emails:', error);
              res.statusCode = 500;
              res.end(JSON.stringify({
                error: 'Failed to send notification emails',
                message: error.message,
              }));
            }
          });
        } catch (error) {
          console.error('Error parsing request:', error);
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Invalid request body' }));
        }
      });
    },
  };
}
