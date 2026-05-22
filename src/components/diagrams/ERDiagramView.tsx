import { useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
  Handle,
} from 'reactflow';
import type { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from '@dagrejs/dagre';
import type { Database, Entity } from '../../types/architecture';

interface ERDiagramViewProps {
  database: Database;
}

// Custom node for entities
function EntityNode({ data }: { data: { entity: Entity; groupName: string; dbId: string } }) {
  const { entity, groupName } = data;
  const prefix = entity.name.charAt(0);
  const isCenter = entity.isCenter;

  const groupColors: Record<string, string> = {
    'Personas': 'border-purple-500 bg-purple-50 dark:bg-purple-900/30',
    'Negocio': 'border-blue-500 bg-blue-50 dark:bg-blue-900/30',
    'Inmuebles': 'border-green-500 bg-green-50 dark:bg-green-900/30',
    'Financiero': 'border-amber-500 bg-amber-50 dark:bg-amber-900/30',
    'Configuracion': 'border-gray-500 bg-gray-50 dark:bg-gray-900/30',
    'Integraciones': 'border-pink-500 bg-pink-50 dark:bg-pink-900/30',
    'Radicacion': 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30',
    'Catalogos': 'border-slate-400 bg-slate-100 dark:bg-slate-800/40',
  };

  const colorClass = groupColors[groupName] || 'border-gray-500 bg-gray-50 dark:bg-gray-900/30';

  return (
    <div className={`rounded-lg border-2 shadow-lg min-w-[180px] max-w-[220px] ${colorClass} ${
      isCenter ? 'ring-2 ring-emerald-500 ring-offset-2' : ''
    }`}>
      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-gray-400 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-gray-400 border-2 border-white"
      />
      {/* Header */}
      <div className={`px-3 py-2 border-b ${
        isCenter ? 'bg-emerald-500 text-white' : 'bg-white/50 dark:bg-gray-800/50'
      }`}>
        <div className="flex items-center justify-between gap-2">
          <span className={`font-bold text-sm ${isCenter ? 'text-white' : 'text-gray-800 dark:text-white'}`}>
            {entity.name}
          </span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
            prefix === 'C'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200'
              : prefix === 'T'
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-800 dark:text-amber-200'
              : 'bg-gray-100 text-gray-700'
          }`}>
            {prefix === 'C' ? 'Clase' : prefix === 'T' ? 'Tabla' : prefix}
          </span>
        </div>
        <div className={`text-[10px] ${isCenter ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
          {entity.description}
        </div>
      </div>

      {/* Fields - All fields with scroll */}
      <div className="px-2 py-1 max-h-[200px] overflow-y-auto">
        {entity.fields.map((field, i) => (
          <div
            key={i}
            className={`text-[10px] px-1 py-0.5 ${
              field.startsWith('Id') ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            {field}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-2 py-1 border-t border-gray-200 dark:border-gray-600 bg-white/30 dark:bg-gray-800/30">
        <span className="text-[9px] text-gray-500">{groupName}</span>
      </div>
    </div>
  );
}

const nodeTypes = {
  entity: EntityNode,
};

// Layout using Dagre
function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction: 'TB' | 'LR' = 'LR'
) {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodeWidth = 200;
  const nodeHeight = 280;

  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 50,
    ranksep: 80,
    marginx: 20,
    marginy: 20,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
      targetPosition: direction === 'LR' ? Position.Left : Position.Top,
      sourcePosition: direction === 'LR' ? Position.Right : Position.Bottom,
    };
  });

  return { nodes: layoutedNodes, edges };
}

export function ERDiagramView({ database }: ERDiagramViewProps) {
  // Build nodes from entities
  const initialNodes: Node[] = useMemo(() => {
    const nodes: Node[] = [];

    database.entityGroups.forEach((group) => {
      group.entities.forEach((entity) => {
        nodes.push({
          id: entity.name,
          type: 'entity',
          data: {
            entity,
            groupName: group.name,
            dbId: database.id,
          },
          position: { x: 0, y: 0 },
        });
      });
    });

    return nodes;
  }, [database]);

  // Build edges from relations
  const initialEdges: Edge[] = useMemo(() => {
    if (!database.relations) return [];

    return database.relations.map((relation, index) => ({
      id: `edge-${index}`,
      source: relation.from,
      target: relation.to,
      type: 'default',
      animated: relation.type === '1:N',
      style: {
        stroke: relation.type === '1:1' ? '#10b981' : '#3b82f6',
        strokeWidth: 2,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
    }));
  }, [database.relations]);

  // Apply layout
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(
    () => getLayoutedElements(initialNodes, initialEdges, 'LR'),
    [initialNodes, initialEdges]
  );

  const [nodes, , onNodesChange] = useNodesState(layoutedNodes);
  const [edges, , onEdgesChange] = useEdgesState(layoutedEdges);

  // Legend data
  const groupColors = [
    { name: 'Personas', color: 'bg-purple-500' },
    { name: 'Negocio', color: 'bg-blue-500' },
    { name: 'Inmuebles', color: 'bg-green-500' },
    { name: 'Financiero', color: 'bg-amber-500' },
    { name: 'Configuracion', color: 'bg-gray-500' },
    { name: 'Integraciones', color: 'bg-pink-500' },
    { name: 'Radicacion', color: 'bg-emerald-500' },
    { name: 'Catalogos', color: 'bg-slate-400' },
  ];

  return (
    <div className="h-full w-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        className="bg-gray-50 dark:bg-gray-900"
      >
        <Background color="#e5e7eb" gap={20} />
        <Controls className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700" />
        <MiniMap
          nodeColor={(node) => {
            const groupName = node.data?.groupName;
            const colors: Record<string, string> = {
              'Personas': '#a855f7',
              'Negocio': '#3b82f6',
              'Inmuebles': '#22c55e',
              'Financiero': '#f59e0b',
              'Configuracion': '#6b7280',
              'Integraciones': '#ec4899',
              'Radicacion': '#10b981',
              'Catalogos': '#94a3b8',
            };
            return colors[groupName] || '#6b7280';
          }}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
        />
      </ReactFlow>

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 z-10">
        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Leyenda</h4>

        {/* Groups */}
        <div className="space-y-1 mb-3">
          {groupColors.filter(g =>
            database.entityGroups.some(eg => eg.name === g.name)
          ).map((group) => (
            <div key={group.name} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded ${group.color}`} />
              <span className="text-[10px] text-gray-600 dark:text-gray-400">{group.name}</span>
            </div>
          ))}
        </div>

        {/* Relation types */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-2 space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-emerald-500" />
            <span className="text-[10px] text-gray-600 dark:text-gray-400">1:1 (uno a uno)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-blue-500 relative">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rotate-45" />
            </div>
            <span className="text-[10px] text-gray-600 dark:text-gray-400">1:N (uno a muchos)</span>
          </div>
        </div>

        {/* Center entity */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded ring-2 ring-emerald-500 ring-offset-1 bg-white" />
            <span className="text-[10px] text-gray-600 dark:text-gray-400">Entidad Central</span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 z-10">
        <div className="text-xs text-gray-600 dark:text-gray-400">
          <div><strong>{database.entityGroups.reduce((acc, g) => acc + g.entities.length, 0)}</strong> entidades</div>
          <div><strong>{database.relations?.length || 0}</strong> relaciones</div>
        </div>
        <div className="text-[10px] text-gray-400 mt-1">
          Arrastra para mover • Scroll para zoom
        </div>
      </div>
    </div>
  );
}
