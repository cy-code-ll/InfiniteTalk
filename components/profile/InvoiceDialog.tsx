'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ReloadIcon } from '@radix-ui/react-icons';
import { useUser } from '@clerk/nextjs';
import { PayLogItem } from './types';
import { formatTimestamp, getPriceFromPriceId } from './utils';
import { useToast } from '@/components/ui/toast-provider';
import InvoiceTemplate from '@/components/InvoiceTemplate';

interface InvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payLogId: number | null;
  payLogList: PayLogItem[];
}

export function InvoiceDialog({ open, onOpenChange, payLogId, payLogList }: InvoiceDialogProps) {
  const { user } = useUser();
  const toast = useToast();
  const [invoiceType, setInvoiceType] = useState<'personal' | 'business'>('personal');
  const [companyName, setCompanyName] = useState('');
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);

  const handleCreateInvoice = async () => {
    if (!payLogId) {
      toast.error('Please select a payment record');
      return;
    }
    if (invoiceType === 'business' && !companyName.trim()) {
      toast.error('Please enter company name for business invoice');
      return;
    }

    setIsCreatingInvoice(true);
    try {
      const payLogItem = payLogList.find((item: PayLogItem) => item.id === payLogId);
      if (!payLogItem) {
        throw new Error('Payment record not found');
      }

      const price = getPriceFromPriceId(payLogItem.price_id);
      const priceValue = parseFloat(price.replace('$', '')) || payLogItem.amount;

      const invoiceNumber = `INFINITETALK-${new Date().getFullYear()}-${payLogItem.id}`;
      const data = {
        invoiceNumber,
        dateOfIssue: formatTimestamp(payLogItem.created_at),
        companyName: 'InfiniteTalk',
        companyEmailAddress: 'support@infinitetalk.net',
        customerName: user?.fullName || user?.username || 'Customer',
        customerEmail: user?.primaryEmailAddress?.emailAddress || 'customer@example.com',
        customerCompanyName: invoiceType === 'business' ? companyName.trim() : '',
        description: `${payLogItem.amount} Credits`,
        quantity: 1,
        unitPrice: priceValue,
        amount: priceValue,
        subtotal: priceValue,
        total: priceValue,
        amountPaid: priceValue,
        notes: `Payment received in full on ${formatTimestamp(payLogItem.created_at)}. Thank you for your business!`
      };

      setInvoiceData(data);
      setShowInvoicePreview(true);

      setTimeout(() => {
        generateInvoicePDF(invoiceNumber);
      }, 300);
    } catch (error) {
      console.error('Failed to generate invoice:', error);
      toast.error('Failed to generate invoice');
      setShowInvoicePreview(false);
      setInvoiceData(null);
    } finally {
      setIsCreatingInvoice(false);
    }
  };

  const generateInvoicePDF = async (invoiceNumber: string) => {
    try {
      const invoiceElement = document.querySelector('.invoice-template') as HTMLElement;
      if (!invoiceElement) {
        throw new Error('Invoice template not found');
      }

      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = (html2pdfModule as any).default || html2pdfModule;

      const options = {
        margin: [0, 0, 0, 0] as [number, number, number, number],
        filename: `invoice-${invoiceNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
      };

      await (html2pdf().from(invoiceElement).set(options) as any).save();

      toast.success('Invoice generated and downloaded successfully!');
      handleClose();
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setShowInvoicePreview(false);
      setInvoiceData(null);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setInvoiceType('personal');
    setCompanyName('');
    setInvoiceData(null);
    setShowInvoicePreview(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-card-foreground">Create Invoice</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Choose invoice type and generate your invoice.
            </DialogDescription>
          </DialogHeader>

          <div className="flex border-b border-border mt-6">
            <button
              onClick={() => setInvoiceType('personal')}
              className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${invoiceType === 'personal'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-card-foreground'
                }`}
              disabled={isCreatingInvoice}
            >
              Personal Invoice
            </button>
            <button
              onClick={() => setInvoiceType('business')}
              className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${invoiceType === 'business'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-card-foreground'
                }`}
              disabled={isCreatingInvoice}
            >
              Business Invoice
            </button>
          </div>

          {invoiceType === 'business' ? (
            <div className="mt-6">
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Company Name *
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter your company name"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                disabled={isCreatingInvoice}
              />
            </div>
          ) : (
            <div className="mt-6 p-3 bg-muted/50 rounded-lg text-center text-sm text-muted-foreground">
              Personal Invoice: Click Create Invoice to download.
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isCreatingInvoice}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateInvoice} disabled={isCreatingInvoice} className="flex items-center gap-2">
              {isCreatingInvoice ? (
                <>
                  <ReloadIcon className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Invoice'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {invoiceData && (
        <InvoiceTemplate data={invoiceData} isVisible={showInvoicePreview} />
      )}
    </>
  );
}

