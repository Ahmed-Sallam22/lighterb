import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../components/auth/AuthLayout';
import AuthInput from '../components/auth/AuthInput';
import AuthButton from '../components/auth/AuthButton';
import SocialLogin from '../components/auth/SocialLogin';
import AuthLogo from '../components/auth/AuthLogo';

const LoginPage = () => {
	const { t } = useTranslation();
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [rememberMe, setRememberMe] = useState(false);
	const navigate = useNavigate();

	const handleSubmit = e => {
		e.preventDefault();
		// Add your login logic here
		console.log('Login attempt:', { username, password, rememberMe });
		// navigate to home or dashboard after successful login
		// navigate('/');
	};

	return (
		<AuthLayout
			footerText={t('auth.login.noAccount')}
			footerLinkText={t('auth.login.createAccount')}
			footerLinkTo="/auth/register"
		>
			<AuthLogo title={t('auth.login.title')} subtitle={t('auth.login.subtitle')} />

			{/* Login Form */}
			<form onSubmit={handleSubmit} className="space-y-5">
				<AuthInput
					id="username"
					label={t('auth.login.username')}
					type="text"
					value={username}
					onChange={e => setUsername(e.target.value)}
					placeholder={t('auth.login.usernamePlaceholder')}
					autoComplete="username"
					required
				/>

				<AuthInput
					id="password"
					label={t('auth.login.password')}
					type="password"
					value={password}
					onChange={e => setPassword(e.target.value)}
					placeholder={t('auth.login.passwordPlaceholder')}
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
							onChange={e => setRememberMe(e.target.checked)}
							className="w-4 h-4 text-[#11576C] border-gray-300 rounded focus:ring-[#11576C] cursor-pointer"
						/>
						<span className="ml-2 text-gray-700">{t('auth.login.rememberMe')}</span>
					</label>
					<Link to="/auth/forgot-password" className="text-gray-700 hover:text-[#11576C] transition-colors">
						{t('auth.login.forgotPassword')}
					</Link>
				</div>

				<AuthButton type="submit">{t('auth.login.signIn')}</AuthButton>
			</form>

			<SocialLogin />
		</AuthLayout>
	);
};

export default LoginPage;
