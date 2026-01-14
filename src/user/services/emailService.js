const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

/**
 * Email Service for Offer Letters
 * Handles sending offer letters via email with attachments and tracking
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter
   */
  async initializeTransporter() {
    try {
      // Create transporter based on environment
      if (process.env.NODE_ENV === 'production') {
        // Production email service (Gmail, SendGrid, etc.)
        this.transporter = nodemailer.createTransport({
          service: process.env.EMAIL_SERVICE || 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
          }
        });
      } else {
        // Development - use Ethereal for testing
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass
          }
        });
      }

      console.log('✅ [EmailService] Email transporter initialized');
    } catch (error) {
      console.error('❌ [EmailService] Error initializing email transporter:', error);
    }
  }

  /**
   * Send offer letter email
   */
  async sendOfferLetter(offerData, emailOptions = {}) {
    try {
      console.log('📧 [EmailService] Sending offer letter email:', {
        to: offerData.candidateData.candidate_email,
        candidateName: offerData.candidateData.candidate_name
      });

      const {
        subject,
        body,
        attachments = [],
        cc = [],
        bcc = []
      } = emailOptions;

      // Default email subject
      const emailSubject = subject || `Offer Letter - ${offerData.candidateData.designation} at ${offerData.companyData?.companyName || 'Our Company'}`;

      // Default email body
      const emailBody = body || this.generateDefaultEmailBody(offerData);

      // Prepare email data
      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: offerData.candidateData.candidate_email,
        cc: cc.length > 0 ? cc : undefined,
        bcc: bcc.length > 0 ? bcc : undefined,
        subject: emailSubject,
        html: emailBody,
        attachments: attachments
      };

      // Send email
      const result = await this.transporter.sendMail(mailOptions);

      console.log('✅ [EmailService] Offer letter email sent successfully:', {
        messageId: result.messageId,
        candidateEmail: offerData.candidateData.candidate_email
      });

      return {
        success: true,
        messageId: result.messageId,
        previewUrl: process.env.NODE_ENV !== 'production' ? nodemailer.getTestMessageUrl(result) : null
      };

    } catch (error) {
      console.error('❌ [EmailService] Error sending offer letter email:', error);
      throw error;
    }
  }

  /**
   * Send offer letter with PDF attachment
   */
  async sendOfferLetterWithPDF(offerData, pdfPath, emailOptions = {}) {
    try {
      console.log('📧 [EmailService] Sending offer letter with PDF attachment');

      // Check if PDF exists
      try {
        await fs.access(pdfPath);
      } catch (error) {
        throw new Error('PDF file not found');
      }

      // Prepare PDF attachment
      const attachments = [{
        filename: `Offer_Letter_${offerData.candidateData.candidate_name.replace(/\s+/g, '_')}.pdf`,
        path: pdfPath,
        contentType: 'application/pdf'
      }];

      // Send email with attachment
      const result = await this.sendOfferLetter(offerData, {
        ...emailOptions,
        attachments
      });

      return result;

    } catch (error) {
      console.error('❌ [EmailService] Error sending offer letter with PDF:', error);
      throw error;
    }
  }

  /**
   * Send bulk offer letters
   */
  async sendBulkOfferLetters(offers, emailOptions = {}) {
    try {
      console.log('📧 [EmailService] Sending bulk offer letters:', offers.length);

      const results = [];
      const errors = [];

      for (const offer of offers) {
        try {
          const result = await this.sendOfferLetter(offer, emailOptions);
          results.push({
            offerId: offer.id,
            candidateName: offer.candidateData.candidate_name,
            candidateEmail: offer.candidateData.candidate_email,
            success: true,
            messageId: result.messageId
          });
        } catch (error) {
          errors.push({
            offerId: offer.id,
            candidateName: offer.candidateData.candidate_name,
            candidateEmail: offer.candidateData.candidate_email,
            success: false,
            error: error.message
          });
        }
      }

      console.log('✅ [EmailService] Bulk offer letters completed:', {
        successful: results.length,
        errors: errors.length
      });

      return { results, errors };

    } catch (error) {
      console.error('❌ [EmailService] Error in bulk offer letters:', error);
      throw error;
    }
  }

  /**
   * Send offer reminder email
   */
  async sendOfferReminder(offerData, reminderType = 'followup') {
    try {
      console.log('📧 [EmailService] Sending offer reminder:', reminderType);

      const reminderTemplates = {
        followup: {
          subject: `Follow-up: Your Offer Letter - ${offerData.candidateData.designation}`,
          body: this.generateFollowupEmailBody(offerData)
        },
        expiry: {
          subject: `Urgent: Your Offer Letter Expires Soon - ${offerData.candidateData.designation}`,
          body: this.generateExpiryEmailBody(offerData)
        },
        acceptance: {
          subject: `Reminder: Please Respond to Your Offer Letter - ${offerData.candidateData.designation}`,
          body: this.generateAcceptanceReminderBody(offerData)
        }
      };

      const template = reminderTemplates[reminderType] || reminderTemplates.followup;

      const result = await this.sendOfferLetter(offerData, {
        subject: template.subject,
        body: template.body
      });

      return result;

    } catch (error) {
      console.error('❌ [EmailService] Error sending offer reminder:', error);
      throw error;
    }
  }

  /**
   * Generate default email body
   */
  generateDefaultEmailBody(offerData) {
    const companyName = offerData.companyData?.companyName || 'Our Company';
    const candidateName = offerData.candidateData.candidate_name;
    const designation = offerData.candidateData.designation;
    const department = offerData.candidateData.department;
    const joiningDate = offerData.candidateData.joining_date || 'To be discussed';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; }
          .content { padding: 20px 0; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin-top: 20px; }
          .highlight { color: #2563eb; font-weight: bold; }
          .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: #2563eb; margin: 0;">🎉 Congratulations!</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">You've been selected!</p>
          </div>
          
          <div class="content">
            <p>Dear <span class="highlight">${candidateName}</span>,</p>
            
            <p>We are delighted to inform you that you have been selected for the position of <span class="highlight">${designation}</span> in the <span class="highlight">${department}</span> department at <span class="highlight">${companyName}</span>.</p>
            
            <p>Your offer letter is attached to this email with all the details regarding your compensation, benefits, and employment terms.</p>
            
            <h3>Key Details:</h3>
            <ul>
              <li><strong>Position:</strong> ${designation}</li>
              <li><strong>Department:</strong> ${department}</li>
              <li><strong>Joining Date:</strong> ${joiningDate}</li>
              <li><strong>Company:</strong> ${companyName}</li>
            </ul>
            
            <p>Please review the offer letter carefully and let us know if you have any questions. We look forward to welcoming you to our team!</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="#" class="button">Accept Offer</a>
              <a href="#" class="button" style="background-color: #64748b;">Ask Questions</a>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>Next Steps:</strong></p>
            <ol style="text-align: left; display: inline-block;">
              <li>Review the offer letter</li>
              <li>Sign and return the acceptance</li>
              <li>Complete onboarding documents</li>
              <li>Prepare for your first day</li>
            </ol>
            
            <p style="margin-top: 20px;">
              <strong>Contact:</strong> HR Department<br>
              <strong>Email:</strong> hr@${companyName.toLowerCase().replace(/\s+/g, '')}.com<br>
              <strong>Phone:</strong> +91-XXXXXXXXXX
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate follow-up email body
   */
  generateFollowupEmailBody(offerData) {
    const candidateName = offerData.candidateData.candidate_name;
    const designation = offerData.candidateData.designation;
    const companyName = offerData.companyData?.companyName || 'Our Company';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #fef3c7; padding: 20px; text-align: center; border-radius: 8px; }
          .content { padding: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="color: #d97706; margin: 0;">📧 Follow-up: Your Offer Letter</h2>
          </div>
          
          <div class="content">
            <p>Dear <strong>${candidateName}</strong>,</p>
            
            <p>I hope this email finds you well. I wanted to follow up regarding the offer letter we sent you for the <strong>${designation}</strong> position at <strong>${companyName}</strong>.</p>
            
            <p>We haven't received your response yet, and we wanted to ensure you received the offer and address any questions you might have.</p>
            
            <p>Please let us know:</p>
            <ul>
              <li>If you received the offer letter</li>
              <li>If you have any questions about the offer</li>
              <li>When you expect to provide your response</li>
            </ul>
            
            <p>We're excited about the possibility of having you join our team and look forward to hearing from you soon!</p>
            
            <p>Best regards,<br>
            HR Team<br>
            ${companyName}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate expiry reminder email body
   */
  generateExpiryReminderBody(offerData) {
    const candidateName = offerData.candidateData.candidate_name;
    const designation = offerData.candidateData.designation;
    const companyName = offerData.companyData?.companyName || 'Our Company';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #fee2e2; padding: 20px; text-align: center; border-radius: 8px; }
          .content { padding: 20px 0; }
          .urgent { color: #dc2626; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="color: #dc2626; margin: 0;">⚠️ URGENT: Offer Letter Expires Soon</h2>
          </div>
          
          <div class="content">
            <p>Dear <strong>${candidateName}</strong>,</p>
            
            <p class="urgent">Your offer letter for the <strong>${designation}</strong> position at <strong>${companyName}</strong> is about to expire!</p>
            
            <p>This is a final reminder that we need your response to proceed with your onboarding process. If you don't respond by the expiration date, we may need to withdraw the offer.</p>
            
            <p>Please respond immediately if you're still interested in joining our team. We're here to help with any questions or concerns you might have.</p>
            
            <p>Don't miss this opportunity to join our amazing team!</p>
            
            <p>Best regards,<br>
            HR Team<br>
            ${companyName}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate acceptance reminder email body
   */
  generateAcceptanceReminderBody(offerData) {
    const candidateName = offerData.candidateData.candidate_name;
    const designation = offerData.candidateData.designation;
    const companyName = offerData.companyData?.companyName || 'Our Company';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #dbeafe; padding: 20px; text-align: center; border-radius: 8px; }
          .content { padding: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="color: #2563eb; margin: 0;">📋 Reminder: Please Respond to Your Offer</h2>
          </div>
          
          <div class="content">
            <p>Dear <strong>${candidateName}</strong>,</p>
            
            <p>We hope you're doing well. We're writing to remind you that we're still waiting for your response to the offer letter for the <strong>${designation}</strong> position at <strong>${companyName}</strong>.</p>
            
            <p>To help you make your decision, please consider:</p>
            <ul>
              <li>Review the compensation and benefits package</li>
              <li>Check the employment terms and conditions</li>
              <li>Consider the growth opportunities</li>
              <li>Think about the company culture and values</li>
            </ul>
            
            <p>We're excited about the possibility of having you join our team and would love to discuss any questions or concerns you might have.</p>
            
            <p>Please respond at your earliest convenience.</p>
            
            <p>Best regards,<br>
            HR Team<br>
            ${companyName}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Send test email
   */
  async sendTestEmail(toEmail) {
    try {
      console.log('🧪 [EmailService] Sending test email to:', toEmail);

      const testMailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: toEmail,
        subject: 'Test Email - Offer Letter System',
        html: `
          <h2>Test Email</h2>
          <p>This is a test email to verify the email service is working correctly.</p>
          <p>If you receive this email, the email service is configured properly.</p>
          <p>Sent at: ${new Date().toLocaleString()}</p>
        `
      };

      const result = await this.transporter.sendMail(testMailOptions);

      console.log('✅ [EmailService] Test email sent successfully');

      return {
        success: true,
        messageId: result.messageId,
        previewUrl: process.env.NODE_ENV !== 'production' ? nodemailer.getTestMessageUrl(result) : null
      };

    } catch (error) {
      console.error('❌ [EmailService] Error sending test email:', error);
      throw error;
    }
  }

  /**
   * Get email service status
   */
  async getServiceStatus() {
    try {
      if (!this.transporter) {
        return { status: 'not_initialized', message: 'Email transporter not initialized' };
      }

      // Test the connection
      await this.transporter.verify();
      
      return { 
        status: 'connected', 
        message: 'Email service is working correctly',
        service: process.env.EMAIL_SERVICE || 'gmail'
      };

    } catch (error) {
      return { 
        status: 'error', 
        message: `Email service error: ${error.message}`,
        service: process.env.EMAIL_SERVICE || 'gmail'
      };
    }
  }
}

module.exports = new EmailService();
