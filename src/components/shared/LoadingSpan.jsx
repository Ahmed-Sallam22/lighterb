import React from "react";

function LoadingSpan() {
	return (
		<div className="flex justify-center items-center py-12">
			<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#28819C]"></div>
		</div>
	);
}

export default LoadingSpan;
