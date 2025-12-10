import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../components/auth/AuthLayout';
import AuthInput from '../components/auth/AuthInput';
import AuthButton from '../components/auth/AuthButton';
import AuthLogo from '../components/auth/AuthLogo';

const ResetPasswordPage = () => {
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const token = searchParams.get('token'); // Get reset token from URL

	const [formData, setFormData] = useState({
		newPassword: '',
		confirmPassword: '',
	});
	const [errors, setErrors] = useState({});

	const handleChange = e => {
		const { id, value } = e.target;
		setFormData(prev => ({
			...prev,
			[id]: value,
		}));
		// Clear error when user starts typing
		if (errors[id]) {
			setErrors(prev => ({
				...prev,
				[id]: '',
			}));
		}
	};

	const handleSubmit = e => {
		e.preventDefault();

		// Validation
		const newErrors = {};
		if (formData.newPassword.length < 8) {
			newErrors.newPassword = t('auth.resetPassword.passwordMinLength');
		}
		if (formData.newPassword !== formData.confirmPassword) {
			newErrors.confirmPassword = t('auth.resetPassword.passwordsDoNotMatch');
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		// Add your password reset logic here
		// After successful reset, redirect to login
		alert(t('auth.resetPassword.resetSuccess'));
		navigate('/auth/login');
	};

	return (
		<AuthLayout
			footerText={t('auth.resetPassword.haveAccount')}
			footerLinkText={t('auth.resetPassword.signIn')}
			footerLinkTo="/auth/login"
		>
			<AuthLogo title={t('auth.resetPassword.title')} subtitle={t('auth.resetPassword.subtitle')} />

			{/* Reset Password Form */}
			<form onSubmit={handleSubmit} className="space-y-5">
				<AuthInput
					id="newPassword"
					label={t('auth.resetPassword.newPassword')}
					type="password"
					value={formData.newPassword}
					onChange={handleChange}
					placeholder={t('auth.resetPassword.newPasswordPlaceholder')}
					autoComplete="new-password"
					error={errors.newPassword}
					required
					showPasswordToggle
				/>

				<AuthInput
					id="confirmPassword"
					label={t('auth.resetPassword.confirmPassword')}
					type="password"
					value={formData.confirmPassword}
					onChange={handleChange}
					placeholder={t('auth.resetPassword.confirmPasswordPlaceholder')}
					autoComplete="new-password"
					error={errors.confirmPassword}
					required
					showPasswordToggle
				/>

				<div className="pt-1">
					<AuthButton type="submit">{t('auth.resetPassword.confirm')}</AuthButton>
				</div>
			</form>
		</AuthLayout>
	);
};

export default ResetPasswordPage;
