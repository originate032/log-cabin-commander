
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Upload, FileJson, Trash2 } from 'lucide-react';
import { LogEntry } from '@/types/log';
import { toast } from '@/hooks/use-toast';

interface JsonUploaderProps {
  onLogsLoaded: (logs: LogEntry[]) => void;
}

export const JsonUploader: React.FC<JsonUploaderProps> = ({ onLogsLoaded }) => {
  const [jsonText, setJsonText] = useState('');
  const [fileName, setFileName] = useState('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setJsonText(content);
    };
    reader.readAsText(file);
  };

  const parseAndLoadLogs = () => {
    if (!jsonText.trim()) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, загрузите файл или введите JSON",
        variant: "destructive",
      });
      return;
    }

    try {
      const parsed = JSON.parse(jsonText);
      const logs = Array.isArray(parsed) ? parsed : [parsed];
      
      // Валидация логов
      const validLogs = logs.filter(log => log.cabinetName || log.cabinet_name);
      
      if (validLogs.length === 0) {
        toast({
          title: "Ошибка",
          description: "JSON не содержит логов с полем cabinetName",
          variant: "destructive",
        });
        return;
      }

      // Нормализация полей
      const normalizedLogs: LogEntry[] = validLogs.map(log => ({
        ...log,
        cabinetName: log.cabinetName || log.cabinet_name,
      }));

      onLogsLoaded(normalizedLogs);
      
      toast({
        title: "Успех",
        description: `Загружено ${normalizedLogs.length} логов`,
      });
    } catch (error) {
      console.error('JSON parsing error:', error);
      toast({
        title: "Ошибка",
        description: "Некорректный формат JSON",
        variant: "destructive",
      });
    }
  };

  const clearData = () => {
    setJsonText('');
    setFileName('');
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileJson className="h-5 w-5" />
          Загрузка JSON логов
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              id="file-upload"
              type="file"
              accept=".json,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById('file-upload')?.click()}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {fileName || 'Выберите JSON файл'}
            </Button>
          </div>
          {(jsonText || fileName) && (
            <Button variant="outline" size="icon" onClick={clearData}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Или вставьте JSON:</label>
          <Textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder="Вставьте JSON с массивом логов..."
            className="min-h-[120px] font-mono text-sm"
          />
        </div>

        <Button 
          onClick={parseAndLoadLogs}
          className="w-full"
          disabled={!jsonText.trim()}
        >
          <FileJson className="h-4 w-4 mr-2" />
          Загрузить логи
        </Button>
      </CardContent>
    </Card>
  );
};
