import { FaCheckCircle } from "react-icons/fa";

const StepSuccess = () => (
    <div className="text-center py-4">
        <div className="mb-3 flex justify-center">
            <FaCheckCircle className="text-5xl text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Password Berhasil Direset!</h1>
        <p className="text-gray-500 text-sm mt-2 mb-6">
        Kamu sekarang bisa login dengan password baru kamu.
        </p>
        
        <a href="/login"
        className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white
                    font-semibold rounded-lg px-6 py-2.5 text-sm transition-colors"
        >
        Pergi ke Halaman Login
        </a>
    </div>
);

export default StepSuccess;