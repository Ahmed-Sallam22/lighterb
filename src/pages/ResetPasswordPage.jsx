import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import AuthInput from "../components/auth/AuthInput";
import AuthButton from "../components/auth/AuthButton";
import AuthLogo from "../components/auth/AuthLogo";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token"); // Get reset token from URL

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

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

    // Validation
    const newErrors = {};
    if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Add your password reset logic here
    console.log("Reset password with token:", token, formData);
    // After successful reset, redirect to login
    alert("Password reset successful! Redirecting to login...");
    navigate("/auth/login");
  };

  return (
    <AuthLayout footerText="Already have an account?" footerLinkText="Sign in" footerLinkTo="/auth/login">
      <AuthLogo title="Forgot Password ?" subtitle="No worries, we'll send you reset instructions." />

      {/* Reset Password Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthInput
          id="newPassword"
          label="Enter New Password"
          type="password"
          value={formData.newPassword}
          onChange={handleChange}
          placeholder="Enter New Password"
          autoComplete="new-password"
          error={errors.newPassword}
          required
          showPasswordToggle
        />

        <AuthInput
          id="confirmPassword"
          label="Confirm Password"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm Password"
          autoComplete="new-password"
          error={errors.confirmPassword}
          required
          showPasswordToggle
        />

        <div className="pt-1">
          <AuthButton type="submit">Confirm</AuthButton>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
