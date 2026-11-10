import SettingItem from "./SettingItem";
import { useNavigate } from "react-router-dom";
import { FaKey, FaShieldAlt, FaQuestionCircle } from "react-icons/fa";

export default function SettingCard() {
    const navigate = useNavigate();
    return (
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
                <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
                    <span className="material-symbols-outlined text-[#0062E3] text-[22px]">settings</span>
                    <h2 className="font-bold font-display text-base text-slate-900">Keamanan & Layanan</h2>
                </div>

                <div className="space-y-3">
                    <SettingItem icon={FaKey} label="Ubah Kata Sandi" onClick={() => navigate("/ubahpassword")} />
                    <SettingItem icon={FaShieldAlt} label="Kebijakan Privasi & Ketentuan Layanan" onClick={() => navigate("/privasi-layanan")} />
                    <SettingItem icon={FaQuestionCircle} label="Pusat Bantuan & Dukungan Pengguna" onClick={() => navigate("/bantuan-dan-dukungan")} />
                </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Versi Aplikasi v2.4.0 (Clinical Release)</span>
                <span>Enkripsi AES-256</span>
            </div>
        </div>
    );
}