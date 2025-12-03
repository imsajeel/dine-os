import React from 'react';
import { ArrowCounterClockwise, Trash, Minus, Plus, CaretRight, Coffee, Printer } from "@phosphor-icons/react";
import { CartItem, Modifier, OrderType } from '../../types/pos';

type CartProps = {
  cart: CartItem[];
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  clearCart: () => void;
  removeFromCart: (id: string, modifiers?: Modifier[], notes?: string) => void;
  updateQuantity: (id: string, delta: number, modifiers?: Modifier[], notes?: string) => void;
  subtotal: number;
  tax: number;
  total: number;
  handleSendOrder: () => void;
  setIsPaymentModalOpen: (isOpen: boolean) => void;
  hasExistingOrder?: boolean;
  onPrintReceipt?: () => void;
  onEdit?: (item: CartItem) => void;
};

export const Cart: React.FC<CartProps> = ({
  cart,
  orderType,
  setOrderType,
  clearCart,
  removeFromCart,
  updateQuantity,
  subtotal,
  tax,
  total,
  handleSendOrder,
  setIsPaymentModalOpen,
  hasExistingOrder = false,
  onPrintReceipt,
  onEdit
}) => {
  return (
    <aside className="w-96 bg-white border-l border-slate-200 flex flex-col z-10 shadow-xl flex-shrink-0">
      {/* Cart Header */}
      <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg mb-6">
              <button 
                  onClick={() => setOrderType('dine-in')}
                  className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${orderType === 'dine-in' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  Dine In
              </button>
              <button 
                  onClick={() => setOrderType('takeaway')}
                  className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${orderType === 'takeaway' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  Takeaway
              </button>
          </div>
          
          <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                {hasExistingOrder ? 'Existing Order' : 'Current Order'}
              </h2>
              <div className="flex items-center gap-2">
                {hasExistingOrder && onPrintReceipt && (
                  <button 
                      onClick={onPrintReceipt}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Print Receipt"
                  >
                      <Printer weight="bold" className="text-lg" />
                  </button>
                )}
                <button 
                    onClick={clearCart}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Clear Cart"
                >
                    <ArrowCounterClockwise weight="bold" className="text-lg" />
                </button>
              </div>
          </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length > 0 ? (
              cart.map((item, index) => (
                  <div 
                    key={`${item.id}-${index}`} 
                    className={`flex items-center gap-3 p-3 rounded-xl border shadow-sm animate-slide-in ${item.isExisting ? 'bg-slate-50 border-slate-200 opacity-80' : 'bg-white border-slate-100 cursor-pointer hover:border-blue-300'}`}
                    onClick={() => !item.isExisting && onEdit && onEdit(item)}
                  >
                      <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 relative">
                           <img 
                            src={item.image} 
                            alt="" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement?.classList.add('bg-slate-200');
                            }} 
                           />
                           {item.isExisting && <div className="absolute inset-0 bg-slate-500/10 flex items-center justify-center"><span className="text-[10px] font-bold bg-white/80 px-1 rounded text-slate-600">SENT</span></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-slate-800 text-sm truncate">{item.name}</h4>
                        {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                          <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                              {item.selectedModifiers.map((mod, idx) => (
                                  <div key={idx} className="flex justify-between">
                                      <span>
                                        + {mod.name} 
                                        {mod.weight && <span className="text-slate-400 ml-1">({mod.weight}g)</span>}
                                      </span>
                                      {mod.weight ? (
                                        <span></span> // Hide price for weight modifier as it's included in item price
                                      ) : (
                                        mod.price > 0 && <span>£{mod.price.toFixed(2)}</span>
                                      )}
                                  </div>
                              ))}
                          </div>
                        )}
                        {item.notes && (
                            <div className="text-xs text-orange-600 mt-1 italic bg-orange-50 p-1 rounded">
                                &quot;{item.notes}&quot;
                            </div>
                        )}
                        <p className="text-blue-600 font-semibold text-sm mt-1">
                            £{(() => {
                                // Calculate total price for this item
                                const weightMod = item.selectedModifiers?.find(m => m.weight);
                                let itemBasePrice = item.price;
                                if (weightMod && weightMod.weight) {
                                    itemBasePrice = (weightMod.weight / 1000) * item.price;
                                }
                                const otherModifiersPrice = item.selectedModifiers?.reduce((acc, mod) => {
                                    if (mod.weight) return acc;
                                    return acc + mod.price;
                                }, 0) || 0;
                                return ((itemBasePrice + otherModifiersPrice) * item.quantity).toFixed(2);
                            })()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                          {!item.isExisting ? (
                              <>
                                <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-1">
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (item.quantity <= 1) {
                                            removeFromCart(item.id, item.selectedModifiers, item.notes);
                                        } else {
                                            updateQuantity(item.id, -1, item.selectedModifiers, item.notes);
                                        }
                                    }}
                                    className="w-6 h-6 flex items-center justify-center rounded-md bg-white text-slate-600 shadow-sm hover:bg-slate-100 active:scale-95 transition-all"
                                >
                                    {item.quantity <= 1 ? <Trash weight="bold" className="text-xs text-red-500" /> : <Minus weight="bold" className="text-xs" />}
                                </button>
                                <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        updateQuantity(item.id, 1, item.selectedModifiers, item.notes);
                                    }}
                                    className="w-6 h-6 flex items-center justify-center rounded-md bg-white text-blue-600 shadow-sm hover:bg-slate-100 active:scale-95 transition-all"
                                >
                                    <Plus weight="bold" className="text-xs" />
                                </button>
                                </div>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFromCart(item.id, item.selectedModifiers, item.notes);
                                    }}
                                    className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash weight="bold" className="text-lg" />
                                </button>
                              </>
                          ) : (
                              <div className="flex flex-col items-end gap-1">
                                  <span className="text-sm font-bold text-slate-500">x{item.quantity}</span>
                                  <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Ordered</span>
                              </div>
                          )}
                      </div>
                  </div>
              ))
          ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center">
                       <div className="relative">
                          <div className="absolute -inset-1 rounded-full bg-slate-100 animate-pulse opacity-75"></div>
                          <Coffee weight="duotone" className="text-3xl relative opacity-50" />
                       </div>
                  </div>
                  <p className="font-medium">Start adding items</p>
              </div>
          )}
      </div>

      {/* Cart Footer */}
      <div className="p-6 bg-slate-50 border-t border-slate-200">
          <div className="space-y-3 mb-6">
              <div className="flex justify-between text-slate-500 text-sm">
                  <span>Subtotal</span>
                  <span>£{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-sm">
                  <span>Tax (10%)</span>
                  <span>£{tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-200 pt-3 flex justify-between items-end">
                  <span className="text-slate-800 font-bold">Total</span>
                  <span className="text-2xl font-bold text-blue-600">£{total.toFixed(2)}</span>
              </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
              <button 
                  onClick={handleSendOrder}
                  disabled={cart.length === 0}
                  className="py-4 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg shadow-lg shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                  <span>Send Order</span>
              </button>
              <button 
                  onClick={() => setIsPaymentModalOpen(true)}
                  disabled={cart.length === 0}
                  className="py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2 group"
              >
                  <span>Pay Now</span>
                  <CaretRight weight="bold" className="text-xl group-hover:translate-x-1 transition-transform" />
              </button>
          </div>
      </div>
    </aside>
  );
};
