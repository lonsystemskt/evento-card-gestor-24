
import React, { useState, useRef, useEffect } from 'react';
import { X, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DemandFormData } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DemandFormProps {
  eventId: string;
  onSubmit: (data: DemandFormData) => void;
  onCancel: () => void;
  initialData?: DemandFormData;
  isModal?: boolean;
}

const DemandForm: React.FC<DemandFormProps> = ({
  eventId,
  onSubmit,
  onCancel,
  initialData,
  isModal = false
}) => {
  const [formData, setFormData] = useState<DemandFormData>({
    title: initialData?.title || '',
    subject: initialData?.subject || '',
    date: initialData?.date || new Date()
  });
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Atualizar dados quando initialData mudar
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        subject: initialData.subject,
        date: initialData.date
      });
    } else {
      setFormData({ title: '', subject: '', date: new Date() });
    }
  }, [initialData]);

  // Fechar modal ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isModal && modalRef.current && !modalRef.current.contains(event.target as Node)) {
        // Verificar se o clique foi no calendário
        if (calendarRef.current && calendarRef.current.contains(event.target as Node)) {
          return;
        }
        // Se o calendário estiver aberto, não fechar o modal
        if (datePickerOpen) {
          return;
        }
        onCancel();
      }
    };

    if (isModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModal, onCancel, datePickerOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.subject.trim()) return;

    onSubmit(formData);
    onCancel();
    
    // Reset form
    setFormData({ title: '', subject: '', date: new Date() });
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, date }));
      setDatePickerOpen(false);
    }
  };

  const formContent = (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title" className="text-white">Título da Demanda</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Digite o título da demanda"
            className="glass-input border-white/20 text-white placeholder:text-white/50"
            required
          />
        </div>

        <div>
          <Label htmlFor="subject" className="text-white">Assunto</Label>
          <Textarea
            id="subject"
            value={formData.subject}
            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            placeholder="Descreva o assunto da demanda"
            className="glass-input border-white/20 text-white placeholder:text-white/50 resize-none"
            rows={3}
            required
          />
        </div>

        <div>
          <Label className="text-white">Data da Demanda</Label>
          <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal glass-input border-white/20 text-white hover:bg-white/10",
                  !formData.date && "text-white/50"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.date ? format(formData.date, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-auto p-0 glass-popup border-blue-400/30 shadow-2xl backdrop-blur-xl z-[10000]" 
              align="start"
              side="top"
              sideOffset={10}
            >
              <div ref={calendarRef} className="pointer-events-auto">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={handleDateSelect}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex space-x-3 pt-4">
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            className="flex-1 glass-input border-white/20 text-white hover:bg-white/10 transition-all duration-200"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="flex-1 glass-button text-white hover:bg-teal-500/40 transition-all duration-200"
          >
            {initialData ? 'Atualizar' : 'Criar Demanda'}
          </Button>
        </div>
      </form>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div ref={modalRef} className="glass-popup rounded-2xl p-6 w-full max-w-md animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white text-left">
              {initialData ? 'Editar Demanda' : 'Nova Demanda'}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              <X size={20} className="text-white" />
            </button>
          </div>
          {formContent}
        </div>
      </div>
    );
  }

  return formContent;
};

export default DemandForm;
