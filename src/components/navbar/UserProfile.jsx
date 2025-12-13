import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { IoPersonCircleOutline, IoLogOutOutline, IoKeyOutline, IoChevronDown } from "react-icons/io5";
import { logoutUser } from "../../store/authSlice";

const UserProfile = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { user } = useSelector((state) => state.auth);
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef(null);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleLogout = async () => {
		setIsOpen(false);
		await dispatch(logoutUser());
		navigate("/auth/login");
	};

	const handleChangePassword = () => {
		setIsOpen(false);
		navigate("/change-password");
	};

	const userName = user?.name || "Guest User";
	const userRole = user?.user_type || "User";

	return (
		<div className="relative" ref={dropdownRef}>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="flex items-center gap-3 hover:bg-white/10 rounded-lg px-3 py-2 transition-colors"
			>
				<IoPersonCircleOutline className="text-white w-7 h-7" />
				<div className="text-white text-left">
					<div className="font-medium text-sm">{userName}</div>
					<div className="text-xs text-gray-300 capitalize">{userRole}</div>
				</div>
				<IoChevronDown
					className={`text-white w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
				/>
			</button>

			{/* Dropdown Menu */}
			{isOpen && (
				<div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
					{/* User Info Header */}
					<div className="px-4 py-3 border-b border-gray-200">
						<p className="text-sm font-medium text-gray-900">{userName}</p>
						<p className="text-xs text-gray-500">{user?.email || ""}</p>
					</div>

					{/* Menu Items */}
					<div className="py-1">
						<button
							onClick={handleChangePassword}
							className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
						>
							<IoKeyOutline className="w-5 h-5 text-gray-500" />
							<span>Change Password</span>
						</button>

						<button
							onClick={handleLogout}
							className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
						>
							<IoLogOutOutline className="w-5 h-5" />
							<span>Logout</span>
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default UserProfile;
