import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Server } from 'lucide-react';
import type { System } from '../../types/architecture';

interface SystemNodeProps {
  data: {
    system: System;
    onClick?: (system: System) => void;
  };
}

export const SystemNode = memo(function SystemNode({ data }: SystemNodeProps) {
  const { system, onClick } = data;

  return (
    <div
      className="bg-blue-500 text-white rounded-xl shadow-lg p-4 min-w-[180px] cursor-pointer hover:bg-blue-600 transition-colors border-2 border-blue-400"
      onClick={() => onClick?.(system)}
    >
      <Handle type="target" position={Position.Top} className="!bg-blue-300" />

      <div className="flex items-center gap-2 mb-2">
        <Server size={20} />
        <span className="font-bold text-sm">{system.shortName}</span>
      </div>

      <p className="text-xs text-blue-100 line-clamp-2">{system.description}</p>

      <div className="mt-2 flex flex-wrap gap-1">
        <span className="text-[10px] bg-blue-400/50 px-1.5 py-0.5 rounded">
          {system.technology.framework}
        </span>
        {system.stats.pages && (
          <span className="text-[10px] bg-blue-400/50 px-1.5 py-0.5 rounded">
            {system.stats.pages} páginas
          </span>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-blue-300" />
    </div>
  );
});
