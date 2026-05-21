import { useState } from 'react';
import { LayoutGrid, Database, FileText, Users, Building, CreditCard, AlertTriangle, RefreshCw, Briefcase, Settings, ChevronRight } from 'lucide-react';

interface Module {
  id: string;
  code: number;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  pages: string[];
  entities: string[];
  storedProcedures: string[];
}

// NOTA: Entidades verificadas directamente en el codigo fuente de AGSSAsura
// Muchos modulos acceden a datos adicionales via DataTables/StoredProcedures
// que no se reflejan aqui (ej: Siniestros muestra datos de Contrato via SP)
const modules: Module[] = [
  {
    id: 'cotizaciones',
    code: 4,
    name: 'Cotizaciones',
    description: 'Creacion y gestion de cotizaciones de seguros de arrendamiento',
    icon: FileText,
    color: 'blue',
    pages: ['Cotizacion.aspx', 'Cotizaciones_4.aspx', 'Cotizaciones_Impresion.aspx'],
    entities: ['CCotizacion'],
    storedProcedures: ['P_InsertarCotizacion', 'P_ListarCotizacionByDocumento', 'P_ListarCotizacionById'],
  },
  {
    id: 'solicitudes',
    code: 5,
    name: 'Solicitudes',
    description: 'Gestion de solicitudes de arrendamiento - centro del sistema',
    icon: Briefcase,
    color: 'emerald',
    pages: ['Solicitudes_5.aspx', 'Solicitudes_6.aspx', 'Solicitudes_7.aspx', 'Solicitudes_8.aspx'],
    entities: ['CSolicitudes', 'CArrendador', 'CArrendatario', 'CDirecciones', 'CInmueble', 'CValidacionIdentidad', 'CPolizaColectiva'],
    storedProcedures: ['P_CrearSolicitud', 'P_ListarSolicitud6', 'P_ListarSolicitud7', 'P_FiltroSolicitudP5'],
  },
  {
    id: 'analisis',
    code: 10,
    name: 'Analisis de Riesgo',
    description: 'Evaluacion de riesgo con motor de decision automatico',
    icon: Users,
    color: 'purple',
    pages: ['Analisis_10.aspx', 'Analisis_10A.aspx', 'Analisis_11.aspx'],
    entities: ['CAnalisis', 'CSolicitudes', 'CCorreosIntervinentes', 'CResultado'],
    storedProcedures: ['P_CrearAnalisisSolicitud', 'P_ListarConsultaMD', 'P_InsertarResultadoMd', 'P_EmitirResultadoAnalisis'],
  },
  {
    id: 'contratos',
    code: 12,
    name: 'Contratos',
    description: 'Elaboracion de contratos con firma electronica ZohoSign',
    icon: FileText,
    color: 'amber',
    pages: ['Contratos_12.aspx', 'Contratos_13.aspx', 'ContratosZohoSign.aspx', 'ProformaEditable.aspx'],
    entities: ['CContrato', 'CPolizaIndividual', 'CZohoSign'],
    storedProcedures: ['P_ContratoVivienda', 'P_ContratoComercio', 'P_Contratos13Load', 'P_Contratos13Guardar'],
  },
  {
    id: 'caja',
    code: 21,
    name: 'Caja',
    description: 'Gestion de pagos: primer canon, mensualidades, otros conceptos',
    icon: CreditCard,
    color: 'green',
    pages: ['Caja_21.aspx', 'Caja_22.aspx', 'Caja_23.aspx', 'CajaRecibo.aspx'],
    entities: ['CCaja', 'CComprobantePago'],
    storedProcedures: ['P_ListarInfoCajaBySolicitud', 'P_InsertarComprobantePago', 'P_InsertarReciboPago', 'P_CrearCaja'],
  },
  {
    id: 'siniestros',
    code: 23,
    name: 'Siniestros',
    description: 'Gestion de reclamaciones y siniestros de seguro',
    icon: AlertTriangle,
    color: 'red',
    pages: ['Siniestros_23.aspx', 'Siniestros_23A.aspx', 'Siniestros_24.aspx', 'Siniestros_25.aspx'],
    entities: ['CSiniestro'],
    storedProcedures: ['P_ListarInfoSiniestros_P27', 'P_GuardarInfoSiniestro', 'P_CerrarSiniestro', 'P_InsertarIndemnizacion'],
  },
  {
    id: 'renovaciones',
    code: 24,
    name: 'Renovaciones',
    description: 'Renovacion de polizas proximas a vencer',
    icon: RefreshCw,
    color: 'cyan',
    pages: ['Renovaciones_24.aspx', 'Renovaciones_24A.aspx', 'Renovaciones_25.aspx'],
    entities: ['CRenovacion', 'CRenovacionSipro', 'CCotizacion'],
    storedProcedures: ['P_RenovacionesGrilla1', 'P_ListarRenovacionByIdRenovacion', 'P_RenovacionCotizador', 'P_ActualizarRenovacion'],
  },
  {
    id: 'inmobiliarias',
    code: 15,
    name: 'Inmobiliarias',
    description: 'Administracion de inmobiliarias afiliadas',
    icon: Building,
    color: 'indigo',
    pages: ['Inmobiliaria_15.aspx', 'Inmobiliaria_16.aspx', 'Inmobiliaria_17.aspx'],
    entities: ['CInmobiliaria', 'CArrendador', 'CArrendatario', 'CDirecciones', 'CInmueble', 'COrdenContrato', 'CSolicitudes', 'CPolizaColectiva'],
    storedProcedures: ['P_InsertarInmobiliaria', 'P_ListarInmobiliariaById', 'P_ListarInmobiliaria17'],
  },
  {
    id: 'admin',
    code: 0,
    name: 'Administracion',
    description: 'Gestion de usuarios, roles y configuracion del sistema',
    icon: Settings,
    color: 'gray',
    pages: ['AdminGestionUsuarios.aspx', 'Menu.aspx', 'ModificarClave.aspx'],
    entities: ['CUsuario', 'CPermisos'],
    storedProcedures: ['P_ValidarUsuario', 'P_EditarClave', 'P_ListarPermisosByUsuario', 'P_InsertarPermisosUsuario'],
  },
];

