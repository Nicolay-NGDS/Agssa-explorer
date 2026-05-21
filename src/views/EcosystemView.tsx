import { useState } from 'react';
import {
  Server,
  Database,
  Layers,
  FileCode,
  Plug,
  ChevronRight,
  Box,
} from 'lucide-react';
import { useArchitecture } from '../hooks/useArchitecture';
import type { System, Database as DatabaseType } from '../types/architecture';

export function EcosystemView() {
  const { systems, databases, integrations, wcfServices, modules } = useArchitecture();
  const [selectedSystem, setSelectedSystem] = useState<System | null>(null);

  // Get modules for a system
  const getSystemModules = (systemId: string) => {
    return modules.filter(m => m.system === systemId);
  };

  // Get database for a system
  const getSystemDatabase = (dbId: string) => {
    return databases.find(d => d.id === dbId);
  };

  // Get integrations for a system
  const getSystemIntegrations = (integrationIds: string[]) => {
    return integrations.filter(i => integrationIds.includes(i.id));
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Ecosistema AGSSA
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sistema integral de gestión de arriendos con seguros de arrendamiento
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Server size={24} />}
            value={systems.length}
            label="Sistemas"
            color="blue"
          />
          <StatCard
            icon={<Database size={24} />}
            value={databases.reduce((acc, db) => acc + db.entityGroups.reduce((a, g) => a + g.entities.length, 0), 0)}
            label="Entidades"
            color="emerald"
          />
          <StatCard
            icon={<Layers size={24} />}
            value={modules.length}
            label="Módulos"
            color="purple"
          />
          <StatCard
            icon={<Plug size={24} />}
            value={integrations.length + wcfServices.length}
            label="Integraciones"
            color="orange"
          />
        </div>

        {/* Systems Grid */}
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
          Los 4 Sistemas
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {systems.map(system => (
            <SystemCard
              key={system.id}
              system={system}
              modules={getSystemModules(system.id)}
              database={getSystemDatabase(system.database)}
              integrations={getSystemIntegrations(system.integrations)}
              isSelected={selectedSystem?.id === system.id}
              onClick={() => setSelectedSystem(selectedSystem?.id === system.id ? null : system)}
            />
          ))}
        </div>

        {/* Databases Section */}
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
          Bases de Datos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {databases.map(db => (
            <DatabaseCard key={db.id} database={db} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label, color }: {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    orange: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800',
  };

  return (
    <div className={`rounded-xl p-4 border ${colors[color]}`}>
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-sm opacity-80">{label}</div>
        </div>
      </div>
    </div>
  );
}

function SystemCard({
  system,
  modules,
  database,
  integrations,
  isSelected,
  onClick
}: {
  system: System;
  modules: any[];
  database?: DatabaseType;
  integrations: any[];
  isSelected: boolean;
  onClick: () => void;
}) {
  const totalEntities = database?.entityGroups.reduce((acc, g) => acc + g.entities.length, 0) || 0;

  return (
    <div
      className={`bg-white dark:bg-gray-900 rounded-xl border-2 transition-all cursor-pointer ${
        isSelected
          ? 'border-blue-500 shadow-lg'
          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
      }`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
              <Server size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 dark:text-white">{system.name}</h3>
              <p className="text-sm text-gray-500">{system.technology.framework}</p>
            </div>
          </div>
          <ChevronRight
            size={20}
            className={`text-gray-400 transition-transform ${isSelected ? 'rotate-90' : ''}`}
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 line-clamp-2">
          {system.description}
        </p>
      </div>

      {/* Stats */}
      <div className="p-4 grid grid-cols-4 gap-2 text-center">
        {system.stats.pages && (
          <MiniStat value={system.stats.pages} label="Páginas" />
        )}
        {system.stats.controllers && (
          <MiniStat value={system.stats.controllers} label="Controllers" />
        )}
        {system.stats.services && (
          <MiniStat value={system.stats.services} label="Services" />
        )}
        {system.stats.apiEndpoints && (
          <MiniStat value={system.stats.apiEndpoints} label="Endpoints" />
        )}
        {modules.length > 0 && (
          <MiniStat value={modules.length} label="Módulos" />
        )}
        {system.stats.storedProcedures && (
          <MiniStat value={system.stats.storedProcedures} label="SPs" />
        )}
        {totalEntities > 0 && (
          <MiniStat value={totalEntities} label="Entidades" />
        )}
        {integrations.length > 0 && (
          <MiniStat value={integrations.length} label="APIs" />
        )}
      </div>

      {/* Expanded Content */}
      {isSelected && (
        <div className="border-t border-gray-100 dark:border-gray-800 p-4 space-y-4 bg-gray-50 dark:bg-gray-800/50">
          {/* Modules */}
          {modules.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Layers size={16} /> Módulos ({modules.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {modules.map(mod => (
                  <span
                    key={mod.id}
                    className="text-xs bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-lg"
                  >
                    {mod.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Database */}
          {database && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Database size={16} /> Base de Datos
              </h4>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium text-emerald-600 dark:text-emerald-400">{database.name}</span>
                <span className="mx-2">•</span>
                <span>{totalEntities} entidades</span>
              </div>
            </div>
          )}

          {/* Integrations */}
          {integrations.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Plug size={16} /> Integraciones ({integrations.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {integrations.map(int => (
                  <span
                    key={int.id}
                    className="text-xs bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-lg"
                  >
                    {int.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Critical Files */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <FileCode size={16} /> Archivos Críticos
            </h4>
            <div className="space-y-1">
              {system.criticalFiles.slice(0, 3).map((file, i) => (
                <div key={i} className="text-xs text-gray-600 dark:text-gray-400">
                  <code className="text-blue-600 dark:text-blue-400">{file.path}</code>
                  {file.size && <span className="text-gray-400 ml-2">({file.size})</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Box size={16} /> Stack Tecnológico
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-gray-500">UI:</span> <span className="text-gray-700 dark:text-gray-300">{system.technology.ui}</span></div>
              <div><span className="text-gray-500">ORM:</span> <span className="text-gray-700 dark:text-gray-300">{system.technology.orm}</span></div>
              <div className="col-span-2"><span className="text-gray-500">Arquitectura:</span> <span className="text-gray-700 dark:text-gray-300">{system.technology.architecture}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MiniStat({ value, label }: { value: number; label: string }) {
  return (
    <div className="p-2">
      <div className="text-lg font-bold text-gray-800 dark:text-white">{value}</div>
      <div className="text-[10px] text-gray-500 uppercase">{label}</div>
    </div>
  );
}

function DatabaseCard({ database }: { database: DatabaseType }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const totalEntities = database.entityGroups.reduce((acc, g) => acc + g.entities.length, 0);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Database size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 dark:text-white">{database.name}</h3>
              <p className="text-xs text-gray-500">{database.server}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{totalEntities}</div>
              <div className="text-xs text-gray-500">entidades</div>
            </div>
            <ChevronRight
              size={20}
              className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            />
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-100 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-800/50">
          <div className="mb-3 flex flex-wrap gap-2">
            <span className="text-xs text-gray-500">Usado por:</span>
            {database.usedBy.map(sys => (
              <span
                key={sys}
                className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded"
              >
                {sys}
              </span>
            ))}
          </div>

          <div className="space-y-3">
            {database.entityGroups.map(group => (
              <div key={group.name}>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {group.name} <span className="text-gray-400">({group.entities.length})</span>
                </h4>
                <div className="flex flex-wrap gap-1">
                  {group.entities.map(entity => (
                    <span
                      key={entity.name}
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        entity.isCenter
                          ? 'bg-emerald-500 text-white font-medium'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}
                      title={entity.description}
                    >
                      {entity.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
