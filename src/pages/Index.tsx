
import React from 'react';
import { Toaster } from '@/components/ui/toaster';
import { JsonUploader } from '@/components/JsonUploader';
import { CabinetSelector } from '@/components/CabinetSelector';
import { LogsDisplay } from '@/components/LogsDisplay';
import { useLogManagement } from '@/hooks/useLogManagement';

const Index = () => {
  const {
    logs,
    activeCabinet,
    cabinetSessions,
    showProcessed,
    setShowProcessed,
    processLogs,
    updateLogState,
    startCabinetWork,
    endCabinetWork,
    getGroupedLogs,
  } = useLogManagement();

  const handleLogProcessedChange = (logId: string, cabinetName: string, processed: boolean) => {
    updateLogState(logId, cabinetName, { processed });
  };

  const handleLogCommentChange = (logId: string, cabinetName: string, comment: string) => {
    updateLogState(logId, cabinetName, { comment });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Система управления логами
          </h1>
          <p className="text-lg text-gray-600">
            Загрузите, обработайте и управляйте JSON логами с удобным интерфейсом
          </p>
        </div>

        {/* Загрузчик JSON */}
        <JsonUploader onLogsLoaded={processLogs} />

        {/* Селектор кабинетов */}
        {logs.length > 0 && (
          <CabinetSelector
            logs={logs}
            activeCabinet={activeCabinet}
            cabinetSessions={cabinetSessions}
            onStartWork={startCabinetWork}
            onEndWork={endCabinetWork}
          />
        )}

        {/* Отображение логов */}
        <LogsDisplay
          groupedLogs={getGroupedLogs()}
          activeCabinet={activeCabinet}
          showProcessed={showProcessed}
          onShowProcessedChange={setShowProcessed}
          onLogProcessedChange={handleLogProcessedChange}
          onLogCommentChange={handleLogCommentChange}
        />
      </div>
      
      <Toaster />
    </div>
  );
};

export default Index;
