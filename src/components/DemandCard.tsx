
import React from 'react';
import { Edit, Trash2, CheckCircle } from 'lucide-react';
import { Demand, DemandStatus } from '@/types';

interface DemandCardProps {
  demand: Demand;
  onEdit: (demand: Demand) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
}

const DemandCard: React.FC<DemandCardProps> = ({
  demand,
  onEdit,
  onDelete,
  onComplete
}) => {
  const getStatus = (): DemandStatus => {
    const today = new Date();
    const demandDate = new Date(demand.date);
    const diffDays = Math.ceil((demandDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (diffDays < 0) return 'overdue';
    if (diffDays <= 3) return 'current';
    return 'upcoming';
  };

  const getStatusColor = (status: DemandStatus) => {
    switch (status) {
      case 'overdue': return 'bg-red-500';
      case 'current': return 'bg-orange-500';
      case 'upcoming': return 'bg-teal-500';
    }
  };

  const truncateText = (text: string, maxLength: number = 30) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const status = getStatus();

  return (
    <div className="w-[240px] lg:w-[260px] h-[100px] glass-card rounded-lg p-3 flex-shrink-0 relative hover:bg-white/10 transition-all duration-200 will-change-transform">
      <div className="flex items-start justify-between h-full">
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center space-x-2 mb-2">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusColor(status)}`}></div>
            <h4 className="text-sm font-medium text-white truncate-title" title={demand.title}>
              {truncateText(demand.title, 25)}
            </h4>
          </div>
          
          <p className="text-xs text-blue-200/70 mb-2 line-clamp-2 leading-tight truncate-subtitle" title={demand.subject}>
            {demand.subject}
          </p>
          
          <p className="text-xs text-teal-300 font-medium">
            {demand.date.toLocaleDateString('pt-BR')}
          </p>
        </div>
        
        <div className="flex flex-col space-y-1 flex-shrink-0">
          <button
            onClick={() => onEdit(demand)}
            className="btn-teal p-1.5"
            title="Editar demanda"
          >
            <Edit size={12} className="text-teal-300" />
          </button>
          
          <button
            onClick={() => onComplete(demand.id)}
            className="btn-green p-1.5"
            title="Marcar como concluída"
          >
            <CheckCircle size={12} className="text-green-300" />
          </button>
          
          <button
            onClick={() => onDelete(demand.id)}
            className="btn-red p-1.5"
            title="Excluir demanda"
          >
            <Trash2 size={12} className="text-red-300" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemandCard;
