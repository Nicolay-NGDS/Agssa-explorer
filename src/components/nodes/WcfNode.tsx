import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Workflow } from 'lucide-react';
import type { WcfService } from '../../types/architecture';

interface WcfNodeProps {
  data: {
    wcfService: WcfService;
    onClick?: (wcfService: WcfService) => void;
  };
}

export const WcfNode = memo(function WcfNode({ data }: WcfNodeProps) {
  const { wcfService, onClick } = data;

  return (
    <div
      className="bg-violet-500 text-white rounded-xl shadow-lg p-4 min-w-[160px] cursor-pointer hover:bg-violet-600 transition-colors border-2 border-violet-400"
      onClick={() => onClick?.(wcfService)}
    >
      <Handle type="target" position={Position.Top} className="!bg-violet-300" />

      <div className="flex items-center gap-2 mb-2">
        <Workflow size={18} />
        <span className="font-bold text-sm truncate">{wcfService.name}</span>
      </div>

      <p className="text-xs text-violet-100 line-clamp-2">{wcfService.description}</p>

      <div className="mt-2 flex flex-wrap gap-1">
        <span className="text-[10px] bg-violet-400/50 px-1.5 py-0.5 rounded">
          Puerto {wcfService.port}
        </span>
        {wcfService.methods && (
          <span className="text-[10px] bg-violet-400/50 px-1.5 py-0.5 rounded">
            {wcfService.methods.length} métodos
          </span>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-violet-300" />
    </div>
  );
});
