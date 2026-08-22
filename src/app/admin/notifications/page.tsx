'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Check, CheckCheck, ArrowLeft, User, CreditCard, FileText, MessageSquare, Key, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  userId: string | null;
  userName: string | null;
  examName: string | null;
  amount: number | null;
  status: string;
  createdAt: string;
}

export default function AdminNotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }
    if (status === 'authenticated') {
      fetchNotifications();
    }
  }, [status]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/admin/notifications?limit=100');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (ids: string[]) => {
    try {
      await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      // Update local state
      setNotifications(prev =>
        prev.map(n => (ids.includes(n.id) ? { ...n, status: 'READ' } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - ids.length));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications(prev => prev.map(n => ({ ...n, status: 'READ' })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SIGNUP': return <User className="h-5 w-5 text-green-500" />;
      case 'FORM_SUBMIT': return <FileText className="h-5 w-5 text-blue-500" />;
      case 'PAYMENT': return <CreditCard className="h-5 w-5 text-purple-500" />;
      case 'STATUS_CHANGE': return <RefreshCw className="h-5 w-5 text-orange-500" />;
      case 'FORM_REQUEST': return <MessageSquare className="h-5 w-5 text-yellow-500" />;
      case 'OTP_RELAY': return <Key className="h-5 w-5 text-red-500" />;
      default: return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SIGNUP': return 'bg-green-50 border-green-200';
      case 'FORM_SUBMIT': return 'bg-blue-50 border-blue-200';
      case 'PAYMENT': return 'bg-purple-50 border-purple-200';
      case 'STATUS_CHANGE': return 'bg-orange-50 border-orange-200';
      case 'FORM_REQUEST': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
                <p className="text-sm text-gray-500">{unreadCount} unread</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchNotifications}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
              {unreadCount > 0 && (
                <Button variant="primary" size="sm" onClick={markAllAsRead}>
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Mark All Read
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notification List */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BellOff className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No notifications yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Notifications will appear here when users signup, submit forms, or make payments.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  notification.status === 'UNREAD'
                    ? `${getTypeColor(notification.type)} border-l-4`
                    : 'bg-white'
                }`}
                onClick={() => {
                  if (notification.status === 'UNREAD') {
                    markAsRead([notification.id]);
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-semibold ${notification.status === 'UNREAD' ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h3>
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-gray-600 whitespace-pre-line">
                        {notification.message}
                      </div>
                      {notification.amount && (
                        <div className="mt-2 inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                          ₹{(notification.amount / 100).toLocaleString('en-IN')}
                        </div>
                      )}
                    </div>
                    {notification.status === 'UNREAD' && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
