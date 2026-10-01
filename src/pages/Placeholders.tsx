import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

function Shell({ title, text, children }: { title: string; text: string; children?: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="parchment w-full max-w-md space-y-4 p-6 text-center">
        <h1 className="gold-text text-2xl">{title}</h1>
        <p className="text-muted-foreground">{text}</p>
        {children}
      </div>
    </div>
  );
}

export function Quiz() {
  const nav = useNavigate();
  return (
    <Shell title="Quiz de Perfil" text="Em breve: descubra seu perfil de herói (etapa 2).">
      <Button onClick={() => { localStorage.setItem('life-os-quiz', JSON.stringify({ done: true })); nav('/register'); }}>Continuar para cadastro</Button>
      <Link to="/login" className="block text-sm text-primary">Já tenho conta</Link>
    </Shell>
  );
}

export function Onboarding() {
  const { updateProfile } = useAuth();
  const nav = useNavigate();
  return (
    <Shell title="Onboarding" text="Em breve: configuração inicial inteligente (etapa 6).">
      <Button onClick={async () => { await updateProfile({ onboarding_completed: true }); nav('/dashboard'); }}>Concluir</Button>
    </Shell>
  );
}

export function Settings() {
  return <Shell title="Configurações" text="Em breve (etapa 7)."><Link to="/dashboard" className="text-primary">Voltar</Link></Shell>;
}

export function Plans() {
  return <Shell title="Planos" text="Em breve (etapa 7)."><Link to="/dashboard" className="text-primary">Voltar</Link></Shell>;
}
