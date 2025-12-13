import { Navigate, useLocation } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { checkAuth } from '../../store/authSlice';
import authService from '../../services/authService';

const AuthGuard = ({ children }) => {
	const dispatch = useDispatch();
	const location = useLocation();
	const { isAuthenticated } = useSelector((state) => state.auth);

	useEffect(() => {
		// Check auth state on mount
		dispatch(checkAuth());
	}, [dispatch]);

	// Check both Redux state and service
	const isLoggedIn = isAuthenticated || authService.isAuthenticated();

	if (!isLoggedIn) {
		// Redirect to login page with return URL
		return <Navigate to="/auth/login" state={{ from: location }} replace />;
	}

	return children;
};

export default AuthGuard;
