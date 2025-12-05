// FrameworkSidebar.tsx
import { Link, useLocation } from 'react-router-dom';
import type { Stream } from '../types';

interface FrameworkSidebarProps {
  streams: Stream[];
}

const FrameworkSidebar = ({ streams }: FrameworkSidebarProps) => {
  const location = useLocation();

  return (
    <nav className="sidebar">
      <div className="sidebar__section">
        <p className="sidebar__label">Общее</p>
        <Link
          to="/"
          className={`sidebar__link ${
            location.pathname === '/' ? 'is-active' : ''
          }`}
        >
          Личный кабинет
        </Link>
      </div>

      <div className="sidebar__section">
        <p className="sidebar__label">Разделы</p>
        {streams.map((stream) => (
          <Link
            key={stream.id}
            to={`/streams/${stream.id}`}
            className={`sidebar__link ${
              location.pathname.includes(stream.id) ? 'is-active' : ''
            }`}
          >
            {stream.label}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default FrameworkSidebar;