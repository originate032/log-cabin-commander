
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, MessageSquare, Settings } from 'lucide-react';
import { ProcessedLogEntry } from '@/types/log';

interface LogEntryProps {
  log: ProcessedLogEntry;
  onProcessedChange: (processed: boolean) => void;
  onCommentChange: (comment: string) => void;
}

export const LogEntry: React.FC<LogEntryProps> = ({
  log,
  onProcessedChange,
  onCommentChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [comment, setComment] = useState(log.comment || '');

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'error':
        return 'destructive';
      case 'warn':
      case 'warning':
        return 'secondary';
      case 'info':
        return 'outline';
      case 'success':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status?: string) => {
    return status ? '●' : '○';
  };

  const handleCommentBlur = () => {
    if (comment !== log.comment) {
      onCommentChange(comment);
    }
  };

  const displayText = log.summary || log.message || 'Нет описания';

  return (
    <Card className={`mb-3 transition-all ${log.processed ? 'opacity-75 bg-gray-50' : ''}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Основная информация */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                {log.service && (
                  <Badge variant="outline" className="text-xs">
                    <Settings className="h-3 w-3 mr-1" />
                    {log.service}
                  </Badge>
                )}
                {log.status && (
                  <Badge variant={getStatusColor(log.status)} className="text-xs">
                    <span className="mr-1">{getStatusIcon(log.status)}</span>
                    {log.status}
                  </Badge>
                )}
                {log.timestamp && (
                  <Badge variant="outline" className="text-xs">
                    {new Date(log.timestamp).toLocaleString()}
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-gray-700 leading-relaxed">
                {displayText}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                checked={log.processed}
                onCheckedChange={onProcessedChange}
                className="mt-1"
              />
              <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </Collapsible>
            </div>
          </div>

          {/* Комментарий */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">
                Комментарий:
              </label>
            </div>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onBlur={handleCommentBlur}
              placeholder="Добавить комментарий..."
              className="text-sm resize-none"
              rows={2}
            />
          </div>

          {/* Развернутая информация */}
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleContent>
              <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                <h4 className="text-sm font-medium mb-2 text-gray-700">
                  Полный JSON объект:
                </h4>
                <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-64 font-mono">
                  {JSON.stringify(log, null, 2)}
                </pre>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  );
};
