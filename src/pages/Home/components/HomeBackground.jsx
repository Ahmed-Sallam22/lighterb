import React from "react";
import Group1 from "../../../ui/icons/Group1";
import Group2 from "../../../ui/icons/Group2";
import Group3 from "../../../ui/icons/Group3";
import Group4 from "../../../ui/icons/Group4";
import Group5 from "../../../ui/icons/Group5";
import Group6 from "../../../ui/icons/Group6";

const HomeBackground = () => {
	return (
		<>
			<div
				className="absolute inset-0"
				style={{
					backgroundImage:
						"linear-gradient(135deg, rgba(3,17,32,0.98) 0%, rgba(8,61,92,0.95) 45%, rgba(13,97,122,0.9) 100%)",
				}}
				aria-hidden="true"
			/>
			<div
				className="absolute inset-0 opacity-40"
				style={{
					backgroundImage:
						"radial-gradient(circle at 20% 20%, rgba(40,129,156,0.45), transparent 45%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.18), transparent 35%), radial-gradient(circle at 10% 90%, rgba(40,129,156,0.35), transparent 40%)",
				}}
				aria-hidden="true"
			/>
			<Group1 />
			<Group2 />
			<Group3 />
			<Group4 />
			<Group5 />
			<Group6 />
		</>
	);
};

export default HomeBackground;
