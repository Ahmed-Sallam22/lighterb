import React from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { IoDocumentTextOutline } from "react-icons/io5";
import Button from "./shared/Button";

function AttachmentsSection({ t, attachments, onUpload, onRemove }) {
	return (
		<div className="mt-8 space-y-4">
			{/* Header */}
			<div className="flex justify-between items-center">
				<h3 className="text-lg font-medium text-[#28819C]">
					{t("requisitions.newRequisition.attachments")} ({attachments.length})
				</h3>

				<label className="flex items-center gap-2 px-4 py-2 bg-[#28819C] text-white rounded-lg hover:bg-[#206b82] transition-colors text-sm font-medium cursor-pointer">
					<FiPlus size={18} />
					{t("requisitions.newRequisition.addFile")}
					<input type="file" multiple onChange={onUpload} className="hidden" />
				</label>
			</div>

			{/* Body */}
			<div className="bg-[#F9FAFB] border border-gray-200 rounded-lg p-8 min-h-[200px] flex flex-col items-center justify-center">
				{attachments.length === 0 ? (
					<>
						<IoDocumentTextOutline className="text-gray-400 mb-4" size={48} />
						<p className="text-gray-700 font-medium mb-1">
							{t("requisitions.newRequisition.noFilesAttached")}
						</p>
						<p className="text-gray-500 text-sm">{t("requisitions.newRequisition.filesLinkedOnSave")}</p>
					</>
				) : (
					<div className="w-full space-y-2">
						{attachments.map((file, index) => (
							<div
								key={index}
								className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200"
							>
								<div className="flex items-center gap-3">
									<IoDocumentTextOutline className="text-[#28819C]" size={24} />
									<span className="text-sm text-gray-700">{file.name}</span>
								</div>

								<Button
									onClick={() => onRemove(index)}
									className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-300"
									icon={<FiTrash2 size={18} />}
								/>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

export default AttachmentsSection;
