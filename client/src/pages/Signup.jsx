// import React, { useState } from "react";
// import axios from "axios";

// function TherapistSignup() {
//   const [formData, setFormData] = useState({
//     name: "",
//     age: "",
//     email:"",
//     gender: "",
//     experience: "",
//     specialization: "",
//     contact: ""
//   });



//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

 

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await axios.post("http://localhost:5000/api/register", formData);
//       alert("Registration request sent!");
//     } catch (e) {
//       alert("Error submitting request",e.message);
//       console.log(e);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
//       <div className="w-full max-w-3xl bg-white shadow-md rounded-lg p-8">
//         {/* Heading */}
//         <h2 className="text-4xl font-bold text-gray-900 text-center mb-6">
//           Register as Therapist
//         </h2>

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Name
//             </label>
//             <input
//               type="text"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Age
//             </label>
//             <input
//               type="number"
//               name="age"
//               value={formData.age}
//               onChange={handleChange}
//               className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Email
//             </label>
//             <input
//               type="text"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Gender
//             </label>
//             <select
//               name="gender"
//               value={formData.gender}
//               onChange={handleChange}
//               className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
//               required
//             >
//               <option value="">Select</option>
//               <option value="Male">Male</option>
//               <option value="Female">Female</option>
//               <option value="Other">Other</option>
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Experience (in years)
//             </label>
//             <input
//               type="number"
//               name="experience"
//               value={formData.experience}
//               onChange={handleChange}
//               className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Specialization
//             </label>
//             <input
//               type="text"
//               name="specialization"
//               value={formData.specialization}
//               onChange={handleChange}
//               className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Contact No.
//             </label>
//             <input
//               type="tel"
//               name="contact"
//               value={formData.contact}
//               onChange={handleChange}
//               className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
//               required
//             />
//           </div>

//           {/* Submit Button */}
//           <button
//             type="submit"
//             className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition"
//           >
//             Register as Therapist
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default TherapistSignup;
import React, { useState } from "react";
import axios from "axios";

function TherapistSignup() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    email: "",
    gender: "",
    experience: "",
    specialization: "",
    contact: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");
    
    try {
      await axios.post("http://localhost:5000/api/register", formData);
      setSuccessMessage("Registration request sent successfully!");
      setFormData({
        name: "",
        age: "",
        email: "",
        gender: "",
        experience: "",
        specialization: "",
        contact: ""
      });
    } catch (e) {
      setErrorMessage(e.response.data.msg);
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dyslexia-friendly styles
  const dyslexicStyles = {
    fontFamily: "'Comic Sans MS', 'OpenDyslexic', sans-serif",
    letterSpacing: "0.05em",
    lineHeight: "1.6",
    color: "#333",
    textDecoration: "none"
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-blue-50 p-4"
      style={dyslexicStyles}
    >
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-xl overflow-hidden">
        {/* Colorful header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
          <h2 className="text-3xl font-bold text-white text-center">
            Become a Therapist
          </h2>
          <p className="text-white text-center mt-2 text-lg">
            Help children learn in ways that work for them
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Success/Error messages */}
          {successMessage && (
            <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded">
              <p className="text-green-700 font-medium">✅ {successMessage}</p>
            </div>
          )}
          {errorMessage && (
            <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded">
              <p className="text-red-700 font-medium">⚠️ {errorMessage}</p>
            </div>
          )}

          {/* Form fields with icons and better spacing */}
          <div className="space-y-1">
            <label className="block text-lg font-medium text-blue-800 flex items-center">
              <span className="mr-2">👤</span> Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              style={dyslexicStyles}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="block text-lg font-medium text-blue-800 flex items-center">
                <span className="mr-2">🎂</span> Age
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full p-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                style={dyslexicStyles}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-lg font-medium text-blue-800 flex items-center">
                <span className="mr-2">📧</span> Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                style={dyslexicStyles}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-lg font-medium text-blue-800 flex items-center">
              <span className="mr-2">👫</span> Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full p-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              style={dyslexicStyles}
              required
            >
              <option value="">Select your gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="block text-lg font-medium text-blue-800 flex items-center">
                <span className="mr-2">⏳</span> Experience (years)
              </label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className="w-full p-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                style={dyslexicStyles}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-lg font-medium text-blue-800 flex items-center">
                <span className="mr-2">🎯</span> Specialization
              </label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                className="w-full p-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                style={dyslexicStyles}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-lg font-medium text-blue-800 flex items-center">
              <span className="mr-2">📱</span> Contact Number
            </label>
            <input
              type="tel"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              className="w-full p-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              style={dyslexicStyles}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 px-6 rounded-xl text-white font-bold text-lg mt-6 transition-all ${isSubmitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              "Register as Therapist"
            )}
          </button>
        </form>

        {/* Additional help section */}
        <div className="bg-blue-100 p-4 text-center">
          <p className="text-blue-800">
            Need help? Contact us at <span className="font-bold">help@dyslexiaapp.com</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default TherapistSignup;