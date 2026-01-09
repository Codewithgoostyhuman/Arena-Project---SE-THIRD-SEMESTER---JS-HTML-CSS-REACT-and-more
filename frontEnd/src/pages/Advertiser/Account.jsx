import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Auth/AuthContext';

export default function Account({fetchWithAuth}) {
  const [account, setAccount] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');

 
  const loadAccount = async () => {
    try {
      const data = await fetchWithAuth('/advertiser/account');
      setAccount(data);
    } catch (err) {
      console.error('Error loading account:', err);
    }
  };
 useEffect(() => {
    loadAccount();
  }, []);

  const handleAddPayment = async (e) => {
    e.preventDefault();
    
    try {
      await fetchWithAuth('/advertiser/account/payment', {
        method: 'POST',
        body: JSON.stringify({
          amount: parseFloat(paymentAmount),
          method: 'credit_card',
          transactionId: 'TXN' + Date.now()
        })
      });
      alert('Payment added successfully!');
      setShowPaymentForm(false);
      setPaymentAmount('');
      loadAccount();
    } catch (err) {
      alert('Error adding payment');
    }
  };

  if (!account) return <div className="text-center py-10">Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Account & Billing</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-500 mb-1">Current Balance</div>
          <div className="text-3xl font-bold text-green-600">
            ${account.balance.toFixed(2)}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-500 mb-1">Total Charges</div>
          <div className="text-3xl font-bold text-red-600">
            ${account.charges.reduce((sum, c) => sum + c.amount, 0).toFixed(2)}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-500 mb-1">Total Payments</div>
          <div className="text-3xl font-bold text-blue-600">
            ${account.payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <button
          onClick={() => setShowPaymentForm(!showPaymentForm)}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
        >
          {showPaymentForm ? 'Cancel' : '+ Add Payment'}
        </button>
      </div>

      {showPaymentForm && (
        <form onSubmit={handleAddPayment} className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-xl font-bold mb-4">Add Payment</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount ($)</label>
            <input
              type="number"
              step="0.01"
              min="1"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
          >
            Add Payment
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">Recent Charges</h3>
          {account.charges.length === 0 ? (
            <p className="text-gray-500">No charges yet</p>
          ) : (
            <div className="space-y-3">
              {account.charges.slice(0, 10).map((charge, idx) => (
                <div key={idx} className="flex justify-between items-start border-b pb-2">
                  <div>
                    <div className="font-medium">{charge.description}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(charge.timestamp).toLocaleDateString()} • {charge.chargeType}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-red-600">
                    -${charge.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">Recent Payments</h3>
          {account.payments.length === 0 ? (
            <p className="text-gray-500">No payments yet</p>
          ) : (
            <div className="space-y-3">
              {account.payments.slice(0, 10).map((payment, idx) => (
                <div key={idx} className="flex justify-between items-start border-b pb-2">
                  <div>
                    <div className="font-medium">Payment via {payment.method}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(payment.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-green-600">
                    +${payment.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}