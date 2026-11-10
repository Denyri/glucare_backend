import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { useSidebar } from "../hooks/useSidebar";
import HeaderIntervensi from "../components/HeaderIntervensi";
import OptimasiRingkasan from "../components/OptimasiRingkasan";
import OptimasiMingguan from "../components/OptimasiMingguan";
import OptimasiTargetAkhir from "../components/OptimasiTargetAkhir";

export default function OptimasiMetabolik() {
    const [activeTab, setActiveTab] = useState("ringkasan");
    const tabs = [
        { id: "ringkasan", label: "Ringkasan Klinis", icon: "biotech" },
        { id: "mingguan", label: "Panduan Mingguan", icon: "calendar_month" },
        { id: "target akhir", label: "Target Akhir", icon: "flag" },
    ];
    const { isOpen } = useSidebar();

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            <Sidebar />
            <div className={`flex-1 transition-all duration-300 ${isOpen ? "lg:ml-60" : "lg:ml-24"}`}>
                <HeaderIntervensi />

                <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-6">
                    {/* Tab Navigation */}
                    <div className="flex flex-wrap gap-2.5 p-1.5 bg-white border border-slate-200/80 rounded-2xl w-fit shadow-sm">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                                        isActive
                                            ? "bg-purple-600 text-white shadow-sm"
                                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab Contents */}
                    <div>
                        {activeTab === "ringkasan" && <OptimasiRingkasan />}
                        {activeTab === "mingguan" && <OptimasiMingguan />}
                        {activeTab === "target akhir" && <OptimasiTargetAkhir />}
                    </div>
                </div>
            </div>
        </div>
    );
}