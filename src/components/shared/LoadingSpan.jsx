import React from "react";

function LoadingSpan({ text }) {
	return (
		<div className="flex justify-center items-center py-12">
			<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#28819C]"></div>
			{text && <span className="ml-4 text-[#28819C] font-medium">{text}</span>}
		</div>
	);
}

export default LoadingSpan;
