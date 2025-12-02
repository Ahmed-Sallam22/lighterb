import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import AuthInput from "../components/auth/AuthInput";
import AuthButton from "../components/auth/AuthButton";
import SocialLogin from "../components/auth/SocialLogin";
import AuthLogo from "../components/auth/AuthLogo";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
    // Clear error when user starts typing
    if (errors[id]) {
      setErrors((prev) => ({
        ...prev,
        [id]: "",
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Add your registration logic here
    console.log("Registration attempt:", formData);
    // navigate('/login') or navigate('/') after successful registration
  };

  return (
    <AuthLayout footerText="Already have an account?" footerLinkText="Sign in" footerLinkTo="/auth/login">
      <AuthLogo title="Create Account" subtitle="Start by entering your details to set up your new account." />

      {/* Register Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthInput
          id="username"
          label="Username"
          type="text"
          value={formData.username}
          onChange={handleChange}
          placeholder="Enter Username"
          autoComplete="username"
          required
        />

        <AuthInput
          id="email"
          label="Email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter Email"
          autoComplete="email"
          required
        />

        <AuthInput
          id="password"
          label="Password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter Password"
          autoComplete="new-password"
          error={errors.password}
          required
          showPasswordToggle
        />

        <div className="pt-1">
          <AuthButton type="submit">Create Account</AuthButton>
        </div>
      </form>

      <SocialLogin />
    </AuthLayout>
  );
};

export default RegisterPage;
