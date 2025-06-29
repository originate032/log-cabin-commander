
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LogEntry, LogState, CabinetWorkSession, ProcessedLogEntry } from '@/types/log';
import { toast } from '@/hooks/use-toast';

export const useLogManagement = () => {
  const [logs, setLogs] = useState<ProcessedLogEntry[]>([]);
  const [logStates, setLogStates] = useState<LogState[]>([]);
  const [activeCabinet, setActiveCabinet] = useState<string | null>(null);
  const [cabinetSessions, setCabinetSessions] = useState<CabinetWorkSession[]>([]);
  const [showProcessed, setShowProcessed] = useState(true);
  const [loading, setLoading] = useState(false);

  // Загрузка состояний логов из Supabase
  const loadLogStates = async () => {
    try {
      const { data, error } = await supabase
        .from('log_states')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setLogStates(data || []);
    } catch (error) {
      console.error('Error loading log states:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить состояния логов",
        variant: "destructive",
      });
    }
  };

  // Загрузка активных сессий работы с кабинетами
  const loadCabinetSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('cabinet_work_sessions')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setCabinetSessions(data || []);
    } catch (error) {
      console.error('Error loading cabinet sessions:', error);
    }
  };

  // Генерация уникального ID для лога
  const generateLogId = (log: LogEntry, index: number): string => {
    return `${log.cabinetName}_${index}_${Date.now()}`;
  };

  // Обработка загруженных JSON логов
  const processLogs = (jsonLogs: LogEntry[]) => {
    const processedLogs: ProcessedLogEntry[] = jsonLogs.map((log, index) => {
      const logId = generateLogId(log, index);
      const existingState = logStates.find(state => 
        state.cabinet_name === log.cabinetName && 
        (state.log_id === logId || state.log_id === log.id?.toString())
      );

      return {
        ...log,
        log_id: logId,
        processed: existingState?.processed || false,
        comment: existingState?.comment,
        in_progress: existingState?.in_progress || false,
      };
    });

    setLogs(processedLogs);
  };

  // Обновление состояния лога
  const updateLogState = async (logId: string, cabinetName: string, updates: Partial<LogState>) => {
    try {
      const { data, error } = await supabase
        .from('log_states')
        .upsert({
          log_id: logId,
          cabinet_name: cabinetName,
          ...updates,
        })
        .select()
        .single();

      if (error) throw error;

      // Обновляем локальное состояние
      setLogStates(prev => {
        const existing = prev.find(state => state.log_id === logId);
        if (existing) {
          return prev.map(state => 
            state.log_id === logId ? { ...state, ...updates } : state
          );
        } else {
          return [...prev, data];
        }
      });

      // Обновляем логи
      setLogs(prev => prev.map(log => 
        log.log_id === logId ? { ...log, ...updates } : log
      ));

    } catch (error) {
      console.error('Error updating log state:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить состояние лога",
        variant: "destructive",
      });
    }
  };

  // Начать работу с кабинетом
  const startCabinetWork = async (cabinetName: string) => {
    try {
      const { data, error } = await supabase
        .from('cabinet_work_sessions')
        .upsert({
          cabinet_name: cabinetName,
        })
        .select()
        .single();

      if (error) throw error;

      setActiveCabinet(cabinetName);
      await loadCabinetSessions();
      
      toast({
        title: "Кабинет взят в работу",
        description: `Начата работа с кабинетом "${cabinetName}"`,
      });
    } catch (error) {
      console.error('Error starting cabinet work:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось взять кабинет в работу",
        variant: "destructive",
      });
    }
  };

  // Завершить работу с кабинетом
  const endCabinetWork = async (cabinetName: string) => {
    try {
      const { error } = await supabase
        .from('cabinet_work_sessions')
        .delete()
        .eq('cabinet_name', cabinetName);

      if (error) throw error;

      setActiveCabinet(null);
      await loadCabinetSessions();
      
      toast({
        title: "Работа завершена",
        description: `Работа с кабинетом "${cabinetName}" завершена`,
      });
    } catch (error) {
      console.error('Error ending cabinet work:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось завершить работу с кабинетом",
        variant: "destructive",
      });
    }
  };

  // Получить отфильтрованные логи
  const getFilteredLogs = () => {
    let filtered = logs;

    // Фильтр по активному кабинету
    if (activeCabinet) {
      filtered = filtered.filter(log => log.cabinetName === activeCabinet);
    }

    // Фильтр по обработанным логам
    if (!showProcessed) {
      filtered = filtered.filter(log => !log.processed);
    }

    return filtered;
  };

  // Группировка логов по кабинетам
  const getGroupedLogs = () => {
    const filtered = getFilteredLogs();
    const grouped: { [key: string]: ProcessedLogEntry[] } = {};

    filtered.forEach(log => {
      if (!grouped[log.cabinetName]) {
        grouped[log.cabinetName] = [];
      }
      grouped[log.cabinetName].push(log);
    });

    return grouped;
  };

  useEffect(() => {
    loadLogStates();
    loadCabinetSessions();
  }, []);

  return {
    logs,
    logStates,
    activeCabinet,
    cabinetSessions,
    showProcessed,
    loading,
    setShowProcessed,
    processLogs,
    updateLogState,
    startCabinetWork,
    endCabinetWork,
    getGroupedLogs,
    getFilteredLogs,
  };
};
