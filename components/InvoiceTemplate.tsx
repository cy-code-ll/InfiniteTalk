'use client';

import React from 'react';

interface InvoiceData {
  invoiceNumber: string;
  dateOfIssue: string;
  companyName: string;
  companyEmailAddress: string;
  customerName: string;
  customerEmail: string;
  customerCompanyName?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  subtotal: number;
  total: number;
  amountPaid: number;
  notes: string;
}

interface InvoiceTemplateProps {
  data: InvoiceData;
  isVisible?: boolean;
}

const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ data, isVisible = false }) => {
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  return (
    <div
      className="invoice-template"
      style={{
        width: '210mm',
        height: '297mm',
        padding: '15mm',
        backgroundColor: 'white',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        lineHeight: '1.5',
        color: '#000000',
        boxSizing: 'border-box',
        position: isVisible ? 'relative' : 'absolute',
        left: isVisible ? 'auto' : '-9999px',
        top: isVisible ? 'auto' : '-9999px',
        zIndex: isVisible ? 1000 : -1,
        margin: isVisible ? '20px auto' : '0',
        border: isVisible ? '1px solid #ddd' : 'none',
        boxShadow: isVisible ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none',
        visibility: isVisible ? 'visible' : 'hidden',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#000' }}>Invoice</div>
        <div style={{ width: '60px', height: '60px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <img src="/logo.webp" alt="InfiniteTalk Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: '8px' }}>
            <strong>INVOICE NUMBER:</strong> {data.invoiceNumber}
          </div>
          <div style={{ marginBottom: '8px' }}>
            <strong>DATE OF ISSUE:</strong> {data.dateOfIssue}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>{data.companyName}</div>
          <div style={{ marginTop: '8px' }}>
            <strong>Contact Email:</strong> {data.companyEmailAddress}
          </div>
        </div>
        <div style={{ flex: 1, textAlign: 'right' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>BILL TO</div>
          <div style={{ marginBottom: '4px' }}>{data.customerName}</div>
          <div style={{ marginBottom: '4px' }}>{data.customerEmail}</div>
          {data.customerCompanyName && <div>{data.customerCompanyName}</div>}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '10px', marginBottom: '10px', fontWeight: 'bold', borderBottom: '1px solid #ddd', paddingBottom: '8px' }}>
          <div>DESCRIPTION</div>
          <div>QTY</div>
          <div>UNIT PRICE</div>
          <div style={{ textAlign: 'right' }}>AMOUNT</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '10px', paddingBottom: '8px' }}>
          <div>{data.description}</div>
          <div>{data.quantity}</div>
          <div>{formatCurrency(data.unitPrice)}</div>
          <div style={{ textAlign: 'right' }}>{formatCurrency(data.amount)}</div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #ddd', marginBottom: '20px' }} />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '30px' }}>
        <div style={{ width: '200px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Subtotal</span>
            <span>{formatCurrency(data.subtotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Total</span>
            <span>{formatCurrency(data.total)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
            <span>AMOUNT PAID</span>
            <span>{formatCurrency(data.amountPaid)}</span>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>NOTES:</div>
        <div>{data.notes}</div>
      </div>

      <div style={{ position: 'absolute', bottom: '20mm', right: '20mm', fontSize: '12px', color: '#666' }}>Page 1 of 1</div>
    </div>
  );
};

export default InvoiceTemplate;


