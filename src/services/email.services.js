
const nodemailer = require('nodemailer');

// SMTP Servers - to connect
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
    },
});

// Verify the connection configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('Error connecting to email server:', error);
    } else {
        console.log('Email server is ready to send messages');
    }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Backend Ledger" <${process.env.EMAIL_USER}>`, // sender address
            to, // list of receivers
            subject, // Subject line
            text, // plain text body
            html, // html body
        });

        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

async function sendRegisterEmail(userEmail, name) {

    const subject = "Welcome to Backend Ledger! 🎉";

    const html = `
<!DOCTYPE html>
<html>
<head>
<style>

body {
    margin: 0;
    padding: 0;
    background-color: #f3f4f6;
    font-family: Arial, Helvetica, sans-serif;
}

.container {
    max-width: 600px;
    margin: 40px auto;
    background: #ffffff;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,0.08);
}


.header {
    background: linear-gradient(135deg, #ff7a18, #ff9f43);
    padding: 35px;
    text-align: center;
    color: white;
}


.header h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
}


.header p {
    margin-top: 10px;
    font-size: 15px;
}


.content {
    padding: 35px;
    color: #374151;
}


.content h2 {
    color: #111827;
    font-size: 22px;
}


.content p {
    line-height: 1.7;
    font-size: 15px;
}


.details {
    background: #f9fafb;
    border-radius: 10px;
    padding: 20px;
    margin: 25px 0;
    border: 1px solid #e5e7eb;
}


.details h3 {
    margin-top: 0;
    color: #ff7a18;
}


.details p {
    margin: 8px 0;
}


.button {
    display: inline-block;
    background-color: #ff7a18;
    color: white;
    padding: 12px 28px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    margin-top: 15px;
}


.footer {
    background: #111827;
    color: #9ca3af;
    text-align: center;
    padding: 20px;
    font-size: 13px;
}


</style>
</head>


<body>

<div class="container">


    <div class="header">

        <h1>Welcome to Backend Ledger</h1>

        <p>
            Your account has been created successfully
        </p>

    </div>



    <div class="content">


        <h2>Hello ${name},</h2>


        <p>
            Thank you for registering with 
            <strong>Backend Ledger</strong>.
            We are happy to have you onboard.
        </p>



        <div class="details">


            <h3>Account Details</h3>


            <p>
                <strong>Name:</strong> ${name}
            </p>


            <p>
                <strong>Email:</strong> ${userEmail}
            </p>


        </div>



        <p>
            You can now access your account and start using
            all available features.
        </p>



        <a href="#" class="button">
            Get Started
        </a>



        <p style="margin-top:30px;">
            If you did not create this account, please ignore this email.
        </p>



        <p>
            Regards,<br>
            <strong>Backend Ledger Team</strong>
        </p>


    </div>



    <div class="footer">

        © 2026 Backend Ledger. All rights reserved.

    </div>


</div>


</body>
</html>
`;

    await sendEmail(userEmail, subject, "", html);
}

module.exports = { sendRegisterEmail };