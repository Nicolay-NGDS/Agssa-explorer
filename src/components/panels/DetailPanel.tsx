import { X, Server, Database, Plug, Workflow, ExternalLink, Code, FileText, GitBranch } from 'lucide-react';
import type { System, Database as DatabaseType, Integration, WcfService } from '../../types/architecture';

type DetailItem = System | DatabaseType | Integration | WcfService | null;

interface DetailPanelProps {
  item: DetailItem;
  onClose: () => void;
}

export function DetailPanel({ item, onClose }: DetailPanelProps) {
  if (!item) return null;

  const renderContent = () => {
    if ('technology' in item && 'repository' in item) {
      return <SystemDetail system={item as System} />;
    }
    if ('entityGroups' in item) {
      return <DatabaseDetail database={item as DatabaseType} />;
    }
    if ('category' in item) {
      return <IntegrationDetail integration={item as Integration} />;
    }
    if ('methods' in item && 'binding' in item) {
      return <WcfDetail wcfService={item as WcfService} />;
    }
    return null;
  };

  return (
    <div className="absolute top-0 right-0 h-full w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-xl overflow-y-auto z-50">
      <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
        <h2 className="font-bold text-lg text-gray-900 dark:text-white truncate pr-2">
          {item.name}
        </h2>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
        >
          <X size={20} />
        </button>
      </div>
      <div className="p-4">{renderContent()}</div>
    </div>
  );
}

