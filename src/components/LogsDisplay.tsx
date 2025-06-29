
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { LogEntry } from './LogEntry';
import { ProcessedLogEntry } from '@/types/log';
import { Filter, Folder, Eye, EyeOff } from 'lucide-react';

interface LogsDisplayProps {
  groupedLogs: { [key: string]: ProcessedLogEntry[] };
  activeCabinet: string | null;
  showProcessed: boolean;
  onShowProcessedChange: (show: boolean) => void;
  onLogProcessedChange: (logId: string, cabinetName: string, processed: boolean) => void;
  onLogCommentChange: (logId: string, cabinetName: string, comment: string) => void;
}

export const LogsDisplay: React.FC<LogsDisplayProps> = ({
  groupedLogs,
  activeCabinet,
  showProcessed,
  onShowProcessedChange,
  onLogProcessedChange,
  onLogCommentChange,
}) => {
  const cabinetNames = Object.keys(groupedLogs);
  const totalLogs = Object.values(groupedLogs).flat().length;

  if (totalLogs === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="text-gray-500 space-y-2">
            <Folder className="h-12 w-12 mx-auto opacity-50" />
            <h3 className="text-lg font-medium">Логи не загружены</h3>
            <p className="text-sm">Загрузите JSON файл с логами для начала работы</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Фильтры */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Фильтры и настройки
            </CardTitle>
            <Badge variant="outline">
              {totalLogs} {totalLogs === 1 ? 'лог' : 'логов'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {showProcessed ? (
                <Eye className="h-4 w-4 text-gray-500" />
              ) : (
                <EyeOff className="h-4 w-4 text-gray-500" />
              )}
              <label className="text-sm font-medium">
                Показывать обработанные логи
              </label>
            </div>
            <Switch
              checked={showProcessed}
              onCheckedChange={onShowProcessedChange}
            />
          </div>
          
          {activeCabinet && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <Badge variant="default">Активный кабинет</Badge>
                <span className="text-sm font-medium">{activeCabinet}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Логи по кабинетам */}
      {cabinetNames.map((cabinetName) => {
        const cabinetLogs = groupedLogs[cabinetName];
        const processedCount = cabinetLogs.filter(log => log.processed).length;
        const errorCount = cabinetLogs.filter(log => log.status === 'Error').length;

        return (
          <Card key={cabinetName}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Folder className="h-5 w-5" />
                  {cabinetName}
                </CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline">
                    {cabinetLogs.length} {cabinetLogs.length === 1 ? 'лог' : 'логов'}
                  </Badge>
                  <Badge variant="secondary">
                    {processedCount} обработано
                  </Badge>
                  {errorCount > 0 && (
                    <Badge variant="destructive">
                      {errorCount} {errorCount === 1 ? 'ошибка' : 'ошибок'}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {cabinetLogs.map((log) => (
                  <LogEntry
                    key={log.log_id}
                    log={log}
                    onProcessedChange={(processed) => 
                      onLogProcessedChange(log.log_id, cabinetName, processed)
                    }
                    onCommentChange={(comment) => 
                      onLogCommentChange(log.log_id, cabinetName, comment)
                    }
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