// Todas las entidades únicas
const allEntities = Array.from(new Set(modules.flatMap(m => m.entities))).sort();

export function ModulesView() {
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'matrix'>('cards');

  const colorClasses: Record<string, { bg: string; border: string; text: string; light: string }> = {
    blue: { bg: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-500', light: 'bg-blue-50 dark:bg-blue-900/20' },
    emerald: { bg: 'bg-emerald-500', border: 'border-emerald-500', text: 'text-emerald-500', light: 'bg-emerald-50 dark:bg-emerald-900/20' },
    purple: { bg: 'bg-purple-500', border: 'border-purple-500', text: 'text-purple-500', light: 'bg-purple-50 dark:bg-purple-900/20' },
    amber: { bg: 'bg-amber-500', border: 'border-amber-500', text: 'text-amber-500', light: 'bg-amber-50 dark:bg-amber-900/20' },
    green: { bg: 'bg-green-500', border: 'border-green-500', text: 'text-green-500', light: 'bg-green-50 dark:bg-green-900/20' },
    red: { bg: 'bg-red-500', border: 'border-red-500', text: 'text-red-500', light: 'bg-red-50 dark:bg-red-900/20' },
    cyan: { bg: 'bg-cyan-500', border: 'border-cyan-500', text: 'text-cyan-500', light: 'bg-cyan-50 dark:bg-cyan-900/20' },
    indigo: { bg: 'bg-indigo-500', border: 'border-indigo-500', text: 'text-indigo-500', light: 'bg-indigo-50 dark:bg-indigo-900/20' },
    gray: { bg: 'bg-gray-500', border: 'border-gray-500', text: 'text-gray-500', light: 'bg-gray-50 dark:bg-gray-900/20' },
  };

  return (
    <div className="h-full flex">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <LayoutGrid size={28} className="text-blue-500" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Modulos del Sistema
                  </h1>
                  <p className="text-sm text-gray-500">
                    9 modulos funcionales en AGSSAsura - cada uno es un departamento con su dashboard
                  </p>
                </div>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    viewMode === 'cards'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  Cards
                </button>
                <button
                  onClick={() => setViewMode('matrix')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    viewMode === 'matrix'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  Matriz
                </button>
              </div>
            </div>
          </div>

          {viewMode === 'cards' ? (
            /* Cards View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.map(module => {
                const Icon = module.icon;
                const colors = colorClasses[module.color];
                const isSelected = selectedModule?.id === module.id;

                return (
                  <button
                    key={module.id}
                    onClick={() => setSelectedModule(isSelected ? null : module)}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? `${colors.border} ${colors.light} shadow-lg`
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2 rounded-lg ${colors.light}`}>
                        <Icon size={24} className={colors.text} />
                      </div>
                      <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded">
                        Mod. {module.code}
                      </span>
                    </div>

                    <h3 className="font-semibold text-gray-800 dark:text-white mb-1">
                      {module.name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-3">
                      {module.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-gray-500">
                        <Database size={12} className="inline mr-1" />
                        {module.entities.length} entidades
                      </span>
                      <span className="text-gray-500">
                        {module.pages.length} páginas
                      </span>
                    </div>

                    {/* Expanded Details */}
                    {isSelected && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                        <div>
                          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Entidades que usa:
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {module.entities.map(entity => (
                              <span
                                key={entity}
                                className={`text-xs px-2 py-0.5 rounded ${colors.light} ${colors.text}`}
                              >
                                {entity}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Paginas:
                          </h4>
                          <div className="text-xs text-gray-500 space-y-0.5">
                            {module.pages.map(page => (
                              <div key={page} className="flex items-center gap-1">
                                <ChevronRight size={10} />
                                {page}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            /* Matrix View */
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800">
                      <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300 sticky left-0 bg-gray-100 dark:bg-gray-800 z-10">
                        Entidad
                      </th>
                      {modules.map(module => {
                        const colors = colorClasses[module.color];
                        return (
                          <th
                            key={module.id}
                            className="p-2 text-center font-medium whitespace-nowrap"
                          >
                            <span className={`${colors.text}`}>{module.name}</span>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {allEntities.map((entity, idx) => (
                      <tr
                        key={entity}
                        className={idx % 2 === 0 ? '' : 'bg-gray-50 dark:bg-gray-800/50'}
                      >
                        <td className="p-2 font-mono text-gray-700 dark:text-gray-300 sticky left-0 bg-white dark:bg-gray-900 z-10 border-r border-gray-200 dark:border-gray-700">
                          {entity}
                        </td>
                        {modules.map(module => {
                          const uses = module.entities.includes(entity);
                          const colors = colorClasses[module.color];
                          return (
                            <td key={module.id} className="p-2 text-center">
                              {uses ? (
                                <span className={`inline-block w-4 h-4 rounded-full ${colors.bg}`} title={`${module.name} usa ${entity}`} />
                              ) : (
                                <span className="inline-block w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 opacity-30" />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Matrix Legend */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex flex-wrap items-center gap-4">
                  {modules.map(module => {
                    const colors = colorClasses[module.color];
                    return (
                      <div key={module.id} className="flex items-center gap-1.5">
                        <span className={`w-3 h-3 rounded-full ${colors.bg}`} />
                        <span className="text-xs text-gray-600 dark:text-gray-400">{module.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
              Nota sobre las entidades
            </h4>
            <p className="text-sm text-amber-700 dark:text-amber-300 mb-2">
              Las entidades listadas son las que se <strong>instancian directamente</strong> en el codigo de cada modulo (verificado en archivos .aspx.cs).
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Muchos modulos acceden a datos adicionales via <strong>Stored Procedures</strong> que retornan DataTables.
              Por ejemplo, Siniestros muestra datos de Contrato y Solicitud aunque no instancie esas entidades directamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
