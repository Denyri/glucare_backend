import { FaChevronRight } from "react-icons/fa";

export default function SettingItem({ icon: Icon, label, onClick}) {
    return (
        <div 
            onClick={onClick}
            className="flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow-sm cursor-pointer hover:bg-gray-50 transition">
                <div className="flex items-center gap-3">
                    <div className="text-blue-500">
                        <Icon />
                    </div>
                    <span className="text-sm font-medium">{label}</span>
                </div>

                <FaChevronRight className="text-gray-400" />
            </div>
    );
}