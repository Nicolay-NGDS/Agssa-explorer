import { useState } from 'react';
import { Server, Database, Users, Building2, Briefcase, CreditCard, Shield, FileSignature, Cloud, MessageSquare } from 'lucide-react';

interface Connection {
  from: string;
  to: string;
  label: string;
  description: string;
  type: 'user' | 'system' | 'database' | 'external' | 'wcf';
}

const connections: Connection[] = [
  // User to System
  { from: 'inmobiliaria', to: 'landing', label: 'Usa', description: 'La inmobiliaria usa el portal para generar links y consultar solicitudes', type: 'user' },
  { from: 'arrendatario', to: 'radicacion', label: 'Radica', description: 'El arrendatario completa el formulario de radicación', type: 'user' },
  { from: 'asesor', to: 'portal', label: 'Gestiona', description: 'El asesor usa el portal para cotizar y dar seguimiento', type: 'user' },

  // System to System
  { from: 'landing', to: 'agssa', label: 'Consulta', description: 'Landing consulta datos de inmobiliarias y solicitudes de AGSSA', type: 'system' },
  { from: 'radicacion', to: 'agssa', label: 'Crea solicitud', description: 'Cuando el arrendatario completa el formulario, se crea la solicitud en AGSSA via WCF', type: 'wcf' },
  { from: 'portal', to: 'agssa', label: 'Lee/Escribe', description: 'El portal de asesores consulta y actualiza información en AGSSA', type: 'system' },

  // System to Database
  { from: 'agssa', to: 'bd-agssa', label: 'Principal', description: 'AGSSAsura maneja toda la información: solicitudes, contratos, pólizas, siniestros', type: 'database' },
  { from: 'radicacion', to: 'bd-radicaciones', label: 'Temporal', description: 'Guarda datos del formulario antes de enviar a AGSSA', type: 'database' },
  { from: 'portal', to: 'bd-agssa', label: 'Lee', description: 'Portal consulta directamente la BD AGSSA', type: 'database' },
  { from: 'landing', to: 'bd-agssa', label: 'Lee', description: 'Landing consulta datos de la BD AGSSA', type: 'database' },

  // External integrations
  { from: 'radicacion', to: 'wompi', label: 'Pago', description: 'Procesa el pago del estudio de arrendamiento ($35,000 COP)', type: 'external' },
  { from: 'radicacion', to: 'truvalidate', label: 'Identidad', description: 'Valida identidad con biometría facial y documento', type: 'external' },
  { from: 'radicacion', to: 'masivapp', label: 'SMS', description: 'Envía notificaciones SMS al arrendatario', type: 'external' },
  { from: 'agssa', to: 'zohosign', label: 'Firma', description: 'Envía contratos para firma digital de todas las partes', type: 'external' },
  { from: 'agssa', to: 'aws-s3', label: 'Archivos', description: 'Almacena documentos y contratos firmados', type: 'external' },
];

const externalServices = [
  { id: 'wompi', name: 'Wompi', icon: CreditCard, color: 'orange', desc: 'Pagos' },
  { id: 'truvalidate', name: 'TruValidate', icon: Shield, color: 'purple', desc: 'Identidad' },
  { id: 'masivapp', name: 'MasivApp', icon: MessageSquare, color: 'yellow', desc: 'SMS' },
  { id: 'zohosign', name: 'ZohoSign', icon: FileSignature, color: 'pink', desc: 'Firma' },
  { id: 'aws-s3', name: 'AWS S3', icon: Cloud, color: 'cyan', desc: 'Storage' },
];

