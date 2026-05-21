import { SimpleArchitectureDiagram } from '../components/diagrams/SimpleArchitectureDiagram';

export function DiagramView() {
  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Diagrama de Arquitectura
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Visualizacion de las conexiones entre usuarios, sistemas, bases de datos e integraciones externas
          </p>
        </div>

        {/* Diagram */}
        <SimpleArchitectureDiagram />
      </div>
    </div>
  );
}
