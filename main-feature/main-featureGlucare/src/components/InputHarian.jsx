import { useState, useEffect } from "react";
import api from "../api";

export default function InputHarian() {
    const [sudahInput, setSudahInput] = useState(false);
    const [todayData, setTodayData] = useState(null);
    const [loadingCheck, setLoadingCheck] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [sukses, setSukses] = useState(null);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        glucose_mean: "",
        steps: "",
        sleep_hours: "",
        carbs_g: "",
    });

    useEffect(() => {
        const cekHariIni = async () => {
            try {
                const token = localStorage.getItem("token") || sessionStorage.getItem("token");
                if (!token) {
                    setLoadingCheck(false);
                    return;
                }
                const res = await api.get("/api/daily-logs/today", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setSudahInput(res.data.sudah_input);
                setTodayData(res.data.data);
            } catch (err) {
                console.error("Gagal cek log hari ini:", err);
            } finally {
                setLoadingCheck(false);
            }
        };
        cekHariIni();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        setError("");

        const { glucose_mean, steps, sleep_hours, carbs_g } = form;
        if (!glucose_mean || !steps || !sleep_hours || !carbs_g) {
            setError("Semua field wajib diisi");
            return;
        }
        if (Number(glucose_mean) < 50 || Number(glucose_mean) > 500) {
            setError("Gula darah tidak valid (50–500 mg/dL)");
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            if (!token) {
                setError("User tidak terautentikasi");
                setSubmitting(false);
                return;
            }
            const res = await api.post("/api/daily-logs", {
                glucose_mean: parseFloat(glucose_mean),
                steps: parseInt(steps),
                sleep_hours: parseFloat(sleep_hours),
                carbs_g: parseFloat(carbs_g),
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSukses(res.data);
            setSudahInput(true);
        } catch (err) {
            if (err.response?.status === 409) {
                setSudahInput(true);
            } else {
                setError(err.response?.data?.message || "Gagal menyimpan data");
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingCheck) {
        return (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <p className="text-sm text-gray-400">Memuat...</p>
            </div>
        );
    }

    if (sudahInput) {
        const data = sukses || todayData;
        return (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-lg flex-shrink-0">
                        ✓
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800">Data hari ini sudah tercatat</p>
                        {data && (
                            <p className="text-sm text-gray-500">
                                Hari ke-{data.day_idx} · Streak 🔥 {data.streak} hari
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-1">Input Data Hari Ini</h3>
            <p className="text-xs text-gray-400 mb-4">
                Catat kondisi harianmu untuk pemantauan program 90 hari
            </p>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-xs text-gray-500 mb-1 block">Gula Darah (mg/dL)</label>
                    <input
                        type="number"
                        name="glucose_mean"
                        value={form.glucose_mean}
                        onChange={handleChange}
                        placeholder="cth: 110"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-500 mb-1 block">Langkah Kaki</label>
                    <input
                        type="number"
                        name="steps"
                        value={form.steps}
                        onChange={handleChange}
                        placeholder="cth: 8000"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-500 mb-1 block">Jam Tidur</label>
                    <input
                        type="number"
                        name="sleep_hours"
                        value={form.sleep_hours}
                        onChange={handleChange}
                        placeholder="cth: 7.5"
                        step="0.5"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-500 mb-1 block">Karbohidrat (gram)</label>
                    <input
                        type="number"
                        name="carbs_g"
                        value={form.carbs_g}
                        onChange={handleChange}
                        placeholder="cth: 150"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                </div>
            </div>

            {error && <p className="text-red-500 text-xs mt-3">{error}</p>}

            <button
                onClick={handleSubmit}
                disabled={submitting}
                className="mt-4 w-full bg-[#0072CE] hover:bg-gradient-to-r hover:from-[#0072CE] hover:to-[#003A68] disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition"
            >
                {submitting ? "Menyimpan..." : "Simpan Data Hari Ini"}
            </button>
        </div>
    );
}