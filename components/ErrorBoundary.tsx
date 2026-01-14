import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-[#09090b] p-6 text-center">
                    <div className="size-20 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-4xl text-rose-600 dark:text-rose-400">error_outline</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 mb-2">Ops! Algo deu errado.</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 max-w-md mb-8">
                        Desculpe, encontramos um erro inesperado. Tente recarregar a página.
                    </p>
                    <div className="flex gap-4">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow-lg hover:scale-105 transition-transform"
                        >
                            Recarregar Página
                        </button>
                        <button
                            onClick={() => {
                                localStorage.clear();
                                window.location.reload();
                            }}
                            className="px-6 py-3 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold rounded-xl hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
                        >
                            Limpar Cache
                        </button>
                    </div>
                    {this.state.error && (
                        <div className="mt-12 p-4 bg-zinc-100 dark:bg-zinc-900 rounded-lg text-left max-w-xl w-full overflow-auto max-h-40 border border-zinc-200 dark:border-zinc-800">
                            <p className="font-mono text-xs text-rose-500 mb-1">Error Details (Dev Mode):</p>
                            <pre className="font-mono text-xs text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
                                {this.state.error.toString()}
                            </pre>
                        </div>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
