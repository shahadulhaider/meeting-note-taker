import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Meeting, Transcript, JobProgress, ActionItem } from '@meeting-note-taker/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  ChevronLeft,
  Trash2,
  Download,
  FileText,
  ListChecks,
  BookOpen,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

export const MeetingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<JobProgress | null>(null);
  const [deleting, setDeleting] = useState(false);

  // WebSocket for real-time updates
  const { subscribeMeeting, unsubscribeMeeting } = useWebSocket((update: JobProgress) => {
    if (update.meetingId === id) {
      setProgress(update);

      // Update meeting status
      if (meeting) {
        setMeeting({ ...meeting, status: update.status });
      }

      // If completed, fetch the transcript
      if (update.status === 'completed') {
        fetchMeeting();
      }
    }
  });

  useEffect(() => {
    if (id) {
      fetchMeeting();
      subscribeMeeting(id);

      return () => {
        unsubscribeMeeting(id);
      };
    }
  }, [id]);

  const fetchMeeting = async () => {
    try {
      setLoading(true);
      const data = await api.getMeeting(id!);
      setMeeting(data.meeting);
      setTranscript(data.transcript || null);
    } catch (err) {
      setError('Failed to load meeting');
      console.error('Error fetching meeting:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this meeting?')) return;

    try {
      setDeleting(true);
      await api.deleteMeeting(id!);
      navigate('/dashboard');
    } catch (err) {
      console.error('Error deleting meeting:', err);
      alert('Failed to delete meeting');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusMessage = () => {
    if (!meeting) return '';

    switch (meeting.status) {
      case 'processing':
        return 'Processing audio file...';
      case 'transcribing':
        return 'Transcribing audio...';
      case 'summarizing':
        return 'Generating summary and extracting action items...';
      case 'completed':
        return 'Processing complete';
      case 'failed':
        return 'Processing failed';
      default:
        return 'Waiting to process...';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Meeting not found</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  const isProcessing = ['processing', 'transcribing', 'summarizing'].includes(meeting.status);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Meeting Info */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{meeting.title}</CardTitle>
              <CardDescription className="mt-2">
                {format(new Date(meeting.createdAt), 'PPP')} at {format(new Date(meeting.createdAt), 'p')}
              </CardDescription>
            </div>
            <Badge
              variant={meeting.status === 'completed' ? 'default' : 'secondary'}
            >
              {meeting.status}
            </Badge>
          </div>
          {meeting.description && (
            <p className="text-muted-foreground mt-3">{meeting.description}</p>
          )}
        </CardHeader>

        {isProcessing && (
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{getStatusMessage()}</span>
                <span className="font-medium">{progress?.progress || 0}%</span>
              </div>
              <Progress value={progress?.progress || 0} />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Content Tabs */}
      {transcript && meeting.status === 'completed' ? (
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary">
              <BookOpen className="h-4 w-4 mr-2" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="transcript">
              <FileText className="h-4 w-4 mr-2" />
              Transcript
            </TabsTrigger>
            <TabsTrigger value="action-items">
              <ListChecks className="h-4 w-4 mr-2" />
              Action Items
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Meeting Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{transcript.summary || 'No summary available'}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transcript" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Full Transcript</CardTitle>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{transcript.content}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="action-items" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Action Items</CardTitle>
              </CardHeader>
              <CardContent>
                {transcript.actionItems && (transcript.actionItems as ActionItem[]).length > 0 ? (
                  <div className="space-y-3">
                    {(transcript.actionItems as ActionItem[]).map((item, index) => (
                      <div key={item.id || index} className="flex items-start space-x-3 p-3 bg-accent/50 rounded-lg">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.text}</p>
                          {item.assignee && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Assigned to: {item.assignee}
                            </p>
                          )}
                        </div>
                        {item.priority && (
                          <Badge variant={
                            item.priority === 'high' ? 'destructive' :
                            item.priority === 'medium' ? 'default' :
                            'secondary'
                          }>
                            {item.priority}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No action items found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : meeting.status === 'failed' ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-destructive mb-4">Processing failed. Please try uploading the audio again.</p>
            <Button onClick={() => navigate('/meetings/new')}>Create New Meeting</Button>
          </CardContent>
        </Card>
      ) : meeting.status === 'pending' ? (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No audio file uploaded yet</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};
