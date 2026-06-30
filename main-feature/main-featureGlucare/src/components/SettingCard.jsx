import SettingItem from "./SettingItem";
import { useNavigate } from "react-router-dom";
import { FaKey, FaShieldAlt, FaQuestionCircle } from "react-icons/fa";

export default function SettingCard() {
    const navigate = useNavigate();
    return (
        <div className="bg-blue-100 p-5 rounded-xl shadow">
            <h2 className="font-bold mb-4">Informasi Aplikasi & Legal</h2>

            <div className="space-y-3">
                <SettingItem icon = {FaKey} label="Ubah kata sandi" onClick={() => navigate("/ubahpassword")}/>
                <SettingItem icon={FaShieldAlt} label="Kebijakan privasi dan ketentuan layanan" onClick={() => navigate("/privasi-layanan")}/>
                <SettingItem icon={FaQuestionCircle} label="Bantuan dan dukungan" onClick={() => navigate("/bantuan-dan-dukungan")}/>
            </div>
        </div>
    );
}