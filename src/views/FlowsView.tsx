import { useState, useMemo } from 'react';
import { GitBranch, ChevronRight, Database, ArrowRightLeft, Circle } from 'lucide-react';
import { useArchitecture } from '../hooks/useArchitecture';
import type { Flow, FlowStep } from '../types/architecture';

export function FlowsView() {
  const { flows, systems, databases } = useArchitecture();
  const [selectedFlow, setSelectedFlow] = useState<Flow | null>(flows[0] || null);

  const systemsMap = useMemo(() => {
    const map: Record<string, string> = {};
    systems.forEach(s => {
      map[s.id] = s.shortName;
    });
    return map;
  }, [systems]);

  const databasesMap = useMemo(() => {
    const map: Record<string, string> = {};
    databases.forEach(db => {
      map[db.id] = db.name;
    });
    return map;
  }, [databases]);

  return (
    <div className="h-full flex">
      {/* Sidebar - Flow List */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-y-auto flex-shrink-0">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
            <GitBranch size={20} />
            Flujos de Negocio
          </h2>
          <p className="text-sm text-gray-500 mt-1">{flows.length} flujos documentados</p>
        </div>

        <div className="p-2">
          {flows.map(flow => (
            <button
              key={flow.id}
              onClick={() => setSelectedFlow(flow)}
              className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${
                selectedFlow?.id === flow.id
                  ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className="font-medium text-gray-800 dark:text-white">{flow.name}</div>
              <div className="text-xs text-gray-500 mt-1 line-clamp-2">{flow.description}</div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-blue-500">{flow.steps.length} pasos</span>
                {flow.involvedDatabases && flow.involvedDatabases.length > 1 && (
                  <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded">
                    Multi-BD
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content - Flow Detail */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-6">
        {selectedFlow ? (
          <FlowDetail
            flow={selectedFlow}
            systemsMap={systemsMap}
            databasesMap={databasesMap}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            Selecciona un flujo para ver los detalles
          </div>
        )}
      </div>
    </div>
  );
}

function FlowDetail({
  flow,
  systemsMap,
  databasesMap
}: {
  flow: Flow;
  systemsMap: Record<string, string>;
  databasesMap: Record<string, string>;
}) {
  // Determinar si el flujo usa múltiples BDs
  const isMultiDb = flow.involvedDatabases && flow.involvedDatabases.length > 1;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{flow.name}</h1>
        <p className="text-gray-600 dark:text-gray-300">{flow.description}</p>

        {/* Data Flow Summary - NUEVO */}
        {flow.dataFlowSummary && (
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Database className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" size={20} />
              <div>
                <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">
                  Flujo de Datos
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-200">
                  {flow.dataFlowSummary}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Involved Databases - NUEVO */}
        {flow.involvedDatabases && flow.involvedDatabases.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-3">
            {flow.involvedDatabases.map((db, idx) => (
              <div
                key={db.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  db.role === 'temporal'
                    ? 'bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700'
                    : db.role === 'permanente'
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-700'
                    : 'bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600'
                }`}
              >
                <Database size={16} className={
                  db.role === 'temporal'
                    ? 'text-amber-600 dark:text-amber-400'
                    : db.role === 'permanente'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-gray-600 dark:text-gray-400'
                } />
                <div>
                  <span className={`text-sm font-medium ${
                    db.role === 'temporal'
                      ? 'text-amber-800 dark:text-amber-200'
                      : db.role === 'permanente'
                      ? 'text-emerald-800 dark:text-emerald-200'
                      : 'text-gray-800 dark:text-gray-200'
                  }`}>
                    {databasesMap[db.id] || db.id}
                  </span>
                  <span className={`text-xs ml-2 ${
                    db.role === 'temporal'
                      ? 'text-amber-600 dark:text-amber-400'
                      : db.role === 'permanente'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-gray-500'
                  }`}>
                    ({db.role})
                  </span>
                </div>
                {idx < flow.involvedDatabases!.length - 1 && (
                  <ArrowRightLeft size={14} className="text-gray-400 ml-2" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* States */}
        {flow.states && flow.states.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Estados</h3>
            <div className="flex flex-wrap gap-2">
              {flow.states.map(state => (
                <span
                  key={state}
                  className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full"
                >
                  {state}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* SubStates */}
        {flow.subStates && flow.subStates.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Sub-Estados</h3>
            <div className="flex flex-wrap gap-2">
              {flow.subStates.map(subState => (
                <span
                  key={subState}
                  className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full"
                >
                  {subState}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {flow.results && flow.results.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Resultados Posibles</h3>
            <div className="flex flex-wrap gap-2">
              {flow.results.map(result => (
                <span
                  key={result}
                  className="text-xs bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-full"
                >
                  {result}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Swim Lanes View for Multi-DB flows */}
      {isMultiDb ? (
        <SwimLanesView
          flow={flow}
          systemsMap={systemsMap}
        />
      ) : (
        /* Simple Timeline for single-DB flows */
        <div className="space-y-4">
          {flow.steps.map((step, index) => (
            <StepCard
              key={step.order}
              step={step}
              systemName={systemsMap[step.system] || step.system}
              isLast={index === flow.steps.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SwimLanesView({
  flow,
  systemsMap,
}: {
  flow: Flow;
  systemsMap: Record<string, string>;
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden">
      {/* Swim Lane Headers */}
      <div className="grid grid-cols-2 border-b border-gray-200 dark:border-gray-700">
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border-r border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Database size={18} className="text-amber-600 dark:text-amber-400" />
            <span className="font-semibold text-amber-800 dark:text-amber-200">BD RADICACIONES</span>
            <span className="text-xs text-amber-600 dark:text-amber-400 ml-1">(Temporal)</span>
          </div>
        </div>
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20">
          <div className="flex items-center gap-2">
            <Database size={18} className="text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold text-emerald-800 dark:text-emerald-200">BD AGSSA</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 ml-1">(Permanente)</span>
          </div>
        </div>
      </div>

      {/* Steps in Swim Lanes */}
      <div className="relative">
        {flow.steps.map((step, index) => {
          const isSync = step.dbOperation === 'sync';
          const isRadicaciones = step.database === 'radicaciones';
          const isAgssa = step.database === 'agssa';
          const isNoDb = !step.database;

          return (
            <div key={step.order} className="relative">
              {/* Connection line */}
              {index < flow.steps.length - 1 && (
                <div className="absolute left-1/2 bottom-0 w-px h-4 bg-gray-300 dark:bg-gray-600 transform -translate-x-1/2 translate-y-full z-0" />
              )}

              <div className={`grid grid-cols-2 ${
                isSync
                  ? 'bg-gradient-to-r from-amber-100 via-blue-100 to-emerald-100 dark:from-amber-900/30 dark:via-blue-900/30 dark:to-emerald-900/30'
                  : ''
              }`}>
                {/* Left Lane (RADICACIONES) */}
                <div className={`p-4 border-r border-b border-gray-200 dark:border-gray-700 min-h-[100px] ${
                  isRadicaciones && !isSync ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''
                }`}>
                  {(isRadicaciones || isSync) && (
                    <SwimLaneStep
                      step={step}
                      systemName={systemsMap[step.system] || step.system}
                      side="left"
                      isSync={isSync}
                    />
                  )}
                  {isNoDb && index === 0 && (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                      <Circle size={8} className="mr-2" />
                      Inicio
                    </div>
                  )}
                </div>

                {/* Right Lane (AGSSA) */}
                <div className={`p-4 border-b border-gray-200 dark:border-gray-700 min-h-[100px] ${
                  isAgssa && !isSync ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''
                }`}>
                  {(isAgssa || isSync) && (
                    <SwimLaneStep
                      step={step}
                      systemName={systemsMap[step.system] || step.system}
                      side="right"
                      isSync={isSync}
                    />
                  )}
                </div>
              </div>

              {/* Sync Arrow */}
              {isSync && (
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                    <ArrowRightLeft size={14} />
                    SYNC
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SwimLaneStep({
  step,
  systemName,
  side,
  isSync
}: {
  step: FlowStep;
  systemName: string;
  side: 'left' | 'right';
  isSync: boolean;
}) {
  const systemColors: Record<string, string> = {
    'AGSSA': 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
    'Radicacion': 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300',
    'Portal Asesores': 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300',
    'Landing': 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
  };

  return (
    <div className={`relative ${side === 'right' && isSync ? 'pl-8' : ''} ${side === 'left' && isSync ? 'pr-8' : ''}`}>
      {/* Step Number */}
      <div className={`absolute ${side === 'left' ? '-left-2' : '-left-2'} top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
        isSync
          ? 'bg-blue-500 text-white'
          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
      }`}>
        {step.order}
      </div>

      <div className="ml-6">
        {/* System Badge */}
        <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded mb-1 ${
          systemColors[systemName] || 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
        }`}>
          {systemName}
        </span>

        {/* Action */}
        <h4 className="font-semibold text-gray-800 dark:text-white text-sm">{step.action}</h4>

        {/* Detail */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{step.detail}</p>

        {/* Entity Badge */}
        {step.entity && (
          <div className="mt-2 flex flex-wrap gap-1">
            {step.entity.split(', ').map(entity => (
              <span
                key={entity}
                className={`text-[10px] px-1.5 py-0.5 rounded ${
                  step.database === 'radicaciones'
                    ? 'bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200'
                    : 'bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200'
                }`}
              >
                {entity}
              </span>
            ))}
          </div>
        )}

        {/* Technical Badges */}
        <div className="flex flex-wrap gap-1 mt-2">
          {step.sp && <TechBadge label="SP" value={step.sp} />}
          {step.controller && <TechBadge label="Ctrl" value={step.controller} />}
          {step.service && <TechBadge label="Svc" value={step.service} />}
          {step.wcf && <TechBadge label="WCF" value={step.wcf} />}
        </div>
      </div>
    </div>
  );
}

function StepCard({
  step,
  systemName,
  isLast
}: {
  step: FlowStep;
  systemName: string;
  isLast: boolean;
}) {
  const systemColors: Record<string, string> = {
    'AGSSA': 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
    'Radicacion': 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
    'Portal Asesores': 'border-orange-500 bg-orange-50 dark:bg-orange-900/20',
    'Landing': 'border-purple-500 bg-purple-50 dark:bg-purple-900/20',
  };

  const colorClass = systemColors[systemName] || 'border-gray-500 bg-gray-50 dark:bg-gray-900/20';
  const isSync = step.dbOperation === 'sync';

  return (
    <div className="relative">
      {/* Connector Line */}
      {!isLast && (
        <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 -mb-4" />
      )}

      <div className={`relative border-l-4 ${colorClass} rounded-lg p-4 ml-3 ${
        isSync ? 'ring-2 ring-blue-400 dark:ring-blue-500' : ''
      }`}>
        {/* Step Number */}
        <div className={`absolute -left-5 top-4 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
          isSync
            ? 'bg-blue-500 border-blue-500 text-white'
            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
        }`}>
          <span className={`text-sm font-bold ${isSync ? '' : 'text-gray-600 dark:text-gray-300'}`}>
            {step.order}
          </span>
        </div>

        <div className="ml-4">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded">
              {systemName}
            </span>
            <ChevronRight size={14} className="text-gray-400" />
            <span className="font-semibold text-gray-800 dark:text-white">{step.action}</span>

            {/* Database Badge - NUEVO */}
            {step.database && (
              <span className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 ${
                step.database === 'radicaciones'
                  ? 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300'
                  : 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
              }`}>
                <Database size={10} />
                {step.database === 'radicaciones' ? 'RADICACIONES' : 'AGSSA'}
              </span>
            )}

            {/* Sync Badge */}
            {isSync && (
              <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded flex items-center gap-1">
                <ArrowRightLeft size={10} />
                SYNC
              </span>
            )}
          </div>

          {/* Detail */}
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{step.detail}</p>

          {/* Entity Badge - NUEVO */}
          {step.entity && (
            <div className="mb-3">
              <span className="text-xs text-gray-500 mr-2">Entidades:</span>
              {step.entity.split(', ').map(entity => (
                <span
                  key={entity}
                  className={`text-xs px-1.5 py-0.5 rounded mr-1 ${
                    step.database === 'radicaciones'
                      ? 'bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200'
                      : 'bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200'
                  }`}
                >
                  {entity}
                </span>
              ))}
            </div>
          )}

          {/* Technical Details */}
          <div className="flex flex-wrap gap-2">
            {step.sp && (
              <TechBadge label="SP" value={step.sp} color="emerald" />
            )}
            {step.controller && (
              <TechBadge label="Controller" value={step.controller} color="blue" />
            )}
            {step.service && (
              <TechBadge label="Service" value={step.service} color="purple" />
            )}
            {step.page && (
              <TechBadge label="Page" value={step.page} color="orange" />
            )}
            {step.method && (
              <TechBadge label="Method" value={step.method} color="cyan" />
            )}
            {step.integration && (
              <TechBadge label="API" value={step.integration} color="pink" />
            )}
            {step.wcf && (
              <TechBadge label="WCF" value={step.wcf} color="violet" />
            )}
            {step.endpoint && (
              <TechBadge label="Endpoint" value={step.endpoint} color="yellow" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TechBadge({ label, value, color = 'gray' }: { label: string; value: string; color?: string }) {
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300',
    blue: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
    purple: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
    orange: 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300',
    cyan: 'bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300',
    pink: 'bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300',
    violet: 'bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300',
    yellow: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
    gray: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
  };

  return (
    <span className={`text-[10px] px-2 py-0.5 rounded ${colors[color]}`}>
      <span className="font-semibold">{label}:</span> {value}
    </span>
  );
}
