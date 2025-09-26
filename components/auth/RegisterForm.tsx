import React, { useState } from "react";
import API from "../../utils/api";
import { useRouter } from "next/router";
const RegisterForm = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("partner");
  const [error, setError] = useState("");
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await API.post("/auth/register", { name, email, password, role });
      router.push("/auth/login");
    } catch (err: unknown) {
      const errorMessage = err && 
                         typeof err === 'object' && 
                         'response' in err &&
                         typeof err.response === 'object' &&
                         err.response !== null &&
                         'data' in err.response &&
                         typeof (err.response.data as { error?: string }).error === 'string'
        ? (err.response.data as { error: string }).error
        : "Registration failed";
      setError(errorMessage);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-500/10 text-red-300 text-sm rounded-lg mb-4">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-300">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Hanumant Pisal"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="role" className="block text-sm font-medium text-gray-300">
            Role
          </label>
          <select
            id="role"
            name="role"
            required
            value={role}
            onChange={e => setRole(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none"
          >
            <option value="partner">Delivery Partner</option>
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-gray-300">
          Email 
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          placeholder="hanumant@gmail.com"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-gray-300">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          placeholder="password"
        />
        <p className="mt-1 text-xs text-gray-500">
          Use 8 or more characters with a mix of letters, numbers & symbols
        </p>
      </div>
      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:-translate-y-0.5"
        >
          Sign Up
        </button>
      </div>
    </form>
  );
};
export default RegisterForm;
