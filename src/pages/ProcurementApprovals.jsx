import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  // Legacy support
  Pending: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  Approved: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  Rejected: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-200',
  },
};

const ProcurementApprovals = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { steps, loading, error, actionLoading } = useSelector((state) => state.approvalSteps);
  
  const [activeTab, setActiveTab] = useState('All Approvals');
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedStep, setSelectedStep] = useState(null);
  const [comments, setComments] = useState('');
  const [reason, setReason] = useState('');

  // Fetch approval steps on mount
  useEffect(() => {
    dispatch(fetchApprovalSteps());
  }, [dispatch]);

  useEffect(() => {
    document.title = 'Approvals - LightERP';
    return () => {
      document.title = 'LightERP';
    };
  }, []);

  // Group steps by approval instance
  const groupedSteps = useMemo(() => {
    const grouped = {};
    steps.forEach((step) => {
      const instanceId = step.approval_instance;
      if (!grouped[instanceId]) {
        grouped[instanceId] = [];
      }
      grouped[instanceId].push(step);
    });
    return grouped;
  }, [steps]);

  // Convert grouped steps to workflow format
  const workflows = useMemo(() => {
    return Object.entries(groupedSteps).map(([instanceId, instanceSteps]) => {
      const approvedCount = instanceSteps.filter(s => s.status === 'APPROVED').length;
      const totalSteps = instanceSteps.length;
      const hasRejected = instanceSteps.some(s => s.status === 'REJECTED');
      const hasPending = instanceSteps.some(s => s.status === 'PENDING');
      
      let overallStatus = 'APPROVED';
      if (hasRejected) {
        overallStatus = 'REJECTED';
      } else if (hasPending) {
        overallStatus = 'PENDING';
      }

      // Get the first step for display
      const firstStep = instanceSteps[0];
      const workflowDetails = firstStep?.workflow_step_details;

      return {
        instance: parseInt(instanceId),
        status: overallStatus,
        workflow: workflowDetails?.workflow ? `Workflow #${workflowDetails.workflow}` : 'Unknown Workflow',
        submittedDate: firstStep?.activated_at ? new Date(firstStep.activated_at).toLocaleDateString() : 'N/A',
        progress: `${approvedCount}/${totalSteps} steps`,
        steps: instanceSteps,
      };
    });
  }, [groupedSteps]);

  const filteredWorkflows = useMemo(() => {
    if (activeTab === 'Pending My Approval') {
      return workflows.filter((wf) => wf.status === 'PENDING');
    }
    return workflows;
  }, [activeTab, workflows]);

  const handleApprove = async () => {
    if (!selectedStep) return;

    try {
      await dispatch(approveStep({ id: selectedStep.id, comments })).unwrap();
      // Refresh data
      await dispatch(fetchApprovalSteps()).unwrap();
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
      await dispatch(fetchApprovalSteps()).unwrap();
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

  const handleViewDetails = (instance) => {
    navigate(`/procurement/approvals/${instance}`);
  };



  return (
    <section className="min-h-screen bg-[#f2f3f5] pb-12">
      <PageHeader icon={<HeaderIcon />} title="Approvals" subtitle="Workflow Management" />

      <div className="max-w-6xl mx-auto px-6 mt-8 space-y-6">

        <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-6 md:p-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-2xl font-semibold text-[#1f4560]">Approval Workflows</h2>
              <div className="flex flex-wrap gap-2">
                {['Pending My Approval', 'Manage Workflows', 'All Approvals'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-colors ${
                      activeTab === tab
                        ? 'border-[#48C1F0] bg-[#e5f6ff] text-[#0c2a3c]'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading approval workflows...</div>
              ) : error ? (
                <div className="text-center py-8 text-red-600">Error: {error}</div>
              ) : filteredWorkflows.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No approval workflows found</div>
              ) : (
                filteredWorkflows.map((wf) => {
                  const wfStyle = statusStyles[wf.status] || statusStyles.PENDING;
                  // Find first pending step
                  const pendingStep = wf.steps.find(s => s.status === 'PENDING');
                  const displayStep = pendingStep || wf.steps[0];
                  const stepStyle = statusStyles[displayStep?.status] || statusStyles.PENDING;
                  const workflowStepDetails = displayStep?.workflow_step_details;

                  return (
                    <div
                      key={wf.instance}
                      className="bg-white rounded-3xl border border-gray-200 shadow-md p-5 md:p-6"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <p className="text-sm font-semibold text-[#0d2438]">Instance #{wf.instance}</p>
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${wfStyle.bg} ${wfStyle.text} ${wfStyle.border}`}
                            >
                              {wf.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Workflow: {wf.workflow} • Submitted: {wf.submittedDate} • Progress: {wf.progress}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleViewDetails(wf.instance)}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-[#28819C]"
                        >
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1.5 9C1.5 9 4.5 3 9 3C13.5 3 16.5 9 16.5 9C16.5 9 13.5 15 9 15C4.5 15 1.5 9 1.5 9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
                          </svg>
                          View Details
                        </button>
                      </div>

                      <div
                        className={`mt-4 rounded-2xl border ${stepStyle.border} bg-white p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${stepStyle.bg} ${stepStyle.text}`}>
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.4" />
                              <path d="M6 10.3L8.9 13.1L14 7.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-base font-semibold text-[#1f4560]">
                              Step {workflowStepDetails?.sequence}: {workflowStepDetails?.name || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {workflowStepDetails?.description || 'No description'} • Status: {displayStep?.status}
                            </p>
                          </div>
                        </div>
                        {pendingStep && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openApproveModal(pendingStep)}
                              disabled={actionLoading}
                              className="px-4 py-2 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actionLoading ? 'Processing...' : 'Approve'}
                            </button>
                            <button
                              type="button"
                              onClick={() => openRejectModal(pendingStep)}
                              disabled={actionLoading}
                              className="px-4 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actionLoading ? 'Processing...' : 'Reject'}
                            </button>
                          </div>
                        )}
                      </div>

                      {wf.status === 'APPROVED' && (
                        <p className="mt-3 text-sm font-semibold text-emerald-600">
                          ✓ All steps completed
                        </p>
                      )}
                      {wf.status === 'REJECTED' && (
                        <p className="mt-3 text-sm font-semibold text-red-600">
                          ✗ Workflow rejected
                        </p>
                      )}
                    </div>
                  );
                })
              )}
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

export default ProcurementApprovals;
