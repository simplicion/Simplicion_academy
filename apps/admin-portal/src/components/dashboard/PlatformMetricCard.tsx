import React from 'react';
import { Card } from '@simplicion/ui';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export interface PlatformMetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
  description?: string;
}

export const PlatformMetricCard: React.FC<PlatformMetricCardProps> = ({
  title,
  value,
  change,
  trend = 'up',
  icon: Icon,
  description,
}) => {
  return (
    <Card className="p-5 flex flex-col justify-between hover:border-slate-300 transition-all shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
        {change && (
          <div className="flex items-center space-x-1.5 mt-1.5">
            <span
              className={`flex items-center text-xs font-bold ${
                trend === 'up'
                  ? 'text-emerald-600'
                  : trend === 'down'
                  ? 'text-rose-600'
                  : 'text-slate-500'
              }`}
            >
              {trend === 'up' && <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />}
              {trend === 'down' && <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
              {change}
            </span>
            {description && <span className="text-[11px] text-slate-400">{description}</span>}
          </div>
        )}
      </div>
    </Card>
  );
};

