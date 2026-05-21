import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Database } from 'lucide-react';
import type { Database as DatabaseType } from '../../types/architecture';

interface DatabaseNodeProps {
  data: {
    database: DatabaseType;
    onClick?: (database: DatabaseType) => void;
  };
}

export const DatabaseNode = memo(function DatabaseNode({ data }: DatabaseNodeProps) {
  const { database, onClick } = data;

  const totalEntities = database.entityGroups.reduce(
    (acc, group) => acc + group.entities.length,
    0
  );

  return (
    <div
      className="bg-emerald-500 text-white rounded-xl shadow-lg p-4 min-w-[160px] cursor-pointer hover:bg-emerald-600 transition-colors border-2 border-emerald-400"
      onClick={() => onClick?.(database)}
    >
      <Handle type="target" position={Position.Top} className="!bg-emerald-300" />

      <div className="flex items-center gap-2 mb-2">
        <Database size={20} />
        <span className="font-bold text-sm">{database.name}</span>
      </div>

      <p className="text-xs text-emerald-100 line-clamp-2">{database.description}</p>

      <div className="mt-2 flex flex-wrap gap-1">
        <span className="text-[10px] bg-emerald-400/50 px-1.5 py-0.5 rounded">
          {database.technology}
        </span>
        <span className="text-[10px] bg-emerald-400/50 px-1.5 py-0.5 rounded">
          {totalEntities} entidades
        </span>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-emerald-300" />
    </div>
  );
});
