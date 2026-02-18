import { LoginForm } from '../components/LoginForm';

export const LoginPage = () => {
  return (
    <div className="auth-page">
      <section className="auth-shell">
        <article className="auth-hero">
          <p className="auth-kicker">Welcome back</p>
          <h1>FlowDesk</h1>
          <p className="muted">
            Ship projects faster with focused task flow, approvals, and live team visibility.
          </p>
        </article>
        <LoginForm />
      </section>
    </div>
  );
};
