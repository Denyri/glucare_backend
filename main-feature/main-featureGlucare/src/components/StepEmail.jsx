import { useState } from 'react';
import { FaLock } from "react-icons/fa";
import api from "../api";


const StepEmail = ({ onSuccess }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
        await api.post('/api/auth/forgot-password', { email });
        onSuccess(email);
        } catch (err) {
        setError(err.response?.data?.message || 'Terjadi kesalahan, coba lagi');
        } finally {
        setLoading(false);
        }
    };

    return (
        <>
        <div className="text-center mb-6">
            <div className ="mb-3 flex justify-center">
                <FaLock className="text-4xl text-blue-500" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800">Lupa Kata Sandi?</h1>
            <p className="text-gray-500 text-sm mt-1">
            Masukkan email kamu, kami akan kirimkan kode OTP
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
            </label>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contoh@email.com"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm
                        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            </div>

            {error && (
            <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
            </p>
            )}

            <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400
                        text-white font-semibold rounded-lg py-2.5 text-sm transition-colors"
            >
            {loading ? 'Mengirim...' : 'Kirim Kode OTP'}
            </button>

            
            <a href="/login"
            className="block text-center text-sm text-gray-500 hover:text-indigo-600 mt-2"
            >
            ← Kembali ke Login
            </a>
        </form>
        </>
    );
};

export default StepEmail;