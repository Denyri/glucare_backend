import { useState } from 'react';
import StepEmail from '../components/StepEmail';
import StepOtp from '../components/StepOtp';
import StepNewPassword from '../components/StepNewPassword';
import StepSuccess from '../components/StepSuccess';

const ForgotPassword = () => {

    const [step, setStep] = useState('email');
    const [email, setEmail] = useState('');
    const [resetToken, setResetToken] = useState('');

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-8">

            {step === 'email' && (
            <StepEmail
                onSuccess={(inputEmail) => {
                setEmail(inputEmail);
                setStep('otp');
                }}
            />
            )}

            {step === 'otp' && (
            <StepOtp
                email={email}
                onSuccess={(token) => {
                setResetToken(token);
                setStep('new-password');
                }}
                onBack={() => setStep('email')}
            />
            )}

            {step === 'new-password' && (
            <StepNewPassword
                resetToken={resetToken}
                onSuccess={() => setStep('success')}
            />
            )}

            {step === 'success' && <StepSuccess />}

        </div>
        </div>
    );
};

export default ForgotPassword;