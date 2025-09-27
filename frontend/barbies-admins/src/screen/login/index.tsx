// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/context/auth-context";
// import Label from "@/components/ui/Label";

// export default function Login() {
//   const router = useRouter();
//   const { login, user } = useAuth();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);

//   type ApiError = {
//     response?: {
//       data?: unknown;
//     };
//     message: string;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null);
//     setLoading(true);

//     try {
//       await login(email, password);

//       setEmail("");
//       setPassword("");

//       if (user?.roles?.includes("admin")) {
//         router.push("/users");
//       } else {
//         router.push("/");
//       }
//     } catch (error: unknown) {
//       const err = error as ApiError;
//       setError("Invalid credentials or server error.");
//       console.error("Error logingin user:", err.response?.data || err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="bhs:h-screen bhs:flex bhs:justify-center bhs:items-center bhs:bg-gray-100">
//       <form
//         onSubmit={handleSubmit}
//         className=" bhs:p-6 bhs:bg-white bhs:shadow bhs:rounded-lg bhs:space-y-4 bhs:w-md  bhs:py-4"
//       >
//         <h2 className="bhs:text-xl bhs:font-semibold">Login</h2>

//         {error && <p className="bhs:text-red-500 bhs:text-sm">{error}</p>}

//         <div>
//           <Label className="bhs:block bhs:text-sm bhs:font-medium">Email</Label>
//           <input
//             type="email"
//             className="bhs:w-full bhs:p-2 bhs:border bhs:rounded"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//             placeholder="email@example.com"
//             name="email"
//           />
//         </div>

//         <div>
//           <label className="bhs:block bhs:text-sm bhs:font-medium">
//             Password
//           </label>
//           <input
//             type="password"
//             className="bhs:w-full bhs:p-2 bhs:border bhs:rounded"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//             placeholder="enter password"
//             name="password"
//           />
//         </div>

//         <button
//           type="submit"
//           disabled={loading}
//           className="bhs:w-full bhs:py-2 bhs:bg-pink-600 bhs:text-white bhs:rounded bhs:hover:bg-pink-700 bhs:disabled:opacity-50 bhs:cursor-pointer"
//         >
//           {loading ? "Logging in..." : "Login"}
//         </button>
//       </form>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import Label from "@/components/ui/Label";
import { Eye, EyeOff } from "lucide-react"; // 👈 icon pack

export default function Login() {
  const router = useRouter();
  const { login, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  type ApiError = {
    response?: {
      data?: unknown;
    };
    message: string;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // ✅ Extra validation
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);

    try {
      await login(email, password);

      setEmail("");
      setPassword("");

      if (user?.roles?.includes("admin")) {
        router.push("/users");
      } else {
        router.push("/");
      }
    } catch (error: unknown) {
      const err = error as ApiError;
      setError("Invalid credentials or server error.");
      console.error(
        "Error logging in user:",
        err.response?.data || err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bhs:h-screen bhs:flex bhs:justify-center bhs:items-center bhs:bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bhs:p-6 bhs:bg-white bhs:shadow bhs:rounded-lg bhs:space-y-4 bhs:w-md bhs:py-4"
      >
        <h2 className="bhs:text-xl bhs:font-semibold">Login</h2>

        {error && <p className="bhs:text-red-500 bhs:text-sm">{error}</p>}

        <div>
          <Label className="bhs:block bhs:text-sm bhs:font-medium">Email</Label>
          <input
            type="email"
            className="bhs:w-full bhs:p-2 bhs:border bhs:rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="email@example.com"
            name="email"
          />
        </div>

        <div>
          <Label className="bhs:block bhs:text-sm bhs:font-medium">
            Password
          </Label>
          <div className="bhs:relative">
            <input
              type={showPassword ? "text" : "password"}
              className="bhs:w-full bhs:p-2 bhs:border bhs:rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="enter password"
              name="password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="bhs:absolute bhs:inset-y-0 bhs:right-2 bhs:flex bhs:items-center bhs:text-gray-500 hover:bhs:text-gray-700"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bhs:w-full bhs:py-2 bhs:bg-pink-600 bhs:text-white bhs:rounded bhs:hover:bg-pink-700 bhs:disabled:opacity-50 bhs:cursor-pointer"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
