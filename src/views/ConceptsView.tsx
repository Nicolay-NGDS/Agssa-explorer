import { useState } from 'react';
import { BookOpen, Database, GitBranch, Layers, ArrowRightLeft, Server, ChevronDown, ChevronRight, Lightbulb, Code, UserPlus, CheckCircle, FileText, CreditCard, AlertTriangle, RefreshCw, Building, Banknote, Cpu, HardDrive, Cloud, FolderOpen, Shield, Users, User, Globe, ExternalLink } from 'lucide-react';

interface ConceptSection {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  content: React.ReactNode;
}

export function ConceptsView() {
  const [expandedSection, setExpandedSection] = useState<string | null>('architecture');

  const sections: ConceptSection[] = [
    {
      id: 'architecture',
      icon: Layers,
      title: 'Arquitectura General',
      description: 'Como estan organizados los sistemas y como se comunican',
      content: <ArchitectureContent />,
    },
    {
      id: 'polizas',
      icon: Shield,
      title: 'Tipos de Polizas: Colectiva vs Individual',
      description: 'Las dos formas de obtener el seguro de arriendo',
      content: <PolizasContent />,
    },
    {
      id: 'databases',
      icon: Database,
      title: 'Bases de Datos',
      description: 'AGSSA vs RADICACIONES - temporal vs permanente',
      content: <DatabasesContent />,
    },
    {
      id: 'infrastructure',
      icon: HardDrive,
      title: 'Servidores y Almacenamiento',
      description: 'Donde viven los datos: servidores SQL y archivos en la nube',
      content: <InfrastructureContent />,
    },
    {
      id: 'sync',
      icon: ArrowRightLeft,
      title: 'Sincronizacion de Datos',
      description: 'Como fluyen los datos entre sistemas y bases de datos',
      content: <SyncContent />,
    },
    {
      id: 'nomenclature',
      icon: Code,
      title: 'Nomenclatura de Codigo',
      description: 'Convenciones de nombres: C*, T*, prefijos y patrones',
      content: <NomenclatureContent />,
    },
    {
      id: 'lifecycle',
      icon: UserPlus,
      title: 'Ciclo de Vida de la Informacion',
      description: 'Como se construye la informacion del cliente paso a paso',
      content: <DataLifecycleContent />,
    },
    {
      id: 'flows',
      icon: GitBranch,
      title: 'Flujos de Negocio',
      description: 'Los procesos principales del sistema',
      content: <FlowsContent />,
    },
    {
      id: 'payments',
      icon: Banknote,
      title: 'Pagos y Recaudos',
      description: 'Como funcionan los diferentes tipos de pago en el sistema',
      content: <PaymentsContent />,
    },
    {
      id: 'motor',
      icon: Cpu,
      title: 'Motor de Decision',
      description: 'Como funciona el analisis de riesgo automatizado',
      content: <MotorDecisionContent />,
    },
    {
      id: 'integrations',
      icon: Server,
      title: 'Integraciones',
      description: 'Servicios externos y WCF internos',
      content: <IntegrationsContent />,
    },
  ];

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen size={32} className="text-amber-500" />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Conceptos Clave
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Documentacion esencial para entender el ecosistema AGSSA. Haz clic en cada seccion para expandir.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {sections.map(section => {
            const Icon = section.icon;
            const isExpanded = expandedSection === section.id;

            return (
              <div
                key={section.id}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${isExpanded ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    <Icon size={24} className={isExpanded ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500'} />
                  </div>
                  <div className="flex-1 text-left">
                    <h2 className="font-semibold text-gray-800 dark:text-white">{section.title}</h2>
                    <p className="text-sm text-gray-500">{section.description}</p>
                  </div>
                  {isExpanded ? (
                    <ChevronDown size={20} className="text-gray-400" />
                  ) : (
                    <ChevronRight size={20} className="text-gray-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800/50">
                    {section.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <Lightbulb size={20} className="text-amber-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                Tip: Explora las otras vistas
              </h4>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Usa las vistas de <strong>Flujos</strong> y <strong>Base de Datos</strong> para ver
                diagramas interactivos y mas detalles tecnicos de cada componente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArchitectureContent() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Los 4 Sistemas Principales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SystemCard
            name="AGSSAsura"
            tech=".NET 4.8 WebForms"
            role="Sistema central - corazon del ecosistema"
            color="blue"
          />
          <SystemCard
            name="RadicacionEnLinea"
            tech=".NET 8 MVC"
            role="Formulario de radicacion para arrendatarios"
            color="emerald"
          />
          <SystemCard
            name="Portal-Asesores"
            tech=".NET 8 API + Razor"
            role="Dashboard para asesores inmobiliarios"
            color="orange"
          />
          <SystemCard
            name="LandingInmobiliarias"
            tech=".NET 4.7.2 WebForms"
            role="Portal para inmobiliarias"
            color="purple"
          />
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Flujo de Comunicacion</h3>
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 font-mono text-sm">
          <pre className="text-gray-700 dark:text-gray-300 overflow-x-auto">
{`Inmobiliarias ──► RadicacionEnLinea ──► AGSSAsura
      │                                      │
      │              (WCF)                   │
      │                                      ▼
      └──────────────────────────► Portal-Asesores`}
          </pre>
        </div>
      </div>
    </div>
  );
}

function SystemCard({ name, tech, role, color }: { name: string; tech: string; role: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
    emerald: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
    orange: 'border-orange-500 bg-orange-50 dark:bg-orange-900/20',
    purple: 'border-purple-500 bg-purple-50 dark:bg-purple-900/20',
  };

  return (
    <div className={`border-l-4 ${colors[color]} rounded-r-lg p-3`}>
      <h4 className="font-semibold text-gray-800 dark:text-white">{name}</h4>
      <p className="text-xs text-gray-500 mb-1">{tech}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">{role}</p>
    </div>
  );
}

function PolizasContent() {
  return (
    <div className="space-y-6">
      {/* Introducción */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">¿Que es una poliza de arriendo?</h4>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Es un <strong>seguro</strong> que protege al arrendador (dueño del inmueble) en caso de que el arrendatario
          (inquilino) no pague el arriendo. SURA paga al arrendador mientras se resuelve la situacion.
        </p>
      </div>

      {/* Las dos opciones */}
      <div>
        <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Existen DOS formas de obtener este seguro:</h4>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Póliza Colectiva */}
          <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-500 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-500 rounded-xl">
                <Users size={28} className="text-white" />
              </div>
              <div>
                <h5 className="font-bold text-purple-800 dark:text-purple-200 text-lg">Poliza COLECTIVA</h5>
                <p className="text-xs text-purple-600 dark:text-purple-400">Via Inmobiliaria</p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-purple-700 dark:text-purple-300">
              <div className="flex items-start gap-2">
                <Building size={16} className="mt-0.5 flex-shrink-0" />
                <p><strong>¿Quien la tiene?</strong> La inmobiliaria. Una sola poliza para TODOS sus clientes.</p>
              </div>
              <div className="flex items-start gap-2">
                <Users size={16} className="mt-0.5 flex-shrink-0" />
                <p><strong>¿Como funciona?</strong> La inmobiliaria tiene un "paraguas" y todos sus arrendatarios entran bajo ese paraguas.</p>
              </div>
              <div className="flex items-start gap-2">
                <Globe size={16} className="mt-0.5 flex-shrink-0" />
                <p><strong>¿Donde radican?</strong> El arrendatario recibe un link de la inmobiliaria y llena el formulario en RadicacionEnLinea.</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                <p><strong>¿Quien gestiona?</strong> El asesor de la inmobiliaria hace seguimiento en Portal-Asesores o AGSSAsura.</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-purple-300 dark:border-purple-700">
              <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-2">Portal de entrada:</p>
              <div className="flex items-center gap-2 bg-white dark:bg-purple-800 rounded px-3 py-2">
                <Globe size={14} />
                <code className="text-xs">inmobiliarias.arriendeseguro.com</code>
              </div>
            </div>
          </div>

          {/* Póliza Individual */}
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-500 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-500 rounded-xl">
                <User size={28} className="text-white" />
              </div>
              <div>
                <h5 className="font-bold text-emerald-800 dark:text-emerald-200 text-lg">Poliza INDIVIDUAL</h5>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">Directo con SURA</p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-emerald-700 dark:text-emerald-300">
              <div className="flex items-start gap-2">
                <User size={16} className="mt-0.5 flex-shrink-0" />
                <p><strong>¿Quien la tiene?</strong> El arrendador o arrendatario directamente. Cada cliente tiene SU propia poliza.</p>
              </div>
              <div className="flex items-start gap-2">
                <Shield size={16} className="mt-0.5 flex-shrink-0" />
                <p><strong>¿Como funciona?</strong> El cliente contrata directamente con SURA, sin intermediario inmobiliario.</p>
              </div>
              <div className="flex items-start gap-2">
                <Globe size={16} className="mt-0.5 flex-shrink-0" />
                <p><strong>¿Donde radican?</strong> En la pagina publica arriendetranquiloenlinea.com.co</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                <p><strong>¿Quien gestiona?</strong> SURA directamente, o el cliente hace seguimiento por su cuenta.</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-emerald-300 dark:border-emerald-700">
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-2">Portal de entrada:</p>
              <div className="flex items-center gap-2 bg-white dark:bg-emerald-800 rounded px-3 py-2">
                <Globe size={14} />
                <code className="text-xs">arriendetranquiloenlinea.com.co</code>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Diagrama visual */}
      <div>
        <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Diagrama: ¿Como se ve cada tipo?</h4>
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto">
          <pre className="text-xs text-gray-700 dark:text-gray-300 font-mono">{`
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PÓLIZA COLECTIVA                                     │
│                    (Via Inmobiliaria - lo que tenemos)                       │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────┐           │
│   │              INMOBILIARIA "ABC Arriendos"                    │           │
│   │                                                              │           │
│   │    ┌──────────────────────────────────────────────┐         │           │
│   │    │      PÓLIZA COLECTIVA #12345                 │         │           │
│   │    │      (UNA sola póliza para todos)            │         │           │
│   │    │                                              │         │           │
│   │    │   ┌─────────┐ ┌─────────┐ ┌─────────┐       │         │           │
│   │    │   │Cliente A│ │Cliente B│ │Cliente C│  ...  │         │           │
│   │    │   │Solicitud│ │Solicitud│ │Solicitud│       │         │           │
│   │    │   └─────────┘ └─────────┘ └─────────┘       │         │           │
│   │    └──────────────────────────────────────────────┘         │           │
│   └──────────────────────────────────────────────────────────────┘           │
│                                                                              │
│   Flujo: Landing Inmob → RadicacionEnLinea → AGSSAsura → Portal-Asesores    │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         PÓLIZA INDIVIDUAL                                    │
│                    (Directo - sistema separado)                              │
│                                                                              │
│   ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│   │    CLIENTE A     │  │    CLIENTE B     │  │    CLIENTE C     │          │
│   │                  │  │                  │  │                  │          │
│   │ ┌──────────────┐ │  │ ┌──────────────┐ │  │ ┌──────────────┐ │          │
│   │ │PÓLIZA #67890 │ │  │ │PÓLIZA #67891 │ │  │ │PÓLIZA #67892 │ │          │
│   │ │(Solo para A) │ │  │ │(Solo para B) │ │  │ │(Solo para C) │ │          │
│   │ └──────────────┘ │  │ └──────────────┘ │  │ └──────────────┘ │          │
│   └──────────────────┘  └──────────────────┘  └──────────────────┘          │
│                                                                              │
│   Flujo: arriendetranquiloenlinea.com.co → AGSSAsura (directo)              │
└─────────────────────────────────────────────────────────────────────────────┘
`}</pre>
        </div>
      </div>

      {/* Tabla comparativa */}
      <div>
        <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Comparacion detallada</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700 text-left">
                <th className="p-3 rounded-tl-lg">Aspecto</th>
                <th className="p-3 bg-purple-100 dark:bg-purple-900/50">Colectiva (Inmobiliaria)</th>
                <th className="p-3 bg-emerald-100 dark:bg-emerald-900/50 rounded-tr-lg">Individual (Directo)</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 dark:text-gray-300">
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-3 font-medium">¿Quien contrata?</td>
                <td className="p-3 bg-purple-50 dark:bg-purple-900/20">La inmobiliaria (contrato marco)</td>
                <td className="p-3 bg-emerald-50 dark:bg-emerald-900/20">El arrendador o arrendatario</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-3 font-medium">Numero de polizas</td>
                <td className="p-3 bg-purple-50 dark:bg-purple-900/20">1 poliza = muchos clientes</td>
                <td className="p-3 bg-emerald-50 dark:bg-emerald-900/20">1 poliza = 1 cliente</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-3 font-medium">Portal de radicacion</td>
                <td className="p-3 bg-purple-50 dark:bg-purple-900/20">Link generado por inmobiliaria</td>
                <td className="p-3 bg-emerald-50 dark:bg-emerald-900/20">arriendetranquiloenlinea.com.co</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-3 font-medium">¿Quien hace seguimiento?</td>
                <td className="p-3 bg-purple-50 dark:bg-purple-900/20">Asesor de la inmobiliaria</td>
                <td className="p-3 bg-emerald-50 dark:bg-emerald-900/20">SURA o el cliente mismo</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-3 font-medium">Entidad en BD</td>
                <td className="p-3 bg-purple-50 dark:bg-purple-900/20"><code>CPolizaColectiva</code></td>
                <td className="p-3 bg-emerald-50 dark:bg-emerald-900/20"><code>CPolizaIndividual</code></td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-3 font-medium">Sistemas que usan</td>
                <td className="p-3 bg-purple-50 dark:bg-purple-900/20">LandingInmob + RadicacionEnLinea + Portal-Asesores</td>
                <td className="p-3 bg-emerald-50 dark:bg-emerald-900/20">Sistema separado (no en repos)</td>
              </tr>
              <tr>
                <td className="p-3 font-medium rounded-bl-lg">Ventaja principal</td>
                <td className="p-3 bg-purple-50 dark:bg-purple-900/20">Gestion centralizada, tarifas preferenciales</td>
                <td className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-br-lg">No necesita intermediario</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Portales públicos */}
      <div>
        <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Portales publicos de Arriende Seguro</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Globe size={18} className="text-blue-500" />
              <span className="font-medium text-gray-800 dark:text-white">Pagina principal</span>
            </div>
            <a href="https://www.arriendeseguro.com" target="_blank" rel="noopener noreferrer"
               className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              arriendeseguro.com
              <ExternalLink size={12} />
            </a>
            <p className="text-xs text-gray-500 mt-1">Marketing, info de productos, contacto</p>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Building size={18} className="text-purple-500" />
              <span className="font-medium text-gray-800 dark:text-white">Portal Inmobiliarias</span>
            </div>
            <a href="https://inmobiliarias.arriendeseguro.com" target="_blank" rel="noopener noreferrer"
               className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              inmobiliarias.arriendeseguro.com
              <ExternalLink size={12} />
            </a>
            <p className="text-xs text-gray-500 mt-1">Generar links, consultar solicitudes (LandingInmobiliarias)</p>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <User size={18} className="text-emerald-500" />
              <span className="font-medium text-gray-800 dark:text-white">Radicacion Individual</span>
            </div>
            <a href="https://arriendetranquiloenlinea.com.co" target="_blank" rel="noopener noreferrer"
               className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              arriendetranquiloenlinea.com.co
              <ExternalLink size={12} />
            </a>
            <p className="text-xs text-gray-500 mt-1">Para clientes sin inmobiliaria (sistema separado)</p>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={18} className="text-amber-500" />
              <span className="font-medium text-gray-800 dark:text-white">Radicacion via Inmobiliaria</span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Link dinamico generado
            </span>
            <p className="text-xs text-gray-500 mt-1">Cada inmobiliaria genera su propio link (RadicacionEnLinea)</p>
          </div>
        </div>
      </div>

      {/* Nota importante */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg p-4">
        <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-2">
          <AlertTriangle size={18} />
          Importante sobre los repositorios
        </h4>
        <p className="text-sm text-amber-700 dark:text-amber-300">
          Los 4 repositorios que tenemos (<strong>AGSSAsura, RadicacionEnLinea, Portal-Asesores, LandingInmobiliarias</strong>)
          son para el flujo de <strong>Poliza Colectiva</strong> (via inmobiliaria).
        </p>
        <p className="text-sm text-amber-700 dark:text-amber-300 mt-2">
          El sistema de <strong>Poliza Individual</strong> (arriendetranquiloenlinea.com.co) es un sistema
          <strong> separado</strong> que no esta en estos repositorios. Posiblemente es manejado directamente
          por SURA o es un sistema legacy diferente.
        </p>
      </div>

      {/* Resumen */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 dark:text-white mb-2">En resumen:</h4>
        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
          <li>✓ <strong>Poliza Colectiva:</strong> Inmobiliaria tiene 1 poliza → muchos clientes entran bajo ella</li>
          <li>✓ <strong>Poliza Individual:</strong> Cada cliente tiene su propia poliza independiente</li>
          <li>✓ <strong>Nuestros repos:</strong> Solo manejan el flujo Colectiva (via inmobiliaria)</li>
          <li>✓ <strong>Individual:</strong> Se maneja por arriendetranquiloenlinea.com.co (sistema aparte)</li>
        </ul>
      </div>
    </div>
  );
}

function DatabasesContent() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-300 dark:border-emerald-700 rounded-lg p-4">
          <h4 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-2 flex items-center gap-2">
            <Database size={18} />
            BD AGSSA (Permanente)
          </h4>
          <ul className="text-sm text-emerald-700 dark:text-emerald-300 space-y-1">
            <li>• 88 entidades, 120+ Stored Procedures</li>
            <li>• Datos definitivos del negocio</li>
            <li>• Usada por: AGSSAsura, Portal-Asesores, Landing</li>
            <li>• Servidor interno: 10.254.35.16</li>
          </ul>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg p-4">
          <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-2">
            <Database size={18} />
            BD RADICACIONES (Temporal)
          </h4>
          <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
            <li>• 11 tablas con Entity Framework Core</li>
            <li>• Area de espera durante radicacion</li>
            <li>• Usada solo por: RadicacionEnLinea</li>
            <li>• Servidor expuesto: 186.31.31.18</li>
          </ul>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">¿Por que dos bases de datos?</h4>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
          <li><strong>Aislamiento:</strong> Si el proceso falla, no ensucia la BD principal</li>
          <li><strong>Seguridad:</strong> RADICACIONES esta expuesta a internet, AGSSA esta en red interna</li>
          <li><strong>Tecnologia:</strong> RadicacionEnLinea usa .NET 8 + EF Core, necesita modelo propio</li>
          <li><strong>Performance:</strong> El formulario publico no toca directamente produccion</li>
        </ul>
      </div>
    </div>
  );
}

function InfrastructureContent() {
  return (
    <div className="space-y-6">
      {/* Explicación simple */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Primero, lo basico:</h4>
        <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
          <p><strong>Base de datos</strong> = Donde se guardan los datos (tablas, registros)</p>
          <p><strong>Servidor</strong> = La computadora donde vive la base de datos</p>
          <p><strong>AWS S3</strong> = Carpeta en la nube para guardar archivos (PDFs, fotos)</p>
        </div>
      </div>

      {/* Resumen visual simple */}
      <div>
        <h4 className="font-semibold text-gray-800 dark:text-white mb-3">¿Que tiene AGSSA?</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Bases de datos */}
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-500 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Database size={24} className="text-emerald-600" />
              <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">2</span>
            </div>
            <h5 className="font-semibold text-emerald-800 dark:text-emerald-200">Bases de Datos</h5>
            <ul className="text-sm text-emerald-700 dark:text-emerald-300 mt-2">
              <li>• AGSSA</li>
              <li>• RADICACIONES</li>
            </ul>
          </div>

          {/* Servidores */}
          <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-500 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <HardDrive size={24} className="text-purple-600" />
              <span className="text-2xl font-bold text-purple-700 dark:text-purple-300">3</span>
            </div>
            <h5 className="font-semibold text-purple-800 dark:text-purple-200">Servidores SQL</h5>
            <ul className="text-sm text-purple-700 dark:text-purple-300 mt-2">
              <li>• Interno (desarrollo)</li>
              <li>• Produccion AGSSA</li>
              <li>• Produccion Radicacion</li>
            </ul>
          </div>

          {/* AWS S3 */}
          <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-500 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Cloud size={24} className="text-orange-600" />
              <span className="text-2xl font-bold text-orange-700 dark:text-orange-300">1</span>
            </div>
            <h5 className="font-semibold text-orange-800 dark:text-orange-200">Almacen de Archivos</h5>
            <ul className="text-sm text-orange-700 dark:text-orange-300 mt-2">
              <li>• AWS S3 (nube)</li>
              <li>• PDFs, fotos, docs</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Diagrama visual claro */}
      <div>
        <h4 className="font-semibold text-gray-800 dark:text-white mb-3">¿Como esta organizado?</h4>
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto">
          <pre className="text-xs text-gray-700 dark:text-gray-300 font-mono">{`
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DESARROLLO (para programadores)                       │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Servidor: 10.254.35.16 (red interna)                               │    │
│  │  ┌──────────────────┐    ┌──────────────────┐                       │    │
│  │  │   BD AGSSA       │    │  BD RADICACIONES │                       │    │
│  │  │   (copia dev)    │    │   (copia dev)    │                       │    │
│  │  └──────────────────┘    └──────────────────┘                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                        PRODUCCION (usuarios reales)                          │
│                                                                              │
│  ┌────────────────────────┐         ┌────────────────────────┐              │
│  │  Servidor AGSSA        │         │  Servidor Radicacion   │              │
│  │  57.131.25.62          │         │  186.31.31.18          │              │
│  │  ┌──────────────────┐  │         │  ┌──────────────────┐  │              │
│  │  │   BD AGSSA       │  │         │  │ BD RADICACIONES  │  │              │
│  │  │   (produccion)   │  │         │  │  (produccion)    │  │              │
│  │  └──────────────────┘  │         │  └──────────────────┘  │              │
│  └────────────────────────┘         └────────────────────────┘              │
│          ▲                                    ▲                              │
│          │                                    │                              │
│    AGSSAsura                           RadicacionEnLinea                     │
│    Portal-Asesores                     (formulario web)                      │
│    Landing Inmobiliarias                                                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                        ARCHIVOS (en la nube)                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  AWS S3                                                             │    │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐    │    │
│  │  │ Contratos  │  │  Cedulas   │  │Comprobantes│  │ Siniestros │    │    │
│  │  │   (PDF)    │  │  (fotos)   │  │   (PDF)    │  │   (docs)   │    │    │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
`}</pre>
        </div>
      </div>

      {/* Tabla de servidores */}
      <div>
        <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Detalle de Servidores</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700 text-left">
                <th className="p-2 rounded-tl-lg">Servidor</th>
                <th className="p-2">Ambiente</th>
                <th className="p-2">Base de Datos</th>
                <th className="p-2 rounded-tr-lg">Quien lo usa</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 dark:text-gray-300">
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
                <td className="p-2 font-mono text-xs">10.254.35.16</td>
                <td className="p-2"><span className="bg-blue-200 dark:bg-blue-800 px-2 py-0.5 rounded text-xs">Desarrollo</span></td>
                <td className="p-2">AGSSA + RADICACIONES</td>
                <td className="p-2">Programadores (pruebas)</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-emerald-50 dark:bg-emerald-900/20">
                <td className="p-2 font-mono text-xs">57.131.25.62</td>
                <td className="p-2"><span className="bg-emerald-200 dark:bg-emerald-800 px-2 py-0.5 rounded text-xs">Produccion</span></td>
                <td className="p-2">AGSSA</td>
                <td className="p-2">AGSSAsura, Portal, Landing</td>
              </tr>
              <tr className="bg-amber-50 dark:bg-amber-900/20">
                <td className="p-2 font-mono text-xs">186.31.31.18</td>
                <td className="p-2"><span className="bg-emerald-200 dark:bg-emerald-800 px-2 py-0.5 rounded text-xs">Produccion</span></td>
                <td className="p-2">RADICACIONES</td>
                <td className="p-2">RadicacionEnLinea</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* AWS S3 detalle */}
      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-300 dark:border-orange-700 rounded-lg p-4">
        <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2 flex items-center gap-2">
          <FolderOpen size={18} />
          ¿Que se guarda en AWS S3?
        </h4>
        <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
          Los archivos NO van en la base de datos. Van en AWS S3 (como un Google Drive empresarial):
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { icon: '📄', label: 'Contratos firmados', ext: 'PDF' },
            { icon: '🪪', label: 'Cedulas escaneadas', ext: 'JPG/PNG' },
            { icon: '🧾', label: 'Comprobantes de pago', ext: 'PDF' },
            { icon: '📋', label: 'Documentos siniestros', ext: 'PDF/DOC' },
          ].map(item => (
            <div key={item.label} className="bg-white dark:bg-gray-800 rounded p-2 text-center">
              <span className="text-2xl">{item.icon}</span>
              <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">{item.label}</p>
              <p className="text-xs text-gray-500">{item.ext}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Resumen final */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 dark:text-white mb-2">En resumen:</h4>
        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
          <li>✓ <strong>2 bases de datos:</strong> AGSSA (negocio) y RADICACIONES (formulario web)</li>
          <li>✓ <strong>3 servidores:</strong> 1 de desarrollo + 2 de produccion</li>
          <li>✓ <strong>1 almacen en nube:</strong> AWS S3 para archivos</li>
          <li>✓ <strong>Desarrollo y produccion separados:</strong> Los programadores no tocan datos reales</li>
        </ul>
      </div>
    </div>
  );
}

function SyncContent() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-800 dark:text-white mb-3">¿Cuando ocurre la sincronizacion?</h3>
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
          <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-3">
            <li className="flex items-start gap-2">
              <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded">1</span>
              <span>Usuario completa formulario → datos en <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">BD RADICACIONES</code></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded">2</span>
              <span>Usuario paga con Wompi → registro en <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">TPago</code></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded">3</span>
              <span>Wompi envia <strong>WEBHOOK</strong> con status "APPROVED"</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded">4</span>
              <span>RadicacionEnLinea <strong>LLAMA</strong> al WCF <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">ExternalSolutionService</code></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded">5</span>
              <span>WCF crea registros en <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">BD AGSSA</code> (CSolicitudes, etc.)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded">6</span>
              <span>Se guarda <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">IdAgssa</code> en TRadicacione para vincular</span>
            </li>
          </ol>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Mapeo de Entidades</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700">
                <th className="text-left p-2 rounded-tl-lg">RADICACIONES</th>
                <th className="text-center p-2">→</th>
                <th className="text-left p-2 rounded-tr-lg">AGSSA</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 dark:text-gray-300">
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-2"><code>TRadicacione</code></td>
                <td className="text-center p-2">→</td>
                <td className="p-2"><code>CSolicitudes</code></td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-2"><code>TInformacionBasica</code> (arrendatario)</td>
                <td className="text-center p-2">→</td>
                <td className="p-2"><code>CArrendatarioPN</code></td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-2"><code>TInformacionBasica</code> (codeudor)</td>
                <td className="text-center p-2">→</td>
                <td className="p-2"><code>CCodeudor</code></td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-2"><code>TInmueble</code></td>
                <td className="text-center p-2">→</td>
                <td className="p-2"><code>CInmueble</code></td>
              </tr>
              <tr>
                <td className="p-2"><code>TFacturacion</code></td>
                <td className="text-center p-2">→</td>
                <td className="p-2">(datos en solicitud)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-4">
        <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">⚠️ Si algo falla...</h4>
        <p className="text-sm text-red-700 dark:text-red-300">
          Si el pago es rechazado, el usuario abandona, o la validacion de identidad falla,
          los datos quedan <strong>SOLO en RADICACIONES</strong> y nunca llegan a AGSSA.
          El campo <code>IdAgssa = NULL</code> indica que la radicacion no se completo.
        </p>
      </div>
    </div>
  );
}

function NomenclatureContent() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Prefijos de Entidades</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg p-4">
            <h4 className="font-bold text-2xl text-blue-600 dark:text-blue-400 mb-1">C*</h4>
            <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">Clase (Class)</p>
            <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">
              Usado en BD AGSSA<br />
              Codigo legacy .NET 4.8 (2015-2018)<br />
              Notacion Hungara
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              <code className="text-xs bg-blue-100 dark:bg-blue-800 px-1 rounded">CSolicitudes</code>
              <code className="text-xs bg-blue-100 dark:bg-blue-800 px-1 rounded">CContrato</code>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg p-4">
            <h4 className="font-bold text-2xl text-amber-600 dark:text-amber-400 mb-1">T*</h4>
            <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">Tabla (Table)</p>
            <p className="text-xs text-amber-600 dark:text-amber-300 mt-2">
              Usado en BD RADICACIONES<br />
              Codigo moderno .NET 8 (2024)<br />
              Convencion EF Core
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              <code className="text-xs bg-amber-100 dark:bg-amber-800 px-1 rounded">TRadicacione</code>
              <code className="text-xs bg-amber-100 dark:bg-amber-800 px-1 rounded">TPago</code>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Otros Patrones</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">P_*</code>
            <span className="text-gray-600 dark:text-gray-400">Stored Procedures (ej: P_CrearSolicitud)</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">Id*</code>
            <span className="text-gray-600 dark:text-gray-400">Campos de llave primaria o foranea</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">*Services.cs</code>
            <span className="text-gray-600 dark:text-gray-400">Clases de servicio en .NET</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">*Controller.cs</code>
            <span className="text-gray-600 dark:text-gray-400">Controladores MVC/API</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FlowsContent() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        El sistema tiene 6 flujos principales de negocio:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          { name: 'Radicacion', desc: 'Arrendatario solicita arriendo', steps: 12, multi: true },
          { name: 'Validacion Identidad', desc: 'Verificacion biometrica', steps: 12, multi: true },
          { name: 'Analisis de Riesgo', desc: 'Motor de decision automatico', steps: 8, multi: false },
          { name: 'Contrato', desc: 'Elaboracion y firma electronica', steps: 12, multi: false },
          { name: 'Siniestro', desc: 'Reclamacion de seguro', steps: 8, multi: false },
          { name: 'Renovacion', desc: 'Renovacion de polizas', steps: 10, multi: false },
        ].map(flow => (
          <div key={flow.name} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium text-gray-800 dark:text-white">{flow.name}</h4>
              {flow.multi && (
                <span className="text-xs bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded">
                  Multi-BD
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">{flow.desc}</p>
            <p className="text-xs text-blue-500 mt-1">{flow.steps} pasos</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500 italic">
        Visita la seccion "Flujos de Negocio" en el menu para ver los diagramas detallados.
      </p>
    </div>
  );
}

function DataLifecycleContent() {
  const stages = [
    {
      id: 'radicacion',
      title: 'Radicacion',
      subtitle: 'El arrendatario inicia el proceso',
      icon: UserPlus,
      color: 'emerald',
      database: 'RADICACIONES',
      entities: ['TRadicacione', 'TInformacionBasica', 'TInmueble', 'TPago'],
      dataAdded: [
        'Datos personales del arrendatario (nombre, documento, contacto)',
        'Informacion laboral y financiera',
        'Datos del codeudor (si aplica)',
        'Direccion del inmueble a arrendar',
        'Comprobante de pago del estudio ($35,000)',
      ],
      status: 'Datos en espera - aun no en sistema principal',
    },
    {
      id: 'solicitud',
      title: 'Solicitud Creada',
      subtitle: 'Pago aprobado, datos sincronizados a AGSSA',
      icon: FileText,
      color: 'blue',
      database: 'AGSSA',
      entities: ['CSolicitudes', 'CArrendatarioPN', 'CCodeudor', 'CInmueble', 'CArrendador'],
      dataAdded: [
        'Numero de solicitud unico (IdSolicitud)',
        'Datos del arrendador/propietario',
        'Inmobiliaria asociada',
        'Poliza colectiva asignada',
        'Estado inicial: "CREADA"',
      ],
      status: 'Solicitud visible en AGSSAsura y Portal Asesores',
    },
    {
      id: 'analisis',
      title: 'Analisis de Riesgo',
      subtitle: 'Analista ejecuta el motor de decision (manual)',
      icon: CheckCircle,
      color: 'purple',
      database: 'AGSSA',
      entities: ['CAnalisis', 'CRiesgos', 'CResultado'],
      dataAdded: [
        'Score de riesgo crediticio',
        'Resultado de centrales de riesgo',
        'Preguntas KBA (validacion identidad)',
        'Resultado del analisis: APROBADO/NEGADO/ESTUDIO',
        'Observaciones del analista',
      ],
      status: 'Ejecutado manualmente por analista desde Analisis_11.aspx',
    },
    {
      id: 'contrato',
      title: 'Contrato',
      subtitle: 'Se genera el contrato de arrendamiento',
      icon: FileText,
      color: 'amber',
      database: 'AGSSA',
      entities: ['CContrato', 'CPolizaIndividual', 'CZohoSign'],
      dataAdded: [
        'Numero de contrato',
        'Poliza individual del seguro',
        'Clausulas especificas (vivienda/comercio)',
        'Firma electronica via ZohoSign',
        'Documentos almacenados en AWS S3',
      ],
      status: 'Contrato firmado y activo',
    },
    {
      id: 'caja',
      title: 'Caja / Pagos',
      subtitle: 'Registro de pagos mensuales',
      icon: CreditCard,
      color: 'green',
      database: 'AGSSA',
      entities: ['CCaja', 'CPagos', 'CComprobantePago'],
      dataAdded: [
        'Primer canon (pago inicial)',
        'Pagos mensuales de arriendo',
        'Administracion y servicios',
        'Comprobantes de pago',
        'Estado de cartera',
      ],
      status: 'Contrato en seguimiento activo',
    },
  ];

  const optionalStages = [
    {
      id: 'siniestro',
      title: 'Siniestro',
      subtitle: 'Si el arrendatario incumple',
      icon: AlertTriangle,
      color: 'red',
      entities: ['CSiniestro'],
      dataAdded: ['Tipo de siniestro', 'Monto reclamado', 'Documentos soporte', 'Indemnizacion'],
    },
    {
      id: 'renovacion',
      title: 'Renovacion',
      subtitle: 'Al vencer la poliza',
      icon: RefreshCw,
      color: 'cyan',
      entities: ['CRenovacion', 'CCotizacion'],
      dataAdded: ['Nueva vigencia', 'Nuevo canon', 'Nueva prima', 'Actualizacion de datos'],
    },
  ];

  const colorClasses: Record<string, { bg: string; border: string; text: string; light: string }> = {
    emerald: { bg: 'bg-emerald-500', border: 'border-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', light: 'bg-emerald-50 dark:bg-emerald-900/20' },
    blue: { bg: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-600 dark:text-blue-400', light: 'bg-blue-50 dark:bg-blue-900/20' },
    purple: { bg: 'bg-purple-500', border: 'border-purple-500', text: 'text-purple-600 dark:text-purple-400', light: 'bg-purple-50 dark:bg-purple-900/20' },
    amber: { bg: 'bg-amber-500', border: 'border-amber-500', text: 'text-amber-600 dark:text-amber-400', light: 'bg-amber-50 dark:bg-amber-900/20' },
    green: { bg: 'bg-green-500', border: 'border-green-500', text: 'text-green-600 dark:text-green-400', light: 'bg-green-50 dark:bg-green-900/20' },
    red: { bg: 'bg-red-500', border: 'border-red-500', text: 'text-red-600 dark:text-red-400', light: 'bg-red-50 dark:bg-red-900/20' },
    cyan: { bg: 'bg-cyan-500', border: 'border-cyan-500', text: 'text-cyan-600 dark:text-cyan-400', light: 'bg-cyan-50 dark:bg-cyan-900/20' },
  };

  return (
    <div className="space-y-6">
      {/* Intro */}
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Cada cliente pasa por varias etapas. En cada una se va <strong>agregando informacion</strong> a su registro
        hasta tener un expediente completo con contrato activo.
      </p>

      {/* Auto vs Manual note */}
      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-gray-600 dark:text-gray-400"><strong>Automatico:</strong> Radicacion → Pago → Solicitud creada</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-purple-500" />
          <span className="text-gray-600 dark:text-gray-400"><strong>Manual:</strong> Analisis, Contrato, Caja (requieren accion de analista/asesor)</span>
        </div>
      </div>

      {/* Main Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600" />

        {/* Stages */}
        <div className="space-y-6">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            const colors = colorClasses[stage.color];

            return (
              <div key={stage.id} className="relative pl-16">
                {/* Circle with icon */}
                <div className={`absolute left-3 w-7 h-7 rounded-full ${colors.bg} flex items-center justify-center z-10`}>
                  <Icon size={14} className="text-white" />
                </div>

                {/* Stage number */}
                <div className="absolute left-0 -top-1 text-xs font-bold text-gray-400">{index + 1}</div>

                {/* Content card */}
                <div className={`${colors.light} border ${colors.border} rounded-lg p-4`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className={`font-semibold ${colors.text}`}>{stage.title}</h4>
                      <p className="text-xs text-gray-500">{stage.subtitle}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded ${stage.database === 'RADICACIONES' ? 'bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200' : 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200'}`}>
                      {stage.database}
                    </span>
                  </div>

                  {/* Data added */}
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Informacion que se agrega:</p>
                    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
                      {stage.dataAdded.map((item, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-gray-400">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Entities */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-500">Entidades:</span>
                    {stage.entities.map(entity => (
                      <code key={entity} className="text-xs bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600">
                        {entity}
                      </code>
                    ))}
                  </div>

                  {/* Status */}
                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                    <p className="text-xs italic text-gray-500">{stage.status}</p>
                  </div>
                </div>

                {/* Sync indicator between Radicacion and Solicitud */}
                {index === 0 && (
                  <div className="absolute -bottom-3 left-6 transform -translate-x-1/2">
                    <div className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                      SYNC via WCF
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Optional paths */}
      <div className="mt-8">
        <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Caminos Opcionales (despues del contrato)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {optionalStages.map(stage => {
            const Icon = stage.icon;
            const colors = colorClasses[stage.color];

            return (
              <div key={stage.id} className={`${colors.light} border ${colors.border} rounded-lg p-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={18} className={colors.text} />
                  <div>
                    <h5 className={`font-medium ${colors.text}`}>{stage.title}</h5>
                    <p className="text-xs text-gray-500">{stage.subtitle}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {stage.entities.map(entity => (
                    <code key={entity} className="text-xs bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600">
                      {entity}
                    </code>
                  ))}
                </div>
                <ul className="text-xs text-gray-600 dark:text-gray-400">
                  {stage.dataAdded.map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
          <Building size={18} />
          Resultado Final: Expediente Completo
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Al final del proceso, el sistema tiene toda la informacion del cliente:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          {[
            { label: 'Arrendatario', data: 'Datos personales, laborales, financieros' },
            { label: 'Codeudor', data: 'Respaldo financiero' },
            { label: 'Arrendador', data: 'Propietario del inmueble' },
            { label: 'Inmueble', data: 'Direccion, canon, destino' },
            { label: 'Analisis', data: 'Score de riesgo, resultado' },
            { label: 'Contrato', data: 'Poliza, clausulas, firmas' },
            { label: 'Pagos', data: 'Historial de cartera' },
            { label: 'Documentos', data: 'Archivos en S3' },
          ].map(item => (
            <div key={item.label} className="bg-white dark:bg-gray-700 rounded p-2">
              <p className="font-medium text-gray-800 dark:text-white">{item.label}</p>
              <p className="text-gray-500">{item.data}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PaymentsContent() {
  return (
    <div className="space-y-6">
      {/* Intro */}
      <p className="text-sm text-gray-600 dark:text-gray-400">
        El sistema maneja <strong>dos tipos de pago diferentes</strong> que ocurren en momentos distintos del proceso
        y se gestionan por canales completamente separados.
      </p>

      {/* Two payment types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pago Estudio - Wompi */}
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-500 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-emerald-500 rounded-lg">
              <CreditCard size={20} className="text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-emerald-800 dark:text-emerald-200">Pago del Estudio</h4>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">$35,000 COP</p>
            </div>
          </div>

          <div className="space-y-2 text-sm text-emerald-700 dark:text-emerald-300">
            <div className="flex items-center gap-2">
              <span className="font-medium">Pasarela:</span>
              <code className="bg-emerald-100 dark:bg-emerald-800 px-2 py-0.5 rounded">Wompi</code>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Sistema:</span>
              <span>RadicacionEnLinea</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Momento:</span>
              <span>Al radicar la solicitud</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Quien paga:</span>
              <span>El arrendatario</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-emerald-300 dark:border-emerald-700">
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              Este pago cubre el costo del estudio de arrendamiento.
              Es requisito para que la solicitud pase a AGSSA.
            </p>
          </div>
        </div>

        {/* Pago Poliza - SIPRO/SURA */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Banknote size={20} className="text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 dark:text-blue-200">Pago de la Poliza</h4>
              <p className="text-xs text-blue-600 dark:text-blue-400">Prima del seguro</p>
            </div>
          </div>

          <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
            <div className="flex items-center gap-2">
              <span className="font-medium">Sistema:</span>
              <code className="bg-blue-100 dark:bg-blue-800 px-2 py-0.5 rounded">SIPRO (SURA)</code>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Acceso:</span>
              <span>Via VPN de SURA</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Momento:</span>
              <span>Despues de aprobar el contrato</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Quien paga:</span>
              <span>El arrendatario (a SURA)</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-blue-300 dark:border-blue-700">
            <p className="text-xs text-blue-600 dark:text-blue-400">
              El cliente paga directamente a SURA. La promotora debe entrar
              por VPN a SIPRO para verificar si el pago ya se realizo.
            </p>
          </div>
        </div>
      </div>

      {/* Flow diagram */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Flujo de Pagos</h4>
        <div className="font-mono text-xs text-gray-700 dark:text-gray-300 overflow-x-auto">
          <pre>{`
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  RADICACION     │     │    CONTRATO     │     │   ACTIVACION    │
│                 │     │                 │     │                 │
│  Arrendatario   │     │  Se aprueba el  │     │  Poliza activa  │
│  paga $35,000   │────►│  contrato       │────►│  en SURA        │
│  via WOMPI      │     │                 │     │                 │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │  PAGO POLIZA    │
                        │                 │
                        │  Cliente paga   │
                        │  a SURA (SIPRO) │
                        │                 │
                        │  Promotora      │
                        │  verifica por   │
                        │  VPN            │
                        └─────────────────┘
`}</pre>
        </div>
      </div>

      {/* Caja module clarification */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg p-4">
        <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
          ¿Y el modulo de Caja en AGSSAsura?
        </h4>
        <p className="text-sm text-amber-700 dark:text-amber-300">
          El modulo de <strong>Caja</strong> en AGSSAsura se usa para <strong>registrar</strong> que los pagos
          ya se realizaron, no para procesarlos. Permite llevar control de:
        </p>
        <ul className="text-sm text-amber-700 dark:text-amber-300 mt-2 space-y-1">
          <li>• <strong>Primer canon:</strong> Primer pago de arriendo del inquilino</li>
          <li>• <strong>Pago de poliza:</strong> Registro de que ya pago en SIPRO</li>
          <li>• <strong>Pagos mensuales:</strong> Seguimiento de cartera</li>
          <li>• <strong>Comprobantes:</strong> Generacion de recibos</li>
        </ul>
      </div>

      {/* Important note */}
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-4">
        <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">⚠️ Importante</h4>
        <p className="text-sm text-red-700 dark:text-red-300">
          <strong>No hay integracion directa</strong> entre AGSSAsura y SIPRO para pagos.
          La verificacion del pago de la poliza es un proceso <strong>manual</strong> donde
          la promotora debe consultar SIPRO por VPN y luego registrar en AGSSAsura que el pago fue confirmado.
        </p>
      </div>
    </div>
  );
}

function MotorDecisionContent() {
  return (
    <div className="space-y-6">
      {/* Intro */}
      <p className="text-sm text-gray-600 dark:text-gray-400">
        El Motor de Decision es el sistema que evalua el riesgo de cada solicitud de arrendamiento.
        Determina si un arrendatario es apto para obtener la poliza de arriendo seguro.
      </p>

      {/* Key clarification */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-500 rounded-xl p-4">
        <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-2">
          <AlertTriangle size={18} />
          Aclaracion Importante
        </h4>
        <p className="text-sm text-amber-700 dark:text-amber-300">
          A pesar de llamarse "motor de decision", su ejecucion es <strong>MANUAL</strong>.
          Un analista debe ingresar al modulo de Analisis en AGSSAsura (<code>Analisis_11.aspx</code>)
          y ejecutar el motor para cada solicitud.
        </p>
      </div>

      {/* When it runs */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 dark:text-white mb-3">¿Cuando se ejecuta?</h4>
        <div className="font-mono text-xs text-gray-700 dark:text-gray-300 overflow-x-auto">
          <pre>{`
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  RADICACION     │      │    SOLICITUD    │      │    ANALISIS     │
│                 │      │                 │      │                 │
│  Pago de        │      │  Solicitud      │      │  Analista       │
│  estudio        │─────►│  creada en      │─────►│  ejecuta motor  │
│  ($35,000)      │      │  AGSSA          │      │  MANUALMENTE    │
│                 │ AUTO │                 │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
                                                         │
                    ┌────────────────────────────────────┘
                    ▼
            ┌───────────────────────────────────────────────────┐
            │              MOTOR DE DECISION                    │
            │                                                   │
            │  1. Valida completitud de datos                   │
            │  2. Consulta API SURA (lista negra)               │
            │  3. Calcula score de riesgo                       │
            │  4. Retorna: APROBADO / NEGADO / ESTUDIO          │
            └───────────────────────────────────────────────────┘
`}</pre>
        </div>
      </div>

      {/* What it validates */}
      <div>
        <h4 className="font-semibold text-gray-800 dark:text-white mb-3">¿Que valida el motor?</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Validacion interna */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg p-4">
            <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Validaciones Internas</h5>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Completitud de datos del arrendatario</li>
              <li>• Informacion laboral y financiera</li>
              <li>• Datos del codeudor (si aplica)</li>
              <li>• Validacion del rango de canon</li>
              <li>• Informacion del inmueble</li>
            </ul>
          </div>

          {/* Validacion externa - SURA */}
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-300 dark:border-purple-700 rounded-lg p-4">
            <h5 className="font-medium text-purple-800 dark:text-purple-200 mb-2">Consulta a SURA</h5>
            <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
              <li>• <strong>Lista negra</strong> de SURA ("riesgo consultable")</li>
              <li>• Personas con historial negativo</li>
              <li>• Siniestros previos reportados</li>
              <li>• Clientes rechazados anteriormente</li>
            </ul>
            <div className="mt-2 pt-2 border-t border-purple-300 dark:border-purple-700">
              <p className="text-xs text-purple-600 dark:text-purple-400">
                API: <code className="bg-purple-100 dark:bg-purple-800 px-1 rounded">cotizador.sura.com/regulacion/secureCommand/validarriesgosmodulos</code>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Canon range */}
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-300 dark:border-emerald-700 rounded-lg p-4">
        <h4 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-2">Rango de Canon Aplicable</h4>
        <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-3">
          El motor de decision solo se utiliza para solicitudes con canon mensual entre:
        </p>
        <div className="flex items-center gap-4 justify-center">
          <div className="bg-white dark:bg-emerald-800 rounded-lg px-4 py-2 text-center">
            <p className="text-xs text-emerald-600 dark:text-emerald-400">Minimo</p>
            <p className="text-lg font-bold text-emerald-800 dark:text-emerald-200">$1,500,000</p>
          </div>
          <span className="text-emerald-600 dark:text-emerald-400">→</span>
          <div className="bg-white dark:bg-emerald-800 rounded-lg px-4 py-2 text-center">
            <p className="text-xs text-emerald-600 dark:text-emerald-400">Maximo</p>
            <p className="text-lg font-bold text-emerald-800 dark:text-emerald-200">$8,000,000</p>
          </div>
        </div>
        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 italic">
          Nota: Esta validacion esta definida en el stored procedure <code>P_ValidarConsultaMD</code> en la base de datos.
          Solicitudes fuera de este rango pueden requerir analisis manual diferente.
        </p>
      </div>

      {/* Results */}
      <div>
        <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Resultados Posibles</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg p-3 text-center">
            <div className="w-10 h-10 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
              <CheckCircle size={20} className="text-white" />
            </div>
            <h5 className="font-medium text-green-800 dark:text-green-200">APROBADO</h5>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              Cumple todos los criterios. Se puede proceder con el contrato.
            </p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg p-3 text-center">
            <div className="w-10 h-10 bg-amber-500 rounded-full mx-auto mb-2 flex items-center justify-center">
              <AlertTriangle size={20} className="text-white" />
            </div>
            <h5 className="font-medium text-amber-800 dark:text-amber-200">ESTUDIO</h5>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              Requiere revision manual adicional por un analista senior.
            </p>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-3 text-center">
            <div className="w-10 h-10 bg-red-500 rounded-full mx-auto mb-2 flex items-center justify-center">
              <AlertTriangle size={20} className="text-white" />
            </div>
            <h5 className="font-medium text-red-800 dark:text-red-200">NEGADO</h5>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              No cumple criterios. Esta en lista negra o riesgo muy alto.
            </p>
          </div>
        </div>
      </div>

      {/* Technical details */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Detalles Tecnicos</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="font-medium text-gray-700 dark:text-gray-300 min-w-32">Servicio WCF:</span>
            <code className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">MotorDecisionService</code>
            <span className="text-gray-500">(puerto 86)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium text-gray-700 dark:text-gray-300 min-w-32">Pagina ASPX:</span>
            <code className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">Analisis_11.aspx</code>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium text-gray-700 dark:text-gray-300 min-w-32">SP Validacion:</span>
            <code className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">P_ValidarConsultaMD</code>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium text-gray-700 dark:text-gray-300 min-w-32">Entidades:</span>
            <div className="flex flex-wrap gap-1">
              <code className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs">CAnalisis</code>
              <code className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs">CResultado</code>
              <code className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs">CRiesgos</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IntegrationsContent() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Integraciones Externas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { name: 'Wompi', category: 'Pagos' },
            { name: 'TruValidate', category: 'Identidad' },
            { name: 'ZohoSign', category: 'Firma' },
            { name: 'AWS S3', category: 'Storage' },
            { name: 'MasivApp', category: 'SMS' },
            { name: 'SURA', category: 'Riesgo' },
            { name: 'HubSpot', category: 'Marketing' },
            { name: 'KaizenBlitz', category: 'Riesgo' },
          ].map(int => (
            <div key={int.name} className="bg-gray-100 dark:bg-gray-800 rounded p-2 text-center">
              <p className="font-medium text-sm text-gray-800 dark:text-white">{int.name}</p>
              <p className="text-xs text-gray-500">{int.category}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Servicios WCF Internos</h3>
        <div className="space-y-2">
          {[
            { name: 'ExternalSolutionService', port: 80, desc: 'Crear solicitudes desde sistemas externos' },
            { name: 'MotorDecisionService', port: 86, desc: 'Analisis automatico de riesgo' },
            { name: 'ServicioArrendamientoCentral', port: 81, desc: 'Comunicacion entre sistemas' },
          ].map(svc => (
            <div key={svc.name} className="bg-gray-100 dark:bg-gray-800 rounded p-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-gray-800 dark:text-white">{svc.name}</p>
                <p className="text-xs text-gray-500">{svc.desc}</p>
              </div>
              <code className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">:{svc.port}</code>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
