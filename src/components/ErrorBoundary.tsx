"use client";

/**
 * SUTRA — React Component Error Boundary
 *
 * Granular error boundary to prevent an isolated workspace tab fault
 * from crashing the entire application shell.
 */

import React, { Component, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    errorMessage: "",
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message || "An unexpected error occurred in this workspace view.",
    };
  }

  public override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("[SUTRA Component Error Boundary]", error, errorInfo);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, errorMessage: "" });
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-2xl border border-rose-500/30 bg-zinc-950 p-6 shadow-xl space-y-4 my-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">
                {this.props.fallbackTitle ?? "Workspace Rendering Exception"}
              </h3>
              <p className="text-xs text-zinc-400">
                This panel encountered a local fault. Surrounding navigation and your data remain safe.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-3 font-mono text-xs text-rose-300">
            {this.state.errorMessage}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-semibold text-zinc-950 hover:bg-amber-400 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Retry Component</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
