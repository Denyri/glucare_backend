import Sidebar from "../components/Sidebar";
import { useState } from "react";
import { useSidebar } from "../hooks/useSidebar";
import HeaderIntervensi from "../components/HeaderIntervensi";
import StabilisasiRingkasan from "../components/StabilisasiRingkasan";
import StabilisasiMingguan from "../components/StabilisasiMingguan";
import StabilisasiTargetAkhir from "../components/StabilisasiTargetAkhir"

export default function StabilisasiDasar() {
    const [activeTab, setActiveTab] = useState("ringkasan");
    const tabs = ["ringkasan", "mingguan", "target akhir"];
    const { isOpen } = useSidebar();
    
    return (
        <div className="flex">
            <Sidebar />
            <div className={`flex-1 transition-all duration-300 ${isOpen ? 'lg:ml-60' : 'lg:ml-24'}`}>
                <HeaderIntervensi />
                
                <div className="p-8 max-w-6xl">
                    <div className="flex gap-4 mb-6">
                        {tabs.map((tab) => (
                            <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 rounded-xl capitalize shadow-sm ${ activeTab === tab ? "bg-blue-600 text-white" : "bg-white text-slate-600"}`}>
                                {tab}
                            </button>
                        ))}
                    </div>

                    {activeTab === "ringkasan" && <StabilisasiRingkasan />}
                    {activeTab === "mingguan" && <StabilisasiMingguan />}
                    {activeTab === "target akhir" && <StabilisasiTargetAkhir />}
                </div>
            </div>
        </div>
    );
}