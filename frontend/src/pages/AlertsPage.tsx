import React, { useState, useMemo } from 'react';
import { Bell, AlertTriangle, Info, Check, Trash2, CheckSquare, Search, Trash } from 'lucide-react';
import { useAlertStore } from '../store';
import { formatDistanceToNow } from 'date-fns';
import type { Alert } from '../data/mockData';

export default function AlertsPage() {
  const { alerts, unreadCount, markRead, markAllRead, dismissAlert, setAlerts } = useAlertStore();
  
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info' | 'unread'>('all');
  const [search, setSearch] = useState('');

  // Clear all alerts
  const handleClearAll = () => {
    setAlerts([]);
  };

  // Grouping logic based on dates
  const groupedAlerts = useMemo(() => {
    // 1. Filter and Search
    const filtered = alerts.filter(a => {
      const matchesSearch = 
        a.title.toLowerCase().includes(search.toLowerCase()) || 
        a.message.toLowerCase().includes(search.toLowerCase()) ||
        (a.deviceName && a.deviceName.toLowerCase().includes(search.toLowerCase()));

      const matchesFilter = 
        filter === 'all' || 
        (filter === 'unread' && !a.read) || 
        a.level === filter;

      return matchesSearch && matchesFilter;
    });

    // 2. Chronological grouping
    const today: Alert[] = [];
    const yesterday: Alert[] = [];
    const older: Alert[] = [];

    const startOfToday = new Date();
    startOfToday.setHours(0,0,0,0);

    const startOfYesterday = new Date();
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    startOfYesterday.setHours(0,0,0,0);

    filtered.forEach(a => {
      const date = new Date(a.timestamp);
      if (date >= startOfToday) {
        today.push(a);
      } else if (date >= startOfYesterday) {
        yesterday.push(a);
      } else {
        older.push(a);
      }
    });

    return { today, yesterday, older, totalCount: filtered.length };
  }, [alerts, filter, search]);

  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'critical':
        return <AlertTriangle size={16} style={{ color: 'var(--color-danger)' }} />;
      case 'warning':
        return <AlertTriangle size={16} style={{ color: 'var(--color-warning)' }} />;
      default:
        return <Info size={16} style={{ color: 'var(--color-info)' }} />;
    }
  };

  const renderAlertRow = (a: Alert) => {
    return (
      <div
        key={a.id}
        style={{
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          background: a.read ? 'transparent' : 'var(--bg-surface-2)',
          padding: 'var(--space-4)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 'var(--space-4)',
          transition: 'all var(--transition-fast)'
        }}
      >
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start', flex: 1 }}>
          <div style={{
            marginTop: '2px',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: a.level === 'critical' ? 'var(--color-danger-light)' : a.level === 'warning' ? 'var(--color-warning-light)' : 'var(--color-primary-50)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {getAlertIcon(a.level)}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span className={`badge ${
                a.level === 'critical' ? 'badge-danger' : 
                a.level === 'warning' ? 'badge-warning' : 
                'badge-info'
              }`} style={{ fontSize: '8px', textTransform: 'uppercase' }}>
                {a.level}
              </span>
              <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>{a.title}</strong>
              
              {!a.read && (
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-primary-500)' }} />
              )}
            </div>
            
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              {a.message}
            </p>

            <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
              {a.deviceName && (
                <span>Device: <strong style={{ color: 'var(--text-secondary)' }}>{a.deviceName}</strong></span>
              )}
              <span>{formatDistanceToNow(new Date(a.timestamp))} ago</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {!a.read && (
            <button
              onClick={() => markRead(a.id)}
              className="btn btn-secondary"
              style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px' }}
              title="Mark as Read"
            >
              <Check size={12} /> Mark Read
            </button>
          )}
          <button
            onClick={() => dismissAlert(a.id)}
            className="btn btn-secondary"
            style={{ padding: '6px', color: 'var(--color-danger)', borderColor: 'transparent' }}
            title="Dismiss"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', height: '100%' }}>
      
      {/* ── HEADER ROW ────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)' }}>Alerts</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            System logs, device status changes, and network warnings
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
          >
            <CheckSquare size={16} />
            Mark All Read
          </button>
          <button
            onClick={handleClearAll}
            disabled={alerts.length === 0}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-danger)' }}
          >
            <Trash size={16} />
            Clear All
          </button>
        </div>
      </div>

      {/* ── FILTER ROW ────────────────────────────────────────── */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: 'var(--space-4)',
        display: 'flex',
        gap: 'var(--space-4)',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search alerts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '36px', width: '100%' }}
          />
        </div>

        <div className="button-group" style={{ display: 'flex', gap: '4px', background: 'var(--bg-surface-2)', padding: '2px', borderRadius: 'var(--radius)' }}>
          {(['all', 'unread', 'critical', 'warning', 'info'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                border: 'none',
                outline: 'none',
                background: filter === tab ? 'var(--bg-surface)' : 'transparent',
                color: filter === tab ? 'var(--color-primary-500)' : 'var(--text-secondary)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {tab === 'unread' ? `Unread (${unreadCount})` : tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── ALERT CONTAINER ───────────────────────────────────── */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: 'var(--space-6)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
        overflowY: 'auto',
        flex: 1
      }}>
        {groupedAlerts.totalCount > 0 ? (
          <>
            {/* TODAY */}
            {groupedAlerts.today.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <h3 style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-bold)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Today</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {groupedAlerts.today.map(renderAlertRow)}
                </div>
              </div>
            )}

            {/* YESTERDAY */}
            {groupedAlerts.yesterday.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <h3 style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-bold)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Yesterday</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {groupedAlerts.yesterday.map(renderAlertRow)}
                </div>
              </div>
            )}

            {/* OLDER */}
            {groupedAlerts.older.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <h3 style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-bold)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Older</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {groupedAlerts.older.map(renderAlertRow)}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="no-data" style={{ padding: 'var(--space-12)' }}>
            <Bell size={48} style={{ opacity: 0.3, margin: '0 auto var(--space-3)' }} />
            No alerts found. You are all caught up!
          </div>
        )}
      </div>
    </div>
  );
}
