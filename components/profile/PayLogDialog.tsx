'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { ReloadIcon } from '@radix-ui/react-icons';
import { api } from '@/lib/api';
import { PayLogItem } from './types';
import { formatTimestamp, getPriceFromPriceId, getPaginationItems, dialogTable } from './utils';

interface PayLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenInvoiceDialog: (payLogId: number) => void;
}

export function PayLogDialog({ open, onOpenChange, onOpenInvoiceDialog }: PayLogDialogProps) {
  const [payLogList, setPayLogList] = useState<PayLogItem[]>([]);
  const [isLoadingPayLog, setIsLoadingPayLog] = useState(false);
  const [payLogError, setPayLogError] = useState<string | null>(null);
  const [payLogCurrentPage, setPayLogCurrentPage] = useState(1);
  const [payLogTotalPages, setPayLogTotalPages] = useState(0);
  const payLogPageSize = 10;

  const fetchPayLog = async (page: number) => {
    setIsLoadingPayLog(true);
    setPayLogError(null);
    try {
      const result = await api.user.getPayLog(page, payLogPageSize);
      if (result.code === 200 && result.data) {
        setPayLogList(result.data.list || []);
        setPayLogTotalPages(result.data.total_page || 0);
      } else {
        setPayLogList([]);
        setPayLogTotalPages(0);
        setPayLogError(result.msg || 'Failed to fetch pay log');
      }
    } catch (error) {
      setPayLogError(error instanceof Error ? error.message : 'An unknown error occurred fetching pay log');
      setPayLogList([]);
      setPayLogTotalPages(0);
    } finally {
      setIsLoadingPayLog(false);
    }
  };

  useEffect(() => {
    if (open) {
      setPayLogCurrentPage(1);
      fetchPayLog(1);
    }
  }, [open]);

  const handlePayLogPageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= payLogTotalPages && newPage !== payLogCurrentPage) {
      setPayLogCurrentPage(newPage);
      fetchPayLog(newPage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-h-[85vh] overflow-y-auto rounded-3xl border border-border shadow-2xl bg-card/95 backdrop-blur-xl [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-muted/80 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted"
        style={{ 
          width: 'min(98vw, 1200px)',
          maxWidth: 'min(98vw, 1200px)',
          minWidth: '360px'
        }}
      >
        <DialogHeader className="text-center pb-6 border-b border-border">
          <DialogTitle className="text-2xl font-semibold text-card-foreground tracking-tight">Pay Log</DialogTitle>
          <DialogDescription className="text-muted-foreground mt-2">
            View your payment transaction history
          </DialogDescription>
        </DialogHeader>
        <div className="pt-6">
          {isLoadingPayLog ? (
            <div className="text-center py-12">
              <ReloadIcon className="animate-spin h-8 w-8 text-primary mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">Loading...</p>
            </div>
          ) : payLogError ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-400 text-2xl">⚠️</span>
              </div>
              <p className="text-red-400 font-medium">Failed to load: {payLogError}</p>
            </div>
          ) : payLogList.length > 0 ? (
            <>
              {/* 移动端卡片布局 */}
              <div className="block sm:hidden space-y-3">
                {payLogList.map((item) => (
                  <div key={item.id} className="bg-muted/30 rounded-lg p-4 border border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Date</span>
                      <span className="text-sm text-card-foreground font-medium">{formatTimestamp(item.created_at)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Points</span>
                      <span className={`${dialogTable.pillBase} bg-green-500/20 text-green-400 font-bold`}>
                        {item.amount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Price</span>
                      <span className="text-sm text-card-foreground font-medium">
                        {(() => {
                          const mapped = getPriceFromPriceId(item.price_id);
                          return mapped && mapped !== '-' ? mapped : (item.price_id || '-');
                        })()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Currency</span>
                      <span className="text-sm text-card-foreground">{item.currency}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Payment Type</span>
                      <span className="text-sm text-card-foreground">{item.pay_type}</span>
                    </div>
                    <div className="pt-2 border-t border-border">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenInvoiceDialog(item.id)}
                        className="w-full h-9 text-sm"
                      >
                        Generate Invoice
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* 桌面端表格布局 */}
              <div className="hidden sm:block">
                <div className={dialogTable.wrapper}>
                  <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-muted/30 [&::-webkit-scrollbar-thumb]:bg-muted-foreground/40 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-muted-foreground/60">
                    <table className={dialogTable.table} style={{ minWidth: '700px' }}>
                      <thead>
                        <tr className="border-b border-border">
                          <th className={`${dialogTable.headCell} w-1/4 min-w-[120px]`}>Date</th>
                          {/* <th className={`${dialogTable.headCell} w-1/6 min-w-[80px]`}>Points</th> */}
                          <th className={`${dialogTable.headCell} w-1/6 min-w-[100px]`}>Price</th>
                          <th className={`${dialogTable.headCell} w-1/6 hidden sm:table-cell min-w-[90px]`}>Currency</th>
                          <th className={`${dialogTable.headCell} w-1/6 hidden sm:table-cell min-w-[110px]`}>Payment Type</th>
                          <th className={`${dialogTable.headCell} w-1/6 min-w-[100px]`}>Invoice</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payLogList.map((item) => (
                          <tr key={item.id} className={dialogTable.row}>
                            <td className={`${dialogTable.cell} text-muted-foreground min-w-[120px]`}>{formatTimestamp(item.created_at)}</td>
                            {/* <td className={`${dialogTable.cell} min-w-[80px]`}>
                              <span className={`${dialogTable.pillBase} bg-green-500/20 text-green-400 font-bold`}>
                                {item.amount}
                              </span>
                            </td> */}
                            <td className={`${dialogTable.cell} text-card-foreground font-medium whitespace-nowrap min-w-[100px]`}>
                              {(() => {
                                const mapped = getPriceFromPriceId(item.price_id);
                                if (mapped && mapped !== '-') return mapped;
                                return (
                                  <span className="inline-block max-w-[180px] truncate align-middle" title={item.price_id || '-'}>
                                    {item.price_id || '-'}
                                  </span>
                                );
                              })()}
                            </td>
                            <td className={`${dialogTable.cell} text-card-foreground hidden sm:table-cell min-w-[90px]`}>{item.currency}</td>
                            <td className={`${dialogTable.cell} text-card-foreground hidden sm:table-cell min-w-[110px]`}>{item.pay_type}</td>
                            <td className={`${dialogTable.cell} min-w-[100px]`}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onOpenInvoiceDialog(item.id)}
                                className="h-8 px-3 text-sm whitespace-nowrap"
                              >
                                Invoice
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {payLogTotalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePayLogPageChange(payLogCurrentPage - 1);
                          }}
                          className={payLogCurrentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                      {getPaginationItems(payLogCurrentPage, payLogTotalPages).map((item, index) => (
                        <PaginationItem key={index}>
                          {item === '...' ? (
                            <PaginationEllipsis />
                          ) : (
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handlePayLogPageChange(item as number);
                              }}
                              isActive={item === payLogCurrentPage}
                            >
                              {item}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePayLogPageChange(payLogCurrentPage + 1);
                          }}
                          className={payLogCurrentPage >= payLogTotalPages ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-muted-foreground text-3xl">💳</span>
              </div>
              <p className="text-muted-foreground font-medium text-lg">No payment records yet</p>
              <p className="text-muted-foreground/60 text-sm mt-1">Your payment history will appear here</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

