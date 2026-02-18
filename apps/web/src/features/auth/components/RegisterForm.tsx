import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../auth.api';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

export const RegisterForm = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'manager' | 'employee'>('employee');
  const [register, { isLoading }] = useRegisterMutation();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await register({ name, email, password, role }).unwrap();
    navigate('/dashboard/projects', { replace: true });
  };

  return (
    <form className="card auth-form" onSubmit={onSubmit}>
      <div className="auth-form-head">
        <h2>Create your account</h2>
        <p className="muted">Set your role and start collaborating.</p>
      </div>
      <Input label="Name" value={name} onChange={(event) => setName(event.target.value)} required />
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

      <label className="field" htmlFor="register-role">
        <span className="field-label">Role</span>
        <select
          id="register-role"
          className="input"
          value={role}
          onChange={(event) => setRole(event.target.value as 'admin' | 'manager' | 'employee')}
        >
          <option value="employee">Employee</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
      </label>

      <Button type="submit" fullWidth disabled={isLoading}>
        {isLoading ? 'Creating account...' : 'Create account'}
      </Button>
      <Button type="button" variant="secondary" fullWidth onClick={() => navigate('/login')}>
        Back to sign in
      </Button>
    </form>
  );
};
