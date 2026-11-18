import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
  description?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  trend = 'up',
  icon: Icon,
  description,
}) => {
  return (
    <div className="p-5 bg-white rounded-xl border border-[#e2e8f0] shadow-sm flex flex-col justify-between min-w-0">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wider truncate">
          {title}
        </span>
        <div className="w-9 h-9 rounded-lg bg-[#eff6ff] text-[#2563eb] flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-4">
        <h3
          className="text-2xl font-bold text-[#0f172a] tracking-tight"
          style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
        >
          {value}
        </h3>
        {change && (
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <span
              className={`flex items-center text-xs font-semibold ${
                trend === 'up'
                  ? 'text-[#059669]'
                  : trend === 'down'
                  ? 'text-[#dc2626]'
                  : 'text-[#64748b]'
              }`}
            >
              {trend === 'up' && <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />}
              {trend === 'down' && <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
              {change}
            </span>
            {description && <span className="text-xs text-[#64748b]">{description}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
