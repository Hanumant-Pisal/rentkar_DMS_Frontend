import React, { useState, useEffect } from "react";
import API from "../../utils/api";
import { setToken, setUser, getToken } from "../../utils/auth";
import { useRouter } from "next/router";
const LoginForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const token = getToken();
    if (token) {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      if (user) {
        const redirectPath = user.role === "admin" ? "/admin/dashboard" : "/partner/dashboard";
        router.push(redirectPath);
      }
    }
  }, [router]);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const response = await API.post("/auth/login", { 
        email: email.trim(),
        password: password.trim()
      });
      const { token, user } = response.data;
      if (!token || !user) {
        throw new Error("Invalid response from server");
      }
      setToken(token);
      setUser(user);
      sessionStorage.removeItem('preventLoginRedirect');
      const redirectPath = user.role === "admin" ? "/admin/dashboard" : "/partner/dashboard";
      window.location.href = redirectPath;
    } catch (err: any) {
      const errorMessage = err.message || "Login failed. Please check your credentials and try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-500/10 text-red-300 text-sm rounded-lg mb-4">
          {error}
        </div>
      )}
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
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          placeholder="hanumant@gmail.com"
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="block text-sm font-medium text-gray-300">
            Password
          </label>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          placeholder="password"
        />
      </div>
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:-translate-y-0.5 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </div>
    </form>
  );
};
export default LoginForm;
