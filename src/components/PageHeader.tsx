import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

const PageHeader = ({ title, showBack = true, rightAction }: PageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between py-4 px-1">
      <div className="flex items-center gap-3">
        {showBack && (
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <h1 className="text-xl font-bold truncate">{title}</h1>
      </div>
      {rightAction}
    </div>
  );
};

export default PageHeader;
