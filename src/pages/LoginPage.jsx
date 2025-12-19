import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthLayout from '../components/auth/AuthLayout';
import AuthInput from '../components/auth/AuthInput';
import AuthButton from '../components/auth/AuthButton';
// import SocialLogin from '../components/auth/SocialLogin';
import AuthLogo from '../components/auth/AuthLogo';
import { loginUser, clearError } from '../store/authSlice';

const LoginPage = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch = useDispatch();
	const { loading, error } = useSelector((state) => state.auth);

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [rememberMe, setRememberMe] = useState(false);

	// Get the return URL from location state or default to home
	const from = location.state?.from?.pathname || '/';

	// Redirect is now handled in handleSubmit after successful login
	// Removed automatic redirect on isAuthenticated change to prevent immediate navigation

	// Show error toast
	useEffect(() => {
		if (error) {
			toast.error(error);
			dispatch(clearError());
		}
	}, [error, dispatch]);

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!email.trim() || !password) {
			toast.error(t('auth.login.fillAllFields'));
			return;
		}

		try {
			await dispatch(loginUser({ email, password, rememberMe })).unwrap();
			toast.success(t('auth.login.success'));
							navigate(from, { replace: true });

	
		} catch {
			// Error is handled by the useEffect
		}
	};

	return (
		<AuthLayout
		>
			<ToastContainer position="top-right" autoClose={3000} />
			<AuthLogo title={t('auth.login.title')} subtitle={t('auth.login.subtitle')} />

			{/* Login Form */}
			<form onSubmit={handleSubmit} className="space-y-5">
				<AuthInput
					id="email"
					label={t('auth.login.email')}
					type="email"
					value={email}
					onChange={e => setEmail(e.target.value)}
					placeholder={t('auth.login.emailPlaceholder')}
					autoComplete="email"
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

				<AuthButton type="submit" disabled={loading}>
					{loading ? t('auth.login.signingIn') : t('auth.login.signIn')}
				</AuthButton>
			</form>

			{/* <SocialLogin /> */}
		</AuthLayout>
	);
};

export default LoginPage;
