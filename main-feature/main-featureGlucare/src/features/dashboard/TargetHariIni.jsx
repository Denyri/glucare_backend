export default function StatCardGrid() {
    const data = [
        { icon: "🩸", value: "18g", sub: "/40g", label: "Gula" },
        { icon: "🏃‍♀️", value: "22 menit", sub: "/21 menit", label: "Aktivitas" },
        { icon: "😴", value: "6.5 jam", sub: "/8 jam", label: "Tidur" },
        { icon: "💧", value: "6 gelas", sub: "/8 gelas", label: "Air" },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.map((item, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-sm">
                    <div className="text-lg">{item.icon}</div>
                    <p className="text-lg font-semibold mt-1 text-gray-800">{item.value}</p>
                    <p className="text-sm text-gray-400">{item.sub}</p>

                    <div className="mt-3">
                        <div className="w-full h-2 bg-gray-200 rounded-full">
                            <div className="h-2 bg-[#0072CE] rounded-full w-[80%]" />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{item.label}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}