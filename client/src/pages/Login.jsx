// import React, { useState, useEffect } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import axios from "axios";

// function LoginPage() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [error, setError] = useState(location.state?.message || "");
//   const [isLoading, setIsLoading] = useState(false);

//   // Dyslexia-friendly styles
//   const dyslexicStyles = {
//     fontFamily: "'Comic Sans MS', sans-serif",
//     letterSpacing: "0.05em",
//     lineHeight: "1.6",
//   };

//   // Colors
//   const colors = {
//     primary: "#4CAF50", // Green
//     secondary: "#FF9800", // Orange
//     background: "#fffff4", // Cream
//     text: "#333333", // Dark gray
//     error: "#D32F2F" // Soft red
//   };

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       navigate("/dashboard");
//     }
//   }, [navigate]);

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError("");
    
//     try {
//       const response = await axios.post("http://localhost:5000/login", {
//         email,
//         password,
//       });
//       localStorage.setItem("token", response.data.token);
//       navigate("/dashboard");
//     } catch (err) {
//       setError("Oops! That email and password combination didn't work. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div 
//       className="min-h-screen flex items-center justify-center p-4"
//       style={{...dyslexicStyles, backgroundColor: colors.background}}
//     >
//       <div 
//         className="w-full max-w-md p-8 rounded-xl shadow-lg"
//         style={{backgroundColor: "white"}}
//       >
//         {/* Header with icon */}
//         <div className="text-center mb-6">
//           <div className="text-5xl mb-3" role="img" aria-label="Lock">🔒</div>
//           <h2 
//             className="text-3xl font-bold mb-2"
//             style={{color: colors.primary}}
//           >
//             Welcome Back!
//           </h2>
//           <p className="text-lg" style={{color: colors.text}}>
//             Sign in to continue learning
//           </p>
//         </div>

//         {/* Error Message */}
//         {error && (
//           <div className="mb-6 p-4 rounded-lg flex items-start" style={{backgroundColor: "#FFEBEE"}}>
//             <span className="text-xl mr-2" style={{color: colors.error}}>⚠️</span>
//             <p style={{color: colors.error}}>{error}</p>
//           </div>
//         )}

//         <form className="space-y-5" onSubmit={handleLogin}>
//           {/* Email Field */}
//           <div>
//             <label
//               htmlFor="email"
//               className="block text-lg font-medium mb-2"
//               style={{color: colors.text}}
//             >
//               <span className="mr-2">✉️</span> Email Address
//             </label>
//             <input
//               type="email"
//               id="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full p-4 text-lg rounded-lg border-2 focus:outline-none focus:ring-2"
//               style={{
//                 ...dyslexicStyles,
//                 borderColor: "#E0E0E0",
//                 backgroundColor: colors.background,
//                 focusBorderColor: colors.primary,
//                 focusRingColor: colors.primary
//               }}
//               placeholder="your@email.com"
//               required
//             />
//           </div>

//           {/* Password Field */}
//           <div>
//             <label
//               htmlFor="password"
//               className="block text-lg font-medium mb-2"
//               style={{color: colors.text}}
//             >
//               <span className="mr-2">🔑</span> Password
//             </label>
//             <input
//               type="password"
//               id="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full p-4 text-lg rounded-lg border-2 focus:outline-none focus:ring-2"
//               style={{
//                 ...dyslexicStyles,
//                 borderColor: "#E0E0E0",
//                 backgroundColor: colors.background,
//                 focusBorderColor: colors.primary,
//                 focusRingColor: colors.primary
//               }}
//               placeholder="Enter your password"
//               required
//             />
//           </div>

//           {/* Submit Button */}
//           <button
//             type="submit"
//             disabled={isLoading}
//             className="w-full py-4 px-6 rounded-xl text-white text-xl font-bold shadow-md transition-all flex justify-center items-center"
//             style={{
//               backgroundColor: isLoading ? "#A5D6A7" : colors.primary,
//               hoverBackgroundColor: colors.secondary
//             }}
//           >
//             {isLoading ? (
//               <>
//                 <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                 </svg>
//                 Signing In...
//               </>
//             ) : (
//               "Sign In"
//             )}
//           </button>
//         </form>

//         {/* Footer Links */}
//         <div className="mt-6 text-center">
//           <p className="text-lg" style={{color: colors.text}}>
//             Don't have an account?{' '}
//             <button 
//               onClick={() => navigate("/signup")}
//               className="font-bold underline focus:outline-none"
//               style={{color: colors.primary}}
//             >
//               Sign up here
//             </button>
//           </p>
//           <button 
//             onClick={() => navigate("/forgot-password")}
//             className="mt-2 text-lg font-medium focus:outline-none"
//             style={{color: colors.text}}
//           >
//             Forgot password?
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default LoginPage;
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(location.state?.message || "");
  const [isLoading, setIsLoading] = useState(false);

  // Dyslexia-friendly styles
  const dyslexicStyles = {
    fontFamily: "'Comic Sans MS', 'OpenDyslexic', sans-serif",
    letterSpacing: "0.05em",
    lineHeight: "1.6",
    color: "#333",
    textDecoration: "none"
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const response = await axios.post("http://localhost:5000/login", {
        email,
        password,
      });
      localStorage.setItem("token", response.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError("Oops! That email and password combination didn't work. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-blue-50 p-4"
      style={dyslexicStyles}
    >
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl overflow-hidden">
        {/* Colorful header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
          <h2 className="text-3xl font-bold text-white text-center">
            Welcome Back!
          </h2>
          <p className="text-white text-center mt-2 text-lg">
            Sign in to continue learning
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="p-6 space-y-5">
          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded">
              <p className="text-red-700 font-medium">⚠️ {error}</p>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-1">
            <label className="block text-lg font-medium text-blue-800 flex items-center">
              <span className="mr-2">✉️</span> Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              style={dyslexicStyles}
              placeholder="your@email.com"
              required
            />
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <label className="block text-lg font-medium text-blue-800 flex items-center">
              <span className="mr-2">🔑</span> Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              style={dyslexicStyles}
              placeholder="Enter your password"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 px-6 rounded-xl text-white font-bold text-lg mt-6 transition-all ${isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing In...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="bg-blue-100 p-4 text-center border-t border-blue-200">
          <div className="flex flex-col space-y-2">
            <p className="text-blue-800">
              Don't have an account?{' '}
              <button 
                onClick={() => navigate("/signup")}
                className="font-bold underline focus:outline-none text-blue-600"
              >
                Sign up here
              </button>
            </p>
            <button 
              onClick={() => navigate("/forgot-password")}
              className="text-blue-700 hover:underline focus:outline-none"
            >
              Forgot password?
            </button>
            <p className="text-blue-800 pt-2">
              Need help? Contact us at{' '}
              <span className="font-bold">support@dyslexiaapp.com</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;