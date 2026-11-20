import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center p-6 text-center bg-[#18191f] text-gray-200 rounded-2xl border border-amber-500/20">
          <AlertTriangle className="w-10 h-10 text-amber-400 mb-3 animate-pulse" />
          <h2 className="text-base font-semibold mb-1 text-gray-100">
            {this.props.fallbackTitle || 'Đã xảy ra sự cố hiển thị'}
          </h2>
          <p className="text-xs text-gray-400 max-w-md mb-4 font-mono break-words">
            {this.state.error?.message || 'Lỗi không xác định'}
          </p>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-gray-950 font-medium rounded-xl text-xs transition-colors shadow"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Thử tải lại
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
