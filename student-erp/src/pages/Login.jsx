import { useState } from "react";
import axios from "axios";
import loginImg from "../assets/login.png";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/api/admin/login", {
        email,
        password,
      });
      localStorage.setItem("isLoggedIn", "true");
      navigate("/dashboard");
    } catch {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex bg-[#546c70] animate-[bgShift_12s_ease-in-out_infinite]">
      {/* LEFT IMAGE PANEL */}
      <div className="hidden lg:block lg:w-[48%] relative m-6 rounded-xl overflow-hidden border border-white/20 shadow-2xl">
        <img
          src={loginImg}
          alt="students"
          className="w-full h-full object-cover animate-[slowZoom_20s_linear_infinite]"
        />

        <div className="absolute inset-0 bg-[#546c70]/55"></div>

        <div className="absolute bottom-8 left-8 text-black">
          <h2 className="text-2xl font-semibold mb-1">
            Smart Student Management
          </h2>
          <p className="text-sm max-w-xs opacity-90">
            Manage students, attendance, courses and performance in one powerful
            system.
          </p>
        </div>
      </div>

      {/* RIGHT LOGIN AREA */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div
          className="bg-white/90 backdrop-blur-lg p-10 rounded-xl shadow-2xl w-full max-w-md
                        animate-[cardEnter_0.9s_ease-out] border border-white/30"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-1">Welcome</h2>

          <p className="text-gray-500 mb-6 text-sm">
            Sign in to continue to Admin Dashboard
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email ID"
              className="w-full p-3 bg-gray-100 rounded-md
                         focus:outline-none focus:ring-2 focus:ring-[#546c70]
                         transition-all duration-300
                         focus:scale-[1.03] focus:shadow-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full p-3 bg-gray-100 rounded-md
               focus:outline-none focus:ring-2 focus:ring-[#546c70]
               transition-all duration-300
               focus:scale-[1.03] focus:shadow-md pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#546c70] transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              className="w-full bg-[#546c70] text-white py-3 rounded-md font-semibold
                               hover:bg-[#3e5559]
                               hover:scale-[1.04]
                               active:scale-[0.96]
                               transition duration-200 shadow-md hover:shadow-xl"
            >
              Log in
            </button>
          </form>
        </div>
      </div>

      {/* ANIMATIONS */}
      <style>
        {`
        @keyframes cardEnter {
          from {
            opacity: 0;
            transform: translateY(60px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes slowZoom {
          0% { transform: scale(1); }
          50% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }

        @keyframes bgShift {
          0% { background-color: #546c70; }
          50% { background-color: #4d6367; }
          100% { background-color: #546c70; }
        }
        `}
      </style>
    </div>
  );
}

export default Login;
