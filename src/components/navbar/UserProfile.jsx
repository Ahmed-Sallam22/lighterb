import React from "react";
import { IoPersonCircleOutline } from "react-icons/io5";

const UserProfile = ({ userName = "John Doe", userRole = "Administrator" }) => {
	return (
		<div className="flex items-center gap-3">
			<IoPersonCircleOutline className="text-white w-7 h-7" />
			<div className="text-white">
				<div className="font-medium text-sm">{userName}</div>
				<div className="text-xs text-gray-300">{userRole}</div>
			</div>
		</div>
	);
};

export default UserProfile;
