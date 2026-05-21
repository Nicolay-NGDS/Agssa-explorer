import { NavLink } from 'react-router-dom';
import { Sun, Moon, Box, GitBranch, Database, Plug, Network, BookOpen, LayoutGrid, Workflow } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function Navbar() {
  const { theme, toggleTheme } = useTheme();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
      isActive
        ? 'bg-blue-500 text-white'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
    }`;

  return (
    <nav className="h-16 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-6 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <img src="/favicon.svg" alt="Arriende Seguro" className="w-8 h-8" />
        <span className="font-semibold text-gray-900 dark:text-white">
          Arriende Seguro Explorer
        </span>
      </div>

      {/* Navigation Links */}
      <div className="flex items-center gap-2">
        <NavLink to="/ecosistema" className={linkClass}>
          <Box size={18} />
          <span className="hidden sm:inline">Ecosistema</span>
        </NavLink>
        <NavLink to="/diagrama" className={linkClass}>
          <Network size={18} />
          <span className="hidden sm:inline">Diagrama</span>
        </NavLink>
        <NavLink to="/flujos" className={linkClass}>
          <GitBranch size={18} />
          <span className="hidden sm:inline">Flujos</span>
        </NavLink>
        <NavLink to="/base-datos" className={linkClass}>
          <Database size={18} />
          <span className="hidden sm:inline">Base de Datos</span>
        </NavLink>
        <NavLink to="/integraciones" className={linkClass}>
          <Plug size={18} />
          <span className="hidden sm:inline">Integraciones</span>
        </NavLink>
        <NavLink to="/modulos" className={linkClass}>
          <LayoutGrid size={18} />
          <span className="hidden sm:inline">Módulos</span>
        </NavLink>
        <NavLink to="/flujo-datos" className={linkClass}>
          <Workflow size={18} />
          <span className="hidden sm:inline">Flujo Datos</span>
        </NavLink>
        <NavLink to="/conceptos" className={linkClass}>
          <BookOpen size={18} />
          <span className="hidden sm:inline">Conceptos</span>
        </NavLink>
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        title={theme === 'light' ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro'}
      >
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>
    </nav>
  );
}
