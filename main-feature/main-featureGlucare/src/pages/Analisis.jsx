import Sidebar from "../components/Sidebar";
import HeaderAnalisis from "../components/HeaderAnalisis";
import AnalisisCard from "../components/AnalisisCard";
import { useNavigate } from "react-router-dom";
import ilustrasi from "../assets/ilustrasi.png"
import kuesioner from "../assets/kuesioner.png"
import labtest from "../assets/labtest.png"
import { useSidebar } from "../hooks/useSidebar";

function Analisis() {
    const navigate = useNavigate();
    const { isOpen } = useSidebar();

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />

            <div className={`flex-1 transition-all duration-300 ${isOpen ? 'lg:ml-60' : 'lg:ml-24'}`}>
                <HeaderAnalisis title="Analisis Risiko" subtitle="Pilih metode untuk menghitung skor risiko" />

                <div className="p-4 sm:p-6 lg:p-8 relative min-h-[450px] sm:min-h-[500px] lg:min-h-[518px]">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto w-full">

                        <AnalisisCard
                            icon={labtest}
                            title="Mode Klinis / Lab"
                            description="Gunakan data hasil pemeriksaan medis untuk analisis lebih akurat"
                            tags={["HbA1c", "GDP", "GDS", "Kolestrol", "Tekanan Darah"]}
                            tagBg="#6BAFFF1A"
                            tagText="#0072CE"
                            footerText="✅ Akurasi tinggi-direkomendasikan"
                            footerColor="#059669"
                            onClick={() => navigate("/modeLab")}
                        />

                        <AnalisisCard
                            icon={kuesioner}
                            title="Mode Kuesioner"
                            description="Jawab pertanyaan sederhana untuk analisis cepat"
                            tags={["Pola Hidup", "Aktivitas", "Riwayat", "Keluarga"]}
                            tagBg="#A8AAFF1A"
                            tagText="#6366F1"
                            footerText="📋 Cocok tanpa data lab"
                            footerColor="#6366F1"
                            onClick={() => navigate("/kuesioner")}
                        />

                    </div>

                    <img 
                        src={ilustrasi} 
                        alt="Ilustrasi analisis" 
                        className="absolute bottom-4 sm:bottom-6 lg:bottom-0 right-4 sm:right-6 w-40 sm:w-52 lg:w-60 
                                    max-w-[40%] sm:max-w-[35%] lg:max-w-none pointer-events-none opacity-80 lg:opacity-100
                                    hidden sm:block" 
                    />
                </div>
            </div>
        </div>      
    );
}

export default Analisis;