import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../components/auth/AuthLayout';
import AuthInput from '../components/auth/AuthInput';
import AuthButton from '../components/auth/AuthButton';
import AuthLogo from '../components/auth/AuthLogo';

const ForgetPasswordPage = () => {
	const { t } = useTranslation();
	const [email, setEmail] = useState('');
	const navigate = useNavigate();

	const handleSubmit = e => {
		e.preventDefault();
		// Add your password reset logic here
		// After sending email, simulate navigation to reset password page
		// In real app, user would click link in email to navigate to /auth/reset-password?token=xyz
		// For demo, you can navigate directly:
		navigate('/auth/reset-password?token=demo-token');
	};

	return (
		<AuthLayout
			footerText={t('auth.forgotPassword.haveAccount')}
			footerLinkText={t('auth.forgotPassword.signIn')}
			footerLinkTo="/auth/login"
		>
			<AuthLogo title={t('auth.forgotPassword.title')} subtitle={t('auth.forgotPassword.subtitle')} />

			{/* Forgot Password Form */}
			<form onSubmit={handleSubmit} className="space-y-5">
				<AuthInput
					id="email"
					label={t('auth.forgotPassword.email')}
					type="email"
					value={email}
					onChange={e => setEmail(e.target.value)}
					placeholder={t('auth.forgotPassword.emailPlaceholder')}
					autoComplete="email"
					required
				/>

				<div className="pt-1">
					<AuthButton type="submit">{t('auth.forgotPassword.sendResetLink')}</AuthButton>
				</div>
			</form>
		</AuthLayout>
	);
};

export default ForgetPasswordPage;
