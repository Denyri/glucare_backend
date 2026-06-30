export default function ContactCard() {
    return (
        <div className="bg-blue-100 p-4 rounded-xl space-y-4">

            <div className="bg-white p-4 rounded-lg flex items-center gap-3">
                <span className="text-blue-500 text-lg">📧</span>
            <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-sm font-medium">
                    layanannusahealth228@gmail.com
                </p>
            </div>            
        </div>

        <div className="bg-white p-4 rounded-lg flex items-center gap-3">
                <span className="text-blue-500 text-lg">☎️</span>
            <div>
                <p className="text-sm text-gray-500">Whatsapp</p>
                <p className="text-sm font-medium">
                    +62812-3746-7347
                </p>
            </div>            
        </div>


    </div>
    );
}