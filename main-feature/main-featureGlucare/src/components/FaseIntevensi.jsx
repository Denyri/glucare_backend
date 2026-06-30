import { useNavigate } from "react-router-dom";
export default function FaseIntervensi({ currentDay = 1 }) {
    const navigate = useNavigate();
    const phases = [
        {
            title: "Stabilisasi Dasar",
            range: "Hari 1-30",
            active: currentDay <= 30,
            path: "/stabilisasi",
            status: [
                { icon: "🍬", value: "<= 40g", color: "text-orange-500" },
                { icon: "🏃‍♀️", value: "150 menit", color: "text-blue-500" },
                { icon: "😴", value: "7 jam", color: "text-purple-500" },
            ],
        },
        {
            title: "Optimasi Metabolik",
            range: "Hari 31-60",
            active: currentDay > 30 && currentDay <= 60,
            path: "/optimasi",
            status: [
                { icon: "🍬", value: "<= 30g", color: "text-orange-500" },
                { icon: "🏃‍♀️", value: "200 menit", color: "text-blue-500" },
                { icon: "😴", value: "7.5 jam", color: "text-purple-500" },
            ],
        },
        {
            title: "Konsolidasi",
            range: "Hari 61-90",
            active: currentDay > 60,
            path: "/konsolidasi",
            status: [
                { icon: "🍬", value: "<= 25g", color: "text-orange-500" },
                { icon: "🏃‍♀️", value: "250 menit", color: "text-blue-500" },
                { icon: "😴", value: "8 jam", color: "text-purple-500" },
            ],
        },
    ];

    return (
        <div className="space-y-4">
            {phases.map((item, i) => (
                <div
                    key={i}
                    onClick={() => item.path && navigate(item.path)}
                    className={`rounded-xl p-4 border transition cursor-pointer hover:shadow-sm ${
                        item.active
                            ? "border-[#0B5ED7] bg-blue-50"
                            : "border-gray-200 bg-gray-50 opacity-80 hover:opacity-100"
                    }`}
                >
                    <div className="flex items-start gap-4">
                        
                        
                        <div
                            className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${
                                item.active
                                    ? "bg-[#0B5ED7] text-white"
                                    : "bg-gray-200 text-gray-600"
                            }`}
                        >
                            {i + 1}
                        </div>

                            
                        <div className="flex-1">
                            <p className="font-medium text-gray-800">
                                {item.title}
                            </p>
                            <p className="text-xs text-gray-500">
                                {item.range}
                            </p>

                            
                            <div className="flex gap-4 mt-2 text-xs flex-wrap">
                                {item.status.map((stat, idx) => (
                                    <span key={idx} className={stat.color}>
                                        {stat.icon} {stat.value}
                                    </span>
                                ))}
                            </div>

                            <p className="text-xs text-[#0072CE] mt-2 font-medium">
                                Klik untuk detail
                            </p>                         
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}