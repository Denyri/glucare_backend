import Sidebar from "../components/Sidebar";
import HeaderAnalisis from "../components/HeaderAnalisis";
import { useSidebar } from "../hooks/useSidebar";
import { useState } from "react";
import FAQItem from "../components/FAQItem";
import ContactCard from "../components/ContactCard";

export default function BantuandanDukungan() {
    const { isOpen } = useSidebar();

    const [search, setSearch] = useState("")

    const faqs = [
        {
            pertanyaan: "Bagaimana cara mengubah email atau nomor telepon?",
            jawaban: "Pergi ke halaman pengaturan dan klik edit profile lalu ubah email atau no telepon anda",
        },
        {
            pertanyaan: "Apakah tersedia aplikasi di IOS atau android?",
            jawaban: "Ya, Glucare mempunyai aplikasi berbasis mobile. Anda bisa mengunduhnya untuk pemantauan yang lebih optimal",
        },
        {
            pertanyaan: "Apakah ada biaya tambahan yang perlu diketahui?",
            jawaban: "Tidak ada, Glucare gratis hanya untuk anda",
        },       
    ];

    const filteredFaqs = faqs.filter((item) =>
        item.pertanyaan.toLowerCase().includes(search.toLowerCase())
    );

    return(
        <div className="flex min-h-screen">
            <Sidebar />

            <div className="flex-1 flex flex-col">
                <div className={`flex-1 transition-all duration-300 ${isOpen ? "lg:ml-60" : "lg-ml-24"}`}>
                    <HeaderAnalisis 
                        title ="Bantuan & Dukungan"
                        subtitle="Butuh bantuan? Jelajahi FAQ atau hubungi kami sekarang"/>
                    <div className="p-6 space-y-6">

                        <input 
                            type="text"
                            placeholder="🔍 Cari bantuan..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-gray-100 focus:outline-none"/>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            <div className="bg-blue-100 p-4 rounded-xl space-y-3">
                                {filteredFaqs.map((item, index) => (
                                    <FAQItem key={index} {...item}/>
                                ))}
                            </div>

                            <ContactCard />
                        </div>
                    </div>


                </div>
            </div>
        </div>
    )
}

    
