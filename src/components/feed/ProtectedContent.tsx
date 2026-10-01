'use client';

import { useEffect, useState } from 'react';

export default function ProtectedContent({ children }: { children: React.ReactNode }) {
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const handleBlur = () => {
      setIsHidden(true);
      alert('Le contenu est protégé et ne peut pas être copié ou partagé. Veuillez utiliser le bouton d\'exportation officiel pour obtenir ce document.');
    };

    const handleFocus = () => {
      setIsHidden(false);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        setIsHidden(true);
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText('');
        }
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="relative select-none">
      {isHidden && (
        <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center text-white text-center p-6 z-50 rounded-lg transition-all duration-150">
          <p className="font-semibold text-lg">
            Contenu protégé
          </p>
          <p className="text-sm text-slate-300 mt-2">
            Veuillez utiliser le bouton d’exportation officiel pour obtenir ce document.
          </p>
        </div>
      )}
      <div className={isHidden ? 'opacity-0 pointer-events-none filter blur-xl' : 'opacity-100'}>
        {children}
      </div>
    </div>
  );
}