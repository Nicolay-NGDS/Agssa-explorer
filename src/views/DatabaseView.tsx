import { useState, useMemo } from 'react';
import { Database, Table, Search, Server, ChevronDown, ChevronRight, Info, Calendar, GitFork, List } from 'lucide-react';
import { useArchitecture } from '../hooks/useArchitecture';
import { ERDiagramView } from '../components/diagrams/ERDiagramView';
import { NotesPanel, type Note } from '../components/panels/NotesPanel';
import type { Database as DatabaseType, Entity, EntityGroup } from '../types/architecture';

// Notas sobre las bases de datos
const databaseNotes: Note[] = [
  {
    id: 'sync-flow',
    type: 'concept',
    title: '¿Como se sincronizan RADICACIONES y AGSSA?',
    content: 'Las dos bases de datos NO tienen relacion directa (no hay FK entre ellas). La conexion es mediante codigo.',
    details: [
      '1. Usuario completa formulario → datos se guardan en BD RADICACIONES',
      '2. Usuario paga con Wompi → se registra en TPago',
      '3. Wompi envia WEBHOOK con status "APPROVED"',
      '4. RadicacionEnLinea LLAMA al WCF ExternalSolutionService',
      '5. El WCF crea los registros en BD AGSSA (CSolicitudes, CArrendatarioPN, etc.)',
      '6. Se guarda el IdSolicitud en TRadicacione.IdAgssa para vincular ambos registros',
    ],
  },
  {
    id: 'temporal-vs-permanent',
    type: 'info',
    title: '¿Por que RADICACIONES es "temporal"?',
    content: 'RADICACIONES es una "sala de espera" donde los datos permanecen hasta que el proceso se complete exitosamente.',
    details: [
      'Si el pago falla → datos quedan en RADICACIONES, nunca llegan a AGSSA',
      'Si la validacion de identidad falla → igual, nunca llegan a AGSSA',
      'Solo cuando TODO es exitoso → se crea la solicitud en AGSSA',
      'El campo IdAgssa en TRadicacione indica si la radicacion se completo (NULL = no completada)',
    ],
  },
  {
    id: 'data-mapping',
    type: 'tip',
    title: 'Mapeo de datos entre bases de datos',
    content: 'Cuando la sincronizacion ocurre, los datos se transforman de tablas T* a clases C*.',
    details: [
      'TRadicacione → CSolicitudes (solicitud principal)',
      'TInformacionBasica (tipo=Arrendatario) → CArrendatarioPN',
      'TInformacionBasica (tipo=Codeudor) → CCodeudor',
      'TInmueble → CInmueble',
      'TFacturacion → datos de facturacion en la solicitud',
    ],
  },
  {
    id: 'orphan-records',
    type: 'warning',
    title: 'Radicaciones "huerfanas"',
    content: 'Existen muchos registros en RADICACIONES que nunca llegaron a AGSSA.',
    details: [
      'Usuarios que abandonaron el formulario a mitad de proceso',
      'Pagos rechazados o pendientes que nunca se completaron',
      'Validaciones de identidad fallidas',
      'Estos registros quedan en RADICACIONES indefinidamente (sin IdAgssa)',
    ],
  },
];

type ViewTab = 'list' | 'diagram';

