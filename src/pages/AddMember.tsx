import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCoordinator } from '@/lib/coordinator-context';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

const AddMember = () => {
  const navigate = useNavigate();
  const { coordinator } = useCoordinator();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dateJoined, setDateJoined] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  if (!coordinator) { navigate('/'); return null; }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from('members').insert({
      coordinator_id: coordinator.id,
      member_name: name.trim(),
      phone_number: phone.trim(),
      date_joined: dateJoined,
    });
    if (error) {
      toast.error(error.message);
      setSubmitting(false);
      return;
    }
    toast.success('Member added successfully!');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-lg mx-auto py-2 space-y-4">
        <PageHeader title="Add New Member" />
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Member Name</Label>
                <Input id="name" required value={name} onChange={e => setName(e.target.value)} placeholder="Amina Ibrahim" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="08098765432" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateJoined">Date Joined</Label>
                <Input id="dateJoined" type="date" required value={dateJoined} onChange={e => setDateJoined(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Member'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddMember;
