import React, { useState, useEffect } from 'react';
import { X, Money } from '@phosphor-icons/react';

type CashPaymentModalProps = {
  total: number;
  onClose: () => void;
  onComplete: () => void;
};

const UK_DENOMINATIONS = [
  { label: '£50', value: 50, color: 'bg-red-100 text-red-700 border-red-300' },
  { label: '£20', value: 20, color: 'bg-purple-100 text-purple-700 border-purple-300' },
  { label: '£10', value: 10, color: 'bg-orange-100 text-orange-700 border-orange-300' },
  { label: '£5', value: 5, color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { label: '£2', value: 2, color: 'bg-amber-100 text-amber-700 border-amber-300' },
  { label: '£1', value: 1, color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { label: '50p', value: 0.50, color: 'bg-slate-100 text-slate-700 border-slate-300' },
  { label: '20p', value: 0.20, color: 'bg-slate-100 text-slate-700 border-slate-300' },
  { label: '10p', value: 0.10, color: 'bg-slate-100 text-slate-700 border-slate-300' },
  { label: '5p', value: 0.05, color: 'bg-slate-100 text-slate-700 border-slate-300' },
];

export const CashPaymentModal: React.FC<CashPaymentModalProps> = ({ total, onClose, onComplete }) => {
  const [selectedCash, setSelectedCash] = useState<{ [key: string]: number }>({});
  const [totalPaid, setTotalPaid] = useState(0);
  const [change, setChange] = useState(0);
  const [customAmount, setCustomAmount] = useState('');

  useEffect(() => {
    const paidFromDenominations = Object.entries(selectedCash).reduce((sum, [value, count]) => {
      return sum + (parseFloat(value) * count);
    }, 0);
    const paidFromCustom = parseFloat(customAmount) || 0;
    const totalPaidAmount = paidFromDenominations + paidFromCustom;
    setTotalPaid(totalPaidAmount);
    setChange(Math.max(0, totalPaidAmount - total));
  }, [selectedCash, total, customAmount]);

  const addDenomination = (value: number) => {
    setSelectedCash(prev => ({
      ...prev,
      [value]: (prev[value] || 0) + 1
    }));
  };

  const removeDenomination = (value: number) => {
    setSelectedCash(prev => {
      const newCount = (prev[value] || 0) - 1;
      if (newCount <= 0) {
        const { [value]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [value]: newCount };
    });
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
  };

  const handlePresetClick = (amount: number) => {
    setCustomAmount(prev => (parseFloat(prev || '0') + amount).toString());
  };

  const handleNumpadClick = (digit: string) => {
    if (digit === 'C') {
      setCustomAmount('');
    } else if (digit === '.') {
      if (!customAmount.includes('.')) {
        setCustomAmount(customAmount + '.');
      }
    } else {
      setCustomAmount(customAmount + digit);
    }
  };

  const clearAll = () => {
    setSelectedCash({});
    setCustomAmount('');
  };

  const isDue = totalPaid < total;
  const remaining = Math.max(0, total - totalPaid);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Money weight="bold" className="text-2xl text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Cash Payment</h2>
              <p className="text-sm text-slate-500">Enter cash amount or select denominations</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X weight="bold" className="text-2xl text-slate-400" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 gap-6">
          {/* Left Side - Numpad and Presets */}
          <div className="flex flex-col">
            <div className="bg-slate-100 rounded-xl p-4 mb-4 text-right">
              <input
                type="text"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                placeholder="0.00"
                className="w-full bg-transparent text-4xl font-bold text-slate-800 text-right border-none focus:ring-0"
              />
            </div>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[20, 50, 10, 5].map(amount => (
                <button
                  key={amount}
                  onClick={() => handlePresetClick(amount)}
                  className="bg-blue-100 text-blue-700 border-blue-300 border-2 rounded-xl p-4 font-bold text-lg hover:shadow-lg transition-all active:scale-95"
                >
                  £{amount}
                </button>
              ))}
              <button
                onClick={() => setCustomAmount(total.toFixed(2))}
                className="col-span-4 bg-indigo-100 text-indigo-700 border-indigo-300 border-2 rounded-xl p-4 font-bold text-lg hover:shadow-lg transition-all active:scale-95"
              >
                Full Amount (£{total.toFixed(2)})
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'C'].map(digit => (
                <button
                  key={digit}
                  onClick={() => handleNumpadClick(digit)}
                  className="bg-slate-200 text-slate-800 rounded-xl p-4 font-bold text-2xl hover:bg-slate-300 transition-colors"
                >
                  {digit}
                </button>
              ))}
            </div>
          </div>

          {/* Right Side - Summary and Denominations */}
          <div>
            {/* Amount Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Total Due</p>
                <p className="text-2xl font-bold text-slate-800">£{total.toFixed(2)}</p>
              </div>
              <div className={`rounded-xl p-4 ${isDue ? 'bg-red-50' : 'bg-green-50'}`}>
                <p className={`text-xs uppercase font-bold mb-1 ${isDue ? 'text-red-500' : 'text-green-500'}`}>
                  {isDue ? 'Remaining' : 'Paid'}
                </p>
                <p className={`text-2xl font-bold ${isDue ? 'text-red-600' : 'text-green-600'}`}>
                  £{isDue ? remaining.toFixed(2) : totalPaid.toFixed(2)}
                </p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-xs text-blue-500 uppercase font-bold mb-1">Change</p>
                <p className="text-2xl font-bold text-blue-600">£{change.toFixed(2)}</p>
              </div>
            </div>



            {/* Selected Cash Summary */}
            {(Object.keys(selectedCash).length > 0) && (
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-bold text-slate-700">Selected Cash</p>
                  <button
                    onClick={clearAll}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-2">
                  {Object.entries(selectedCash).map(([value, count]) => {
                    const denom = UK_DENOMINATIONS.find(d => d.value === parseFloat(value));
                    return (
                      <div key={value} className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">
                          {count}x {denom?.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">
                            £{(parseFloat(value) * count).toFixed(2)}
                          </span>
                          <button
                            onClick={() => removeDenomination(parseFloat(value))}
                            className="text-red-500 hover:text-red-700 font-bold"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-6 rounded-xl border-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onComplete}
            disabled={isDue}
            className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all ${
              isDue
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {isDue ? `£${remaining.toFixed(2)} remaining` : 'Complete Payment'}
          </button>
        </div>
      </div>
    </div>
  );
};
