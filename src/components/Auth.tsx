import { useState } from 'react';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { LogIn } from 'lucide-react';

export function Auth() {
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(`Erreur lors de la connexion: ${err.message || 'Veuillez réessayer.'}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img src="/logo.png" alt="Logo GSIF" className="h-48 w-auto object-contain" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Connexion
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Connectez-vous pour accéder au tableau de bord
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <button
            onClick={handleLogin}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#2C337B] hover:bg-[#1e2354] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2C337B] transition-colors"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Se connecter avec Google
          </button>
        </div>
      </div>
    </div>
  );
}
