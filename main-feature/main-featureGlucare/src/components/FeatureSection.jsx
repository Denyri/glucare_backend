import checkRisk from "../assets/homeimages/checkrisk.png";
import ninetyDay from "../assets/homeimages/90-Day.png";
import trackProgress from "../assets/homeimages/TrackProgress.png";

const features = [
    {
        image: checkRisk,
        title: "Pemeriksaan Risiko Otomatis",
        desc: "Dapatkan gambaran instan tentang risiko diabetes Anda.",
    },
    {
        image: ninetyDay,
        title: "Program Kesehatan 90 Hari",
        desc: "Perbaiki kesehatan Anda dengan program terarah selama 90 hari.",
    },
    {
        image: trackProgress,
        title: "Monitor Kemajuan Anda",
        desc: "Terus perbarui kemajuan kesehatan Anda secara berkala.",
    },
];

export default function FeatureSection() {
    return (
        <section className="py-20 px-5 text-center bg-white">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl sm:text-3xl font-bold mb-12">
                    Program Kesehatan yang Dibuat Khusus untuk Anda
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl shadow-md p-6 w-full max-w-[300px]">
                            <img
                                src={feature.image}
                                alt={feature.title}
                                className="w-full rounded-lg mb-5" />

                            <h3 className="font-semibold text-lg mb-4">{feature.title}</h3>
                            <div className="w-40 h-px bg-gray-300 mx-auto mb-4" />

                            <p className="text-sm text-gray-600">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}