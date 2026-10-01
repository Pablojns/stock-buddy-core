import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';

function AuthCard({ mode }: { mode: 'login' | 'register' }) {
  const auth = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const isLogin = mode === 'login';

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const err = isLogin ? await auth.signIn(email, password) : await auth.signUp(email, password);
    setBusy(false);
    if (err) return toast.error(err);
    if (isLogin) nav('/dashboard');
    else toast.success('Conta criada! Confirme seu e-mail para entrar.');
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={submit} className="parchment w-full max-w-sm space-y-4 p-6">
        <h1 className="gold-text text-center text-2xl">Life OS</h1>
        <p className="text-center text-muted-foreground">{isLogin ? 'Retorne à sua jornada' : 'Comece sua jornada'}</p>
        <Input type="email" required placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="E-mail" />
        <Input type="password" required minLength={6} placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} aria-label="Senha" />
        <Button type="submit" className="w-full" disabled={busy}>{isLogin ? 'Entrar' : 'Criar conta'}</Button>
        <Button type="button" variant="outline" className="w-full" onClick={async () => { const err = await auth.signInWithGoogle(); if (err) toast.error(err); }}>
          Continuar com Google
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          {isLogin ? <>Novo por aqui? <Link to="/quiz" className="text-primary">Faça o quiz</Link></> : <>Já tem conta? <Link to="/login" className="text-primary">Entrar</Link></>}
        </p>
      </form>
    </div>
  );
}

export const Login = () => <AuthCard mode="login" />;
export const Register = () => <AuthCard mode="register" />;
