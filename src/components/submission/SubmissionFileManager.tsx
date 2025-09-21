import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { AuthorFileManager } from '@/components/author/AuthorFileManager';
import { PaymentStatusBadge } from '@/components/payment/PaymentStatusBadge';
import { FileText, User, DollarSign } from 'lucide-react';

interface SubmissionFileManagerProps {
  submissionId: string;
  articleId: string;
  isAuthor: boolean;
  vettingFee: boolean;
  processingFee: boolean;
}

export const SubmissionFileManager = ({ 
  submissionId, 
  articleId, 
  isAuthor, 
  vettingFee, 
  processingFee 
}: SubmissionFileManagerProps) => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Payment Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payment Status
          </CardTitle>
          <CardDescription>
            Current payment status for this submission
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentStatusBadge 
            vettingFee={vettingFee}
            processingFee={processingFee}
          />
        </CardContent>
      </Card>

      {/* File Management for Authors */}
      {/* {isAuthor && (
        <AuthorFileManager 
          articleId={articleId}
          submissionId={submissionId}
        />
      )} */}


        <AuthorFileManager 
          articleId={articleId}
          submissionId={submissionId}
        />

      {/* Submission Info for Non-Authors */}
      {/* {!isAuthor && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Submission Information
            </CardTitle>
            <CardDescription>
              File management is available to authors only
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="text-sm">
                File updates and management are restricted to the corresponding author
              </span>
            </div>
          </CardContent>
        </Card>
      )} */}
    </div>
  );
};