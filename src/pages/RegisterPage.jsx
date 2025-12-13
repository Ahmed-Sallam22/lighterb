import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthLayout from '../components/auth/AuthLayout';
import AuthInput from '../components/auth/AuthInput';
import AuthButton from '../components/auth/AuthButton';
// import SocialLogin from '../components/auth/SocialLogin';
import AuthLogo from '../components/auth/AuthLogo';
import { registerUser, clearError } from '../store/authSlice';

const RegisterPage = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { loading, error } = useSelector((state) => state.auth);

	const [formData, setFormData] = useState({
		name: '',
		email: '',
		phone_number: '',
		password: '',
		confirm_password: '',
	});
	const [errors, setErrors] = useState({});

	// Redirect is now handled in handleSubmit after successful registration
	// Removed automatic redirect on isAuthenticated change to prevent immediate navigation

	// Show error toast
	useEffect(() => {
		if (error) {
			toast.error(error);
			dispatch(clearError());
		}
	}, [error, dispatch]);

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

	const validateForm = () => {
		const newErrors = {};

		if (!formData.name.trim()) {
			newErrors.name = t('auth.register.nameRequired');
		}

		if (!formData.email.trim()) {
			newErrors.email = t('auth.register.emailRequired');
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			newErrors.email = t('auth.register.emailInvalid');
		}

		if (!formData.phone_number.trim()) {
			newErrors.phone_number = t('auth.register.phoneRequired');
		}

		if (!formData.password) {
			newErrors.password = t('auth.register.passwordRequired');
		} else if (formData.password.length < 8) {
			newErrors.password = t('auth.register.passwordMinLength');
		}

		if (!formData.confirm_password) {
			newErrors.confirm_password = t('auth.register.confirmPasswordRequired');
		} else if (formData.password !== formData.confirm_password) {
			newErrors.confirm_password = t('auth.register.passwordsDoNotMatch');
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		try {
			await dispatch(registerUser(formData)).unwrap();
			toast.success(t('auth.register.success'));
			navigate('/');
		
		} catch {
			// Error is handled by the useEffect
		}
	};

	return (
		<AuthLayout
			footerText={t('auth.register.haveAccount')}
			footerLinkText={t('auth.register.signIn')}
			footerLinkTo="/auth/login"
		>
			<ToastContainer position="top-right" autoClose={3000} />
			<AuthLogo title={t('auth.register.title')} subtitle={t('auth.register.subtitle')} />

			{/* Register Form */}
			<form onSubmit={handleSubmit} className="space-y-5">
				<AuthInput
					id="name"
					label={t('auth.register.name')}
					type="text"
					value={formData.name}
					onChange={handleChange}
					placeholder={t('auth.register.namePlaceholder')}
					autoComplete="name"
					error={errors.name}
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
					error={errors.email}
					required
				/>

				<AuthInput
					id="phone_number"
					label={t('auth.register.phone')}
					type="tel"
					value={formData.phone_number}
					onChange={handleChange}
					placeholder={t('auth.register.phonePlaceholder')}
					autoComplete="tel"
					error={errors.phone_number}
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

				<AuthInput
					id="confirm_password"
					label={t('auth.register.confirmPassword')}
					type="password"
					value={formData.confirm_password}
					onChange={handleChange}
					placeholder={t('auth.register.confirmPasswordPlaceholder')}
					autoComplete="new-password"
					error={errors.confirm_password}
					required
					showPasswordToggle
				/>

				<div className="pt-1">
					<AuthButton type="submit" disabled={loading}>
						{loading ? t('auth.register.registering') : t('auth.register.createAccount')}
					</AuthButton>
				</div>
			</form>

			{/* <SocialLogin /> */}
		</AuthLayout>
	);
};

export default RegisterPage;
