import Sidebar from "../components/Sidebar";
import HeaderAnalisis from "../components/HeaderAnalisis";
import { useSidebar } from "../hooks/useSidebar";

export default function KebijakanPrivasi() {
    const { isOpen } = useSidebar();

    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <div className="flex-1 flex flex-col">
                <div className={`flex-1 transition-all duration-300 ${
                    isOpen ? "lg:ml-60" : "lg:ml-24"
                }`}>
                    <HeaderAnalisis title = "Kebijakan Privasi & Layanan" subtitle="Informasi berikut menjelaskan bagaimana kami mengelola data, serta aturan penggunaan layanan."/>

                    <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            <div className="bg-white rounded-xl p-5 shadow border">
                                <h2 className="font-semibold mb-3">Privacy Policy</h2>

                                <p className="text-sm text-gray-600 mb-2">
                                    Kami menghargai privasi Anda. Informasi yang kami kumpulkan:
                                </p>

                                <ul className="text-sm text-gray-700 space-y-1 mb-4">
                                    <li>• Data akun (Nama, Email)</li>
                                    <li>• Data Pengguna Aplikasi</li>
                                </ul>

                                <ul className="text-sm text-gray-600 mb-2">
                                    <li>• Meningkatkan layanan</li>
                                    <li>• Memberikan pengalaman pengguna yang lebih baik</li>
                                </ul>

                                <p className="text-sm text-gray-600 mb-2 font-medium">
                                    Keamanan Data
                                </p>

                                <p className="text-sm text-gray-700 mb-4">
                                    Kami menjaga data Anda dengan sistem keamanan terbaik.
                                </p>

                                <p className="text-sm text-gray-600">
                                    Apabila ada pertanyaan hubungi kami disini:
                                </p>

                                <p className="text-sm text-blue-600 mt-1">
                                    nusahealth228@gmail.com
                                </p>
                            </div> 

                            <div className="bg-white rounded-xl p-5 shadow border flex flex-col justify-between">
                                <div>
                                    <p className="text-sm text-gray-700 mb-3">
                                        Dengan menggunakan aplikasi ini Anda setuju untuk:
                                    </p>

                                    <ul className="text-sm text-gray-700 space-y-2 mb-4">
                                        <li>• Tidak menyalahgunakan layanan</li>
                                        <li>• Tidak melanggar hukum</li>
                                        <li>• Menjaga keamanan akun Anda</li>
                                    </ul>

                                    <p className="text-sm text-gray-700 font-medium mb-2">
                                        Kami berhak:
                                    </p>

                                    <ul className="text-sm text-gray-700 space-y-2">
                                        <li>→ Menghapus akun jika melanggar aturan</li>
                                        <li>→ Mengubah layanan sewaktu-waktu</li>
                                    </ul>
                                </div>

                                <div className="mt-6">
                                    <div className="bg-gray-100 text-sm text-gray-600 px-4 py-2 rounded-lg text-center">
                                        Terakhir di Perbarui: 29-03-2026
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}