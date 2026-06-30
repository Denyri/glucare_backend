import rsLogo from "../assets/homeimages/rslogo.png";
import whoLogo from "../assets/homeimages/whologo.png";
import diabetesLogo from "../assets/homeimages/diabeteslogo.png";
import kesehatanLogo from "../assets/homeimages/kesehatanlogo.png";
import whatsappIcon from "../assets/homeimages/Whatsapp.svg";
import instagramIcon from "../assets/homeimages/Instagram.svg";
import facebookIcon from "../assets/homeimages/Facebook.svg";
import discordIcon from "../assets/homeimages/Discord.svg";

export default function Footer() {
    return (
        <footer className="bg-[#f5f7fa] px-5 py-[60px]">
            {/* Top Links */}
            <div className="max-w-[1100px] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-10">
                <div>
                    <h3 className="text-base mb-[10px] font-semibold">About Glucare</h3>
                    <p className="text-[13px] text-[#555]">
                        Take control of your diabetes risk and start living a healthier life.
                    </p>
                </div>

                <div>
                    <h3 className="text-base mb-[10px] font-semibold">Resource Center</h3>
                    <ul className="list-none">
                        <li className="mb-[6px]"><a href="#" className="text-[13px] text-[#555] hover:text-[#0072CE]">Case Studies</a></li>
                        <li className="mb-[6px]"><a href="#" className="text-[13px] text-[#555] hover:text-[#0072CE]">Articles</a></li>
                        <li className="mb-[6px]"><a href="#" className="text-[13px] text-[#555] hover:text-[#0072CE]">Interview</a></li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-base mb-[10px] font-semibold">Support</h3>
                    <ul className="list-none">
                        <li className="mb-[6px]"><a href="#" className="text-[13px] text-[#555] hover:text-[#0072CE]">Help Center</a></li>
                        <li className="mb-[6px]"><a href="#" className="text-[13px] text-[#555] hover:text-[#0072CE]">Contact Us</a></li>
                        <li className="mb-[6px]"><a href="#" className="text-[13px] text-[#555] hover:text-[#0072CE]">Registration</a></li>
                        <li className="mb-[6px]"><a href="#faq" className="text-[13px] text-[#555] hover:text-[#0072CE]">FAQ</a></li>
                        <li className="mb-[6px]"><a href="#" className="text-[13px] text-[#555] hover:text-[#0072CE]">Log</a></li>
                    </ul>
                </div>
            </div>

            {/* Partner Logos */}
            <div className="max-w-[1100px] mx-auto flex flex-wrap gap-[20px] sm:gap-[25px] my-[30px]">
                <img src={rsLogo} alt="RS" className="h-10 object-contain" />
                <img src={whoLogo} alt="WHO" className="h-10 object-contain" />
                <img src={diabetesLogo} alt="Diabetes" className="h-10 object-contain" />
                <img src={kesehatanLogo} alt="Kesehatan" className="h-10 object-contain" />
            </div>

            {/* Bottom Bar */}
            <div className="max-w-[1100px] mx-auto flex flex-col sm:flex-row justify-between items-start gap-6">
                <div className="max-w-[500px]">
                    <div className="flex items-center gap-2 text-[#0072CE] mb-[10px]">
                        <img src="/logo_glucare.png" alt="Glucare" className="w-[25px]" />
                        <span>GluCare</span>
                    </div>

                    <div className="flex flex-wrap gap-[10px] mb-[10px]">
                        <a href="#" className="text-xs text-[#555] hover:text-[#0072CE]">Privacy & Policy</a>
                        <a href="#" className="text-xs text-[#555] hover:text-[#0072CE]">Terms & Conditions</a>
                        <a href="#" className="text-xs text-[#555] hover:text-[#0072CE]">Help</a>
                        <a href="#" className="text-xs text-[#555] hover:text-[#0072CE]">Language help</a>
                        <a href="#" className="text-xs text-[#555] hover:text-[#0072CE]">Glucare App</a>
                    </div>

                    <p className="text-xs text-[#666]">
                        GluCare is an AI application for early detection and intervention in
                        the pre-diabetes phase for individuals aged 20–40.
                    </p>
                </div>

                {/* Social Icons */}
                <div className="flex gap-3">
                    <a href="https://wa.me/number" target="_blank">
                        <img src={whatsappIcon} alt="Whatsapp" className="w-7 transition duration-300 hover:scale-110" />
                    </a>
                    <a href="https://instagram.com/username" target="_blank">
                        <img src={instagramIcon} alt="Instagram" className="w-7 transition duration-300 hover:scale-110" />
                    </a>
                    <a href="https://facebook.com/page" target="_blank">
                        <img src={facebookIcon} alt="Facebook" className="w-7 transition duration-300 hover:scale-110" />
                    </a>
                    <a href="https://discord.com" target="_blank">
                        <img src={discordIcon} alt="Discord" className="w-7 transition duration-300 hover:scale-110" />
                    </a>
                </div>
            </div>
        </footer>
    );
}