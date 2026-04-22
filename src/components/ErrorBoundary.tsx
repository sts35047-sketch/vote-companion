import { Component, ReactNode } from "react";

interface State { hasError: boolean; message?: string }

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message };
  }
  componentDidCatch(err: Error) {
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught:", err);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="glass rounded-3xl p-8 max-w-md text-center">
            <div className="text-5xl mb-3">😬</div>
            <h2 className="text-xl font-bold mb-2">Something glitched</h2>
            <p className="text-muted-foreground text-sm mb-4">{this.state.message ?? "Please refresh the page."}</p>
            <button onClick={() => location.reload()} className="btn-3d">Refresh</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
