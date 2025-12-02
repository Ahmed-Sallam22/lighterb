import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import AuthInput from "../components/auth/AuthInput";
import AuthButton from "../components/auth/AuthButton";
import AuthLogo from "../components/auth/AuthLogo";

const ForgetPasswordPage = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your password reset logic here
    console.log("Password reset request for:", email);
    // After sending email, simulate navigation to reset password page
    // In real app, user would click link in email to navigate to /auth/reset-password?token=xyz
    // For demo, you can navigate directly:
    navigate("/auth/reset-password?token=demo-token");
  };

  return (
    <AuthLayout footerText="Already have an account?" footerLinkText="Sign in" footerLinkTo="/auth/login">
      <AuthLogo title="Forgot Password ?" subtitle="No worries, we'll send you reset instructions." />

      {/* Forgot Password Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthInput
          id="email"
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your Email Address"
          autoComplete="email"
          required
        />

        <div className="pt-1">
          <AuthButton type="submit">Send Reset Link</AuthButton>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ForgetPasswordPage;
