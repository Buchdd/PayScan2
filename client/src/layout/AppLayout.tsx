import type { ReactNode } from 'react';
import FrameworkSidebar from '../components/FrameworkSidebar';
import type { FrameworkUser, Stream } from '../types';

interface AppLayoutProps {
  user: FrameworkUser;
  streams: Stream[];
  onLogout: () => void;
  children: ReactNode;
}

const AppLayout = ({ user, streams, onLogout, children }: AppLayoutProps) => {
  return (
    <div className="app-shell">
      <FrameworkSidebar streams={streams} />

      <div className="app-content">
        <header className="app-header">
          <div>
            <p className="app-header__eyebrow">PayScan</p>
            <h1>Система переводов и оплат</h1>
            <p className="app-header__subtitle">
              Управляйте кошельками на единой платформе
            </p>
          </div>
          <div className="app-header__actions">
            <div className="user-chip">
              <div className="user-chip__avatar">
                {user.name
                  .split(' ')
                  .map((x) => x[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <div>
                <strong>{user.name}</strong>
                <p>{user.email}</p>
              </div>
            </div>
            <button className="ghost-button" onClick={onLogout}>
              Выйти
            </button>
          </div>
        </header>

        <main className="app-main">{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;

