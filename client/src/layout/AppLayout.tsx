// AppLayout.tsx
import FrameworkSidebar from '../components/FrameworkSidebar';
import type { FrameworkUser, Stream } from '../types';
import type { ReactNode } from 'react'; // Используем type import

interface AppLayoutProps {
  user: FrameworkUser;
  streams: Stream[];
  onLogout: () => void;
  children: ReactNode; // children обязательно
}

const AppLayout = ({ user, streams, onLogout, children }: AppLayoutProps) => {
  return (
    <div className="app-layout">
      <header className="header">
        <div className="header__logo">
          <span>PayScan</span>
        </div>
        <div className="header__user">
          <span>{user.name}</span>
          <button onClick={onLogout}>Выйти</button>
        </div>
      </header>
      
      <div className="app-container">
        <FrameworkSidebar streams={streams} />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;