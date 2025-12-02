import { useState } from 'react';
import type { FormEvent } from 'react';

interface LoginScreenProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  error?: string;
}

const LoginScreen = ({ onSubmit, error }: LoginScreenProps) => {
  const [email, setEmail] = useState('owner@payscan.local');
  const [password, setPassword] = useState('demo');
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    try {
      await onSubmit(email, password);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="auth-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-card__header">
          <h1>PayScan</h1>
          <p>Войдите, чтобы управлять стримами и платежами</p>
        </div>

        <label className="form-field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label className="form-field">
          <span>Пароль</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        {error ? <div className="auth-card__error">{error}</div> : null}

        <button className="primary-button" disabled={pending}>
          {pending ? 'Входим...' : 'Войти'}
        </button>
      </form>
    </div>
  );
};

export default LoginScreen;

