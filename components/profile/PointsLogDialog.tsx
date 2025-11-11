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
import { ReloadIcon } from '@radix-ui/react-icons';
import { api } from '@/lib/api';
import { TimesLogItem } from './types';
import { formatTimestamp, formatChangeType, getPaginationItems, dialogTable } from './utils';

interface PointsLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PointsLogDialog({ open, onOpenChange }: PointsLogDialogProps) {
  const [timesLogList, setTimesLogList] = useState<TimesLogItem[]>([]);
  const [isLoadingTimesLog, setIsLoadingTimesLog] = useState(false);
  const [timesLogError, setTimesLogError] = useState<string | null>(null);
  const [timesLogCurrentPage, setTimesLogCurrentPage] = useState(1);
  const [timesLogTotalPages, setTimesLogTotalPages] = useState(0);
  const timesLogPageSize = 10;

  const fetchTimesLog = async (page: number) => {
    setIsLoadingTimesLog(true);
    setTimesLogError(null);
    try {
      const result = await api.user.getTimesLog(page, timesLogPageSize);

      if (result.code === 200 && result.data) {
        setTimesLogList(result.data.list || []);
        setTimesLogTotalPages(result.data.total_page || 0);
      } else {
        console.error("Failed to fetch times log:", result.msg || 'Unknown API error');
        setTimesLogList([]);
        setTimesLogTotalPages(0);
        setTimesLogError(result.msg || 'Failed to fetch times log');
      }
    } catch (error) {
      console.error("Failed to fetch times log:", error);
      setTimesLogError(error instanceof Error ? error.message : 'An unknown error occurred fetching times log');
      setTimesLogList([]);
      setTimesLogTotalPages(0);
    } finally {
      setIsLoadingTimesLog(false);
    }
  };

  useEffect(() => {
    if (open) {
      setTimesLogCurrentPage(1);
      fetchTimesLog(1);
    }
  }, [open]);

  const handleTimesLogPageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= timesLogTotalPages && newPage !== timesLogCurrentPage) {
      setTimesLogCurrentPage(newPage);
      fetchTimesLog(newPage);
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
          <DialogTitle className="text-2xl font-semibold text-card-foreground tracking-tight">Points Log</DialogTitle>
          <DialogDescription className="text-muted-foreground mt-2">
            View your points transaction history
          </DialogDescription>
        </DialogHeader>
        <div className="pt-6">
          {isLoadingTimesLog ? (
            <div className="text-center py-12">
              <ReloadIcon className="animate-spin h-8 w-8 text-primary mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">Loading...</p>
            </div>
          ) : timesLogError ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-400 text-2xl">⚠️</span>
              </div>
              <p className="text-red-400 font-medium">Failed to load: {timesLogError}</p>
            </div>
          ) : timesLogList.length > 0 ? (
            <>
              {/* 移动端卡片布局 */}
              <div className="block sm:hidden space-y-3">
                {timesLogList.map((item) => (
                  <div key={item.id} className="bg-muted/30 rounded-lg p-4 border border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Type</span>
                      <span className="text-sm text-card-foreground font-medium">{formatChangeType(item.change_type)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Points</span>
                      <span className={`${dialogTable.pillBase} font-bold ${item.use_limit > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {item.use_limit > 0 ? '+' : ''}{item.use_limit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Date</span>
                      <span className="text-sm text-muted-foreground">{formatTimestamp(item.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* 桌面端表格布局 */}
              <div className="hidden sm:block">
                <div className={dialogTable.wrapper}>
                  <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-muted/30 [&::-webkit-scrollbar-thumb]:bg-muted-foreground/40 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-muted-foreground/60">
                    <table className={dialogTable.table} style={{ minWidth: '600px' }}>
                      <thead>
                        <tr className="border-b border-border">
                          <th className={`${dialogTable.headCell} w-1/3 min-w-[150px]`}>Type</th>
                          <th className={`${dialogTable.headCell} w-1/6 min-w-[100px]`}>Points</th>
                          <th className={`${dialogTable.headCell} w-1/2 min-w-[180px]`}>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {timesLogList.map((item) => (
                          <tr key={item.id} className={dialogTable.row}>
                            <td className={`${dialogTable.cell} text-card-foreground font-medium min-w-[150px]`}>{formatChangeType(item.change_type)}</td>
                            <td className={`${dialogTable.cell} min-w-[100px]`}>
                              <span className={`${dialogTable.pillBase} font-bold ${item.use_limit > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {item.use_limit > 0 ? '+' : ''}{item.use_limit}
                              </span>
                            </td>
                            <td className={`${dialogTable.cell} text-muted-foreground min-w-[180px] whitespace-nowrap`}>{formatTimestamp(item.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {timesLogTotalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handleTimesLogPageChange(timesLogCurrentPage - 1);
                          }}
                          className={timesLogCurrentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                      {getPaginationItems(timesLogCurrentPage, timesLogTotalPages).map((item, index) => (
                        <PaginationItem key={index}>
                          {item === '...' ? (
                            <PaginationEllipsis />
                          ) : (
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handleTimesLogPageChange(item as number);
                              }}
                              isActive={item === timesLogCurrentPage}
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
                            handleTimesLogPageChange(timesLogCurrentPage + 1);
                          }}
                          className={timesLogCurrentPage >= timesLogTotalPages ? 'pointer-events-none opacity-50' : ''}
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
                <span className="text-muted-foreground text-3xl">📊</span>
              </div>
              <p className="text-muted-foreground font-medium text-lg">No points records yet</p>
              <p className="text-muted-foreground/60 text-sm mt-1">Your transaction history will appear here</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

