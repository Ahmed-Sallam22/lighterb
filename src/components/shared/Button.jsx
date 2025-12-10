import { twMerge } from 'tailwind-merge';

function Button({ onClick, children, className, title, icon, ...props }) {
	return (
		<button
			onClick={onClick}
			className={twMerge(
				'flex items-center gap-2 px-4 py-2 bg-[#28819C] text-white rounded-[10px] font-medium transition-colors shadow-md hover:shadow-lg',
				className
			)}
			{...props}
		>
			{icon && <span className="flex items-center">{icon}</span>}
			{title}
			{children}
		</button>
	);
}
export default Button;
