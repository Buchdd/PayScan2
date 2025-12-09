// App.tsx - полный исправленный код
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import './styles/global.css';
import './styles/components.css';
import './styles/pages/auth.css';
import { fetchStreams, login, createTransfer } from './api/client';
import { mockFrameworkUser } from './data/mock';
import AppLayout from './layout/AppLayout';
import LoginScreen from './components/LoginScreen';
import DashboardPage from './pages/DashboardPage';
import StreamPage from './pages/StreamPage';
import NotFoundPage from './pages/NotFoundPage';
import type { FrameworkUser, Stream, TransferPayload } from './types';

const StreamRoute = ({
  streams,
  onCreateTransfer,
}: {
  streams: Stream[];
  onCreateTransfer: (payload: TransferPayload) => Promise<string>;
}) => {
  const { streamId } = useParams();
  const stream = streams.find((item) => item.id === streamId);
  if (!stream || !stream.tenants) {
    return <NotFoundPage />;
  }
  return <StreamPage stream={stream} onCreateTransfer={onCreateTransfer} />;
};

function App() {
  const [user, setUser] = useState<FrameworkUser | null>(null);
  const [streams, setStreams] = useState<Stream[]>(mockFrameworkUser.streams);
  const [authError, setAuthError] = useState<string | undefined>();
  const navigate = useNavigate();

  const handleLogin = async (email: string, password: string) => {
    setAuthError(undefined);
    try {
      const logged = await login(email, password);
      setUser(logged);
      setStreams(logged.streams);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        setAuthError(error.message || 'Ошибка авторизации');
      } else {
        setAuthError('Не удалось подключиться к серверу');
      }
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchStreams()
      .then(setStreams)
      .catch(() => {
        setStreams(mockFrameworkUser.streams);
      });
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  const handleTransfer = async (payload: TransferPayload) => {
    const response = await createTransfer(payload);
    return response.reference;
  };

  if (!user) {
    return <LoginScreen onSubmit={handleLogin} error={authError} />;
  }

  return (
    <AppLayout user={user} streams={streams} onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<DashboardPage streams={streams} />} />
        <Route
          path="/streams/:streamId"
          element={
            <StreamRoute 
              streams={streams} 
              onCreateTransfer={handleTransfer} 
            />
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppLayout>
  );
}

export default function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}