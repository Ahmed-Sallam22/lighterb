import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../components/auth/AuthLayout';
import AuthInput from '../components/auth/AuthInput';
import AuthButton from '../components/auth/AuthButton';
import SocialLogin from '../components/auth/SocialLogin';
import AuthLogo from '../components/auth/AuthLogo';

const RegisterPage = () => {
	const { t } = useTranslation();
	const [formData, setFormData] = useState({
		username: '',
		email: '',
		password: '',
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

		// Add your registration logic here
		// navigate('/login') or navigate('/') after successful registration
	};

	return (
		<AuthLayout
			footerText={t('auth.register.haveAccount')}
			footerLinkText={t('auth.register.signIn')}
			footerLinkTo="/auth/login"
		>
			<AuthLogo title={t('auth.register.title')} subtitle={t('auth.register.subtitle')} />

			{/* Register Form */}
			<form onSubmit={handleSubmit} className="space-y-5">
				<AuthInput
					id="username"
					label={t('auth.register.username')}
					type="text"
					value={formData.username}
					onChange={handleChange}
					placeholder={t('auth.register.usernamePlaceholder')}
					autoComplete="username"
					required
				/>

				<AuthInput
					id="email"
					label={t('auth.register.email')}
					type="email"
					value={formData.email}
					onChange={handleChange}
					placeholder={t('auth.register.emailPlaceholder')}
					autoComplete="email"
					required
				/>

				<AuthInput
					id="password"
					label={t('auth.register.password')}
					type="password"
					value={formData.password}
					onChange={handleChange}
					placeholder={t('auth.register.passwordPlaceholder')}
					autoComplete="new-password"
					error={errors.password}
					required
					showPasswordToggle
				/>

				<div className="pt-1">
					<AuthButton type="submit">{t('auth.register.createAccount')}</AuthButton>
				</div>
			</form>

			<SocialLogin />
		</AuthLayout>
	);
};

export default RegisterPage;
