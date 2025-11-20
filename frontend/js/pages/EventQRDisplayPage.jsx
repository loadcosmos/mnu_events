import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import eventsService from '../services/eventsService';
import checkinService from '../services/checkinService';
import { toast } from 'sonner';
import { ArrowLeft, QrCode, RefreshCw, Users, CheckCircle } from 'lucide-react';
import QRCode from 'qrcode';

export default function EventQRDisplayPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [stats, setStats] = useState({ checkedIn: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastCheckIn, setLastCheckIn] = useState(null);

  useEffect(() => {
    loadEventAndGenerateQR();
    // Auto-refresh stats every 5 seconds
    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, [eventId]);

  const loadEventAndGenerateQR = async () => {
    try {
      setLoading(true);
      const [eventData, statsData] = await Promise.all([
        eventsService.getById(eventId),
        checkinService.getEventStats(eventId),
      ]);

      setEvent(eventData);
      setStats(statsData);
      await generateQR();
    } catch (err) {
      console.error('[EventQRDisplayPage] Load failed:', err);
      toast.error('Failed to load event');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const generateQR = async () => {
    try {
      const response = await checkinService.generateEventQR(eventId);

      // Generate QR code image from the data
      const qrData = JSON.stringify(response.qrData);
      const dataUrl = await QRCode.toDataURL(qrData, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      setQrDataUrl(dataUrl);
    } catch (err) {
      console.error('[EventQRDisplayPage] Generate QR failed:', err);
      toast.error('Failed to generate QR code');
    }
  };

  const updateStats = async () => {
    try {
      const statsData = await checkinService.getEventStats(eventId);

      // Check if there's a new check-in
      if (statsData.checkedIn > stats.checkedIn) {
        setLastCheckIn(new Date());
        // Play success sound
        playSuccessSound();
      }

      setStats(statsData);
    } catch (err) {
      // Silently fail to not disrupt the display
      console.error('[EventQRDisplayPage] Update stats failed:', err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await generateQR();
    await updateStats();
    setRefreshing(false);
    toast.success('QR code refreshed');
  };

  const playSuccessSound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.2;

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.15);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 dark:border-[#2a2a2a] border-t-[#d62e1f] mb-4"></div>
          <p className="text-gray-600 dark:text-[#a0a0a0]">Loading QR code...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate(-1)}
              variant="ghost"
              className="rounded-xl"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Event QR Code</h1>
              {event && (
                <p className="text-gray-600 dark:text-[#a0a0a0] mt-1">
                  Students scan this QR to check in
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Instructions Banner */}
        <div className="mb-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <QrCode className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                How to use:
              </h3>
              <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-decimal list-inside">
                <li>Display this QR code on a projector or large screen</li>
                <li>Students open the MNU Events app</li>
                <li>Students tap "Scan QR" and point camera at this code</li>
                <li>Check-ins will appear in real-time below</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* QR Code Display */}
          <div className="lg:col-span-2">
            <Card className="liquid-glass-card rounded-2xl">
              <CardHeader className="border-b border-gray-200 dark:border-[#2a2a2a]">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-900 dark:text-white">
                    {event?.title}
                  </CardTitle>
                  <Button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-8">
                {qrDataUrl ? (
                  <div className="flex flex-col items-center">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl border-4 border-[#d62e1f]">
                      <img
                        src={qrDataUrl}
                        alt="Event QR Code"
                        className="w-full max-w-md mx-auto"
                      />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
                      QR code auto-refreshes for security
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 dark:border-[#2a2a2a] border-t-[#d62e1f]"></div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-4">
            {/* Real-time Stats */}
            <Card className="liquid-glass-card rounded-2xl">
              <CardHeader>
                <CardTitle className="text-sm text-gray-600 dark:text-[#a0a0a0]">
                  Real-time Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {stats.checkedIn}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-[#a0a0a0]">
                      Checked In
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {stats.total}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-[#a0a0a0]">
                      Total Registered
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-[#a0a0a0]">Attendance</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {stats.total > 0 ? Math.round((stats.checkedIn / stats.total) * 100) : 0}%
                    </span>
                  </div>
                  <div className="relative h-3 bg-gray-200 dark:bg-[#2a2a2a] rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#d62e1f] to-[#b91c1c] rounded-full transition-all duration-500"
                      style={{
                        width: `${stats.total > 0 ? (stats.checkedIn / stats.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Last Check-in Indicator */}
            {lastCheckIn && (
              <Card className="liquid-glass-card rounded-2xl border-2 border-green-500 animate-pulse">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                    <div>
                      <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                        New check-in!
                      </p>
                      <p className="text-xs text-gray-600 dark:text-[#a0a0a0]">
                        {lastCheckIn.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Fullscreen Tip */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            💡 Tip: Press <kbd className="px-2 py-1 bg-gray-200 dark:bg-[#2a2a2a] rounded text-xs">F11</kbd> for fullscreen mode
          </p>
        </div>
      </div>
    </div>
  );
}
