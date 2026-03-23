import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCoordinator } from '@/lib/coordinator-context';
import { getCached, setCache, isOnline } from '@/lib/offline-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import TrustBadge from '@/components/TrustBadge';
import { UserPlus, LogOut, MapPin, Users } from 'lucide-react';

interface MemberWithScore {
  id: string;
  member_name: string;
  trustScore: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { coordinator, logout } = useCoordinator();
  const [members, setMembers] = useState<MemberWithScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!coordinator) {
      navigate('/');
      return;
    }
    fetchMembers();
  }, [coordinator, navigate]);

  const fetchMembers = async () => {
    if (!coordinator) return;

    const cacheKey = `members_${coordinator.id}`;

    // Try network first
    if (isOnline()) {
      const { data: membersData } = await supabase
        .from('members')
        .select('id, member_name')
        .eq('coordinator_id', coordinator.id)
        .order('created_at', { ascending: false });

      if (membersData) {
        const membersWithScores: MemberWithScore[] = await Promise.all(
          membersData.map(async (m) => {
            const { data: contribs } = await supabase
              .from('contributions')
              .select('paid_on_time')
              .eq('member_id', m.id);
            const total = contribs?.length || 0;
            const onTime = contribs?.filter(c => c.paid_on_time).length || 0;
            const trustScore = total > 0 ? Math.round((onTime / total) * 100) : 0;
            return { ...m, trustScore };
          })
        );
        setMembers(membersWithScores);
        setCache(cacheKey, membersWithScores);
        setLoading(false);
        return;
      }
    }

    // Fallback to cache
    const cached = getCached<MemberWithScore[]>(cacheKey);
    if (cached) setMembers(cached);
    setLoading(false);
  };

  if (!coordinator) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-lg mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{coordinator.full_name}</h1>
            <p className="text-lg text-muted-foreground">{coordinator.group_name}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="h-3.5 w-3.5" /> {coordinator.location}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => { logout(); navigate('/'); }}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>

        {/* Stats */}
        <Card>
          <CardContent className="py-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center">
              <Users className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{members.length}</p>
              <p className="text-sm text-muted-foreground">Total Members</p>
            </div>
          </CardContent>
        </Card>

        {/* Add Member */}
        <Button className="w-full" size="lg" onClick={() => navigate('/add-member')}>
          <UserPlus className="mr-2 h-5 w-5" /> Add New Member
        </Button>

        {/* Member List */}
        {loading ? (
          <div className="text-center text-muted-foreground py-8">Loading members...</div>
        ) : members.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No members yet. Add your first member to get started.
          </div>
        ) : (
          <div className="space-y-2">
            {members.map((m) => (
              <Card
                key={m.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/member/${m.id}`)}
              >
                <CardContent className="py-4 flex items-center justify-between">
                  <span className="font-medium">{m.member_name}</span>
                  <TrustBadge score={m.trustScore} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
