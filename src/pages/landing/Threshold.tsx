// src/pages/landing/Threshold.tsx
import { useUIStore } from '@/stores/ui';
import { useUserStore } from '@/stores/user';
import { useNavigate } from '@/navigation';

export default function Threshold() {
  const { setShowLoginDialog } = useUIStore();
  const { publicKey } = useUserStore();
  const navigate = useNavigate();

  if (publicKey) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-base-300 to-base-200 p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          believer.go
        </h1>
        <p className="text-xl mb-8 text-base-content/80 leading-relaxed">
          Where belief meets the public square.
        </p>
        <p className="text-lg mb-12 text-base-content/70">
          A digital cathedral for faith, reason, and community.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={() => setShowLoginDialog(true)}
            className="btn btn-primary btn-lg"
          >
            Sign In with Alby
          </button>
          <button
            onClick={() => navigate('/room/square')}
            className="btn btn-ghost btn-lg"
          >
            Enter as Guest
          </button>
        </div>

        <p className="text-sm text-base-content/50">
          No account needed to explore.
        </p>
      </div>
    </div>
  );
}