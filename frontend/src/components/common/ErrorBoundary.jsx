import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service here
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong.</h1>
            <p className="text-slate-600 mb-6">An unexpected error occurred in the application.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
            >
              Reload Page
            </button>
        {import.meta.env.DEV && this.state.error && (
              <details className="mt-6 text-left p-4 bg-slate-100 rounded-lg overflow-auto max-h-48 text-xs text-slate-700">
                <summary className="cursor-pointer font-semibold mb-2">Error Details</summary>
                <pre>{this.state.error.toString()}</pre>
                <pre className="mt-2">{this.state.errorInfo?.componentStack}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
