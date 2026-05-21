import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Plug, CreditCard, User, FileSignature, Cloud, Bell, Shield, TrendingUp } from 'lucide-react';
import type { Integration } from '../../types/architecture';

interface IntegrationNodeProps {
  data: {
    integration: Integration;
    onClick?: (integration: Integration) => void;
  };
}

const categoryIcons = {
  payments: CreditCard,
  identity: User,
  signature: FileSignature,
  storage: Cloud,
  notifications: Bell,
  risk: Shield,
  marketing: TrendingUp,
};

const categoryColors = {
  payments: 'bg-orange-500 hover:bg-orange-600 border-orange-400',
  identity: 'bg-purple-500 hover:bg-purple-600 border-purple-400',
  signature: 'bg-pink-500 hover:bg-pink-600 border-pink-400',
  storage: 'bg-cyan-500 hover:bg-cyan-600 border-cyan-400',
  notifications: 'bg-yellow-500 hover:bg-yellow-600 border-yellow-400',
  risk: 'bg-red-500 hover:bg-red-600 border-red-400',
  marketing: 'bg-lime-500 hover:bg-lime-600 border-lime-400',
};

export const IntegrationNode = memo(function IntegrationNode({ data }: IntegrationNodeProps) {
  const { integration, onClick } = data;

  const Icon = categoryIcons[integration.category] || Plug;
  const colorClass = categoryColors[integration.category] || 'bg-orange-500 hover:bg-orange-600 border-orange-400';

  return (
    <div
      className={`${colorClass} text-white rounded-xl shadow-lg p-4 min-w-[150px] cursor-pointer transition-colors border-2`}
      onClick={() => onClick?.(integration)}
    >
      <Handle type="target" position={Position.Top} className="!bg-white/50" />

      <div className="flex items-center gap-2 mb-2">
        <Icon size={18} />
        <span className="font-bold text-sm">{integration.name}</span>
      </div>

      <p className="text-xs text-white/80 line-clamp-2">{integration.description}</p>

      <div className="mt-2">
        <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded capitalize">
          {integration.category}
        </span>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-white/50" />
    </div>
  );
});
