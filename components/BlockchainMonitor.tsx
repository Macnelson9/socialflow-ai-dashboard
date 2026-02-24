import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Bell, Activity, TrendingUp } from 'lucide-react';
import { BlockchainEvent, SecurityAlert, getMonitorInstance } from '../services/blockchainEventMonitor';

export const BlockchainMonitor: React.FC = () => {
  const [events, setEvents] = useState<BlockchainEvent[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<'events' | 'alerts'>('alerts');

  useEffect(() => {
    const monitor = getMonitorInstance();
    if (!monitor) return;

    // Subscribe to events and alerts
    monitor.onEvent((event) => {
      setEvents(prev => [event, ...prev].slice(0, 50)); // Keep last 50 events
    });

    monitor.onAlert((alert) => {
      setAlerts(prev => [alert, ...prev]);
    });

    // Update connection status
    const checkConnection = setInterval(() => {
      setIsConnected(monitor.isMonitorConnected());
    }, 1000);

    // Load initial data
    setEvents(monitor.getEvents());
    setAlerts(monitor.getAlerts());
    setIsConnected(monitor.isMonitorConnected());

    return () => {
      clearInterval(checkConnection);
    };
  }, []);

  const handleAcknowledgeAlert = (alertId: string) => {
    const monitor = getMonitorInstance();
    if (monitor) {
      monitor.acknowledgeAlert(alertId);
      setAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId ? { ...alert, acknowledged: true } : alert
        )
      );
    }
  };

  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Blockchain Event Monitor</h1>
          <p className="text-gray-400 mt-1">Real-time monitoring and security alerts</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            isConnected ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
            <span className="text-sm font-medium">{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          {unacknowledgedAlerts.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400">
              <Bell className="w-4 h-4" />
              <span className="text-sm font-medium">{unacknowledgedAlerts.length} Alert{unacknowledgedAlerts.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-800">
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'alerts'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Security Alerts ({unacknowledgedAlerts.length})
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'events'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Events ({events.length})
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'alerts' && (
          <AlertsList alerts={alerts} onAcknowledge={handleAcknowledgeAlert} />
        )}
        {activeTab === 'events' && (
          <EventsList events={events} />
        )}
      </div>
    </div>
  );
};

const AlertsList: React.FC<{
  alerts: SecurityAlert[];
  onAcknowledge: (id: string) => void;
}> = ({ alerts, onAcknowledge }) => {
  if (alerts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No security alerts</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map(alert => (
        <div
          key={alert.id}
          className={`p-4 rounded-lg border ${
            alert.acknowledged
              ? 'bg-gray-800/30 border-gray-700'
              : alert.severity === 'critical'
              ? 'bg-red-500/10 border-red-500/30'
              : 'bg-yellow-500/10 border-yellow-500/30'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className={`p-2 rounded-lg ${
                alert.severity === 'critical' ? 'bg-red-500/20' : 'bg-yellow-500/20'
              }`}>
                {alert.severity === 'critical' ? (
                  <XCircle className="w-5 h-5 text-red-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-sm font-medium px-2 py-0.5 rounded ${
                    alert.severity === 'critical'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {alert.type.replace(/_/g, ' ').toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(alert.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-white mb-2">{alert.message}</p>
                {alert.metadata && (
                  <div className="text-xs text-gray-400 space-y-1">
                    {Object.entries(alert.metadata).map(([key, value]) => (
                      <div key={key}>
                        <span className="text-gray-500">{key}:</span> {JSON.stringify(value)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {!alert.acknowledged && (
              <button
                onClick={() => onAcknowledge(alert.id)}
                className="px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Acknowledge
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const EventsList: React.FC<{ events: BlockchainEvent[] }> = ({ events }) => {
  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No events recorded yet</p>
      </div>
    );
  }

  const getEventIcon = (type: BlockchainEvent['type']) => {
    switch (type) {
      case 'payment':
        return <TrendingUp className="w-4 h-4" />;
      case 'account_created':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-2">
      {events.map(event => (
        <div
          key={event.id}
          className="p-4 rounded-lg bg-gray-800/30 border border-gray-700 hover:border-gray-600 transition-colors"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
              {getEventIcon(event.type)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-blue-400">
                  {event.type.replace(/_/g, ' ').toUpperCase()}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(event.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="text-xs text-gray-400 space-y-1">
                {Object.entries(event.details).map(([key, value]) => (
                  <div key={key} className="flex gap-2">
                    <span className="text-gray-500 min-w-[120px]">{key}:</span>
                    <span className="text-gray-300 break-all">{JSON.stringify(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
