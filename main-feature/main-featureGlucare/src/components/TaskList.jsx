import { useState } from "react";

export default function TaskList() {
    const [tasks, setTasks] = useState([
        { id: 1, icon: "🏃‍♀️", text: "Jalan kaki 30 menit", xp: "+30 XP", color: "bg-green-100 text-green-600", completed: false },
        { id: 2, icon: "💧", text: "Minum air 6 gelas", xp: "+20 XP", color: "bg-blue-100 text-blue-600", completed: false },
        { id: 3, icon: "🍬", text: "Batasi gula < 25g hari ini", xp: "+30 XP", color: "bg-red-100 text-red-600", completed: false },
        { id: 4, icon: "💊", text: "Konsumsi obat / suplemen", xp: "+10 XP", color: "bg-yellow-100 text-yellow-600", completed: false },
        { id: 5, icon: "😴", text: "Tidur 7-8 jam malam ini", xp: "+20 XP", color: "bg-purple-100 text-purple-600", completed: false },
        { id: 6, icon: "🥗", text: "Makan sayur + protein tanpa goreng", xp: "+30 XP", color: "bg-green-100 text-green-600", completed: false },
    ]);

    const toggleTask = (id) => {
        setTasks(tasks.map(task =>
            task.id === id
                ? { ...task, completed: !task.completed }
                : task
        ));
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="space-y-3">
                {tasks.map((item) => (
                    <div
                        key={item.id}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-colors duration-200 ${
                            item.completed
                                ? 'bg-green-50 border-green-200'
                                : 'border-gray-100 hover:border-gray-200'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <label className="relative flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={item.completed}
                                    onChange={() => toggleTask(item.id)}
                                    className="sr-only peer"
                                />
                                <div className="w-5 h-5 bg-white border-2 rounded-lg peer-checked:border-green-500 peer-checked:bg-green-500"></div>
                            </label>

                            <span className={`text-xl ${item.completed ? 'opacity-50 line-through' : ''}`}>
                                {item.icon}
                            </span>

                            <span className={`text-sm ${
                                item.completed
                                    ? 'opacity-50 line-through'
                                    : 'text-gray-700'
                            }`}>
                                {item.text}
                            </span>
                        </div>

                        <span className={`text-xs px-2 py-1 rounded-full ${item.color} ${
                            item.completed ? 'scale-105 ring-2 ring-green-200' : ''
                        }`}>
                            {item.xp}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}