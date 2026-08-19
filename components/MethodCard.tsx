import React from 'react';
import { IntegrationMethod } from '../types';
import { ArrowRight } from 'lucide-react';

interface MethodCardProps {
  method: IntegrationMethod;
  isSelected: boolean;
  onSelect: (id: IntegrationMethod['id']) => void;
}

export const MethodCard: React.FC<MethodCardProps> = ({ method, isSelected, onSelect }) => {
  return (
    <div
      id={`method-card-${method.id}`}
      onClick={() => onSelect(method.id)}
      className={`cursor-pointer rounded-xl border p-5 transition-all duration-200 flex flex-col justify-between ${
        isSelected
          ? 'border-emerald-500 bg-zinc-900 shadow-lg shadow-emerald-950/20 ring-1 ring-emerald-500/40'
          : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/80'
      }`}
    >
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span
            id={`badge-${method.id}`}
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${method.badgeColor}`}
          >
            {method.badge}
          </span>
          <span className="text-[11px] text-zinc-400 font-medium">
            Dificuldade: <span className="font-semibold text-zinc-200">{method.difficulty}</span>
          </span>
        </div>

        <h3 className="text-base font-bold text-zinc-100 mb-1.5">{method.title}</h3>
        <p className="text-xs text-zinc-400 mb-4 leading-relaxed">{method.subtitle}</p>

        <div className="space-y-2 text-xs text-zinc-400 border-t border-zinc-800/80 pt-3">
          <div>
            <strong className="text-zinc-300">Ideal para:</strong> {method.idealFor}
          </div>
          <div>
            <strong className="text-zinc-300">Custo:</strong> {method.cost}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs font-semibold pt-3 border-t border-zinc-800/80">
        <span className={isSelected ? 'text-emerald-400' : 'text-zinc-500'}>
          {isSelected ? 'Método Ativo' : 'Ver Detalhes'}
        </span>
        <ArrowRight
          className={`w-3.5 h-3.5 transition-transform ${
            isSelected ? 'text-emerald-400 translate-x-1' : 'text-zinc-600'
          }`}
        />
      </div>
    </div>
  );
};
