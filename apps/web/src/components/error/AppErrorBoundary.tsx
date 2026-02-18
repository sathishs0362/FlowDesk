import { Component, type ErrorInfo, type ReactNode } from 'react';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  public constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Unhandled UI error:', error, errorInfo);
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="fatal-error">
          <h2>Something went wrong</h2>
          <p className="muted">Please refresh the page or sign in again.</p>
        </div>
      );
    }

    return this.props.children;
  }
}
