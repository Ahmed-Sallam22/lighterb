import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import AuthInput from "../components/auth/AuthInput";
import AuthButton from "../components/auth/AuthButton";
import SocialLogin from "../components/auth/SocialLogin";
import AuthLogo from "../components/auth/AuthLogo";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your login logic here
    console.log("Login attempt:", { username, password, rememberMe });
    // navigate to home or dashboard after successful login
    // navigate('/');
  };

  return (
    <AuthLayout
      footerText="You don't have an account?"
      footerLinkText="Create an account"
      footerLinkTo="/auth/register">
      <AuthLogo
        title="Power Your Operations"
        subtitle="Sign in to manage finances, track purchases, and streamline approvals."
      />

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthInput
          id="username"
          label="Username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your Username"
          autoComplete="username"
          required
        />

        <AuthInput
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your Password"
          autoComplete="current-password"
          required
          showPasswordToggle
        />

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between text-sm pt-1">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-[#11576C] border-gray-300 rounded focus:ring-[#11576C] cursor-pointer"
            />
            <span className="ml-2 text-gray-700">Remember me</span>
          </label>
          <Link to="/auth/forgot-password" className="text-gray-700 hover:text-[#11576C] transition-colors">
            Forgot Password ?
          </Link>
        </div>

        <AuthButton type="submit">Sign in</AuthButton>
      </form>

      <SocialLogin />
    </AuthLayout>
  );
};

export default LoginPage;
