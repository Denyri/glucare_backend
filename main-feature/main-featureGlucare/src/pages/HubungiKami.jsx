import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import contactBg from "../assets/contactus/Rectangle 235.png";
import CTASection from "../components/CTAsection";
import api from "../api";

export default function HubungiKami() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });

    const [popup, setPopup] = useState({
        show: false,
        title: "",
        message: "",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const showPopup = (title, message) => {
        setPopup({ show: true, title, message });
    };

    const closePopup = () => {
        setPopup({ ...popup, show: false });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { name, email, message } = formData;

        if (!name || !email || !message) {
            showPopup("Gagal!", "Mohon isi semua field!");
            return;
        }

        try {
            const response = await api.post(`/api/contact-us/send`, formData);

            showPopup(
                "Berhasil!",
                response.data.message || "Pesan Anda telah terkirim! Kami akan segera menghubungi Anda."
            );

            setFormData({ name: "", email: "", message: "" });
        } catch (error) {
            showPopup(
                "Gagal!",
                error.response?.data?.message || "Terjadi kesalahan saat mengirim pesan."
            );
        }
    };

    return (
        <div className="font-[Poppins]">
            <Navbar />

            <section>
                {/* Hero Banner */}
                <div
                    className="h-[320px] pt-28 flex flex-col justify-center items-center text-white text-center bg-cover bg-center px-4"
                    style={{ backgroundImage: `url(${contactBg})` }}>

                    <h1 className="text-3xl sm:text-4xl font-bold relative after:content-[''] after:block after:w-[100px] after:h-[2px] after:bg-white after:mx-auto after:mt-[20px]">
                        Hubungi Kami
                    </h1>

                    <p className="mt-[10px] mb-[80px] text-sm sm:text-base px-2">
                        Jika Anda mengalami masalah atau memiliki pertanyaan, silakan isi
                        formulir layanan pelanggan di bawah ini.
                        <br />
                        Kami sangat menghargai keluhan dari pengguna
                    </p>
                </div>

                {/* Contact Form Card */}
                <div className="bg-white w-[95%] sm:w-[85%] md:w-[70%] lg:w-[50%] mx-auto mt-[-80px] mb-20 p-6 sm:p-10 rounded-[15px] shadow-lg relative z-10">
                    <h2 className="text-center text-[#0072CE] text-xl sm:text-2xl font-bold mb-[30px]">
                        Kirimkan Kami Pesan
                    </h2>

                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col sm:flex-row gap-5 mb-5">
                            <div className="flex flex-col w-full">
                                <label className="text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="p-3 border border-[#ddd] rounded-[10px] outline-none focus:ring-2 focus:ring-[#0072CE] focus:border-transparent transition"
                                />
                            </div>

                            <div className="flex flex-col w-full">
                                <label className="text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="p-3 border border-[#ddd] rounded-[10px] outline-none focus:ring-2 focus:ring-[#0072CE] focus:border-transparent transition"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col mb-6">
                            <label className="text-sm font-medium text-gray-700 mb-1">Message</label>
                            <textarea
                                name="message"
                                placeholder="Your Message"
                                value={formData.message}
                                onChange={handleChange}
                                className="p-3 border border-[#ddd] rounded-[10px] outline-none h-[120px] resize-none focus:ring-2 focus:ring-[#0072CE] focus:border-transparent transition"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full sm:w-auto px-8 py-3 rounded-lg bg-[#0072CE] text-white font-semibold hover:bg-[#003A68] transition shadow-md">
                            Kirim Pesan
                        </button>
                    </form>
                </div>

                {/* Popup */}
                {popup.show && (
                    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 px-4">
                        <div className="bg-white px-6 sm:px-10 py-8 rounded-[15px] text-center animate-in fade-in zoom-in duration-300 w-full max-w-sm">
                            <h2 className="text-xl sm:text-2xl font-bold">{popup.title}</h2>
                            <p className="mt-3 text-sm sm:text-base">{popup.message}</p>

                            <button
                                onClick={closePopup}
                                className="mt-5 px-6 py-2 bg-[#0072CE] text-white rounded-lg hover:bg-[#003A68] transition">
                                OK
                            </button>
                        </div>
                    </div>
                )}
            </section>

            <CTASection />
            <Footer />
        </div>
    );
}