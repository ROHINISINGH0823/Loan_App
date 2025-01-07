require('dotenv').config(); // Load environment variables from .env file
const SibApiV3Sdk = require('sib-api-v3-sdk');

// Use the API key from the environment variable
const apiKey = process.env.SENDINBLUE_API_KEY;
const apiInstance = SibApiV3Sdk.ApiClient.instance;
apiInstance.authentications['api-key'].apiKey = apiKey;

const transactionalEmailsApi = new SibApiV3Sdk.TransactionalEmailsApi();

const sendEmail = async (recipientEmail, subject, content) => {
  const email = new SibApiV3Sdk.SendSmtpEmail();
  email.sender = { email: 'rohini.singh@jkcsoftwares.com' }; 
  email.to = [{ email: recipientEmail }];
  email.subject = subject;
  email.htmlContent = content;

  try {
    const response = await transactionalEmailsApi.sendTransacEmail(email);
    console.log('Email sent successfully:', response);
  } catch (error) {
    console.error('Error sending email:', error.response ? error.response.body : error);
  }
};

module.exports = sendEmail;
