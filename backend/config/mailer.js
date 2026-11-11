const nodemailer = require('nodemailer');

const sendOtpEmail = async (toEmail, otp) => {
 
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `"Glucare" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Kode OTP Reset Password',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
            <h2>Reset Password</h2>
            <p>Gunakan kode OTP berikut untuk mereset password kamu:</p>
            <div style="
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            color: #4F46E5;
            padding: 16px;
            background: #EEF2FF;
            border-radius: 8px;
            text-align: center;
            ">
            ${otp}
            </div>
            <p style="color: #6B7280; margin-top: 16px;">
            Kode ini berlaku selama <strong>5 menit</strong>.<br/>
            Abaikan email ini jika kamu tidak mereset password.
            </p>
        </div>
        `,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { sendOtpEmail };