export function DatabaseView() {
  const { databases } = useArchitecture();
  const [selectedDb, setSelectedDb] = useState<DatabaseType | null>(databases[0] || null);
  const [activeTab, setActiveTab] = useState<ViewTab>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);

  const filteredGroups = useMemo(() => {
    if (!selectedDb) return [];
    if (!searchTerm) return selectedDb.entityGroups;

    const term = searchTerm.toLowerCase();
    return selectedDb.entityGroups
      .map(group => ({
        ...group,
        entities: group.entities.filter(
          e => e.name.toLowerCase().includes(term) || e.description.toLowerCase().includes(term)
        ),
      }))
      .filter(group => group.entities.length > 0);
  }, [selectedDb, searchTerm]);

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupName)) {
        next.delete(groupName);
      } else {
        next.add(groupName);
      }
      return next;
    });
  };

  const totalEntities = selectedDb?.entityGroups.reduce((acc, g) => acc + g.entities.length, 0) || 0;

  return (
    <div className="h-full flex">
      {/* Sidebar - Database List */}
      <div className="w-72 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
            <Database size={20} />
            Bases de Datos
          </h2>
        </div>

        <div className="flex-1 p-2 overflow-y-auto">
          {databases.map(db => {
            const entityCount = db.entityGroups.reduce((acc, g) => acc + g.entities.length, 0);
            return (
              <button
                key={db.id}
                onClick={() => {
                  setSelectedDb(db);
                  setSelectedEntity(null);
                  setSearchTerm('');
                }}
                className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${
                  selectedDb?.id === db.id
                    ? 'bg-emerald-50 dark:bg-emerald-900/30 border-l-4 border-emerald-500'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className="font-medium text-gray-800 dark:text-white">{db.name}</div>
                <div className="text-xs text-gray-500 mt-1">{db.server}</div>
                <div className="text-xs text-emerald-500 mt-1">{entityCount} entidades</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-950">
        {selectedDb ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h1 className="text-xl font-bold text-gray-800 dark:text-white">{selectedDb.name}</h1>
                  <p className="text-sm text-gray-500">{selectedDb.description}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-500">{totalEntities}</div>
                    <div className="text-xs text-gray-500">Entidades</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">{selectedDb.entityGroups.length}</div>
                    <div className="text-xs text-gray-500">Grupos</div>
                  </div>
                </div>
              </div>

              {/* Used By */}
              <div className="flex items-center gap-2 mb-3">
                <Server size={14} className="text-gray-400" />
                <span className="text-xs text-gray-500">Usado por:</span>
                {selectedDb.usedBy.map(sys => (
                  <span
                    key={sys}
                    className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded"
                  >
                    {sys}
                  </span>
                ))}
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={() => setActiveTab('list')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'list'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <List size={16} />
                  Lista de Entidades
                </button>
                <button
                  onClick={() => setActiveTab('diagram')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'diagram'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <GitFork size={16} />
                  Diagrama ER
                </button>
              </div>

              {/* Search - only show in list view */}
              {activeTab === 'list' && (
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar entidad..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}
            </div>

            {/* Content based on active tab */}
            {activeTab === 'list' ? (
              /* Entity Groups - List View */
              <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Groups List */}
                <div className="space-y-2">
                  {filteredGroups.map(group => (
                    <EntityGroupCard
                      key={group.name}
                      group={group}
                      isExpanded={expandedGroups.has(group.name)}
                      onToggle={() => toggleGroup(group.name)}
                      onSelectEntity={setSelectedEntity}
                      selectedEntity={selectedEntity}
                    />
                  ))}
                </div>

                {/* Entity Detail */}
                <div className="lg:sticky lg:top-0">
                  {selectedEntity ? (
                    <EntityDetail entity={selectedEntity} />
                  ) : (
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-8 text-center text-gray-400 border border-gray-200 dark:border-gray-700">
                      <Table size={48} className="mx-auto mb-3 opacity-50" />
                      <p>Selecciona una entidad para ver sus campos</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Nomenclature Legend */}
              <NomenclatureLegend dbId={selectedDb.id} />

              {/* Notes Panel */}
              <NotesPanel
                title="Conceptos Clave sobre Bases de Datos"
                notes={databaseNotes}
              />
            </div>
            ) : (
              /* Diagram View */
              <div className="flex-1 overflow-hidden">
                <ERDiagramView key={selectedDb.id} database={selectedDb} />
              </div>
            )}
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            Selecciona una base de datos
          </div>
        )}
      </div>
    </div>
  );
}

function EntityGroupCard({
  group,
  isExpanded,
  onToggle,
  onSelectEntity,
  selectedEntity,
}: {
  group: EntityGroup;
  isExpanded: boolean;
  onToggle: () => void;
  onSelectEntity: (entity: Entity) => void;
  selectedEntity: Entity | null;
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDown size={18} className="text-gray-400" />
          ) : (
            <ChevronRight size={18} className="text-gray-400" />
          )}
          <span className="font-semibold text-gray-800 dark:text-white">{group.name}</span>
          <span className="text-xs bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
            {group.entities.length}
          </span>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-800/50">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
            {group.entities.map(entity => (
              <button
                key={entity.name}
                onClick={() => onSelectEntity(entity)}
                className={`text-left p-2 rounded-lg text-sm transition-colors ${
                  selectedEntity?.name === entity.name
                    ? 'bg-emerald-500 text-white'
                    : entity.isCenter
                    ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="truncate block">{entity.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EntityDetail({ entity }: { entity: Entity }) {
  // Determinar el prefijo de la entidad
  const prefix = entity.name.charAt(0);
  const isClassPrefix = prefix === 'C';
  const isTablePrefix = prefix === 'T';

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <Table size={20} className="text-emerald-500" />
        <h3 className="font-bold text-lg text-gray-800 dark:text-white">{entity.name}</h3>
        {entity.isCenter && (
          <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">
            Entidad Central
          </span>
        )}
        {/* Prefix indicator */}
        {(isClassPrefix || isTablePrefix) && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            isClassPrefix
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
              : 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300'
          }`}>
            {isClassPrefix ? 'C = Clase' : 'T = Tabla'}
          </span>
        )}
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{entity.description}</p>

      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        Campos ({entity.fields.length})
      </h4>

      <div className="max-h-96 overflow-y-auto">
        <div className="space-y-1">
          {entity.fields.map((field, i) => (
            <div
              key={i}
              className={`text-sm px-3 py-1.5 rounded ${
                i % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800' : ''
              }`}
            >
              <code className="text-emerald-600 dark:text-emerald-400">{field}</code>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NomenclatureLegend({ dbId }: { dbId: string }) {
  const isAgssa = dbId === 'agssa';
  const isRadicaciones = dbId === 'radicaciones';

  return (
    <div className="mt-6 bg-linear-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-start gap-3">
        <Info size={20} className="text-blue-500 mt-0.5 shrink-0" />
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-3">
            Nomenclatura de Entidades
          </h4>

          {/* Nomenclature Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* AGSSA Convention */}
            <div className={`p-3 rounded-lg border ${
              isAgssa
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">C</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">= Clase (Class)</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Usado en <strong>BD AGSSA</strong>
              </p>
              <div className="flex flex-wrap gap-1">
                <code className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 px-1.5 py-0.5 rounded">CSolicitudes</code>
                <code className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 px-1.5 py-0.5 rounded">CContrato</code>
                <code className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 px-1.5 py-0.5 rounded">CRenovacion</code>
              </div>
            </div>

            {/* RADICACIONES Convention */}
            <div className={`p-3 rounded-lg border ${
              isRadicaciones
                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg font-bold text-amber-600 dark:text-amber-400">T</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">= Tabla (Table)</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Usado en <strong>BD RADICACIONES</strong>
              </p>
              <div className="flex flex-wrap gap-1">
                <code className="text-xs bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-200 px-1.5 py-0.5 rounded">TRadicacione</code>
                <code className="text-xs bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-200 px-1.5 py-0.5 rounded">TPago</code>
                <code className="text-xs bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-200 px-1.5 py-0.5 rounded">TInmueble</code>
              </div>
            </div>
          </div>

          {/* Historical Context */}
          <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={16} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Contexto Historico</span>
            </div>
            <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-start gap-2">
                <span className="font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">2015-2018</span>
                <span>
                  <strong>AGSSAsura</strong> fue desarrollado en .NET Framework 4.8.
                  Usa <em>Notacion Hungara</em> donde "C" indica una Clase del modelo de entidades
                  (ej: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">CContrato</code> = Clase Contrato).
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-amber-600 dark:text-amber-400 whitespace-nowrap">2024</span>
                <span>
                  <strong>RadicacionEnLinea</strong> fue desarrollado en .NET 8 con Entity Framework Core.
                  Usa convencion moderna donde "T" indica una Tabla de la base de datos
                  (ej: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">TRadicacione</code> = Tabla Radicaciones).
                </span>
              </div>
            </div>
          </div>

          {/* Note */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 italic">
            Ambas convenciones son validas y reflejan las practicas de desarrollo de cada epoca.
            La "C" y "T" ayudan a identificar rapidamente de que sistema proviene cada entidad.
          </p>
        </div>
      </div>
    </div>
  );
}
