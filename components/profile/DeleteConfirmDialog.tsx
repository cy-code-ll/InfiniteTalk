'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ReloadIcon, Cross2Icon } from '@radix-ui/react-icons';
import { useToast } from '@/components/ui/toast-provider';
import { api } from '@/lib/api';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoId: number;
  onDeleteSuccess: () => void;
}

export function DeleteConfirmDialog({ open, onOpenChange, videoId, onDeleteSuccess }: DeleteConfirmDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await api.user.deleteOpus(videoId);
      if ((result as any).code === 200) {
        toast.success('Deleted successfully!');
        onOpenChange(false);
        onDeleteSuccess();
      } else {
        toast.error('Failed to delete: ' + ((result as any).msg || 'Unknown error'));
      }
    } catch (error) {
      toast.error('Failed to delete: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-card-foreground">Delete Work</DialogTitle>
          <p className="text-muted-foreground text-sm mt-2">
            Are you sure you want to delete this work? This action cannot be undone.
          </p>
        </DialogHeader>
        <div className="flex justify-end gap-3 mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <ReloadIcon className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Cross2Icon className="h-4 w-4" />
                Delete
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

