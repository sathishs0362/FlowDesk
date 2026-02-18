import { RegisterForm } from '../components/RegisterForm';

export const RegisterPage = () => {
  return (
    <div className="auth-page">
      <section className="auth-shell">
        <article className="auth-hero">
          <p className="auth-kicker">Create account</p>
          <h1>Start with FlowDesk</h1>
          <p className="muted">
            Organize your teams with clear workflow states, dependency checks, and shared dashboards.
          </p>
        </article>
        <RegisterForm />
      </section>
    </div>
  );
};
