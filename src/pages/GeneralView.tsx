
import React, { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import DemandForm from '@/components/DemandForm';
import { useSupabaseEventManager } from '@/hooks/useSupabaseEventManager';
import { Demand, Event } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const GeneralView = () => {
  const { 
    isLoading,
    getActiveEvents, 
    getActiveDemands, 
    updateDemand, 
    deleteDemand 
  } = useSupabaseEventManager();
  
  const [editingDemand, setEditingDemand] = useState<Demand | null>(null);
  const [deletingDemandId, setDeletingDemandId] = useState<string | null>(null);

  const events = getActiveEvents();
  const allDemands = getActiveDemands();

  const getEventById = (eventId: string): Event | undefined => {
    return events.find(event => event.id === eventId);
  };

  const truncateText = (text: string, maxLength: number = 30) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const handleEditDemand = (demand: Demand) => {
    setEditingDemand(demand);
  };

  const handleUpdateDemand = async (demandData: any) => {
    if (editingDemand) {
      await updateDemand(editingDemand.id, {
        title: demandData.title,
        subject: demandData.subject,
        date: demandData.date
      });
      setEditingDemand(null);
    }
  };

  const handleDeleteDemand = async (demandId: string) => {
    await deleteDemand(demandId);
    setDeletingDemandId(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full relative">
        <Header />
        <main className="pt-24 px-4 pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="glass rounded-xl p-8 text-center">
              <p className="text-white">Carregando...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative">
      <Header />
      
      <main className="pt-24 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="glass rounded-xl p-6 mb-6 text-left">
            <h2 className="text-2xl font-bold text-white mb-4 text-left">
              Visão Geral - Todas as Demandas
            </h2>
            <p className="text-blue-200/70 text-left">
              Visualize todas as demandas do sistema organizadas por evento
            </p>
          </div>

          <div className="space-y-4">
            {allDemands.map((demand) => {
              const event = getEventById(demand.eventId);
              if (!event) return null;

              return (
                <div key={demand.id} className="glass rounded-xl p-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      {/* Logo do evento */}
                      <div className="w-10 h-10 glass-card rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        {event.logo ? (
                          <img src={event.logo} alt={event.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 bg-blue-500/30 rounded-lg flex items-center justify-center">
                            <span className="text-blue-300 font-bold text-xs">
                              {event.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Nome do evento */}
                      <div className="min-w-0 w-32 text-left">
                        <span className="text-white font-medium text-sm block truncate text-left">
                          {truncateText(event.name, 15)}
                        </span>
                      </div>

                      {/* Nome da demanda */}
                      <div className="min-w-0 flex-1 text-left">
                        <span className="text-blue-200 text-sm block truncate text-left">
                          {truncateText(demand.title, 25)}
                        </span>
                      </div>

                      {/* Assunto da demanda */}
                      <div className="min-w-0 flex-1 text-left">
                        <span className="text-blue-200/70 text-sm block truncate text-left">
                          {truncateText(demand.subject, 30)}
                        </span>
                      </div>

                      {/* Data */}
                      <div className="min-w-0 w-24 text-left">
                        <span className="text-blue-300 text-xs text-left">
                          {demand.date.toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEditDemand(demand)}
                        className="glass-button p-2 rounded-lg hover:bg-blue-500/30 transition-all duration-200"
                        title="Editar demanda"
                      >
                        <Edit size={14} className="text-blue-300" />
                      </button>
                      <button
                        onClick={() => setDeletingDemandId(demand.id)}
                        className="glass-button p-2 rounded-lg hover:bg-red-500/30 transition-all duration-200"
                        title="Excluir demanda"
                      >
                        <Trash2 size={14} className="text-red-300" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {allDemands.length === 0 && (
              <div className="glass rounded-xl p-8 text-left">
                <p className="text-blue-200/70 text-left">Nenhuma demanda encontrada</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal de edição */}
      <Dialog open={!!editingDemand} onOpenChange={() => setEditingDemand(null)}>
        <DialogContent className="glass-popup border-blue-400/40">
          <DialogHeader>
            <DialogTitle className="text-white text-left">Editar Demanda</DialogTitle>
          </DialogHeader>
          {editingDemand && (
            <DemandForm
              eventId={editingDemand.eventId}
              onSubmit={handleUpdateDemand}
              onCancel={() => setEditingDemand(null)}
              initialData={{
                title: editingDemand.title,
                subject: editingDemand.subject,
                date: editingDemand.date
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmação de exclusão */}
      <AlertDialog open={!!deletingDemandId} onOpenChange={() => setDeletingDemandId(null)}>
        <AlertDialogContent className="glass-popup border-blue-400/40">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white text-left">Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-blue-200/70 text-left">
              Tem certeza que deseja excluir esta demanda? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-start space-x-2">
            <AlertDialogCancel className="glass-button">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deletingDemandId && handleDeleteDemand(deletingDemandId)}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-300"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GeneralView;
