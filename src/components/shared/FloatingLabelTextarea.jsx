import React from 'react';

const FloatingLabelTextarea = ({ id, name, value, onChange, label, rows = 5, className = '' }) => {
	return (
		<div className="relative w-full">
			<textarea
				id={id}
				name={name}
				value={value}
				onChange={onChange}
				placeholder=" "
				rows={rows}
				className={`peer w-full px-4 py-3 border border-gray-300 rounded-lg 
          focus:outline-none focus:ring-2 focus:ring-[#28819C] 
          focus:border-transparent transition-all resize-none bg-white ${className}`}
			/>
			<label
				htmlFor={id}
				className="absolute left-3 -top-2.5 px-1 bg-white text-sm text-gray-600 transition-all 
          peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 
          peer-placeholder-shown:top-3 
          peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[#28819C]"
			>
				{label}
			</label>
		</div>
	);
};

export default FloatingLabelTextarea;
