export default function ProfileItem ({icon: Icon, label, value}) {
    return (
        <div className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 shadow-sm">
            <div className="text-blue-500 text-lg">
                <Icon />
            </div>

            <div className="flex flex-col">
                <span className="text-xs text-gray-400">{label}</span>
                <span className="text-sm font-semibold">{value}</span>
            </div>
        </div>
    );
}