import React from "react";
import PropTypes from "prop-types";
import Button from "./Button";
import { CiWarning } from "react-icons/ci";

const ConfirmModal = ({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
	confirmText = "Delete",
	cancelText = "Cancel",
}) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-9999 flex items-center justify-center overflow-y-auto">
			<div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

			{/* Modal panel - centered */}
			<div className="relative z-10000 w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl transform transition-all">
				<div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
					<div className="sm:flex sm:items-start gap-4">
						<div className="flex items-center justify-center rounded-full bg-red-100">
							<CiWarning className="text-red-600 m-1" size={24} />
						</div>
						<div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
							<h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
								{title}
							</h3>
							<div className="mt-2">
								<p className="text-sm text-gray-500">{message}</p>
							</div>
						</div>
					</div>
				</div>
				<div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
					<Button
						onClick={onConfirm}
						title={confirmText}
						className="bg-red-600 hover:bg-red-700 text-white"
					/>

					<Button
						onClick={onClose}
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
};

export default ConfirmModal;
