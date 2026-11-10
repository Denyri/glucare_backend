import { useEffect, useState } from "react";

const AchievementPopup = ({ achievements, onClose }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (achievements && achievements.length > 0) {
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
                setTimeout(onClose, 500); // Wait for the transition to finish
            }, 4000); // Show for 4 seconds
            return () => clearTimeout(timer);
        }
    }, [achievements, onClose]);

    if (!achievements || achievements.length === 0) return null;

    return (
        <div className={`fixed bottom-10 right-10 z-[100] transition-all duration-500 transform ${visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
            <div className="bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 text-white px-6 py-4 rounded-2xl shadow-[0_10px_40px_rgba(245,158,11,0.5)] flex items-center gap-4 border border-yellow-300">
                <div className="text-4xl animate-bounce drop-shadow-md">🏆</div>
                <div>
                    <h4 className="font-bold text-lg drop-shadow-md uppercase tracking-wider text-yellow-50">Achievement Unlocked!</h4>
                    <ul className="text-sm font-semibold mt-1 drop-shadow-sm flex flex-col gap-1">
                        {achievements.map((ach, idx) => (
                            <li key={idx} className="flex items-center gap-2 bg-black/10 px-3 py-1 rounded-full w-fit">
                                <span className="text-yellow-200">✨</span> {ach.replace(/_/g, " ")}
                            </li>
                        ))}
                    </ul>
                </div>
                <button onClick={() => setVisible(false)} className="ml-4 text-white/80 hover:text-white transition-colors">
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>
        </div>
    );
};

export default AchievementPopup;
