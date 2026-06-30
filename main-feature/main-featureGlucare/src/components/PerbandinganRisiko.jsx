export default function PerbandinganRisiko ({
    before = { value: 93, label: "Tinggi", date: "2026-04-11"},
    after = { value: 96, label: "Tinggi", date: "2026-04-17"},
    improvementText ="Skor turun 3 poin - ada perbaikan!",
}) {
    return (
        <div className="bg-white rounded-2xl shadow p-6 w-full">
        <h2 className="text-sm font-semibold text-gray-700 mb-4"> Perbandingan Risiko </h2>

        <div className="flex gap-4 flex-col md:flex-row">
            <div className="flex-1 bg-blue-50 rounded-xl p-4 relative">
                <p className="text-xs text-gray-500 mb-1">Dulu</p>
                <h3 className="text-2xl font-bold text-red-500">
                    {before.value}%
                </h3>
                <p className="text-sm text-red-500 font-bold">{before.label}</p>
                <p className="text-xs text-gray-400 mt-1">{before.date}</p>

                <div className="h-1 bg-red-200 rounded-full mt-3">
                    <div className="h-1 bg-red-500 rounded-full" style={{width: `${before.value}%`}}/>
                </div>
            </div>

            <div className="flex-1 bg-blue-50 rounded-xl p-4 relative">
                <p className="text-xs text-gray-500 mb-1">Sekarang</p>
                <h3 className="text-2xl font-bold text-red-500">
                    {after.value}%
                </h3>
                <p className="text-sm text-red-500 font-bold">{after.label}</p>
                <p className="text-xs text-gray-400 mt-1">{after.date}</p>

                <div className="h-1 bg-red-200 rounded-full mt-3">
                    <div className="h-1 bg-red-500 rounded-full" style={{width: `${after.value}%`}}/>
                </div>
            </div>
        </div>

            <div className="mt-4 flex justify-center">
                <div className="bg-green-100 text-[#059669] font-bold text-sm px-4 py-2 rounded-full flex items-center gap-2">
                    <span>✅</span>
                    <span>{improvementText}</span>
                </div>
            </div>
        </div>
    );
}