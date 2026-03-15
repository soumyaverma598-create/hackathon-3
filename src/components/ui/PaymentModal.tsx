'use client';

import { useEffect, useState } from 'react';
import { X, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { USE_MOCK, createPaymentOrder, verifyPayment } from '@/lib/api';

interface PaymentModalProps {
  applicationId: string;
  amount: number;
  projectName: string;
  category: string;
  onSuccess: (paymentId: string) => void;
  onFailure: (error: string) => void;
  onClose: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PaymentModal({
  applicationId,
  amount,
  projectName,
  category,
  onSuccess,
  onFailure,
  onClose,
}: PaymentModalProps) {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    initializePayment();
  }, []);

  const initializePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      if (USE_MOCK) {
        onSuccess(`mock_pay_${Date.now()}`);
        return;
      }

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError('Failed to load payment gateway. Please refresh and try again.');
        setLoading(false);
        return;
      }

      // Create payment order
      const result = await createPaymentOrder(applicationId, amount);
      const { orderId: serverOrderId, keyId, isMock } = result as any;
      setOrderId(serverOrderId);

      if (isMock) {
        setLoading(false);
        // We'll show a "Mock Payment" UI instead of calling Razorpay
        return;
      }

      // Open Razorpay checkout
      const options = {
        key: keyId,
        amount: amount * 100, // Convert to paise
        currency: 'INR',
        name: 'PARIVESH 3.0 — MoEFCC, Govt of India',
        description: `EC Application Processing Fee - ${applicationId}`,
        order_id: orderId,
        handler: async function (response: any) {
          try {
            setProcessing(true);
            
            // Verify payment on backend
            const verifyResult = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              application_id: applicationId,
            });

            onSuccess(verifyResult.paymentId);
          } catch (err) {
            console.error('Payment verification error:', err);
            onFailure(err instanceof Error ? err.message : 'Payment verification failed');
          } finally {
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            if (!processing) {
              onFailure('Payment was cancelled');
            }
          },
        },
        prefill: {
          contact: '',
          email: '',
        },
        theme: {
          color: '#1a6b3c',
        },
        notes: {
          application_id: applicationId,
          project_name: projectName,
          category: category,
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (err) {
      console.error('Payment initialization error:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize payment');
      setLoading(false);
    }
  };

  const handleMockPayment = async () => {
    try {
      setProcessing(true);
      setError(null);
      
      // Use the order ID created by the backend
      let currentOrderId = orderId;
      if (!currentOrderId) {
        // Create a mock order ID if not already set (e.g., if USE_MOCK was true from start)
        const result = await createPaymentOrder(applicationId, amount);
        currentOrderId = (result as any).orderId;
        setOrderId(currentOrderId);
      }
      
      // Verify payment on backend
      const verifyResult = await verifyPayment({
        razorpay_order_id: currentOrderId as string,
        razorpay_payment_id: `pay_mock_${Date.now()}`,
        razorpay_signature: 'mock_signature',
        application_id: applicationId,
      });

      onSuccess(verifyResult.paymentId);
    } catch (err) {
      console.error('Mock payment error:', err);
      setError(err instanceof Error ? err.message : 'Mock payment failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CreditCard size={20} className="text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Payment Processing</h3>
              <p className="text-sm text-gray-500">Secure payment via Razorpay</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={processing}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && (
            <div className="flex flex-col items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
              <p className="text-gray-600">Initializing payment gateway...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-800 font-medium">Payment Error</p>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {processing && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <div>
                  <p className="text-blue-800 font-medium">Verifying Payment</p>
                  <p className="text-blue-600 text-sm mt-1">Please wait while we verify your payment...</p>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && !processing && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Payment Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Application ID:</span>
                    <span className="font-mono text-gray-900">{applicationId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Project:</span>
                    <span className="text-gray-900">{projectName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="text-gray-900">{category}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="font-medium text-gray-900">Amount:</span>
                    <span className="font-bold text-green-600">₹{amount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-green-800 font-medium">Demo/Mock Mode Active</p>
                    <p className="text-green-600 text-sm mt-1">
                      Placeholder keys detected. Please use the button below to simulate a successful payment for this demo.
                    </p>
                    <button
                      onClick={handleMockPayment}
                      className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      Complete Simulated Payment <CheckCircle size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Powered by Razorpay • 256-bit SSL encryption
            </p>
            {!loading && !processing && (
              <button
                onClick={onClose}
                className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Import the Razorpay script loader
async function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}
