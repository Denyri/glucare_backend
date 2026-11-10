export default function MetrikMetabolik({
    usia = 42,
    risiko = 51,
    metode = "Kesioner",
    tanggal = "2026-04-11",
}) {
    return (
        <div className="bg-white rounded-2xl shadow p-6 flex-1">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">
                Metrik Metabolik
            </h2>

            <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                    <div>
                        <p className="font-semibold">Usia Metabolik</p>
                        <p className="text-xs text-gray-400">vs. usia 42</p>
                    </div>
                    <p className="font-semibold">{usia} tahun</p>
                </div>

                <div className="flex justify-between">
                    <div>
                        <p className="font-semibold">Risiko 5 Tahun</p>
                        <p className="text-xs text-gray-400">probabilitas progresi</p>
                    </div>
                    <p className="font-semibold">{risiko}%</p>
                </div>

                <div className="flex justify-between">
                    <div>
                        <p className="font-semibold">Mode Analisis</p>
                        <p className="text-xs text-gray-400">{tanggal}</p>
                    </div>
                    <p className="font-semibold">{metode}</p>
                </div>
            </div>
        </div>
    );
}