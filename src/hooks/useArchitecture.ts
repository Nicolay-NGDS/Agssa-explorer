import { useMemo } from 'react';
import architectureData from '../data/architecture.json';
import type { Architecture } from '../types/architecture';

export function useArchitecture() {
  const architecture = useMemo(() => architectureData as Architecture, []);

  return {
    meta: architecture.meta,
    systems: architecture.systems,
    databases: architecture.databases,
    modules: architecture.modules,
    flows: architecture.flows,
    integrations: architecture.integrations,
    wcfServices: architecture.wcfServices,
    connections: architecture.connections,
  };
}

export function useSystem(systemId: string) {
  const { systems } = useArchitecture();
  return systems.find(s => s.id === systemId);
}

export function useFlow(flowId: string) {
  const { flows } = useArchitecture();
  return flows.find(f => f.id === flowId);
}

export function useDatabase(databaseId: string) {
  const { databases } = useArchitecture();
  return databases.find(d => d.id === databaseId);
}

export function useIntegration(integrationId: string) {
  const { integrations } = useArchitecture();
  return integrations.find(i => i.id === integrationId);
}
