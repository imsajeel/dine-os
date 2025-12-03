import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

type ReceiptProps = {
  order: any;
  size?: '58mm' | '80mm';
};

export const Receipt = React.forwardRef<HTMLDivElement, ReceiptProps>(({ order, size }, ref) => {
  if (!order) return null;

  // Get receipt size from localStorage or use prop
  const receiptSize = size || (localStorage.getItem('receipt_size') as '58mm' | '80mm') || '80mm';
  
  // Calculate totals
  const total = Number(order.total_amount || 0);
  const subtotal = total / 1.1; // Assuming 10% tax included
  const tax = total - subtotal;

  return (
    <>
      <style>{`
        /* -------------------------------------
           GLOBAL & RESET
        ------------------------------------- */
        .receipt-container * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        .receipt-container {
            /* Clean, modern font stack */
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f5f5f5; /* Light grey background for screen viewing */
            font-size: 13px;
            color: #000;
            -webkit-print-color-adjust: exact; /* Ensures black backgrounds print */
            print-color-adjust: exact;
            display: inline-block;
        }

        /* -------------------------------------
           RECEIPT CONTAINER
        ------------------------------------- */
        .receipt {
            background-color: #fff;
            width: ${receiptSize === '58mm' ? '58mm' : '80mm'};
            margin: 0; /* Left aligned */
            padding-bottom: 20px;
            border-right: 1px solid #ddd; /* Visual edge for screen */
            box-shadow: 5px 0 10px rgba(0,0,0,0.05); /* Subtle shadow for screen */
        }

        /* -------------------------------------
           HEADER (Inverted Look)
        ------------------------------------- */
        .brand-header {
            background-color: #000;
            color: #fff;
            padding: 20px 10px;
            text-align: center;
        }
        
        .brand-header h1 {
            font-size: 22px;
            font-weight: 800;
            letter-spacing: 3px;
            text-transform: uppercase;
            margin: 0;
        }

        .store-info {
            text-align: center;
            font-size: 11px;
            margin-top: 10px;
            line-height: 1.4;
            color: #333;
            padding: 0 10px;
        }

        /* -------------------------------------
           ORDER DETAILS
        ------------------------------------- */
        .order-details {
            display: flex;
            justify-content: space-between;
            padding: 15px 10px 5px 10px;
            font-size: 11px;
            font-weight: 600;
            color: #555;
        }

        /* The Big Box Number */
        .order-number {
            text-align: center;
            margin: 5px 0 15px 0;
        }
        .order-number span {
            border: 2px solid #000;
            padding: 5px 15px;
            font-size: 18px;
            font-weight: 900;
            border-radius: 6px;
        }

        /* -------------------------------------
           ITEMS LIST
        ------------------------------------- */
        .items-container {
            padding: 0 10px;
            margin-top: 10px;
        }

        .item-row {
            display: flex;
            align-items: flex-end; /* Aligns dots to bottom */
            margin-bottom: 8px;
            font-size: 13px;
        }

        .qty {
            width: 25px;
            font-weight: bold;
            flex-shrink: 0;
        }

        .name {
            font-weight: 500;
        }

        /* This creates the dots ....... between name and price */
        .dots {
            flex-grow: 1;
            border-bottom: 2px dotted #ccc;
            margin: 0 5px;
            position: relative;
            bottom: 4px; /* Adjust dot height */
        }

        .price {
            font-weight: bold;
            flex-shrink: 0;
        }

        .notes {
            font-size: 11px;
            color: #666;
            margin-left: 25px; /* Indent under name */
            margin-top: -5px;
            margin-bottom: 8px;
            font-style: italic;
        }

        /* -------------------------------------
           TOTALS
        ------------------------------------- */
        .totals-section {
            background-color: #f9f9f9; /* Light contrast area */
            padding: 15px 10px;
            margin-top: 10px;
            border-top: 1px solid #000;
            border-bottom: 1px solid #000;
        }

        .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            font-size: 12px;
        }

        .final-total {
            display: flex;
            justify-content: space-between;
            font-size: 20px;
            font-weight: 900;
            margin-top: 10px;
        }

        /* -------------------------------------
           FOOTER & QR
        ------------------------------------- */
        .footer {
            text-align: center;
            padding: 20px 10px;
        }

        .survey {
            margin-bottom: 15px;
        }
        .stars {
            font-size: 18px;
            letter-spacing: 5px;
            margin: 5px 0;
        }

        .qr-container {
            display: inline-block;
            border: 2px solid #000;
            padding: 5px;
            border-radius: 8px;
        }
        .qr-code {
            display: block;
        }

        /* -------------------------------------
           PRINT SETTINGS
        ------------------------------------- */
        @media print {
            body { background: none; }
            .receipt-container {
                background: none;
            }
            .receipt { 
                width: 100%; 
                box-shadow: none; 
                border: none;
                margin: 0;
                padding: 0;
            }
            /* Ensure background colors print */
            .brand-header { -webkit-print-color-adjust: exact; }
            .totals-section { background-color: #f0f0f0 !important; -webkit-print-color-adjust: exact; }
            @page { margin: 0; }
        }
      `}</style>
      
      <div ref={ref} className="receipt-container">
        <div className="receipt">
            
            <div className="brand-header">
                <h1>DineOS</h1>
            </div>

            <div className="store-info">
                123 Restaurant Street, London<br />
                (555) 012-3456 • dineos.com
            </div>

            <div className="order-details">
                <span>{new Date().toLocaleString()}</span>
                <span>Server: Staff</span>
            </div>

            <div className="order-number">
                <span>ORDER #{order.id.toString().slice(-4)}</span>
            </div>

            <div className="items-container">
                {(order.order_items || order.items || []).map((item: any, idx: number) => {
                    const price = Number(item.price_at_time || item.menu_items?.price || item.price || 0);
                    const modifiers = item.modifiers ? (typeof item.modifiers === 'string' ? JSON.parse(item.modifiers) : item.modifiers) : [];
                    const itemName = item.menu_items?.name || item.name || 'Unknown Item';
                    
                    return (
                        <div key={idx}>
                            <div className="item-row">
                                <span className="qty">{item.quantity}</span>
                                <span className="name">{itemName}</span>
                                <span className="dots"></span>
                                <span className="price">{(price * item.quantity).toFixed(2)}</span>
                            </div>
                            {modifiers.length > 0 && (
                                <div className="notes">
                                    {modifiers.map((mod: any, mi: number) => (
                                        <div key={mi}>- {mod.name} (+{Number(mod.price).toFixed(2)})</div>
                                    ))}
                                </div>
                            )}
                            {item.notes && (
                                <div className="notes">
                                    - {item.notes}
                                </div>
                            )}
                        </div>
                    );
                })}
                {(!order.order_items && !order.items) && (
                    <div className="text-center text-red-500">No items found</div>
                )}
            </div>

            <div className="totals-section">
                <div className="total-row">
                    <span>Subtotal</span>
                    <span>{subtotal.toFixed(2)}</span>
                </div>
                <div className="total-row">
                    <span>Tax (10%)</span>
                    <span>{tax.toFixed(2)}</span>
                </div>
                <div className="final-total">
                    <span>TOTAL</span>
                    <span>£{total.toFixed(2)}</span>
                </div>
            </div>

            <div className="footer">
                <div className="survey">
                    <p>How was your meal?</p>
                    <div className="stars">★★★★★</div>
                    <p style={{ fontSize: '10px' }}>Scan to rate & get 10% off</p>
                </div>

                <div className="qr-container">
                    <QRCodeSVG value={`https://dineos.com/feedback/${order.id}`} size={100} />
                </div>
                
                <p style={{ marginTop: '10px', fontSize: '10px', color: '#888' }}>Thank you for your visit!</p>
            </div>
        </div>
      </div>
    </>
  );
});

Receipt.displayName = 'Receipt';
