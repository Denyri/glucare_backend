export default function FAQItem({ pertanyaan, jawaban }) {
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="font-semibold text-sm">{pertanyaan}</p>
            <p className="text-sm text-gray-600 mt-1">{jawaban}</p>
        </div>
    );
}