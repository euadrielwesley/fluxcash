import React from 'react';

const PageLoader: React.FC = () => {
    return (
        <div className="flex items-center justify-center min-h-[400px] w-full">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="size-12 border-4 border-zinc-200 dark:border-zinc-800 border-t-primary rounded-full animate-spin"></div>
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 animate-pulse">Carregando...</p>
            </div>
        </div>
    );
};

export default PageLoader;
