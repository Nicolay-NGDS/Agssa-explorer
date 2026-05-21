import { useState } from 'react';
import {
  Plug,
  CreditCard,
  User,
  FileSignature,
  Cloud,
  Bell,
  Shield,
  TrendingUp,
  ExternalLink,
  Code,
  Workflow,
  Server,
} from 'lucide-react';
import { useArchitecture } from '../hooks/useArchitecture';
import type { Integration, WcfService } from '../types/architecture';

const categoryConfig = {
  payments: { icon: CreditCard, label: 'Pagos', color: 'orange' },
  identity: { icon: User, label: 'Identidad', color: 'purple' },
  signature: { icon: FileSignature, label: 'Firma', color: 'pink' },
  storage: { icon: Cloud, label: 'Almacenamiento', color: 'cyan' },
  notifications: { icon: Bell, label: 'Notificaciones', color: 'yellow' },
  risk: { icon: Shield, label: 'Riesgo', color: 'red' },
  marketing: { icon: TrendingUp, label: 'Marketing', color: 'lime' },
};

type TabType = 'external' | 'wcf';

export function IntegrationsView() {
  const { integrations, wcfServices } = useArchitecture();
  const [activeTab, setActiveTab] = useState<TabType>('external');
  const [selectedItem, setSelectedItem] = useState<Integration | WcfService | null>(null);

  const groupedIntegrations = integrations.reduce((acc, int) => {
    if (!acc[int.category]) acc[int.category] = [];
    acc[int.category].push(int);
    return acc;
  }, {} as Record<string, Integration[]>);

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Tabs */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setActiveTab('external');
              setSelectedItem(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'external'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Plug size={18} />
            Integraciones Externas
            <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">{integrations.length}</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('wcf');
              setSelectedItem(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'wcf'
                ? 'bg-violet-500 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Workflow size={18} />
            Servicios WCF
            <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">{wcfServices.length}</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'external' ? (
          <div className="max-w-6xl mx-auto">
            {Object.entries(groupedIntegrations).map(([category, ints]) => {
              const config = categoryConfig[category as keyof typeof categoryConfig];
              const Icon = config?.icon || Plug;

              return (
                <div key={category} className="mb-8">
                  <h2 className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-white mb-4">
                    <Icon size={20} />
                    {config?.label || category}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ints.map(integration => (
                      <IntegrationCard
                        key={integration.id}
                        integration={integration}
                        isSelected={selectedItem?.id === integration.id}
                        onClick={() => setSelectedItem(integration)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {wcfServices.map(wcf => (
                <WcfCard
                  key={wcf.id}
                  wcfService={wcf}
                  isSelected={selectedItem?.id === wcf.id}
                  onClick={() => setSelectedItem(wcf)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detail Sidebar */}
      {selectedItem && (
        <div className="fixed top-16 right-0 h-[calc(100vh-4rem)] w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-xl overflow-y-auto z-50">
          {'category' in selectedItem ? (
            <IntegrationDetail
              integration={selectedItem as Integration}
              onClose={() => setSelectedItem(null)}
            />
          ) : (
            <WcfDetail
              wcfService={selectedItem as WcfService}
              onClose={() => setSelectedItem(null)}
            />
          )}
        </div>
      )}
    </div>
  );
}

function IntegrationCard({
  integration,
  isSelected,
  onClick,
}: {
  integration: Integration;
  isSelected: boolean;
  onClick: () => void;
}) {
  const config = categoryConfig[integration.category];
  const Icon = config?.icon || Plug;

  const colorClasses: Record<string, string> = {
    orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    pink: 'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800',
    cyan: 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    lime: 'bg-lime-50 dark:bg-lime-900/20 border-lime-200 dark:border-lime-800',
  };

  const iconColors: Record<string, string> = {
    orange: 'text-orange-500',
    purple: 'text-purple-500',
    pink: 'text-pink-500',
    cyan: 'text-cyan-500',
    yellow: 'text-yellow-500',
    red: 'text-red-500',
    lime: 'text-lime-500',
  };

  return (
    <button
      onClick={onClick}
      className={`text-left p-4 rounded-xl border-2 transition-all ${
        isSelected
          ? 'ring-2 ring-blue-500 border-blue-500'
          : colorClasses[config?.color || 'orange']
      } hover:shadow-md`}
    >
      <div className="flex items-center gap-3 mb-2">
        <Icon size={24} className={iconColors[config?.color || 'orange']} />
        <span className="font-bold text-gray-800 dark:text-white">{integration.name}</span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{integration.description}</p>
      <div className="mt-3 flex flex-wrap gap-1">
        {integration.usedBy.map(sys => (
          <span
            key={sys}
            className="text-[10px] bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded"
          >
            {sys}
          </span>
        ))}
      </div>
    </button>
  );
}

function WcfCard({
  wcfService,
  isSelected,
  onClick,
}: {
  wcfService: WcfService;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-left p-4 rounded-xl border-2 transition-all ${
        isSelected
          ? 'ring-2 ring-violet-500 border-violet-500'
          : 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800'
      } hover:shadow-md`}
    >
      <div className="flex items-center gap-3 mb-2">
        <Workflow size={24} className="text-violet-500" />
        <span className="font-bold text-gray-800 dark:text-white">{wcfService.name}</span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{wcfService.description}</p>
      <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
        <span>Puerto: {wcfService.port}</span>
        {wcfService.methods && <span>{wcfService.methods.length} métodos</span>}
      </div>
    </button>
  );
}

function IntegrationDetail({ integration, onClose }: { integration: Integration; onClose: () => void }) {
  const config = categoryConfig[integration.category];
  const Icon = config?.icon || Plug;

  return (
    <div>
      <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={20} className="text-orange-500" />
          <h2 className="font-bold text-lg text-gray-900 dark:text-white">{integration.name}</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
        >
          ✕
        </button>
      </div>

      <div className="p-4 space-y-6">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-300">{integration.description}</p>
          <div className="mt-2 inline-block text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded capitalize">
            {config?.label || integration.category}
          </div>
        </div>

        {integration.baseUrl && (
          <Section icon={<ExternalLink size={16} />} title="URLs">
            <div className="space-y-2">
              <InfoRow label="Base URL" value={integration.baseUrl} />
              {integration.tokenUrl && <InfoRow label="Token URL" value={integration.tokenUrl} />}
            </div>
          </Section>
        )}

        {integration.authentication && (
          <Section icon={<Shield size={16} />} title="Autenticación">
            <span className="text-sm text-gray-700 dark:text-gray-300">{integration.authentication}</span>
          </Section>
        )}

        <Section icon={<Server size={16} />} title="Usado por">
          <div className="flex flex-wrap gap-1">
            {integration.usedBy.map(sys => (
              <span
                key={sys}
                className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded"
              >
                {sys}
              </span>
            ))}
          </div>
        </Section>

        {integration.endpoints && integration.endpoints.length > 0 && (
          <Section icon={<Code size={16} />} title="Endpoints">
            <div className="space-y-3">
              {integration.endpoints.map((ep, i) => (
                <div key={i} className="text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        ep.method === 'GET'
                          ? 'bg-green-100 text-green-700'
                          : ep.method === 'POST'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <code className="text-xs text-gray-600 dark:text-gray-300">{ep.path}</code>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-10">{ep.description}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {integration.webhook && (
          <Section icon={<Workflow size={16} />} title="Webhook">
            <div className="space-y-2">
              <InfoRow label="Path" value={integration.webhook.path} />
              <InfoRow label="Validación" value={integration.webhook.validation} />
              <div className="mt-2">
                <span className="text-xs text-gray-500">Eventos:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {integration.webhook.events.map(event => (
                    <span
                      key={event}
                      className="text-[10px] bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded"
                    >
                      {event}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Section>
        )}

        {integration.flows && integration.flows.length > 0 && (
          <Section icon={<Workflow size={16} />} title="Flujos">
            <div className="flex flex-wrap gap-1">
              {integration.flows.map(flow => (
                <span
                  key={flow}
                  className="text-xs bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded"
                >
                  {flow}
                </span>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

function WcfDetail({ wcfService, onClose }: { wcfService: WcfService; onClose: () => void }) {
  return (
    <div>
      <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Workflow size={20} className="text-violet-500" />
          <h2 className="font-bold text-lg text-gray-900 dark:text-white">{wcfService.name}</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
        >
          ✕
        </button>
      </div>

      <div className="p-4 space-y-6">
        <p className="text-sm text-gray-600 dark:text-gray-300">{wcfService.description}</p>

        <Section icon={<ExternalLink size={16} />} title="Conexión">
          <div className="space-y-2">
            <InfoRow label="URL" value={wcfService.url} />
            <InfoRow label="Puerto" value={wcfService.port.toString()} />
            <InfoRow label="Binding" value={wcfService.binding} />
          </div>
        </Section>

        <Section icon={<Server size={16} />} title="Usado por">
          <div className="flex flex-wrap gap-1">
            {wcfService.usedBy.map(sys => (
              <span
                key={sys}
                className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded"
              >
                {sys}
              </span>
            ))}
          </div>
        </Section>

        {wcfService.methods && wcfService.methods.length > 0 && (
          <Section icon={<Code size={16} />} title="Métodos">
            <div className="space-y-1">
              {wcfService.methods.map(method => (
                <div key={method} className="text-sm">
                  <code className="text-xs bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 px-2 py-1 rounded block">
                    {method}
                  </code>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
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
