const  Button = ({
    children, variant = "primary", onClick, className ="", type ="button",
}) => {
    const base = "px-6 py-3 rounded-xl font-semibold transition duration-200";

const variants = {
    primary: "bg-gradient-to-r from-[#0072CE] to-[#3E97FF] text-white px-14 py-3 rounded-xl font-semibold shadow-lg hover:from-[#005fa8] hover:to-[#2f7de0] transition-colors duration-200",
    secondary : "border border-gray-300 text-gray-600 hover:bg-gray-100 px-20"
};

return(
        <button type={type} onClick={onClick} className={`${base} ${variants[variant]} ${className}`}>
            {children}
        </button>
    );
};

export default Button;
