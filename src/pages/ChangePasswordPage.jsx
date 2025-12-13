import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthLayout from '../components/auth/AuthLayout';
import AuthInput from '../components/auth/AuthInput';
import AuthButton from '../components/auth/AuthButton';
import AuthLogo from '../components/auth/AuthLogo';
import { changePassword, clearError } from '../store/authSlice';

const ChangePasswordPage = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

	const [formData, setFormData] = useState({
		old_password: '',
		new_password: '',
		confirm_password: '',
	});
	const [errors, setErrors] = useState({});

	// Redirect if not authenticated
	useEffect(() => {
		if (!isAuthenticated) {
			navigate('/auth/login');
		}
	}, [isAuthenticated, navigate]);

	// Show error toast
	useEffect(() => {
		if (error) {
			toast.error(error);
			dispatch(clearError());
		}
	}, [error, dispatch]);

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
				[id]: '',
			}));
		}
	};

	const validateForm = () => {
		const newErrors = {};

		if (!formData.old_password) {
			newErrors.old_password = t('auth.changePassword.oldPasswordRequired');
		}

		if (!formData.new_password) {
			newErrors.new_password = t('auth.changePassword.newPasswordRequired');
		} else if (formData.new_password.length < 8) {
			newErrors.new_password = t('auth.changePassword.passwordMinLength');
		}

		if (!formData.confirm_password) {
			newErrors.confirm_password = t('auth.changePassword.confirmPasswordRequired');
		} else if (formData.new_password !== formData.confirm_password) {
			newErrors.confirm_password = t('auth.changePassword.passwordsDoNotMatch');
		}

		if (formData.old_password && formData.new_password && formData.old_password === formData.new_password) {
			newErrors.new_password = t('auth.changePassword.passwordsSame');
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
			await dispatch(changePassword(formData)).unwrap();
			toast.success(t('auth.changePassword.success'));
			
			// Clear form
			setFormData({
				old_password: '',
				new_password: '',
				confirm_password: '',
			});

			// Redirect to home after showing success toast (1.5 seconds)
			setTimeout(() => {
				navigate('/');
			}, 1500);
		} catch {
			// Error is handled by the useEffect
		}
	};

	const handleCancel = () => {
		navigate(-1); // Go back to previous page
	};

	return (
		<AuthLayout
			footerText={t('auth.changePassword.backTo')}
			footerLinkText={t('auth.changePassword.dashboard')}
			footerLinkTo="/"
		>
			<ToastContainer position="top-right" autoClose={3000} />
			<AuthLogo title={t('auth.changePassword.title')} subtitle={t('auth.changePassword.subtitle')} />

			{/* Change Password Form */}
			<form onSubmit={handleSubmit} className="space-y-5">
				<AuthInput
					id="old_password"
					label={t('auth.changePassword.oldPassword')}
					type="password"
					value={formData.old_password}
					onChange={handleChange}
					placeholder={t('auth.changePassword.oldPasswordPlaceholder')}
					autoComplete="current-password"
					error={errors.old_password}
					required
					showPasswordToggle
				/>

				<AuthInput
					id="new_password"
					label={t('auth.changePassword.newPassword')}
					type="password"
					value={formData.new_password}
					onChange={handleChange}
					placeholder={t('auth.changePassword.newPasswordPlaceholder')}
					autoComplete="new-password"
					error={errors.new_password}
					required
					showPasswordToggle
				/>

				<AuthInput
					id="confirm_password"
					label={t('auth.changePassword.confirmPassword')}
					type="password"
					value={formData.confirm_password}
					onChange={handleChange}
					placeholder={t('auth.changePassword.confirmPasswordPlaceholder')}
					autoComplete="new-password"
					error={errors.confirm_password}
					required
					showPasswordToggle
				/>

				<div className="flex gap-3 pt-1">
					<button
						type="button"
						onClick={handleCancel}
						className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
					>
						{t('auth.changePassword.cancel')}
					</button>
					<AuthButton type="submit" disabled={loading} className="flex-1">
						{loading ? t('auth.changePassword.changing') : t('auth.changePassword.changePassword')}
					</AuthButton>
				</div>
			</form>
		</AuthLayout>
	);
};

export default ChangePasswordPage;
