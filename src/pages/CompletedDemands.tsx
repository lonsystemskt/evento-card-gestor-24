
import React from 'react';
import { RotateCcw, Trash2, AlertCircle } from 'lucide-react';
import Header from '@/components/Header';
import { useEventManager } from '@/hooks/useEventManager';

const CompletedDemands = () => {
  const { 
    getActiveEvents, 
    getCompletedDemands, 
    updateDemand, 
    deleteDemand 
  } = useEventManager();
  
  const activeEvents = getActiveEvents();
  const completedDemands = getCompletedDemands();

  const handleRestore = (id: string) => {
    updateDemand(id, { isCompleted: false });
  };

  const handlePermanentDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir permanentemente esta demanda? Esta ação não pode ser desfeita.')) {
      deleteDemand(id);
    }
  };

  const groupedDemands = activeEvents.reduce((acc, event) => {
    const eventDemands = completedDemands.filter(demand => demand.eventId === event.id);
    if (eventDemands.length > 0) {
      acc[event.id] = {
        event,
        demands: eventDemands
      };
    }
    return acc;
  }, {} as Record<string, { event: any, demands: any[] }>);

  return (
    <div className="min-h-screen w-full">
      <Header />
      
      <div className="pt-24 px-4">
        <div className="glass rounded-xl p-4 sm:p-6 mb-6 text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-4 text-left">
            Demandas Concluídas
          </h2>
          <p className="text-sm sm:text-base text-blue-200/70 text-left">
            Gerencie suas demandas concluídas organizadas por evento
          </p>
        </div>

        {Object.keys(groupedDemands).length === 0 ? (
          <div className="glass rounded-xl p-8 sm:p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-teal-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={24} className="sm:size-8 text-teal-300" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Nenhuma demanda concluída</h3>
              <p className="text-sm sm:text-base text-blue-200/70">
                As demandas concluídas aparecerão aqui organizadas por evento
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {Object.values(groupedDemands).map(({ event, demands }) => (
              <div key={event.id} className="glass rounded-xl p-4 sm:p-6">
                <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 glass-card rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                    {event.logo ? (
                      <img src={event.logo} alt={event.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-teal-500/30 rounded-lg flex items-center justify-center">
                        <span className="text-teal-300 font-bold text-xs">
                          {event.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium text-sm sm:text-lg truncate">{event.name}</h3>
                    <p className="text-blue-200/70 text-xs sm:text-sm">
                      {demands.length} demanda{demands.length !== 1 ? 's' : ''} concluída{demands.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  {demands.map((demand) => (
                    <div key={demand.id} className="glass-card rounded-md p-2 hover:bg-white/10 transition-all duration-200">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                          <div className="w-1.5 h-1.5 bg-teal-500 rounded-full flex-shrink-0"></div>
                          
                          <div className="flex-1 min-w-0">
                            <span className="text-white font-medium text-xs sm:text-sm truncate block">{demand.title}</span>
                          </div>
                          
                          <div className="hidden sm:block flex-shrink-0 max-w-[120px] lg:max-w-[200px]">
                            <span className="text-blue-200/70 text-xs truncate block">{demand.subject}</span>
                          </div>
                          
                          <div className="flex-shrink-0">
                            <span className="text-teal-300 text-xs whitespace-nowrap">
                              {demand.date.toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          <button
                            onClick={() => handleRestore(demand.id)}
                            className="btn-teal p-1 sm:p-1.5"
                            title="Restaurar demanda"
                          >
                            <RotateCcw size={10} className="sm:size-3 text-teal-300" />
                          </button>
                          
                          <button
                            onClick={() => handlePermanentDelete(demand.id)}
                            className="btn-red p-1 sm:p-1.5"
                            title="Excluir permanentemente"
                          >
                            <Trash2 size={10} className="sm:size-3 text-red-300" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompletedDemands;
