import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

type ReceiptProps = {
  order: any;
};

export const Receipt = React.forwardRef<HTMLDivElement, ReceiptProps>(({ order }, ref) => {
  if (!order) return null;

  return (
    <div ref={ref} className="p-8 bg-white text-black w-[80mm] font-mono text-sm" id="receipt-content">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Restro OS</h2>
        <p className="text-xs">123 Restaurant Street</p>
        <p className="text-xs">London, UK</p>
        <p className="text-xs mt-2">{new Date().toLocaleString()}</p>
      </div>

      <div className="border-b-2 border-dashed border-black my-4"></div>

      <div className="mb-4">
        <p>Order #: {order.id.toString().slice(-4)}</p>
        <p>Type: {order.table_id ? 'Dine-in' : 'Takeaway'}</p>
        {order.table_id && <p>Table: {order.table_id}</p>}
      </div>

      <div className="space-y-2 mb-4">
        {order.order_items?.map((item: any, idx: number) => (
          <div key={idx}>
            <div className="flex justify-between font-bold">
              <span>{item.quantity}x {item.menu_items?.name || item.name}</span>
              <span>£{(Number(item.price_at_time || item.price) * item.quantity).toFixed(2)}</span>
            </div>
            {item.modifiers && JSON.parse(typeof item.modifiers === 'string' ? item.modifiers : JSON.stringify(item.modifiers)).map((mod: any, mi: number) => (
              <div key={mi} className="text-xs pl-4 flex justify-between">
                <span>+ {mod.name}</span>
                {mod.price > 0 && <span>£{Number(mod.price).toFixed(2)}</span>}
              </div>
            ))}
            {item.notes && (
              <div className="text-xs pl-4 italic">
                Note: {item.notes}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-b-2 border-dashed border-black my-4"></div>

      <div className="flex justify-between text-lg font-bold">
        <span>Total</span>
        <span>£{Number(order.total_amount).toFixed(2)}</span>
      </div>

      {!order.table_id && (
        <div className="mt-8 flex flex-col items-center">
          <QRCodeSVG value={JSON.stringify({ id: order.id, type: 'takeaway' })} size={128} />
          <p className="mt-2 text-xs">Scan to track order</p>
        </div>
      )}

      <div className="mt-8 text-center text-xs">
        <p>Thank you for dining with us!</p>
      </div>
    </div>
  );
});

Receipt.displayName = 'Receipt';
