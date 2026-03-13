'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useWorkflowStore } from '@/store/workflowStore';
import GovHeader from '@/components/GovHeader';
import Sidebar from '@/components/Sidebar';
import SkeletonLoader from '@/components/SkeletonLoader';
import ErrorMessage from '@/components/ErrorMessage';
import { submitPayment } from '@/lib/api';
import { CreditCard, CheckCircle, IndianRupee } from 'lucide-react';

export default function PaymentPage() {
  const { user } = useAuthStore();
  const { applications, isLoading, error, fetchByProponent } = useWorkflowStore();
  const router = useRouter();
  const [selectedAppId, setSelectedAppId] = useState('');
  const [txnId, setTxnId] = useState('');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [payError, setPayError] = useState('');

  useEffect(() => {
    if (!user) { router.replace('/login'); return; }
    fetchByProponent(user.email);
  }, [user]);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId) return;
    setSubmitting(true); setPayError(''); setSuccess('');
    try {
      await submitPayment(selectedAppId, { amount: Number(amount), transactionId: txnId });
      setSuccess('Payment recorded successfully! Status updated to Paid.');
      fetchByProponent(user?.email ?? '');
    } catch (err) {
      setPayError(err instanceof Error ? err.message : 'Payment failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  const pendingApps = applications.filter((a) => a.paymentStatus === 'pending');
  const paidApps = applications.filter((a) => a.paymentStatus !== 'pending');
  const selectedApp = applications.find((a) => a.id === selectedAppId);

  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c] transition-all";

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <GovHeader />
      <div className="flex flex-1">
        <Sidebar role="applicant" />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Fee Payment</h2>
            <p className="text-gray-400 text-sm mb-6">Submit payment for Environmental Clearance application processing fee</p>

            {isLoading ? <SkeletonLoader /> : error ? <ErrorMessage message={error} /> : (
              <div className="space-y-4">
                {/* Payment form */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                  <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <CreditCard size={18} className="text-[#1a6b3c]" /> Submit Payment Details
                  </h3>

                  {success && (
                    <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm font-semibold">
                      <CheckCircle size={16} /> {success}
                    </div>
                  )}
                  {payError && <ErrorMessage message={payError} className="mb-4" />}

                  <form onSubmit={handlePay} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Application *</label>
                      <select className={inputCls} value={selectedAppId} onChange={(e) => setSelectedAppId(e.target.value)} required>
                        <option value="">-- Select application with pending payment --</option>
                        {pendingApps.map((a) => (
                          <option key={a.id} value={a.id}>{a.applicationNumber} — {a.projectName}</option>
                        ))}
                      </select>
                    </div>

                    {selectedApp && (
                      <div className="bg-[#1a6b3c]/5 rounded-lg p-3 text-sm text-gray-600 border border-[#1a6b3c]/10">
                        <p className="font-semibold text-[#1a6b3c] mb-1 flex items-center gap-1"><IndianRupee size={14} /> Prescribed Fee</p>
                        <p>Category {selectedApp.projectCategory} — Approx. ₹{selectedApp.projectCategory === 'A' ? '1,00,000' : selectedApp.projectCategory === 'B1' ? '50,000' : '25,000'}</p>
                        <p className="text-xs text-gray-400 mt-1">Pay via NEFT/RTGS/DD in favour of &quot;MoEFCC Fee Account&quot;</p>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Amount Paid (₹) *</label>
                      <input type="number" className={inputCls} value={amount} onChange={(e) => setAmount(e.target.value)} required min={1} placeholder="e.g. 100000" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Transaction ID / DD Number *</label>
                      <input className={inputCls} value={txnId} onChange={(e) => setTxnId(e.target.value)} required placeholder="e.g. TXN2026031201" />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || !selectedAppId}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, #1a6b3c, #256b45)' }}
                    >
                      <CreditCard size={16} /> {submitting ? 'Recording Payment…' : 'Submit Payment'}
                    </button>
                  </form>
                </div>

                {/* Paid history */}
                {paidApps.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Payment History</h4>
                    <div className="divide-y divide-gray-50">
                      {paidApps.map((a) => (
                        <div key={a.id} className="flex items-center justify-between py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-700">{a.applicationNumber}</p>
                            <p className="text-xs text-gray-400">{a.paymentTransactionId ?? '—'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-800">₹{a.paymentAmount?.toLocaleString('en-IN') ?? '—'}</p>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${a.paymentStatus === 'verified' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                              {a.paymentStatus}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
