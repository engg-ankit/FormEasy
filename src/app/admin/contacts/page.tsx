'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, ArrowLeft, CheckCircle, Archive, Trash2, MessageSquare, Loader2 } from 'lucide-react';
import { Logo } from '@/components/logo';
import Link from 'next/link';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}

export default function AdminContactsPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/admin/contacts', { credentials: 'include' });
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/admin/login';
          return;
        }
        throw new Error('Failed to fetch messages');
      }
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (err) {
      setError('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/admin/contacts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m));
    } catch (err) {
      console.error('Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-100 text-blue-700';
      case 'READ': return 'bg-yellow-100 text-yellow-700';
      case 'REPLIED': return 'bg-green-100 text-green-700';
      case 'ARCHIVED': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900">
      {/* Header */}
      <nav className="bg-primary-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-5 min-h-[88px]">
            <div className="flex items-center gap-3">
              <Logo size="sm" white />
              <h1 className="text-xl font-display font-bold">Contact Messages</h1>
            </div>
            <Link href="/admin">
              <Button variant="outline" className="text-white border-white/30 hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', count: messages.length, color: 'text-primary-600' },
            { label: 'New', count: messages.filter(m => m.status === 'NEW').length, color: 'text-blue-600' },
            { label: 'Replied', count: messages.filter(m => m.status === 'REPLIED').length, color: 'text-green-600' },
            { label: 'Archived', count: messages.filter(m => m.status === 'ARCHIVED').length, color: 'text-gray-600' },
          ].map((stat, i) => (
            <Card key={i}>
              <CardContent className="p-4 text-center">
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
                <p className="text-sm text-neutral-600">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Messages List */}
        {messages.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Mail className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
              <p className="text-neutral-600">No contact messages yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <Card key={msg.id} className={msg.status === 'NEW' ? 'border-2 border-blue-300' : ''}>
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(msg.status)}`}>
                          {msg.status}
                        </span>
                        <span className="text-xs text-neutral-500">
                          {new Date(msg.createdAt).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <h3 className="font-semibold text-primary-900 mb-1">{msg.subject}</h3>
                      <p className="text-sm text-neutral-600 mb-2">
                        From: <span className="font-medium">{msg.name}</span> ({msg.email})
                      </p>
                      <p className="text-neutral-700 bg-neutral-50 rounded-lg p-3 text-sm">
                        {msg.message}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {msg.status === 'NEW' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateStatus(msg.id, 'READ')}
                          className="text-xs"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Mark Read
                        </Button>
                      )}
                      {msg.status !== 'REPLIED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateStatus(msg.id, 'REPLIED')}
                          className="text-xs text-green-600 border-green-300 hover:bg-green-50"
                        >
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Replied
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateStatus(msg.id, 'ARCHIVED')}
                        className="text-xs"
                      >
                        <Archive className="h-3 w-3 mr-1" />
                        Archive
                      </Button>
                    </div>
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
