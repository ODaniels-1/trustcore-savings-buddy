import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCoordinator } from '@/lib/coordinator-context';
import { isOnline, enqueue } from '@/lib/offline-store';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

const RecordContribution = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { coordinator } = useCoordinator();

  const { data: member } = useQuery({
    queryKey: ['member', id],
    queryFn: async () => {
      const { data } = await supabase.from('members').select('member_name').eq('id', id!).single();
      return data;
    },
    enabled: !!id,
  });

  const minAmount = coordinator?.weekly_contribution_amount || 0;
  const [amount, setAmount] = useState(String(minAmount));
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paidOnTime, setPaidOnTime] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!coordinator) { navigate('/'); return null; }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const numAmount = parseInt(amount);
    if (numAmount < minAmount) {
      setError(`Amount cannot be less than the group contribution amount (₦${minAmount.toLocaleString()})`);
      return;
    }
    setSubmitting(true);

    const payload = {
      member_id: id!,
      amount: numAmount,
      contribution_date: date,
      paid_on_time: paidOnTime,
    };

    if (isOnline()) {
      const { error: err } = await supabase.from('contributions').insert(payload);
      if (err) {
        toast.error(err.message);
        setSubmitting(false);
        return;
      }
      toast.success('Contribution recorded successfully!');
    } else {
      enqueue('contributions', payload);
      toast.success('Contribution saved offline — will sync when you reconnect');
    }
    navigate(`/member/${id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-lg mx-auto py-2 space-y-4">
        <PageHeader title="Record Contribution" />
        {member && (
          <p className="text-lg font-medium px-1">{member.member_name}</p>
        )}
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount Paid (₦)</Label>
                <Input
                  id="amount"
                  type="number"
                  required
                  min={minAmount}
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Minimum: ₦{minAmount.toLocaleString()}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" required value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="paidOnTime">Paid on Time</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{paidOnTime ? 'Yes' : 'No'}</span>
                  <Switch id="paidOnTime" checked={paidOnTime} onCheckedChange={setPaidOnTime} />
                </div>
              </div>
              {error && <p className="text-sm text-destructive font-medium">{error}</p>}
              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Contribution'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RecordContribution;
