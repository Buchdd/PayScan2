import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
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
  if (!stream) {
    return <NotFoundPage />;
  }
  return <StreamPage stream={stream} onCreateTransfer={onCreateTransfer} />;
};

function App() {
  const [user, setUser] = useState<FrameworkUser | null>(null);
  const [streams, setStreams] = useState<Stream[]>(mockFrameworkUser.streams);
  const [authError, setAuthError] = useState<string | undefined>();

  const handleLogin = async (email: string, password: string) => {
    setAuthError(undefined);
    try {
      const logged = await login(email, password);
      setUser(logged);
      setStreams(logged.streams);
    } catch (error) {
      console.error(error);
      setUser({ ...mockFrameworkUser, email });
      setStreams(mockFrameworkUser.streams);
      setAuthError('Работаем в офлайн-режиме. Данные тестовые.');
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
  };

  const handleTransfer = async (payload: TransferPayload) => {
    const response = await createTransfer(payload);
    return response.reference;
  };

  if (!user) {
    return <LoginScreen onSubmit={handleLogin} error={authError} />;
  }

  return (
    <BrowserRouter>
      <AppLayout user={user} streams={streams} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<DashboardPage streams={streams} />} />
          <Route
            path="/streams/:streamId"
            element={
              <StreamRoute streams={streams} onCreateTransfer={handleTransfer} />
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
