export default function Alert({type = "success", message, onClose}) {
    const base = "p-4 rounded-lg flex items-start justify-between gap-3";

    const styles = {
        success : "bg-green-100 text-green-700",
        error: "bg-red-100 text-red-700",
        warning: "bg-yellow-100 text-yellow-700",
    };

    return (
        <div className={`${base} ${styles[type]}`}>
            <span className="text-sm">{message}</span>

            {onClose && (
                <button onClick={onClose} className="text-sm font-bold opacity-60 hover:opacity-100">
                    ✕
                </button>
            )}
        </div>
    );
}