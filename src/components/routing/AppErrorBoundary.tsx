import { Component, ErrorInfo, ReactNode } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  hasError: boolean;
};

class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  public state: AppErrorBoundaryState = {
    hasError: false,
  };

  public static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Unhandled app error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background font-bengali flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-2xl border border-border bg-card p-6 text-center">
            <AlertTriangle className="w-10 h-10 text-destructive mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-foreground mb-2">কিছু একটা সমস্যা হয়েছে</h1>
            <p className="text-muted-foreground mb-6">
              পেইজটি লোড করতে সমস্যা হয়েছে। হোমে ফিরে গিয়ে আবার চেষ্টা করো।
            </p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={() => window.location.reload()}>
                আবার লোড করো
              </Button>
              <Link to="/">
                <Button variant="hero">হোমে যাও</Button>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
