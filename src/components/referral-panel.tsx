'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, Copy, Check, Users, IndianRupee, Share2 } from 'lucide-react';

interface ReferralInfo {
  referralCode: string;
  referralBonus: number;
  totalReferrals: number;
  referrals: Array<{
    name: string;
    joinedAt: string;
    bonus: number;
  }>;
}

export function ReferralPanel() {
  const [info, setInfo] = useState<ReferralInfo | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/referral')
      .then(r => r.json())
      .then(data => {
        setInfo(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const handleCopy = () => {
    if (info?.referralCode) {
      navigator.clipboard.writeText(info.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    if (info?.referralCode) {
      const text = `Join ClickNsit using my referral code ${info.referralCode} and get ₹25 bonus on your first application! 🎉\n\nFill every exam form from one platform: ${window.location.origin}`;
      if (navigator.share) {
        navigator.share({ title: 'ClickNsit Referral', text });
      } else {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-6 bg-neutral-200 rounded w-40" />
            <div className="h-4 bg-neutral-200 rounded w-64" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!info) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-accent-600" />
          <h2 className="text-xl font-display font-bold text-primary-900">Refer & Earn</h2>
        </div>
        <p className="text-sm text-neutral-500">
          Share your code and earn ₹25 for every friend who signs up!
        </p>
      </CardHeader>
      <CardContent>
        {/* Referral Code */}
        <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl p-5 mb-5">
          <p className="text-sm text-neutral-500 mb-2">Your Referral Code</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white rounded-lg px-4 py-3 border border-primary-200">
              <span className="text-xl font-mono font-bold text-primary-900 tracking-wider">
                {info.referralCode}
              </span>
            </div>
            <Button
              onClick={handleCopy}
              variant={copied ? 'primary' : 'outline'}
              className="min-h-[44px] min-w-[44px] px-4"
            >
              {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
            </Button>
            <Button
              onClick={handleShare}
              className="min-h-[44px] min-w-[44px] px-4 bg-accent-600 hover:bg-accent-700 text-white"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <IndianRupee className="h-6 w-6 text-green-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-green-700">₹{(info.referralBonus / 100).toFixed(0)}</p>
            <p className="text-xs text-green-600">Bonus Earned</p>
          </div>
          <div className="bg-primary-50 rounded-xl p-4 text-center">
            <Users className="h-6 w-6 text-primary-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-primary-700">{info.totalReferrals}</p>
            <p className="text-xs text-primary-600">Friends Referred</p>
          </div>
        </div>

        {/* Referred Friends List */}
        {info.referrals.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-neutral-700 mb-3">Your Referrals</h3>
            <div className="space-y-2">
              {info.referrals.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{r.name}</p>
                    <p className="text-xs text-neutral-500">
                      Joined {new Date(r.joinedAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-green-600">
                    +₹{(r.bonus / 100).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {info.referrals.length === 0 && (
          <p className="text-sm text-neutral-500 text-center py-3">
            No referrals yet. Share your code to start earning!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
