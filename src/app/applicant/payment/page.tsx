'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useWorkflowStore } from '@/store/workflowStore';
import PageShell from '@/components/PageShell';
import SkeletonLoader from '@/components/SkeletonLoader';
import ErrorMessage from '@/components/ErrorMessage';
import { submitPayment } from '@/lib/api';
import { useLanguageStore } from '@/store/languageStore';
import { formatUiText, getUiText } from '@/lib/translations';
import { CreditCard, CheckCircle, IndianRupee } from 'lucide-react';

export default function PaymentPage() {
  const { user } = useAuthStore();
  const { applications, isLoading, error, fetchByProponent } = useWorkflowStore();
  const { language } = useLanguageStore();
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
      setSuccess(getUiText('paymentRecordedSuccess', language));
      fetchByProponent(user?.email ?? '');
    } catch (err) {
      setPayError(err instanceof Error ? err.message : getUiText('paymentFailed', language));
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  const pendingApps = applications.filter((a) => a.paymentStatus === 'pending');
  const paidApps = applications.filter((a) => a.paymentStatus !== 'pending');
  const selectedApp = applications.find((a) => a.id === selectedAppId);
  const localeMap = {
    en: 'en-IN',
    hi: 'hi-IN',
    mr: 'mr-IN',
    bn: 'bn-IN',
    kn: 'kn-IN',
  } as const;
  const locale = localeMap[language] ?? 'en-IN';

  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#164e63] transition-all";

  return (
    <PageShell role="applicant">
          <h2 className="page-heading">{getUiText('feePaymentHeading', language)}</h2>
          <p className="page-subheading mb-6">{getUiText('feePaymentSubheading', language)}</p>

            {isLoading ? <SkeletonLoader /> : error ? <ErrorMessage message={error} /> : (
              <div className="space-y-4">
                {/* Payment form */}
                <div className="glass-card-strong p-6">
                  <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <CreditCard size={18} className="text-[#164e63]" /> {getUiText('submitPaymentDetails', language)}
                  </h3>

                  {success && (
                    <div className="mb-4 flex items-center gap-2 bg-cyan-50 border border-cyan-200 text-cyan-700 rounded-lg px-4 py-3 text-sm font-semibold">
                      <CheckCircle size={16} /> {success}
                    </div>
                  )}
                  {payError && <ErrorMessage message={payError} className="mb-4" />}

                  <form onSubmit={handlePay} className="space-y-4">
                    <div>
                      <label className="ui-label">{getUiText('applicationRequiredLabel', language)}</label>
                      <select className={inputCls} value={selectedAppId} onChange={(e) => setSelectedAppId(e.target.value)} required>
                        <option value="">{getUiText('selectPendingPaymentPrompt', language)}</option>
                        {pendingApps.map((a) => (
                          <option key={a.id} value={a.id}>{a.applicationNumber} — {a.projectName}</option>
                        ))}
                      </select>
                    </div>

                    {selectedApp && (
                      <div className="bg-[#164e63]/5 rounded-lg p-3 text-sm text-gray-600 border border-[#164e63]/10">
                        <p className="font-semibold text-[#164e63] mb-1 flex items-center gap-1"><IndianRupee size={14} /> {getUiText('prescribedFee', language)}</p>
                        <p>{formatUiText('categoryApproxFee', language, { category: selectedApp.projectCategory, amount: selectedApp.projectCategory === 'A' ? '1,00,000' : selectedApp.projectCategory === 'B1' ? '50,000' : '25,000' })}</p>
                        <p className="text-xs text-gray-400 mt-1">{getUiText('paymentInstruction', language)}</p>
                      </div>
                    )}

                    <div>
                      <label className="ui-label">{getUiText('amountPaidLabel', language)}</label>
                      <input type="number" className={inputCls} value={amount} onChange={(e) => setAmount(e.target.value)} required min={1} placeholder="e.g. 100000" />
                    </div>
                    <div>
                      <label className="ui-label">{getUiText('transactionIdLabel', language)}</label>
                      <input className={inputCls} value={txnId} onChange={(e) => setTxnId(e.target.value)} required placeholder="e.g. TXN2026031201" />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || !selectedAppId}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, #164e63, #1f7ea4)' }}
                    >
                      <CreditCard size={16} /> {submitting ? getUiText('recordingPayment', language) : getUiText('submitPayment', language)}
                    </button>
                  </form>
                </div>

                {/* Paid history */}
                {paidApps.length > 0 && (
                  <div className="glass-card-strong p-4">
                    <h4 className="ui-section-title-text mb-3">{getUiText('paymentHistory', language)}</h4>
                    <div className="divide-y divide-gray-50">
                      {paidApps.map((a) => (
                        <div key={a.id} className="flex items-center justify-between py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-700">{a.applicationNumber}</p>
                            <p className="text-xs text-gray-400">{a.paymentTransactionId ?? '—'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-800">₹{a.paymentAmount?.toLocaleString(locale) ?? '—'}</p>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${a.paymentStatus === 'verified' ? 'bg-cyan-100 text-cyan-700' : 'bg-blue-100 text-blue-700'}`}>
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
    </PageShell>
  );
}
