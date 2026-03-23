import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCoordinator } from '@/lib/coordinator-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { toast } from 'sonner';

const AuthPage = () => {
  const navigate = useNavigate();
  const { coordinator, setCoordinator } = useCoordinator();
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Login fields
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPin, setLoginPin] = useState('');

  // Register fields
  const [fullName, setFullName] = useState('');
  const [groupName, setGroupName] = useState('');
  const [location, setLocation] = useState('');
  const [weeklyAmount, setWeeklyAmount] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPin, setRegPin] = useState('');

  useEffect(() => {
    if (coordinator) {
      navigate('/dashboard');
      return;
    }
    setLoading(false);
  }, [coordinator, navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (regPin.length !== 4 || !/^\d{4}$/.test(regPin)) {
      setError('PIN must be exactly 4 digits');
      return;
    }
    setSubmitting(true);
    const { data, error: err } = await supabase.from('coordinators').insert({
      full_name: fullName.trim(),
      group_name: groupName.trim(),
      location: location.trim(),
      weekly_contribution_amount: parseInt(weeklyAmount),
      phone_number: regPhone.trim(),
      pin: regPin,
    }).select().single();

    if (err) {
      setError(err.message);
      setSubmitting(false);
      return;
    }
    setCoordinator({
      id: data.id,
      full_name: data.full_name,
      group_name: data.group_name,
      location: data.location,
      weekly_contribution_amount: data.weekly_contribution_amount,
      phone_number: data.phone_number,
    });
    toast.success('Registration successful!');
    navigate('/dashboard');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const { data, error: err } = await supabase
      .from('coordinators')
      .select('*')
      .eq('phone_number', loginPhone.trim())
      .single();

    if (err || !data) {
      setError('Phone number not found.');
      setSubmitting(false);
      return;
    }
    if (data.pin !== loginPin) {
      setError('Incorrect PIN. Please try again.');
      setSubmitting(false);
      return;
    }
    setCoordinator({
      id: data.id,
      full_name: data.full_name,
      group_name: data.group_name,
      location: data.location,
      weekly_contribution_amount: data.weekly_contribution_amount,
      phone_number: data.phone_number,
    });
    toast.success('Welcome back!');
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary flex items-center justify-center">
            <Shield className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">TrustCore</CardTitle>
          <CardDescription>
            {isRegistering ? 'Set up your savings group' : 'Welcome back, coordinator'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isRegistering ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Chinedu Okafor" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="groupName">Group Name</Label>
                <Input id="groupName" required value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="Unity Savings Club" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" required value={location} onChange={e => setLocation(e.target.value)} placeholder="Lagos, Nigeria" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weeklyAmount">Weekly Contribution Amount (₦)</Label>
                <Input id="weeklyAmount" type="number" required min={1} value={weeklyAmount} onChange={e => setWeeklyAmount(e.target.value)} placeholder="5000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="regPhone">Phone Number</Label>
                <Input id="regPhone" required value={regPhone} onChange={e => setRegPhone(e.target.value)} placeholder="08012345678" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="regPin">4-Digit PIN</Label>
                <Input id="regPin" type="password" required maxLength={4} inputMode="numeric" pattern="\d{4}" value={regPin} onChange={e => setRegPin(e.target.value)} placeholder="••••" />
              </div>
              {error && <p className="text-sm text-destructive font-medium">{error}</p>}
              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Account'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="loginPhone">Phone Number</Label>
                <Input id="loginPhone" required value={loginPhone} onChange={e => setLoginPhone(e.target.value)} placeholder="08012345678" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="loginPin">4-Digit PIN</Label>
                <Input id="loginPin" type="password" required maxLength={4} inputMode="numeric" pattern="\d{4}" value={loginPin} onChange={e => setLoginPin(e.target.value)} placeholder="••••" />
              </div>
              {error && <p className="text-sm text-destructive font-medium">{error}</p>}
              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting ? 'Logging in...' : 'Login'}
              </Button>
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  <button type="button" className="underline hover:text-foreground" onClick={() => toast.info('Please contact TrustCore support to reset your PIN.')}>
                    Forgot PIN?
                  </button>
                </p>
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <button type="button" className="underline hover:text-foreground font-medium" onClick={() => { setIsRegistering(true); setError(''); }}>
                    Register
                  </button>
                </p>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
