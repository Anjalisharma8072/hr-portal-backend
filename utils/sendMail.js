const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
   service: 'gmail',
   auth: {
      user: 'harshraj7864@gmail.com',
      pass: "dpqiojgltontoiav"
   },
   debug: true, // Enable debug output
   logger: true // Log to console
});

const sendMail = async (to, subject, text) => {
   try {
      await transporter.sendMail({
         from: `"HR Portal Admin" <${process.env.EMAIL_USER}>`,
         to,
         subject,
         text
      });
      console.log('Email sent successfully to:', to);
   } catch (error) {
      console.error('Error sending email:', {
         message: error.message,
         code: error.code,
         command: error.command,
         stack: error.stack
      });
      throw new Error('Failed to send email');
   }
};

module.exports = sendMail;