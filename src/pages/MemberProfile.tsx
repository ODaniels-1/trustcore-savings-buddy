import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCoordinator } from '@/lib/coordinator-context';
import PageHeader from '@/components/PageHeader';
import TrustBadge from '@/components/TrustBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, X, FileText, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Contribution {
  id: string;
  amount: number;
  contribution_date: string;
  paid_on_time: boolean;
}

const MemberProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { coordinator } = useCoordinator();
  const [member, setMember] = useState<{ member_name: string; date_joined: string } | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!coordinator) { navigate('/'); return; }
    fetchData();
  }, [id, coordinator]);

  const fetchData = async () => {
    if (!id) return;
    const [memberRes, contribRes] = await Promise.all([
      supabase.from('members').select('member_name, date_joined').eq('id', id).single(),
      supabase.from('contributions').select('*').eq('member_id', id).order('contribution_date', { ascending: false }),
    ]);
    if (memberRes.data) setMember(memberRes.data);
    if (contribRes.data) setContributions(contribRes.data);
    setLoading(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!member) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Member not found</div>;

  const totalContributed = contributions.reduce((sum, c) => sum + c.amount, 0);
  const onTimeCount = contributions.filter(c => c.paid_on_time).length;
  const totalExpected = contributions.length;
  const trustScore = totalExpected > 0 ? Math.round((onTimeCount / totalExpected) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-lg mx-auto py-2 space-y-5">
        <PageHeader title={member.member_name} />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="py-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Trust Score</p>
              <TrustBadge score={trustScore} size="lg" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Total Contributed</p>
              <p className="text-2xl font-bold">₦{totalContributed.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button size="lg" onClick={() => navigate(`/record-contribution/${id}`)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Record Contribution
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate(`/credit-profile/${id}`)}>
            <FileText className="mr-2 h-4 w-4" /> Credit Profile
          </Button>
        </div>

        {/* Contribution History */}
        <div>
          <h2 className="font-semibold mb-3">Contribution History</h2>
          {contributions.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">No contributions recorded yet.</p>
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Week</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-center">On Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contributions.map((c, i) => (
                      <TableRow key={c.id}>
                        <TableCell>{contributions.length - i}</TableCell>
                        <TableCell>₦{c.amount.toLocaleString()}</TableCell>
                        <TableCell>{format(new Date(c.contribution_date), 'dd MMM yyyy')}</TableCell>
                        <TableCell className="text-center">
                          {c.paid_on_time ? (
                            <Check className="h-5 w-5 text-success mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-destructive mx-auto" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberProfile;
