import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function Layout() {
  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