export function SimpleArchitectureDiagram() {
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const getNodeConnections = (nodeId: string) => {
    return connections.filter(c => c.from === nodeId || c.to === nodeId);
  };

  const isNodeHighlighted = (nodeId: string) => {
    if (!hoveredNode) return false;
    return hoveredNode === nodeId ||
           connections.some(c =>
             (c.from === hoveredNode && c.to === nodeId) ||
             (c.to === hoveredNode && c.from === nodeId)
           );
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white">
          Diagrama de Arquitectura
        </h2>
        <Legend />
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Pasa el mouse sobre cualquier elemento para ver sus conexiones
      </p>

      <div className="relative">
        {/* Main Grid */}
        <div className="grid grid-cols-5 gap-3" style={{ minHeight: '500px' }}>

          {/* Row 1: External Services (left) + Users (center) */}
          <div className="col-span-1 flex flex-col justify-center gap-2">
            <div className="text-[10px] text-gray-400 uppercase font-semibold mb-1 text-center">Radicación</div>
            {externalServices.slice(0, 3).map(svc => (
              <ExternalNode
                key={svc.id}
                id={svc.id}
                name={svc.name}
                desc={svc.desc}
                icon={svc.icon}
                color={svc.color}
                isHighlighted={isNodeHighlighted(svc.id)}
                onHover={setHoveredNode}
                connections={getNodeConnections(svc.id)}
                onConnectionClick={setSelectedConnection}
              />
            ))}
          </div>

          <div className="col-span-3">
            {/* Users Row */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <UserNode
                id="inmobiliaria"
                icon={<Building2 size={18} />}
                label="Inmobiliaria"
                sublabel="Genera links"
                color="purple"
                isHighlighted={isNodeHighlighted('inmobiliaria')}
                onHover={setHoveredNode}
              />
              <UserNode
                id="arrendatario"
                icon={<Users size={18} />}
                label="Arrendatario"
                sublabel="Radica solicitud"
                color="green"
                isHighlighted={isNodeHighlighted('arrendatario')}
                onHover={setHoveredNode}
              />
              <UserNode
                id="asesor"
                icon={<Briefcase size={18} />}
                label="Asesor"
                sublabel="Da seguimiento"
                color="orange"
                isHighlighted={isNodeHighlighted('asesor')}
                onHover={setHoveredNode}
              />
            </div>

            {/* Arrow Row */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="flex justify-center text-gray-400">↓</div>
              <div className="flex justify-center text-gray-400">↓</div>
              <div className="flex justify-center text-gray-400">↓</div>
            </div>

            {/* Systems Row */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <SystemNode
                id="landing"
                name="Landing"
                tech=".NET 4.7.2"
                stats="9 páginas"
                isHighlighted={isNodeHighlighted('landing')}
                onHover={setHoveredNode}
                connections={getNodeConnections('landing')}
                onConnectionClick={setSelectedConnection}
              />
              <SystemNode
                id="radicacion"
                name="Radicación"
                tech=".NET 8"
                stats="13 controllers"
                isHighlighted={isNodeHighlighted('radicacion')}
                onHover={setHoveredNode}
                connections={getNodeConnections('radicacion')}
                onConnectionClick={setSelectedConnection}
              />
              <SystemNode
                id="portal"
                name="Portal Asesores"
                tech=".NET 8"
                stats="17 endpoints"
                isHighlighted={isNodeHighlighted('portal')}
                onHover={setHoveredNode}
                connections={getNodeConnections('portal')}
                onConnectionClick={setSelectedConnection}
              />
            </div>

            {/* Arrow Row */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="flex justify-center text-blue-400">↘</div>
              <div className="flex justify-center text-blue-400">↓</div>
              <div className="flex justify-center text-blue-400">↙</div>
            </div>

            {/* Central System */}
            <div className="flex justify-center mb-4">
              <SystemNode
                id="agssa"
                name="AGSSAsura"
                tech=".NET 4.8"
                stats="56 páginas • 120 SPs • 9 módulos"
                isHighlighted={isNodeHighlighted('agssa')}
                onHover={setHoveredNode}
                connections={getNodeConnections('agssa')}
                onConnectionClick={setSelectedConnection}
                isMain
              />
            </div>

            {/* Arrow Row */}
            <div className="flex justify-center mb-4">
              <div className="text-emerald-400">↓</div>
            </div>

            {/* Databases Row */}
            <div className="grid grid-cols-2 gap-8">
              <div className="flex justify-end">
                <DatabaseNode
                  id="bd-radicaciones"
                  name="BD Radicaciones"
                  entities={11}
                  isHighlighted={isNodeHighlighted('bd-radicaciones')}
                  onHover={setHoveredNode}
                  connections={getNodeConnections('bd-radicaciones')}
                  onConnectionClick={setSelectedConnection}
                />
              </div>
              <div className="flex justify-start">
                <DatabaseNode
                  id="bd-agssa"
                  name="BD AGSSA"
                  entities={88}
                  isHighlighted={isNodeHighlighted('bd-agssa')}
                  onHover={setHoveredNode}
                  connections={getNodeConnections('bd-agssa')}
                  onConnectionClick={setSelectedConnection}
                />
              </div>
            </div>
          </div>

          {/* External Services (right) - AGSSA */}
          <div className="col-span-1 flex flex-col justify-center gap-2">
            <div className="text-[10px] text-gray-400 uppercase font-semibold mb-1 text-center">AGSSAsura</div>
            {externalServices.slice(3).map(svc => (
              <ExternalNode
                key={svc.id}
                id={svc.id}
                name={svc.name}
                desc={svc.desc}
                icon={svc.icon}
                color={svc.color}
                isHighlighted={isNodeHighlighted(svc.id)}
                onHover={setHoveredNode}
                connections={getNodeConnections(svc.id)}
                onConnectionClick={setSelectedConnection}
              />
            ))}
          </div>
        </div>

        {/* Selected Connection Detail */}
        {selectedConnection && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-blue-700 dark:text-blue-300">{selectedConnection.from}</span>
              <span className="text-blue-400">→</span>
              <span className="font-bold text-blue-700 dark:text-blue-300">{selectedConnection.to}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(selectedConnection.type)}`}>
                {selectedConnection.type}
              </span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">{selectedConnection.description}</p>
            <button
              onClick={() => setSelectedConnection(null)}
              className="mt-2 text-xs text-blue-500 hover:underline"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap gap-3 text-[10px]">
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
        <span className="text-gray-500">Sistema</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
        <span className="text-gray-500">Base de Datos</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
        <span className="text-gray-500">API Externa</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
        <span className="text-gray-500">Usuario</span>
      </div>
    </div>
  );
}

function getTypeColor(type: string) {
  const colors: Record<string, string> = {
    user: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    system: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    database: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
    external: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    wcf: 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300',
  };
  return colors[type] || colors.system;
}

function UserNode({ id, icon, label, sublabel, color, isHighlighted, onHover }: {
  id: string;
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  color: string;
  isHighlighted: boolean;
  onHover: (id: string | null) => void;
}) {
  const colors: Record<string, string> = {
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-700',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-700',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-700',
  };

  return (
    <div
      className={`flex flex-col items-center p-3 rounded-xl border-2 transition-colors cursor-pointer ${colors[color]} ${
        isHighlighted ? 'ring-2 ring-blue-500 shadow-lg' : ''
      }`}
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover(null)}
    >
      {icon}
      <span className="text-sm font-medium mt-1">{label}</span>
      <span className="text-[10px] opacity-70">{sublabel}</span>
    </div>
  );
}

function SystemNode({
  id,
  name,
  tech,
  stats,
  isHighlighted,
  onHover,
  connections,
  onConnectionClick,
  isMain
}: {
  id: string;
  name: string;
  tech: string;
  stats: string;
  isHighlighted: boolean;
  onHover: (id: string | null) => void;
  connections: Connection[];
  onConnectionClick: (conn: Connection) => void;
  isMain?: boolean;
}) {
  return (
    <div
      className="relative"
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover(null)}
    >
      <div
        className={`p-4 rounded-xl border-2 transition-colors cursor-pointer ${
          isMain ? 'min-w-[220px]' : ''
        } ${
          isHighlighted
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-lg ring-2 ring-blue-500'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300'
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          <Server size={isMain ? 22 : 16} className={isMain ? 'text-blue-500' : 'text-gray-500'} />
          <span className={`font-bold ${isMain ? 'text-base' : 'text-sm'} text-gray-800 dark:text-white`}>
            {name}
          </span>
        </div>
        <div className="text-xs text-gray-500">{tech}</div>
        <div className="text-[10px] text-blue-500 dark:text-blue-400 mt-1">{stats}</div>
        {isMain && (
          <div className="mt-2 text-[10px] text-center text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-2">
            ⭐ Sistema Central
          </div>
        )}
      </div>

      {/* Tooltip */}
      {isHighlighted && connections.length > 0 && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl p-3 min-w-[220px]">
          <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Conexiones ({connections.length}):</div>
          <div className="max-h-32 overflow-y-auto">
            {connections.map((conn, i) => (
              <div
                key={i}
                className="text-xs py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2"
                onClick={() => onConnectionClick(conn)}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${
                  conn.type === 'external' ? 'bg-orange-500' :
                  conn.type === 'database' ? 'bg-emerald-500' :
                  conn.type === 'wcf' ? 'bg-violet-500' : 'bg-blue-500'
                }`}></span>
                <span className="text-gray-600 dark:text-gray-400">
                  {conn.from === id ? `→ ${conn.to}` : `← ${conn.from}`}:
                </span>
                <span className="text-gray-800 dark:text-gray-200">{conn.label}</span>
              </div>
            ))}
          </div>
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-gray-800 border-l border-t border-gray-200 dark:border-gray-600 rotate-45"></div>
        </div>
      )}
    </div>
  );
}

function DatabaseNode({
  id,
  name,
  entities,
  isHighlighted,
  onHover,
  connections,
  onConnectionClick
}: {
  id: string;
  name: string;
  entities: number;
  isHighlighted: boolean;
  onHover: (id: string | null) => void;
  connections: Connection[];
  onConnectionClick: (conn: Connection) => void;
}) {
  return (
    <div
      className="relative"
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover(null)}
    >
      <div
        className={`p-3 rounded-xl border-2 transition-colors cursor-pointer ${
          isHighlighted
            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 shadow-lg ring-2 ring-emerald-500'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-emerald-300'
        }`}
      >
        <div className="flex items-center gap-2">
          <Database size={18} className="text-emerald-500" />
          <div>
            <div className="text-sm font-bold text-gray-800 dark:text-white">{name}</div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400">{entities} entidades</div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {isHighlighted && connections.length > 0 && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl p-3 min-w-[180px]">
          <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Usado por:</div>
          {connections.map((conn, i) => (
            <div
              key={i}
              className="text-xs text-emerald-600 dark:text-emerald-400 cursor-pointer hover:underline py-0.5"
              onClick={() => onConnectionClick(conn)}
            >
              ← {conn.from}: {conn.label}
            </div>
          ))}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-600 rotate-45"></div>
        </div>
      )}
    </div>
  );
}

function ExternalNode({
  id,
  name,
  desc,
  icon: Icon,
  color,
  isHighlighted,
  onHover,
  connections,
  onConnectionClick
}: {
  id: string;
  name: string;
  desc: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  isHighlighted: boolean;
  onHover: (id: string | null) => void;
  connections: Connection[];
  onConnectionClick: (conn: Connection) => void;
}) {
  const colors: Record<string, string> = {
    orange: 'border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    purple: 'border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    yellow: 'border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
    pink: 'border-pink-300 dark:border-pink-700 bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400',
    cyan: 'border-cyan-300 dark:border-cyan-700 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400',
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover(null)}
    >
      <div
        className={`p-2 rounded-lg border-2 transition-colors cursor-pointer ${colors[color]} ${
          isHighlighted ? 'ring-2 ring-blue-500 shadow-lg' : ''
        }`}
      >
        <div className="flex items-center gap-2">
          <Icon size={14} />
          <div>
            <div className="text-xs font-bold">{name}</div>
            <div className="text-[10px] opacity-70">{desc}</div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {isHighlighted && connections.length > 0 && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl p-2 min-w-[150px]">
          {connections.map((conn, i) => (
            <div
              key={i}
              className="text-[10px] text-gray-600 dark:text-gray-400 cursor-pointer hover:underline"
              onClick={() => onConnectionClick(conn)}
            >
              ← {conn.from}: {conn.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
