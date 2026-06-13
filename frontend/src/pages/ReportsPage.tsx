import React, { useState } from 'react';
import { FileText, Download, Trash2, Calendar, FileType, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface PastReport {
  id: string;
  name: string;
  type: string;
  format: 'PDF' | 'CSV' | 'JSON';
  generated: string;
  size: string;
  status: 'Ready' | 'Generating' | 'Failed';
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState('Device Inventory');
  const [dateRange, setDateRange] = useState('Last 24h');
  const [format, setFormat] = useState<'PDF' | 'CSV' | 'JSON'>('PDF');
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeTables, setIncludeTables] = useState(true);
  const [includeRecs, setIncludeRecs] = useState(true);
  const [description, setDescription] = useState('');

  // Generation status
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const [pastReports, setPastReports] = useState<PastReport[]>([
    { id: 'rep-1', name: 'Weekly Network Health', type: 'Network Health', format: 'PDF', generated: '2026-06-10T14:30:00Z', size: '2.4 MB', status: 'Ready' },
    { id: 'rep-2', name: 'Device Inventory Export', type: 'Device Inventory', format: 'CSV', generated: '2026-06-09T09:15:00Z', size: '48 KB', status: 'Ready' },
    { id: 'rep-3', name: 'Security Events Report', type: 'Security Events', format: 'PDF', generated: '2026-06-08T18:45:00Z', size: '1.1 MB', status: 'Ready' },
    { id: 'rep-4', name: 'Traffic Analysis', type: 'Traffic Analysis', format: 'JSON', generated: '2026-06-07T11:20:00Z', size: '892 KB', status: 'Ready' },
    { id: 'rep-5', name: 'Bandwidth Usage', type: 'Bandwidth Usage', format: 'PDF', generated: '2026-06-06T16:00:00Z', size: '3.2 MB', status: 'Ready' }
  ]);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          
          // Add generated report to top of list
          const newReport: PastReport = {
            id: `rep-${Date.now()}`,
            name: `${reportType} (${dateRange})`,
            type: reportType,
            format: format,
            generated: new Date().toISOString(),
            size: format === 'CSV' ? '32 KB' : format === 'JSON' ? '128 KB' : '1.8 MB',
            status: 'Ready'
          };
          setPastReports(prevList => [newReport, ...prevList]);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleDelete = (id: string) => {
    setPastReports(prev => prev.filter(r => r.id !== id));
  };

  const getFormatBadgeColor = (fmt: 'PDF' | 'CSV' | 'JSON') => {
    switch (fmt) {
      case 'PDF': return 'badge-danger';
      case 'CSV': return 'badge-success';
      case 'JSON': return 'badge-info';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', height: '100%' }}>
      
      {/* ── HEADER ────────────────────────────────────────────── */}
      <div>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)' }}>Reports</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
          Generate PDF summaries, export CSV tables, or fetch JSON network metrics
        </p>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-6)', flex: 1, alignItems: 'flex-start' }}>
        
        {/* LEFT COLUMN: GENERATE FORM (35%) */}
        <div className="stat-card" style={{ flex: '0 0 35%', padding: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>
            <FileText size={16} className="text-primary" />
            <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--weight-bold)' }}>Generate Report</h3>
          </div>

          <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <label className="form-label">Report Type</label>
              <select
                className="form-control"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                disabled={isGenerating}
                style={{ width: '100%' }}
              >
                <option value="Device Inventory">Device Inventory</option>
                <option value="Traffic Analysis">Traffic Analysis</option>
                <option value="Bandwidth Usage">Bandwidth Usage</option>
                <option value="Security Events">Security Events</option>
                <option value="Network Health">Network Health</option>
              </select>
            </div>

            <div>
              <label className="form-label">Date Range</label>
              <select
                className="form-control"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                disabled={isGenerating}
                style={{ width: '100%' }}
              >
                <option value="Last 24h">Last 24 Hours</option>
                <option value="Last 7 days">Last 7 Days</option>
                <option value="Last 30 days">Last 30 Days</option>
                <option value="Custom">Custom Interval</option>
              </select>
            </div>

            <div>
              <label className="form-label">Format</label>
              <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-surface-2)', padding: '2px', borderRadius: 'var(--radius)' }}>
                {(['PDF', 'CSV', 'JSON'] as const).map(fmt => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setFormat(fmt)}
                    disabled={isGenerating}
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      background: format === fmt ? 'var(--bg-surface)' : 'transparent',
                      color: format === fmt ? 'var(--color-primary-500)' : 'var(--text-secondary)',
                      padding: '6px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            {/* Checkboxes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'var(--space-2)' }}>
              <span className="form-label" style={{ marginBottom: 0 }}>Include Sections</span>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input type="checkbox" checked={includeSummary} onChange={(e) => setIncludeSummary(e.target.checked)} disabled={isGenerating} />
                Executive Summary
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input type="checkbox" checked={includeCharts} onChange={(e) => setIncludeCharts(e.target.checked)} disabled={isGenerating} />
                Visual Charts & Graphs
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input type="checkbox" checked={includeTables} onChange={(e) => setIncludeTables(e.target.checked)} disabled={isGenerating} />
                Detailed Asset Tables
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input type="checkbox" checked={includeRecs} onChange={(e) => setIncludeRecs(e.target.checked)} disabled={isGenerating} />
                Hardening Recommendations
              </label>
            </div>

            <div>
              <label className="form-label">Optional Description</label>
              <textarea
                className="form-control"
                style={{ width: '100%', height: '60px', fontSize: 'var(--text-xs)', resize: 'none' }}
                placeholder="Include custom header note..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isGenerating}
              />
            </div>

            {isGenerating && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: 'var(--space-2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)' }}>
                  <span>Generating file...</span>
                  <span>{progress}%</span>
                </div>
                <div className="progress-bar" style={{ height: '6px' }}>
                  <div className="progress-bar-fill" style={{ width: `${progress}%`, background: 'var(--color-primary-500)' }} />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isGenerating}
              style={{ width: '100%', padding: 'var(--space-3)', marginTop: 'var(--space-2)' }}
            >
              Generate Report
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: PAST REPORTS TABLE (65%) */}
        <div className="stat-card" style={{ flex: 1, padding: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>
            <FileText size={16} className="text-secondary" />
            <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--weight-bold)' }}>Past Reports Log</h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--text-xs)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface-2)' }}>
                  <th style={{ padding: '10px var(--space-3)' }}>Report Name</th>
                  <th style={{ padding: '10px var(--space-3)' }}>Type</th>
                  <th style={{ padding: '10px var(--space-3)' }}>Format</th>
                  <th style={{ padding: '10px var(--space-3)' }}>Generated</th>
                  <th style={{ padding: '10px var(--space-3)' }}>Size</th>
                  <th style={{ padding: '10px var(--space-3)' }}>Status</th>
                  <th style={{ padding: '10px var(--space-3)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pastReports.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }} className="table-row-hover">
                    <td style={{ padding: '12px var(--space-3)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)' }}>
                      {r.name}
                    </td>
                    <td style={{ padding: '12px var(--space-3)', color: 'var(--text-secondary)' }}>
                      {r.type}
                    </td>
                    <td style={{ padding: '12px var(--space-3)' }}>
                      <span className={`badge ${getFormatBadgeColor(r.format)}`} style={{ fontSize: '8px' }}>
                        {r.format}
                      </span>
                    </td>
                    <td style={{ padding: '12px var(--space-3)', color: 'var(--text-tertiary)' }}>
                      {new Date(r.generated).toLocaleDateString()} {new Date(r.generated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '12px var(--space-3)', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      {r.size}
                    </td>
                    <td style={{ padding: '12px var(--space-3)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className={`status-dot ${r.status === 'Ready' ? 'online' : r.status === 'Generating' ? 'warning' : 'offline'}`} style={{ width: 6, height: 6 }} />
                        <span style={{ color: 'var(--text-primary)' }}>{r.status}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px var(--space-3)', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => alert(`Downloading file: ${r.name}.${r.format.toLowerCase()}`)}
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="Download"
                        >
                          <Download size={12} /> Download
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="btn btn-secondary"
                          style={{ padding: '4px', color: 'var(--color-danger)', borderColor: 'transparent' }}
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
