import { useState } from 'react';
import api from "../api";
import { FaKey } from "react-icons/fa";

const StepNewPassword = ({ resetToken, onSuccess }) => {
    const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPass, setShowPass] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (form.newPassword !== form.confirmPassword) {
        return setError('Konfirmasi password tidak cocok');
        }
        if (form.newPassword.length < 8) {
        return setError('Password minimal 8 karakter');
        }

        setLoading(true);
        try {
        await api.post('/api/auth/reset-password', {
            resetToken,
            newPassword: form.newPassword,
            confirmPassword: form.confirmPassword,
        });
        onSuccess();
        } catch (err) {
        setError(err.response?.data?.message || 'Terjadi kesalahan');
        } finally {
        setLoading(false);
        }
    };

    return (
        <>
        <div className="text-center mb-6">
            <div className="mb-3 flex justify-center">
                <FaKey className="text-4xl text-blue-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Buat Password Baru</h1>
            <p className="text-gray-500 text-sm mt-1">Password minimal 8 karakter</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            {['newPassword', 'confirmPassword'].map((field) => (
            <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                {field === 'newPassword' ? 'Password Baru' : 'Konfirmasi Password'}
                </label>
                <div className="relative">
                <input
                    type={showPass ? 'text' : 'password'}
                    name={field}
                    value={form[field]}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm
                            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-10"
                />
                {field === 'newPassword' && (
                    <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                    >
                    {showPass ? 'Sembunyikan' : 'Tampilkan'}
                    </button>
                )}
                </div>
            </div>
            ))}

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
            {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
            </button>
        </form>
        </>
    );
};

export default StepNewPassword;