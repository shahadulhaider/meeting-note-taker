import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Meeting } from '@meeting-note-taker/shared';
import { Plus, Mic, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export const Dashboard = () => {
  const { session } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      fetchMeetings();
    }
  }, [session]);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const data = await api.getMeetings();
      setMeetings(data);
    } catch (err) {
      setError('Failed to load meetings');
      console.error('Error fetching meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
      case 'transcribing':
      case 'summarizing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'processing':
        return 'Processing';
      case 'transcribing':
        return 'Transcribing...';
      case 'summarizing':
        return 'Generating summary...';
      case 'failed':
        return 'Failed';
      default:
        return 'Pending';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error loading meetings</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchMeetings}>Try again</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Your Meetings</h1>
          <p className="text-muted-foreground mt-2">
            Manage and review all your meeting recordings and transcripts
          </p>
        </div>
        <Link to="/meetings/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Meeting
          </Button>
        </Link>
      </div>

      {meetings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Mic className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No meetings yet</h2>
            <p className="text-muted-foreground mb-6">
              Create your first meeting to get started with AI-powered transcription
            </p>
            <Link to="/meetings/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Meeting
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {meetings.map((meeting) => (
            <Link key={meeting.id} to={`/meetings/${meeting.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-1">
                      {meeting.title}
                    </CardTitle>
                    {getStatusIcon(meeting.status)}
                  </div>
                  <CardDescription>
                    {format(new Date(meeting.createdAt), 'PPp')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {meeting.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {meeting.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium px-2 py-1 bg-secondary rounded-full">
                      {getStatusLabel(meeting.status)}
                    </span>
                    {meeting.duration && (
                      <span className="text-xs text-muted-foreground">
                        {Math.floor(meeting.duration / 60)} min
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
