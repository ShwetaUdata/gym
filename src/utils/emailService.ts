import { emailApi } from '@/services/apiService';
import { Client } from '@/types/gym';
import { formatCurrency, calculateDiscountedPrice } from '@/utils/pricing';

export async function sendWelcomeEmail(client: Client): Promise<boolean> {
  try {
    const totalAmount = client.finalAmount || calculateDiscountedPrice(client.membershipType, client.membershipPeriod);
    
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #8b5cf6, #f59e0b); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to PowerFit Gym! 🎉</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
          <h2 style="color: #374151; margin-bottom: 20px;">Dear ${client.name},</h2>
          <p style="color: #374151; line-height: 1.6;">Welcome to the PowerFit Gym family! We're thrilled to have you join us on your fitness journey.</p>
          <p style="color: #374151; line-height: 1.6;">Your membership is now active and you can start working out immediately.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">Membership Details:</h3>
            <ul style="color: #374151; line-height: 1.8; list-style: none; padding: 0;">
              <li>📋 <strong>Client ID:</strong> ${client.clientId}</li>
              <li>⏰ <strong>Time Slot:</strong> ${client.slot ? client.slot.charAt(0).toUpperCase() + client.slot.slice(1) : 'Not specified'}</li>
              <li>📅 <strong>Start Date:</strong> ${new Date(client.startDate).toLocaleDateString()}</li>
              <li>📅 <strong>End Date:</strong> ${new Date(client.endDate).toLocaleDateString()}</li>
              <li>💰 <strong>Amount:</strong> ${formatCurrency(totalAmount)}</li>
            </ul>
          </div>
          
          <p style="color: #374151; line-height: 1.6;">Remember, consistency is key! We can't wait to see you achieve your fitness goals.</p>
          <p style="color: #374151; line-height: 1.6; margin-top: 30px;">Best regards,<br/><strong>PowerFit Gym Team</strong></p>
        </div>
        <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
          <p>© ${new Date().getFullYear()} PowerFit Gym. All rights reserved.</p>
        </div>
      </div>
    `;

    // This will be handled by the local context for now
    // When backend is connected, uncomment below:
    // await emailApi.send({
    //   clientId: client.clientId,
    //   emailType: 'welcome',
    //   subject: 'Welcome to PowerFit Gym! 🎉',
    //   html,
    // });

    console.log('Welcome email would be sent to:', client.email);
    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return false;
  }
}

export async function sendCustomEmail(
  client: Client,
  subject: string,
  html: string,
  emailType: string = 'custom'
): Promise<boolean> {
  try {
    await emailApi.send({
      clientId: client.clientId,
      emailType,
      subject,
      html,
    });
    console.log('Email sent successfully to:', client.email);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}
