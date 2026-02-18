import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../auth.api';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

export const LoginForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login, { isLoading }] = useLoginMutation();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await login({ email, password }).unwrap();
    navigate('/dashboard/projects', { replace: true });
  };

  return (
    <form className="card auth-form" onSubmit={onSubmit}>
      <div className="auth-form-head">
        <h2>Sign in</h2>
        <p className="muted">Continue to your dashboard.</p>
      </div>
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />
      <Button type="submit" fullWidth disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>
      <Button type="button" variant="secondary" fullWidth onClick={() => navigate('/register')}>
        Create account
      </Button>
    </form>
  );
};
