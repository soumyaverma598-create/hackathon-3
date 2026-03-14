'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useWorkflowStore } from '@/store/workflowStore';
import PageShell from '@/components/PageShell';
import SkeletonLoader from '@/components/SkeletonLoader';
import ErrorMessage from '@/components/ErrorMessage';
import PaymentModal from '@/components/ui/PaymentModal';
import { useLanguageStore } from '@/store/languageStore';
import { formatUiText, getUiText } from '@/lib/translations';
import { formatAppId } from '@/lib/utils';
import { CreditCard, CheckCircle, IndianRupee, Download, AlertCircle } from 'lucide-react';

interface PaymentApplication {
  id: string;
  applicationNumber: string;
  projectName: string;
  projectCategory: string;
  paymentStatus: string;
  paymentAmount?: number;
  paymentTransactionId?: string;
  paymentDate?: string;
}

export default function PaymentPage() {
  const { user } = useAuthStore();
  const { applications, isLoading, error, fetchByProponent } = useWorkflowStore();
  const { language } = useLanguageStore();
  const router = useRouter();
  const [selectedApp, setSelectedApp] = useState<PaymentApplication | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [success, setSuccess] = useState('');
  const [payError, setPayError] = useState('');

  useEffect(() => {
    if (!user) { router.replace('/login'); return; }
    fetchByProponent(user.email);
  }, [user]);

  const handlePaymentSuccess = (paymentId: string) => {
    setShowPaymentModal(false);
    setSelectedApp(null);
    setSuccess(`Payment successful! Transaction ID: ${paymentId}`);
    fetchByProponent(user?.email ?? '');
  };

  const handlePaymentFailure = (error: string) => {
    setShowPaymentModal(false);
    setSelectedApp(null);
    setPayError(error);
  };

  const getFeeAmount = (category: string): number => {
    switch (category) {
      case 'A': return 50000;
      case 'B1': return 30000;
      case 'B2': return 10000;
      default: return 25000;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
            <CheckCircle size={12} />
            {status === 'verified' ? 'Verified ✓' : 'Paid ✓'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
            <AlertCircle size={12} />
            Payment Pending
          </span>
        );
    }
  };

  if (!user) return null;

  const pendingApps = applications.filter((a) => a.paymentStatus === 'pending' || !a.paymentStatus);
  const paidApps = applications.filter(
    (a) => a.paymentStatus === 'paid' || a.paymentStatus === 'verified'
  );

  return (
    <PageShell role="applicant">
      {/* Header */}
      <div className="mb-8">
        <h1 className="page-heading">Application Fee Payment</h1>
        <p className="page-subheading">Environmental Clearance Processing Fee — MoEFCC</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 flex items-start gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3">
          <CheckCircle size={20} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Payment Successful!</p>
            <p className="text-sm mt-1">{success}</p>
          </div>
        </div>
      )}

      {payError && (
        <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
          <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Payment Failed</p>
            <p className="text-sm mt-1">{payError}</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <SkeletonLoader />
      ) : error ? (
        <ErrorMessage message={error} onRetry={() => user && fetchByProponent(user.email)} />
      ) : (
        <div className="space-y-8">
          {/* Fee Information */}
          <div className="glass-card-strong p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <IndianRupee size={24} className="text-green-600" />
              Fee Structure
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Category A</span>
                  <span className="text-lg font-bold text-gray-900">₹50,000</span>
                </div>
                <p className="text-xs text-gray-500">Large projects with high environmental impact</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Category B1</span>
                  <span className="text-lg font-bold text-gray-900">₹30,000</span>
                </div>
                <p className="text-xs text-gray-500">Medium projects with moderate impact</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Category B2</span>
                  <span className="text-lg font-bold text-gray-900">₹10,000</span>
                </div>
                <p className="text-xs text-gray-500">Small projects with low impact</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> GST (18%) will be added to the base fee amount during payment.
              </p>
            </div>
          </div>

          {/* Pending Payments */}
          {pendingApps.length > 0 && (
            <div className="glass-card-strong overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-green-600 to-green-700">
                <h3 className="text-lg font-semibold text-white">Pending Payments</h3>
                <p className="text-green-100 text-sm">Applications awaiting payment processing</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Application ID</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Project Name</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Fee</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pendingApps.map((app) => {
                      const fee = getFeeAmount(app.projectCategory);
                      const totalWithGST = Math.round(fee * 1.18);
                      
                      return (
                        <tr key={app.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-mono text-gray-900">
                            {formatAppId(app.applicationNumber)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="font-medium">{app.projectName}</div>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Cat {app.projectCategory}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div>
                              <div className="font-medium">₹{totalWithGST.toLocaleString('en-IN')}</div>
                              <div className="text-xs text-gray-500">incl. GST</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {getStatusBadge('pending')}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => {
                                setSelectedApp({
                                  ...app,
                                  paymentAmount: totalWithGST,
                                });
                                setShowPaymentModal(true);
                              }}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <CreditCard size={16} />
                              Pay Now
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Payment History */}
          {paidApps.length > 0 && (
            <div className="glass-card-strong overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700">
                <h3 className="text-lg font-semibold text-white">Payment History</h3>
                <p className="text-blue-100 text-sm">Previous payment transactions</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Application ID</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Project Name</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paidApps.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-mono text-gray-900">
                          {formatAppId(app.applicationNumber)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="font-medium">{app.projectName}</div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          ₹{app.paymentAmount?.toLocaleString('en-IN') || '—'}
                        </td>
                        <td className="px-6 py-4 text-sm font-mono text-gray-500">
                          {app.paymentTransactionId || '—'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {app.paymentDate ? new Date(app.paymentDate).toLocaleDateString('en-IN') : '—'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {getStatusBadge(app.paymentStatus || 'pending')}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {(app.paymentStatus === 'paid' || app.paymentStatus === 'verified') && app.paymentTransactionId && (
                            <button className="inline-flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 transition-colors">
                              <Download size={14} />
                              Receipt
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* No Applications */}
          {pendingApps.length === 0 && paidApps.length === 0 && (
            <div className="glass-card-strong p-12 text-center">
              <CreditCard size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
              <p className="text-gray-500 mb-6">
                You haven't submitted any applications yet. Create an application to see payment options.
              </p>
              <a
                href="/applicant/apply"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                Create Application
              </a>
            </div>
          )}
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedApp && (
        <PaymentModal
          applicationId={formatAppId(selectedApp.applicationNumber)}
          amount={selectedApp.paymentAmount || 0}
          projectName={selectedApp.projectName}
          category={selectedApp.projectCategory}
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedApp(null);
          }}
        />
      )}
    </PageShell>
  );
}