function SystemDetail({ system }: { system: System }) {
  return (
    <div className="space-y-6">
      <Section icon={<Server size={18} />} title="Información General">
        <p className="text-sm text-gray-600 dark:text-gray-300">{system.description}</p>
        <div className="mt-3 space-y-2">
          <InfoRow label="Framework" value={system.technology.framework} />
          <InfoRow label="UI" value={system.technology.ui} />
          <InfoRow label="ORM" value={system.technology.orm} />
          <InfoRow label="Arquitectura" value={system.technology.architecture} />
        </div>
      </Section>

      <Section icon={<GitBranch size={18} />} title="Repositorio">
        <InfoRow label="Rama" value={system.repository.branch} />
        <InfoRow label="Path" value={system.repository.path} />
      </Section>

      <Section icon={<Database size={18} />} title="Base de Datos">
        <span className="text-sm font-medium text-blue-500">{system.database}</span>
      </Section>

      <Section icon={<Code size={18} />} title="Estadísticas">
        <div className="grid grid-cols-2 gap-2">
          {system.stats.pages && <StatBox label="Páginas" value={system.stats.pages} />}
          {system.stats.entities && <StatBox label="Entidades" value={system.stats.entities} />}
          {system.stats.storedProcedures && <StatBox label="SPs" value={system.stats.storedProcedures} />}
          {system.stats.controllers && <StatBox label="Controllers" value={system.stats.controllers} />}
          {system.stats.services && <StatBox label="Services" value={system.stats.services} />}
          {system.stats.apiEndpoints && <StatBox label="API Endpoints" value={system.stats.apiEndpoints} />}
        </div>
      </Section>

      {system.authentication && (
        <Section icon={<Plug size={18} />} title="Autenticación">
          <InfoRow label="Método" value={system.authentication.method} />
          {system.authentication.otpExpiration && (
            <InfoRow label="OTP Expiración" value={system.authentication.otpExpiration} />
          )}
          {system.authentication.jwtExpiration && (
            <InfoRow label="JWT Expiración" value={system.authentication.jwtExpiration} />
          )}
        </Section>
      )}

      <Section icon={<FileText size={18} />} title="Archivos Críticos">
        <ul className="space-y-2">
          {system.criticalFiles.map((file, i) => (
            <li key={i} className="text-sm">
              <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-blue-600 dark:text-blue-400">
                {file.path}
              </code>
              {file.size && <span className="text-gray-400 text-xs ml-2">({file.size})</span>}
              <p className="text-gray-500 text-xs mt-0.5">{file.description}</p>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

function DatabaseDetail({ database }: { database: DatabaseType }) {
  const totalEntities = database.entityGroups.reduce((acc, g) => acc + g.entities.length, 0);

  return (
    <div className="space-y-6">
      <Section icon={<Database size={18} />} title="Información General">
        <p className="text-sm text-gray-600 dark:text-gray-300">{database.description}</p>
        <div className="mt-3 space-y-2">
          <InfoRow label="Servidor" value={database.server} />
          <InfoRow label="Tecnología" value={database.technology} />
          <InfoRow label="Total Entidades" value={totalEntities.toString()} />
        </div>
      </Section>

      <Section icon={<Server size={18} />} title="Usado por">
        <div className="flex flex-wrap gap-1">
          {database.usedBy.map(sys => (
            <span key={sys} className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
              {sys}
            </span>
          ))}
        </div>
      </Section>

      <Section icon={<Code size={18} />} title="Grupos de Entidades">
        <div className="space-y-3">
          {database.entityGroups.map(group => (
            <div key={group.name}>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {group.name} ({group.entities.length})
              </h4>
              <div className="flex flex-wrap gap-1">
                {group.entities.map(entity => (
                  <span
                    key={entity.name}
                    className={`text-[10px] px-1.5 py-0.5 rounded ${
                      entity.isCenter
                        ? 'bg-emerald-500 text-white font-medium'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
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
      </Section>
    </div>
  );
}

function IntegrationDetail({ integration }: { integration: Integration }) {
  return (
    <div className="space-y-6">
      <Section icon={<Plug size={18} />} title="Información General">
        <p className="text-sm text-gray-600 dark:text-gray-300">{integration.description}</p>
        <div className="mt-3 space-y-2">
          <InfoRow label="Categoría" value={integration.category} />
          {integration.authentication && (
            <InfoRow label="Autenticación" value={integration.authentication} />
          )}
        </div>
      </Section>

      {integration.baseUrl && (
        <Section icon={<ExternalLink size={18} />} title="URLs">
          <InfoRow label="Base URL" value={integration.baseUrl} />
          {integration.tokenUrl && <InfoRow label="Token URL" value={integration.tokenUrl} />}
        </Section>
      )}

      <Section icon={<Server size={18} />} title="Usado por">
        <div className="flex flex-wrap gap-1">
          {integration.usedBy.map(sys => (
            <span key={sys} className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
              {sys}
            </span>
          ))}
        </div>
      </Section>

      {integration.endpoints && integration.endpoints.length > 0 && (
        <Section icon={<Code size={18} />} title="Endpoints">
          <ul className="space-y-2">
            {integration.endpoints.map((ep, i) => (
              <li key={i} className="text-sm">
                <span className={`text-[10px] font-medium mr-2 px-1.5 py-0.5 rounded ${
                  ep.method === 'GET' ? 'bg-green-100 text-green-700' :
                  ep.method === 'POST' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {ep.method}
                </span>
                <code className="text-xs text-gray-600 dark:text-gray-300">{ep.path}</code>
                <p className="text-gray-500 text-xs mt-0.5">{ep.description}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {integration.webhook && (
        <Section icon={<Workflow size={18} />} title="Webhook">
          <InfoRow label="Path" value={integration.webhook.path} />
          <InfoRow label="Validación" value={integration.webhook.validation} />
          <div className="mt-2">
            <span className="text-xs text-gray-500">Eventos:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {integration.webhook.events.map(event => (
                <span key={event} className="text-[10px] bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded">
                  {event}
                </span>
              ))}
            </div>
          </div>
        </Section>
      )}
    </div>
  );
}

function WcfDetail({ wcfService }: { wcfService: WcfService }) {
  return (
    <div className="space-y-6">
      <Section icon={<Workflow size={18} />} title="Información General">
        <p className="text-sm text-gray-600 dark:text-gray-300">{wcfService.description}</p>
        <div className="mt-3 space-y-2">
          <InfoRow label="URL" value={wcfService.url} />
          <InfoRow label="Puerto" value={wcfService.port.toString()} />
          <InfoRow label="Binding" value={wcfService.binding} />
        </div>
      </Section>

      <Section icon={<Server size={18} />} title="Usado por">
        <div className="flex flex-wrap gap-1">
          {wcfService.usedBy.map(sys => (
            <span key={sys} className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
              {sys}
            </span>
          ))}
        </div>
      </Section>

      {wcfService.methods && wcfService.methods.length > 0 && (
        <Section icon={<Code size={18} />} title="Métodos">
          <ul className="space-y-1">
            {wcfService.methods.map(method => (
              <li key={method} className="text-sm">
                <code className="text-xs bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 px-1.5 py-0.5 rounded">
                  {method}
                </code>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-800 dark:text-gray-200 font-medium text-right max-w-[60%] truncate" title={value}>
        {value}
      </span>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 text-center">
      <div className="text-lg font-bold text-gray-800 dark:text-white">{value}</div>
      <div className="text-[10px] text-gray-500">{label}</div>
    </div>
  );
}
