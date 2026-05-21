import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/layout/Layout';
import { EcosystemView } from './views/EcosystemView';
import { DiagramView } from './views/DiagramView';
import { FlowsView } from './views/FlowsView';
import { DatabaseView } from './views/DatabaseView';
import { IntegrationsView } from './views/IntegrationsView';
import { ConceptsView } from './views/ConceptsView';
import { ModulesView } from './views/ModulesView';
import DataFlowView from './views/DataFlowView';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/ecosistema" replace />} />
            <Route path="ecosistema" element={<EcosystemView />} />
            <Route path="diagrama" element={<DiagramView />} />
            <Route path="flujos" element={<FlowsView />} />
            <Route path="base-datos" element={<DatabaseView />} />
            <Route path="integraciones" element={<IntegrationsView />} />
            <Route path="modulos" element={<ModulesView />} />
            <Route path="conceptos" element={<ConceptsView />} />
            <Route path="flujo-datos" element={<DataFlowView />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
