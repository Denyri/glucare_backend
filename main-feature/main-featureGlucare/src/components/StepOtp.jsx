import { useState, useEffect } from 'react';
import api from "../api";

const StepOtp = ({ email, onSuccess, onBack }) => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(300); 
    const [resending, setResending] = useState(false);

    
    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
        return () => clearInterval(timer);
    }, [countdown]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
        const res = await api.post('/api/auth/verify-otp', { email, otp });
        onSuccess(res.data.resetToken);
        } catch (err) {
        setError(err.response?.data?.message || 'OTP tidak valid');
        } finally {
        setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        setError('');
        try {
        await api.post('/api/auth/forgot-password', { email });
        setCountdown(300);
        setOtp('');
        } catch (err) {
        setError('Gagal mengirim ulang OTP');
        } finally {
        setResending(false);
        }
    };

    return (
        <>
        <div className="text-center mb-6">
            <div className="text-4xl mb-3">📩</div>
            <h1 className="text-2xl font-bold text-gray-800">Cek Email Kamu</h1>
            <p className="text-gray-500 text-sm mt-1">
            Kode OTP dikirim ke <span className="font-medium text-gray-700">{email}</span>
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Kode OTP (6 digit)
            </label>
            <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="------"
                required
                maxLength={6}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm
                        text-center tracking-[0.5em] font-bold text-lg
                        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            </div>

            
            <div className="text-center text-sm">
            {countdown > 0 ? (
                <p className="text-gray-500">
                Kode kedaluwarsa dalam{' '}
                <span className={`font-semibold ${countdown <= 60 ? 'text-red-500' : 'text-indigo-600'}`}>
                    {formatTime(countdown)}
                </span>
                </p>
            ) : (
                <p className="text-red-500">Kode sudah kedaluwarsa</p>
            )}
            </div>

            {error && (
            <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
            </p>
            )}

            <button
            type="submit"
            disabled={loading || countdown <= 0 || otp.length < 6}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400
                        text-white font-semibold rounded-lg py-2.5 text-sm transition-colors"
            >
            {loading ? 'Memverifikasi...' : 'Verifikasi OTP'}
            </button>

            
            <div className="text-center text-sm text-gray-500">
            Tidak menerima kode?{' '}
            <button
                type="button"
                onClick={handleResend}
                disabled={resending || countdown > 0}
                className="text-indigo-600 hover:underline disabled:text-gray-400 disabled:no-underline font-medium"
            >
                {resending ? 'Mengirim...' : 'Kirim Ulang'}
            </button>
            </div>

            <button
            type="button"
            onClick={onBack}
            className="block w-full text-center text-sm text-gray-500 hover:text-indigo-600"
            >
            ← Ganti Email
            </button>
        </form>
        </>
    );
};

export default StepOtp;