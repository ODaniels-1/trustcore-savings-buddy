import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCoordinator } from '@/lib/coordinator-context';
import PageHeader from '@/components/PageHeader';
import TrustBadge from '@/components/TrustBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Download } from 'lucide-react';
import { differenceInMonths } from 'date-fns';

const CreditProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { coordinator } = useCoordinator();
  const cardRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{
    memberName: string;
    dateJoined: string;
    trustScore: number;
    totalContributed: number;
    onTimePayments: number;
    totalMonths: number;
  } | null>(null);

  useEffect(() => {
    if (!coordinator) { navigate('/'); return; }
    fetchProfile();
  }, [id, coordinator]);

  const fetchProfile = async () => {
    if (!id) return;
    const [memberRes, contribRes] = await Promise.all([
      supabase.from('members').select('member_name, date_joined').eq('id', id).single(),
      supabase.from('contributions').select('*').eq('member_id', id),
    ]);

    if (!memberRes.data) { setLoading(false); return; }

    const contribs = contribRes.data || [];
    const onTime = contribs.filter(c => c.paid_on_time).length;
    const total = contribs.length;
    const trustScore = total > 0 ? Math.round((onTime / total) * 100) : 0;
    const totalContributed = contribs.reduce((s, c) => s + c.amount, 0);
    const totalMonths = differenceInMonths(new Date(), new Date(memberRes.data.date_joined)) || 1;

    setProfile({
      memberName: memberRes.data.member_name,
      dateJoined: memberRes.data.date_joined,
      trustScore,
      totalContributed,
      onTimePayments: onTime,
      totalMonths: Math.max(totalMonths, 1),
    });
    setLoading(false);
  };

  const handleDownloadPDF = async () => {
    // Dynamic import to keep bundle small
    const { default: html2canvas } = await import('html2canvas');
    const { default: jsPDF } = await import('jspdf');

    if (!cardRef.current) return;

    const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    pdf.save(`TrustCore-${profile?.memberName || 'Credit-Profile'}.pdf`);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!profile || !coordinator) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Profile not found</div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-lg mx-auto py-2 space-y-4">
        <PageHeader title="Credit Profile" />

        <div ref={cardRef}>
          <Card className="overflow-hidden">
            <div className="bg-primary p-6 text-center">
              <Shield className="h-10 w-10 text-primary-foreground mx-auto mb-2" />
              <h2 className="text-xl font-bold text-primary-foreground">TrustCore</h2>
              <p className="text-primary-foreground/80 text-sm">Credit Profile</p>
            </div>
            <CardContent className="pt-6 space-y-5">
              <div className="text-center">
                <h3 className="text-xl font-bold">{profile.memberName}</h3>
                <div className="mt-3">
                  <TrustBadge score={profile.trustScore} size="lg" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Group Name</p>
                  <p className="font-medium">{coordinator.group_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Coordinator</p>
                  <p className="font-medium">{coordinator.full_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Months Active</p>
                  <p className="font-medium">{profile.totalMonths}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Contributed</p>
                  <p className="font-medium">₦{profile.totalContributed.toLocaleString()}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">On-Time Payments</p>
                  <p className="font-medium">{profile.onTimePayments}</p>
                </div>
              </div>

              <p className="text-sm italic text-muted-foreground text-center border-t pt-4">
                This member has demonstrated consistent financial discipline within a verified community savings group.
              </p>
            </CardContent>
          </Card>
        </div>

        <Button className="w-full" size="lg" onClick={handleDownloadPDF}>
          <Download className="mr-2 h-5 w-5" /> Download as PDF
        </Button>
      </div>
    </div>
  );
};

export default CreditProfile;
