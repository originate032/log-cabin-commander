
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Monitor, Play, Square } from 'lucide-react';
import { ProcessedLogEntry, CabinetWorkSession } from '@/types/log';

interface CabinetSelectorProps {
  logs: ProcessedLogEntry[];
  activeCabinet: string | null;
  cabinetSessions: CabinetWorkSession[];
  onStartWork: (cabinetName: string) => void;
  onEndWork: (cabinetName: string) => void;
}

export const CabinetSelector: React.FC<CabinetSelectorProps> = ({
  logs,
  activeCabinet,
  cabinetSessions,
  onStartWork,
  onEndWork,
}) => {
  // Получаем уникальные кабинеты
  const cabinets = Array.from(new Set(logs.map(log => log.cabinetName)));

  const getCabinetStats = (cabinetName: string) => {
    const cabinetLogs = logs.filter(log => log.cabinetName === cabinetName);
    const processedCount = cabinetLogs.filter(log => log.processed).length;
    const errorCount = cabinetLogs.filter(log => log.status === 'Error').length;
    const warnCount = cabinetLogs.filter(log => log.status === 'Warn').length;
    
    return {
      total: cabinetLogs.length,
      processed: processedCount,
      errors: errorCount,
      warnings: warnCount,
    };
  };

  const isInSession = (cabinetName: string) => {
    return cabinetSessions.some(session => session.cabinet_name === cabinetName);
  };

  if (cabinets.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          Управление кабинетами
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cabinets.map((cabinetName) => {
            const stats = getCabinetStats(cabinetName);
            const inSession = isInSession(cabinetName);
            const isActive = activeCabinet === cabinetName;

            return (
              <div
                key={cabinetName}
                className={`p-4 border rounded-lg transition-all ${
                  isActive
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : inSession
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm truncate" title={cabinetName}>
                      {cabinetName}
                    </h3>
                    {inSession && (
                      <Badge variant="secondary" className="text-xs">
                        В работе
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1 text-xs">
                    <Badge variant="outline">{stats.total} логов</Badge>
                    <Badge variant="outline">{stats.processed} обработано</Badge>
                    {stats.errors > 0 && (
                      <Badge variant="destructive">{stats.errors} ошибок</Badge>
                    )}
                    {stats.warnings > 0 && (
                      <Badge variant="secondary">{stats.warnings} предупр.</Badge>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {!inSession ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onStartWork(cabinetName)}
                        className="flex-1"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Взять в работу
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEndWork(cabinetName)}
                        className="flex-1"
                      >
                        <Square className="h-3 w-3 mr-1" />
                        Завершить
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
