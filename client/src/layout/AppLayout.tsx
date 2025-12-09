// AppLayout.tsx
import FrameworkSidebar from '../components/FrameworkSidebar';
import type { FrameworkUser, Stream } from '../types';
import type { ReactNode } from 'react';
import '../styles/header.css'; // Добавляем импорт нового стиля

interface AppLayoutProps {
  user: FrameworkUser;
  streams: Stream[];
  onLogout: () => void;
  children: ReactNode;
}

const AppLayout = ({ user, streams, onLogout, children }: AppLayoutProps) => {
  // Получаем инициалы для аватарки
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="app-layout">
      <header className="header">
        <div className="header__logo">
          <div className="header__logo-icon">P</div>
          <span>PayScan</span>
        </div>
        
        <div className="header__user-card">
          <div className="header__user-info">
            <p className="header__user-name">{user.full_name || user.name}</p>
            <p className="header__user-email">{user.email}</p>
          </div>
          
          <div className="header__user-avatar">
            {getInitials(user.full_name || user.name)}
          </div>
          
          <button 
            className="header__logout-button"
            onClick={onLogout}
            title="Выйти из системы"
          >
            <span>Выйти</span>
          </button>
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