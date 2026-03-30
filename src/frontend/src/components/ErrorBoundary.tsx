import { Button } from "@/components/ui/button";
import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  onGoHome?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onGoHome?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex h-full min-h-[400px] flex-col items-center justify-center gap-4 p-8"
          data-ocid="app.error_state"
        >
          <div className="text-center space-y-2">
            <p className="text-2xl font-bold text-destructive">
              Something went wrong
            </p>
            <p className="text-sm text-muted-foreground max-w-sm">
              {this.state.error?.message ?? "An unexpected error occurred."}
            </p>
          </div>
          <Button
            data-ocid="app.error.primary_button"
            variant="outline"
            onClick={this.handleReset}
          >
            Go to Dashboard
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
