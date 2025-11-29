import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import PageHeader from '../components/shared/PageHeader';
import ConfirmModal from '../components/shared/ConfirmModal';
import { fetchApprovalSteps, approveStep, rejectStep } from '../store/approvalStepsSlice';

const HeaderIcon = () => (
  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/30 flex items-center justify-center shadow-lg">
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 2L4 6V18L12 22L20 18V6L12 2Z"
        stroke="#D3D3D3"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M8 12H16" stroke="#48C1F0" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 8V16" stroke="#48C1F0" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  </div>
);

const statusStyles = {
  PENDING: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  APPROVED: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  REJECTED: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-200',
  },
  IN_PROGRESS: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
};

const ProcurementApprovalDetail = () => {
  const navigate = useNavigate();
  const { instanceId } = useParams();

  const dispatch = useDispatch();
  
  const { steps, loading, error, actionLoading } = useSelector((state) => state.approvalSteps);
  
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedStep, setSelectedStep] = useState(null);
  const [comments, setComments] = useState('');
  const [reason, setReason] = useState('');

  // Fetch approval steps for this instance
  useEffect(() => {
    if (instanceId) {
      dispatch(fetchApprovalSteps({ approval_instance: instanceId }));
    }
  }, [dispatch, instanceId]);

  useEffect(() => {
    document.title = `Approval #${instanceId} - LightERP`;
    return () => {
      document.title = 'LightERP';
    };
  }, [instanceId]);

  const handleApprove = async () => {
    if (!selectedStep) return;

    try {
      await dispatch(approveStep({ id: selectedStep.id, comments })).unwrap();
      // Refresh data
      await dispatch(fetchApprovalSteps({ approval_instance: instanceId })).unwrap();
      setShowApproveModal(false);
      setComments('');
      setSelectedStep(null);
    } catch (err) {
      console.error('Error approving step:', err);
      alert(err.message || 'Failed to approve step');
    }
  };

  const handleReject = async () => {
    if (!selectedStep) return;

    try {
      await dispatch(rejectStep({ id: selectedStep.id, reason })).unwrap();
      // Refresh data
      await dispatch(fetchApprovalSteps({ approval_instance: instanceId })).unwrap();
      setShowRejectModal(false);
      setReason('');
      setSelectedStep(null);
    } catch (err) {
      console.error('Error rejecting step:', err);
      alert(err.message || 'Failed to reject step');
    }
  };

  const openApproveModal = (step) => {
    setSelectedStep(step);
    setComments('');
    setShowApproveModal(true);
  };

  const openRejectModal = (step) => {
    setSelectedStep(step);
    setReason('');
    setShowRejectModal(true);
  };

  // Filter steps for this instance
  const instanceSteps = steps.filter(step => step.approval_instance === parseInt(instanceId));

  // Get overall status
  let overallStatus = 'PENDING';
  if (instanceSteps.length > 0) {
    if (instanceSteps.some(s => s.status === 'REJECTED')) {
      overallStatus = 'REJECTED';
    } else if (instanceSteps.every(s => s.status === 'APPROVED')) {
      overallStatus = 'APPROVED';
    } else if (instanceSteps.some(s => s.status === 'IN_PROGRESS')) {
      overallStatus = 'IN_PROGRESS';
    }
  }

  const statusStyle = statusStyles[overallStatus] || statusStyles.PENDING;

  if (loading) {
    return (
      <section className="min-h-screen bg-[#f2f3f5] pb-12">
        <PageHeader icon={<HeaderIcon />} title={`Approval#${instanceId}`} subtitle="Workflow Management" />
        <div className="max-w-6xl mx-auto px-6 mt-6">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8 text-center">
            <p className="text-gray-600">Loading approval details...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="min-h-screen bg-[#f2f3f5] pb-12">
        <PageHeader icon={<HeaderIcon />} title="Error" subtitle="Workflow Management" />
        <div className="max-w-6xl mx-auto px-6 mt-6">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              type="button"
              onClick={() => navigate('/procurement/approvals')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#28819C] text-[#28819C] font-semibold hover:bg-[#e5f2f7] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 12L6 8L10 4" stroke="#28819C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to Approvals
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (instanceSteps.length === 0) {
    return (
      <section className="min-h-screen bg-[#f2f3f5] pb-12">
        <PageHeader icon={<HeaderIcon />} title={`Approval #${instanceId}`} subtitle="Workflow Management" />
        <div className="max-w-6xl mx-auto px-6 mt-6">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8 text-center">
            <p className="text-gray-600 mb-4">No approval steps found for this instance.</p>
            <button
              type="button"
              onClick={() => navigate('/procurement/approvals')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#28819C] text-[#28819C] font-semibold hover:bg-[#e5f2f7] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 12L6 8L10 4" stroke="#28819C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to Approvals
            </button>
          </div>
        </div>
      </section>
    );
  }

  const approvedCount = instanceSteps.filter(s => s.status === 'APPROVED').length;
  const totalSteps = instanceSteps.length;

  return (
    <section className="min-h-screen bg-[#f2f3f5] pb-12">
      <PageHeader 
        icon={<HeaderIcon />} 
        title={`Approval Instance ${instanceId}`} 
        subtitle="Workflow Details & Actions" 
      />

      <div className="max-w-6xl mx-auto px-6 mt-8 space-y-6">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-6 md:p-8">
          {/* Header with Back Button */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/procurement/approvals')}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[#28819C] text-[#28819C] font-semibold hover:bg-[#e5f2f7] transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 12L6 8L10 4" stroke="#28819C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Back to Approvals
              </button>
              <h2 className="text-2xl font-semibold text-[#1f4560]">
                Instance #{instanceId}
              </h2>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
            >
              {overallStatus}
            </span>
            <span className="text-sm text-gray-500">
              Progress: {approvedCount}/{totalSteps} steps approved
            </span>
          </div>

          {/* Approval Steps */}
          <div className="space-y-5">
            <div className="bg-[#f7f8fa] rounded-2xl border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-[#2b3a49] mb-4">Approval Steps</h3>
              <div className="space-y-3">
                {instanceSteps.map((step) => {
                  const stepStyle = statusStyles[step.status] || statusStyles.PENDING;
                  const workflowStep = step.workflow_step_details;
                  const isPending = step.status === 'PENDING';
                  
                  return (
                    <div
                      key={step.id}
                      className={`rounded-2xl border ${stepStyle.border} bg-white p-5 shadow-sm`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${stepStyle.bg} ${stepStyle.text}`}
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 18 18"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.4" />
                              <path d="M5 9.2L7.8 12L13 6.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-base font-semibold text-[#1f4560]">
                              Step {workflowStep?.sequence}: {workflowStep?.name || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {workflowStep?.description || 'No description'}
                            </p>
                            <div className="text-xs text-gray-500 mt-2 space-y-1">
                              <p>Approver Type: <span className="font-medium">{workflowStep?.approver_type || 'N/A'}</span></p>
                              {workflowStep?.role_name && (
                                <p>Role: <span className="font-medium">{workflowStep.role_name}</span></p>
                              )}
                              {step.activated_at && (
                                <p>Activated: <span className="font-medium">{new Date(step.activated_at).toLocaleString()}</span></p>
                              )}
                              {step.due_at && (
                                <p>Due: <span className="font-medium">{new Date(step.due_at).toLocaleString()}</span></p>
                              )}
                              {step.completed_at && (
                                <p>Completed: <span className="font-medium">{new Date(step.completed_at).toLocaleString()}</span></p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${stepStyle.bg} ${stepStyle.text} ${stepStyle.border}`}
                          >
                            {step.status}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons for Pending Steps */}
                      {isPending && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                          <button
                            type="button"
                            onClick={() => openApproveModal(step)}
                            disabled={actionLoading}
                            className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading ? 'Processing...' : 'Approve'}
                          </button>
                          <button
                            type="button"
                            onClick={() => openRejectModal(step)}
                            disabled={actionLoading}
                            className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading ? 'Processing...' : 'Reject'}
                          </button>
                        </div>
                      )}

                      {/* Actions History */}
                      {step.actions && step.actions.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h4 className="text-sm font-semibold text-[#2b3a49] mb-2">Actions History</h4>
                          <div className="space-y-2">
                            {step.actions.map((action) => (
                              <div key={action.id} className="text-xs bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-semibold text-[#1f4560]">
                                    {action.user_details?.username || `User #${action.user}`}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                    action.action === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                  }`}>
                                    {action.action}
                                  </span>
                                </div>
                                {action.comments && (
                                  <p className="text-gray-600 mt-1">Comments: {action.comments}</p>
                                )}
                                <p className="text-gray-500 mt-1">
                                  {new Date(action.created_at).toLocaleString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <ConfirmModal
          isOpen={showApproveModal}
          onClose={() => {
            setShowApproveModal(false);
            setComments('');
            setSelectedStep(null);
          }}
          onConfirm={handleApprove}
          title="Approve Step"
          message={
            <div>
              <p className="mb-4">
                Are you sure you want to approve this step?
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments (optional)
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Add your comments..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows="3"
                />
              </div>
            </div>
          }
          confirmText={actionLoading ? 'Approving...' : 'Approve'}
          confirmButtonClass="bg-emerald-500 hover:bg-emerald-600"
          disabled={actionLoading}
        />
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <ConfirmModal
          isOpen={showRejectModal}
          onClose={() => {
            setShowRejectModal(false);
            setReason('');
            setSelectedStep(null);
          }}
          onConfirm={handleReject}
          title="Reject Step"
          message={
            <div>
              <p className="mb-4">
                Are you sure you want to reject this step?
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason (optional)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Please provide a reason for rejection..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows="3"
                />
              </div>
            </div>
          }
          confirmText={actionLoading ? 'Rejecting...' : 'Reject'}
          confirmButtonClass="bg-red-500 hover:bg-red-600"
          disabled={actionLoading}
        />
      )}
    </section>
  );
};

export default ProcurementApprovalDetail;
