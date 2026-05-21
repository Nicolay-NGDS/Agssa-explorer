// Types for architecture.json

export interface Architecture {
  meta: Meta;
  systems: System[];
  databases: Database[];
  modules: Module[];
  flows: Flow[];
  integrations: Integration[];
  wcfServices: WcfService[];
  connections: Connection[];
}

export interface Meta {
  name: string;
  description: string;
  version: string;
  lastUpdated: string;
}

export interface System {
  id: string;
  name: string;
  shortName: string;
  description: string;
  type: 'system';
  technology: {
    framework: string;
    ui: string;
    orm: string;
    architecture: string;
  };
  repository: {
    branch: string;
    path: string;
  };
  database: string;
  modules?: string[];
  integrations: string[];
  authentication?: {
    method: string;
    otpExpiration?: string;
    jwtExpiration?: string;
    timeout?: string;
  };
  criticalFiles: {
    path: string;
    size?: string;
    description: string;
  }[];
  stats: {
    pages?: number;
    entities?: number;
    storedProcedures?: number;
    controllers?: number;
    services?: number;
    apiEndpoints?: number;
    razorPages?: number;
    routingParams?: number;
  };
}

export interface Database {
  id: string;
  name: string;
  description: string;
  type: 'database';
  server: string;
  technology: string;
  usedBy: string[];
  entityGroups: EntityGroup[];
  storedProcedures?: Record<string, string[]>;
  relations?: EntityRelation[];
}

export interface EntityRelation {
  from: string;
  to: string;
  type: '1:1' | '1:N' | 'N:1' | 'N:N';
  label: string;
}

export interface EntityGroup {
  name: string;
  entities: Entity[];
}

export interface Entity {
  name: string;
  description: string;
  fields: string[];
  isCenter?: boolean;
}

export interface Module {
  id: string;
  code: number;
  name: string;
  description: string;
  system: string;
  pages: string[];
  storedProcedures: string[];
  integrations?: string[];
  states?: string[];
  subStates?: string[];
}

export interface Flow {
  id: string;
  name: string;
  description: string;
  type: 'flow';
  steps: FlowStep[];
  states?: string[];
  subStates?: string[];
  results?: string[];
  // Nuevo: información del flujo de datos entre BDs
  dataFlowSummary?: string;
  involvedDatabases?: {
    id: string;
    role: 'temporal' | 'permanente' | 'lectura';
  }[];
}

export interface FlowStep {
  order: number;
  system: string;
  action: string;
  detail: string;
  sp?: string;
  controller?: string;
  service?: string;
  page?: string;
  method?: string;
  integration?: string;
  wcf?: string;
  endpoint?: string;
  library?: string;
  path?: string;
  subState?: string;
  // Nuevo: información de base de datos
  database?: 'agssa' | 'radicaciones';
  entity?: string;
  dbOperation?: 'read' | 'write' | 'sync';
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  type: 'external';
  category: 'payments' | 'identity' | 'signature' | 'storage' | 'notifications' | 'risk' | 'marketing';
  usedBy: string[];
  baseUrl?: string;
  tokenUrl?: string;
  bucket?: string;
  region?: string;
  pathPattern?: string;
  authentication?: string;
  endpoints?: Endpoint[];
  webhook?: {
    path: string;
    validation: string;
    events: string[];
  };
  flows?: string[];
  operations?: string[];
  integration?: string;
  request?: Record<string, string>;
  response?: Record<string, string>;
}

export interface Endpoint {
  method: string;
  path: string;
  description: string;
}

export interface WcfService {
  id: string;
  name: string;
  description: string;
  type: 'wcf';
  url: string;
  port: number;
  binding: string;
  usedBy: string[];
  methods?: string[];
}

export interface Connection {
  from: string;
  to: string;
  label: string;
  type: 'user-flow' | 'integration' | 'external' | 'database' | 'internal';
}

// Node types for React Flow
export type NodeType = 'system' | 'database' | 'integration' | 'wcf' | 'flow-step';

export interface CustomNodeData {
  id: string;
  label: string;
  description?: string;
  type: NodeType;
  data: System | Database | Integration | WcfService | FlowStep;
}
