import React from "react";
import PropTypes from "prop-types";
import Button from "./Button";
import { CiWarning } from "react-icons/ci";
import FloatingLabelTextarea from "./FloatingLabelTextarea";

const ConfirmModal = ({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
	confirmText = "Confirm",
	cancelText = "Cancel",
	showTextarea = false,
	textareaLabel = "Comments",
	textareaValue = "",
	onTextareaChange,
	loading = false,
	confirmColor = "red",
	textareaId = "confirm-textarea",
	textareaName = "confirm-textarea",
	textareaRows = 3,
}) => {
	if (!isOpen) return null;

	const confirmBtnColor =
		confirmColor === "green" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700";

	return (
		<div className="fixed inset-0 z-9999 flex items-center justify-center overflow-y-auto">
			<div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} />

			<div className="relative z-10000 w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl">
				<div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
					<div className="sm:flex sm:items-start gap-4">
						<div className="flex items-center justify-center rounded-full bg-red-100">
							<CiWarning className="text-red-600 m-1" size={24} />
						</div>

						<div className="mt-3 text-center sm:text-left w-full">
							<h3 className="text-lg font-medium text-gray-900">{title}</h3>

							<p className="mt-2 text-sm text-gray-500">{message}</p>

							{showTextarea && (
								<div className="mt-5">
									<FloatingLabelTextarea
										id={textareaId}
										name={textareaName}
										value={textareaValue}
										onChange={onTextareaChange}
										label={textareaLabel}
										rows={textareaRows}
									/>
								</div>
							)}
						</div>
					</div>
				</div>

				<div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse gap-2">
					<Button
						onClick={onConfirm}
						disabled={loading}
						title={loading ? "Processing..." : confirmText}
						className={`${confirmBtnColor} text-white disabled:opacity-50`}
					/>

					<Button
						onClick={onClose}
						disabled={loading}
						title={cancelText}
						className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
					/>
				</div>
			</div>
		</div>
	);
};

ConfirmModal.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	onConfirm: PropTypes.func.isRequired,
	title: PropTypes.string.isRequired,
	message: PropTypes.string.isRequired,
	confirmText: PropTypes.string,
	cancelText: PropTypes.string,
	showTextarea: PropTypes.bool,
	textareaLabel: PropTypes.string,
	textareaValue: PropTypes.string,
	onTextareaChange: PropTypes.func,
	loading: PropTypes.bool,
	confirmColor: PropTypes.oneOf(["red", "green"]),
	textareaId: PropTypes.string,
	textareaName: PropTypes.string,
	textareaRows: PropTypes.number,
};

export default ConfirmModal;
