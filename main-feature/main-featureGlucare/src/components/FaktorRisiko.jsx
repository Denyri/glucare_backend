export default function FaktorRisiko({
    items = [
        "Riwayat keluarga berisiko",
        "Sedentary lifestyle",
        "Konsumsi gula sangat tinggi",
        "Kualitas tidur sangat buruk",
        "Stres tinggi (meningkatkan kortisol & resistensi insulin)",
    ],
}) {
    return (
        <div className="bg-white rounded-2xl shadow p-6 flex-1">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">
                Faktor Risiko
            </h2>

            <ul className="space-y-3 text-sm">
                {items.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                        <span className="text-red-400 mt-1">•</span>
                        <span className="text-gray-600">{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}