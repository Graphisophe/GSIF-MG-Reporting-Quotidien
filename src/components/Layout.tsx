import { ReactNode } from 'react';
import { motion } from 'motion/react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-[#2C337B] text-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-24 items-center">
            <div className="flex items-center space-x-3">
              <img src="/logo.png" alt="Logo GSIF" className="h-20 w-auto object-contain bg-white p-1 rounded-md" />
              <h1 className="text-xl font-semibold tracking-tight">
                GSIF Marthe Gautier <span className="text-slate-300 font-normal text-sm ml-2 hidden sm:inline-block">| Suivi des Inscriptions</span>
              </h1>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
