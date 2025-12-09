import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";

const SlideUpModal = ({
	isOpen,
	onClose,
	title,
	children,
	className = "",
	maxWidth = "720px",
	childrenClassName = "",
}) => {
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		const handleKeyDown = event => {
			if (event.key === "Escape") {
				onClose?.();
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [isOpen, onClose]);

	useEffect(() => {
		if (!isOpen || typeof document === "undefined") {
			return;
		}

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		return () => {
			document.body.style.overflow = previousOverflow;
		};
	}, [isOpen]);

	if (!isMounted || !isOpen || typeof document === "undefined") {
		return null;
	}

	const modalContent = (
		<div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center">
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
				onClick={onClose}
				aria-hidden="true"
			/>

			<div
				className={`
          relative w-full  bg-[#F2F4F5] rounded-t-3xl sm:rounded-2xl shadow-2xl
          transform transition-all duration-300 animate-fadeInUp
          max-h-screen overflow-hidden ${className}
        `}
				style={{ maxWidth }}
				role="dialog"
				aria-modal="true"
				aria-label={title}
				onClick={event => event.stopPropagation()}
			>
				<div
					className="flex items-center px-12 py-4
					justify-between border-b border-gray-200
				relative"
				>
					<button
						type="button"
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600 transition-colors p-2"
						aria-label="Close modal"
					>
						<svg width="28" height="28" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
							<rect opacity="0.3" x="0.5" y="0.5" width="29" height="29" rx="7.68099" stroke="#28819C" />
							<path d="M9.08203 8.85938L20.9185 21.1399" stroke="#28819C" />
							<path d="M20.9199 8.85938L9.08347 21.1399" stroke="#28819C" />
						</svg>
					</button>
					<div className="flex-1 flex justify-center">
						<h2 className="text-xl font-bold text-[#0d5f7a] text-center">{title}</h2>
					</div>
				</div>

				<div className={`px-6 py-3 overflow-y-auto max-h-[calc(99vh-4.5rem)] ${childrenClassName}`}>
					{children}
				</div>
			</div>
		</div>
	);

	return createPortal(modalContent, document.body);
};

SlideUpModal.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	title: PropTypes.string.isRequired,
	children: PropTypes.node,
	className: PropTypes.string,
	maxWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default SlideUpModal;
