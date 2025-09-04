import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import heartFlowers from '/heart-flowerss.png';
import { Eye, EyeOff, Loader2, Mail, Lock, User as UserIcon, ShieldCheck, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const emailRegex = /^(?:[a-zA-Z0-9_'^&/+-])+(?:\.(?:[a-zA-Z0-9_'^&/+-])+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

function passwordScore(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ['Very weak', 'Weak', 'Okay', 'Good', 'Strong'];
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-600'];
  return { score, label: labels[Math.max(0, score - 1)] ?? 'Very weak', color: colors[Math.max(0, score - 1)] ?? 'bg-red-500' };
}

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwdSignIn, setShowPwdSignIn] = useState(false);
  const [showPwdSignUp, setShowPwdSignUp] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [errors, setErrors] = useState<{ email?: string; password?: string; displayName?: string; terms?: string }>({});
  const { signUp, signIn, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    // basic inline validation
    const next: typeof errors = {};
    if (!email) next.email = 'Email is required';
    else if (!emailRegex.test(email)) next.email = 'Enter a valid email';

    if (!password) next.password = 'Password is required';
    else if (activeTab === 'signup' && password.length < 6) next.password = 'At least 6 characters';

    if (activeTab === 'signup' && displayName.trim().length === 0) next.displayName = 'Please enter your name';
    if (activeTab === 'signup' && !acceptTerms) next.terms = 'Please accept the terms';

    setErrors(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, password, displayName, acceptTerms, activeTab]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(errors).length) return;
    setLoading(true);
    
    try {
      const { error } = await signUp(email, password, displayName);
      
      if (error) {
        toast({
          title: 'Sign up failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Welcome to CoupleConnect!',
          description: 'Please check your email to verify your account.',
        });
      }
    } catch (error) {
      toast({
        title: 'Something went wrong',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(errors).length) return;
    setLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast({
          title: 'Sign in failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: 'Something went wrong',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email || !emailRegex.test(email)) {
      toast({ title: 'Enter a valid email', variant: 'destructive' });
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) {
      toast({ title: 'Reset failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Reset link sent', description: 'Check your inbox to reset your password.' });
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin + '/dashboard' },
      });
      if (error) {
        toast({ title: 'OAuth failed', description: error.message, variant: 'destructive' });
      }
    } finally {
      setLoading(false);
    }
  };

  const signinPwdType = showPwdSignIn ? 'text' : 'password';
  const signupPwdType = showPwdSignUp ? 'text' : 'password';
  const strength = passwordScore(password);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        <div className="hidden md:block">
          <div className="relative overflow-hidden rounded-2xl bg-card/70 backdrop-blur-sm border border-border/50 p-8 shadow-romantic">
            <div className="flex items-center gap-3 mb-6">
              <img src={heartFlowers} alt="Heart" className="w-12 h-12 animate-heart-float" />
              <h1 className="font-serif text-4xl font-bold text-foreground">Couple<span className="text-primary">Connect</span></h1>
            </div>
            <ul className="space-y-4 text-muted-foreground">
              <li className="flex items-start gap-3"><ShieldCheck className="h-5 w-5 text-primary mt-0.5" /><span>Privacy-first: your love story stays yours.</span></li>
              <li className="flex items-start gap-3"><ShieldCheck className="h-5 w-5 text-primary mt-0.5" /><span>Shared memories, goals, and mood tracking.</span></li>
              <li className="flex items-start gap-3"><ShieldCheck className="h-5 w-5 text-primary mt-0.5" /><span>Beautiful UI designed for couples.</span></li>
            </ul>
          </div>
        </div>

        <div>
          <div className="text-center mb-6 md:hidden">
            <div className="flex items-center justify-center gap-3 mb-3">
              <img src={heartFlowers} alt="Heart" className="w-10 h-10 animate-heart-float" />
              <h1 className="font-serif text-3xl font-bold text-foreground">Couple<span className="text-primary">Connect</span></h1>
            </div>
            <p className="text-muted-foreground">Create your beautiful love story journal</p>
          </div>

          <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-romantic">
            <CardHeader>
              <CardTitle className="text-center font-serif text-2xl text-foreground">Welcome Back</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                {/* Sign In */}
                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@email.com" className="pl-9" aria-invalid={!!errors.email} />
                      </div>
                      {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="password" type={signinPwdType} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="pl-9 pr-10" aria-invalid={!!errors.password} />
                        <button type="button" onClick={() => setShowPwdSignIn((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={showPwdSignIn ? 'Hide password' : 'Show password'}>
                          {showPwdSignIn ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                      <div className="text-right">
                        <button type="button" onClick={handleResetPassword} className="text-sm text-primary hover:underline">Forgot password?</button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full" variant="romantic" disabled={loading || Object.keys(errors).length > 0}>
                      {loading ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</span> : 'Sign In'}
                    </Button>

                    <div className="relative py-2 text-center text-xs text-muted-foreground">
                      <span className="bg-card px-2 relative z-10">or continue with</span>
                      <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button type="button" variant="outline" onClick={() => handleOAuth('google')} disabled={loading}>
                        {/* Simple G */}
                        <span className="mr-2 rounded-sm bg-white text-[#4285F4] font-bold w-4 h-4 inline-flex items-center justify-center">G</span>
                        Google
                      </Button>
                      <Button type="button" variant="outline" onClick={() => handleOAuth('github')} disabled={loading}>
                        {/* Octocat-like placeholder */}
                        <span className="mr-2">🐱</span>
                        GitHub
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                {/* Sign Up */}
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Your Name</Label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="displayName" type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your beautiful name" className="pl-9" aria-invalid={!!errors.displayName} />
                      </div>
                      {errors.displayName && <p className="text-sm text-destructive">{errors.displayName}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@email.com" className="pl-9" aria-invalid={!!errors.email} />
                      </div>
                      {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="password" type={signupPwdType} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" minLength={6} className="pl-9 pr-10" aria-invalid={!!errors.password} />
                        <button type="button" onClick={() => setShowPwdSignUp((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={showPwdSignUp ? 'Hide password' : 'Show password'}>
                          {showPwdSignUp ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                      <div className="h-1.5 w-full rounded bg-muted overflow-hidden" aria-hidden>
                        <div className={`h-full transition-all duration-300 ${strength.color}`} style={{ width: `${(strength.score / 5) * 100}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground">Strength: {strength.label}</p>
                    </div>

                    <div className="flex items-start gap-2">
                      <input id="terms" type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} className="mt-1" />
                      <Label htmlFor="terms" className="text-sm text-muted-foreground">I agree to the <a className="text-primary hover:underline" href="#" onClick={(e) => e.preventDefault()}>Terms</a> and <a className="text-primary hover:underline" href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>.</Label>
                    </div>
                    {errors.terms && <p className="text-sm text-destructive">{errors.terms}</p>}

                    <Button type="submit" className="w-full" variant="romantic" disabled={loading || Object.keys(errors).length > 0}>
                      {loading ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Creating account…</span> : 'Create Account'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <div className="text-center mt-6">
            <Button variant="ghost" onClick={() => navigate('/')} className="text-muted-foreground hover:text-primary">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;