'use client';

import { useEffect, useState } from 'react';

export default function ProtectedContent({ children }: { children: React.ReactNode }) {
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsHidden(true);
        alert('Le contenu est masqué. Utilisez le bouton d\'exportation pour télécharger le document.');
      } else {
        setIsHidden(false);
        alert('Le contenu est de nouveau visible.');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return (
    <div className="relative">
      {isHidden && (
        <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center text-white text-center p-4 z-50 rounded-lg">
          <p className="font-semibold">
            Contenu masqué. Utilisez le bouton d'exportation pour télécharger le document.
          </p>
        </div>
      )}
      <div className={isHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'}>
        {children}
      </div>
    </div>
  );
}