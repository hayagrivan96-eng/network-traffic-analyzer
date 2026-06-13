import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, Check, Monitor, GitFork, Activity, PackageSearch, ShieldAlert, Bell, Cpu, Cloud, Globe } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing">
      {/* ── NAVIGATION ────────────────────────────────────────── */}
      <nav className={`landing-nav ${isScrolled ? 'scrolled shadow-md' : ''}`} style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'var(--bg-topnav)',
        borderBottom: '1px solid var(--border)',
        padding: '0 var(--space-8)',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'all var(--transition-fast)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div className="sidebar-logo-icon">
            <Shield size={18} color="#fff" />
          </div>
          <span className="sidebar-logo-text">Network Guardian Pro</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
          <a href="#features" className="nav-item" style={{ width: 'auto', padding: '4px 8px' }}>Features</a>
          <a href="#how-it-works" className="nav-item" style={{ width: 'auto', padding: '4px 8px' }}>How It Works</a>
          <a href="#pricing" className="nav-item" style={{ width: 'auto', padding: '4px 8px' }}>Pricing</a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <button onClick={() => navigate('/login')} className="btn btn-secondary" style={{ padding: '8px var(--space-4)' }}>
            Sign In
          </button>
          <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ padding: '8px var(--space-4)' }}>
            Get Started
          </button>
        </div>
      </nav>

      {/* ── HERO SECTION ──────────────────────────────────────── */}
      <section className="hero-section">
        <div className="hero-eyebrow">
          <span className="status-dot online pulse" style={{ width: '8px', height: '8px' }}></span>
          Real-Time Network Visibility
        </div>
        <h1 className="hero-title">
          See Every Device.<br />
          Understand Every <span>Connection.</span>
        </h1>
        <p className="hero-tagline">
          Professional network monitoring for IT teams, schools, small businesses, and home labs.
          Discover devices, track traffic, and secure your network.
        </p>

        <div className="hero-actions">
          <button onClick={() => navigate('/login')} className="btn btn-primary btn-lg" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            Start Monitoring Free <ArrowRight size={18} />
          </button>
          <button onClick={() => navigate('/login')} className="btn btn-secondary btn-lg">
            View Live Demo
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'var(--space-6)',
          maxWidth: '600px',
          margin: 'var(--space-10) auto 0',
          paddingTop: 'var(--space-8)',
          borderTop: '1px solid var(--border)'
        }}>
          <div>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', color: 'var(--color-primary-500)' }}>10K+</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Devices Supported</div>
          </div>
          <div>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', color: 'var(--color-primary-500)' }}>&lt; 10s</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Discovery Time</div>
          </div>
          <div>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', color: 'var(--color-primary-500)' }}>99.9%</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Monitoring Uptime</div>
          </div>
        </div>
      </section>

      {/* ── FEATURES SECTION ──────────────────────────────────── */}
      <section id="features" style={{ padding: '80px var(--space-8)', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 className="section-heading">Powerful Monitoring Capabilities</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
              Built for performance, scalability, and clarity. Everything you need to manage your network resources.
            </p>
          </div>

          <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
            {/* Feature 1 */}
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label" style={{ fontSize: 'var(--text-sm)' }}>Device Discovery</span>
                <div className="stat-card-icon" style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary-600)' }}>
                  <Monitor size={18} />
                </div>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
                Automatically discover all devices on your network using ARP scanning, ping sweep, and DNS resolution.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label" style={{ fontSize: 'var(--text-sm)' }}>Network Topology</span>
                <div className="stat-card-icon" style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary-600)' }}>
                  <GitFork size={18} />
                </div>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
                Visualize your network layout as an interactive, draggable map showing active routes and switches.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label" style={{ fontSize: 'var(--text-sm)' }}>Traffic Analysis</span>
                <div className="stat-card-icon" style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary-600)' }}>
                  <Activity size={18} />
                </div>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
                Monitor live upload/download bandwidth, top consuming nodes, and detect protocols automatically.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label" style={{ fontSize: 'var(--text-sm)' }}>Packet Sniffing</span>
                <div className="stat-card-icon" style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary-600)' }}>
                  <PackageSearch size={18} />
                </div>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
                Track packet paths, latency, protocol flags, and raw payloads directly inside the UI.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label" style={{ fontSize: 'var(--text-sm)' }}>Security Scanner</span>
                <div className="stat-card-icon" style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary-600)' }}>
                  <ShieldAlert size={18} />
                </div>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
                Detect open ports, unknown host connection attempts, MAC spoofing, and CVE vulnerabilities.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label" style={{ fontSize: 'var(--text-sm)' }}>Alert Center</span>
                <div className="stat-card-icon" style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary-600)' }}>
                  <Bell size={18} />
                </div>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
                Configure real-time notifications for device outages, high packet loss, or suspicious traffic spikes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS SECTION ──────────────────────────────── */}
      <section id="how-it-works" style={{ padding: '80px var(--space-8)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 className="section-heading">How Network Guardian Pro Works</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Get started in three simple steps.</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'var(--space-8)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'var(--color-primary-600)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--weight-bold)',
                margin: '0 auto var(--space-4)'
              }}>1</div>
              <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--weight-semibold)', marginBottom: 'var(--space-2)' }}>Deploy the Agent</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                Install our lightweight Python script on any computer inside your local network.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'var(--color-primary-600)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--weight-bold)',
                margin: '0 auto var(--space-4)'
              }}>2</div>
              <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--weight-semibold)', marginBottom: 'var(--space-2)' }}>Scan and Disocver</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                The agent scans the IP subnets and registers all laptops, phones, servers, and routers.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'var(--color-primary-600)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--weight-bold)',
                margin: '0 auto var(--space-4)'
              }}>3</div>
              <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--weight-semibold)', marginBottom: 'var(--space-2)' }}>Monitor Anywhere</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                Log in to the web console from anywhere to view real-time maps, traffic analysis, and receive alerts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING SECTION ───────────────────────────────────── */}
      <section id="pricing" style={{ padding: '80px var(--space-8)', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 className="section-heading">Simple, Transparent Pricing</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Plans that grow with your network infrastructure.</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'var(--space-6)'
          }}>
            {/* Tier 1 */}
            <div className="stat-card" style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)' }}>Home Free</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', margin: 'var(--space-2) 0 var(--space-6)' }}>Ideal for labs and smart homes.</p>
              <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: 'var(--space-6)' }}>
                <span style={{ fontSize: '32px', fontWeight: 'var(--weight-bold)' }}>$0</span>
                <span style={{ color: 'var(--text-secondary)', marginLeft: '4px' }}>/ month</span>
              </div>
              <button onClick={() => navigate('/login')} className="btn btn-secondary" style={{ width: '100%', marginBottom: 'var(--space-6)' }}>Get Started</button>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', flex: 1, fontSize: 'var(--text-sm)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Check size={16} className="text-success" /> Up to 25 devices</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Check size={16} className="text-success" /> 1 active user</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Check size={16} className="text-success" /> Basic topology map</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Check size={16} className="text-success" /> Local data storage</li>
              </ul>
            </div>

            {/* Tier 2 */}
            <div className="stat-card" style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', height: '100%', border: '2px solid var(--color-primary-500)', position: 'relative' }}>
              <div style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'var(--color-primary-500)',
                color: '#fff',
                fontSize: '10px',
                fontWeight: 'var(--weight-bold)',
                padding: '4px 12px',
                borderRadius: '999px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Most Popular</div>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)' }}>Business Pro</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', margin: 'var(--space-2) 0 var(--space-6)' }}>For small businesses and growing teams.</p>
              <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: 'var(--space-6)' }}>
                <span style={{ fontSize: '32px', fontWeight: 'var(--weight-bold)' }}>$29</span>
                <span style={{ color: 'var(--text-secondary)', marginLeft: '4px' }}>/ month</span>
              </div>
              <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ width: '100%', marginBottom: 'var(--space-6)' }}>Start Free Trial</button>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', flex: 1, fontSize: 'var(--text-sm)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Check size={16} className="text-success" /> Unlimited devices</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Check size={16} className="text-success" /> 10 user seats</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Check size={16} className="text-success" /> Full traffic Sniffer</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Check size={16} className="text-success" /> Automated vulnerability scanning</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Check size={16} className="text-success" /> Email & SMS alerts</li>
              </ul>
            </div>

            {/* Tier 3 */}
            <div className="stat-card" style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)' }}>Enterprise</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', margin: 'var(--space-2) 0 var(--space-6)' }}>For complex multi-site deployments.</p>
              <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: 'var(--space-6)' }}>
                <span style={{ fontSize: '28px', fontWeight: 'var(--weight-bold)' }}>Contact Us</span>
              </div>
              <button onClick={() => navigate('/login')} className="btn btn-secondary" style={{ width: '100%', marginBottom: 'var(--space-6)' }}>Contact Sales</button>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', flex: 1, fontSize: 'var(--text-sm)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Check size={16} className="text-success" /> Multi-site dashboard</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Check size={16} className="text-success" /> Unlimited users</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Check size={16} className="text-success" /> 24/7 dedicated support & SLA</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Check size={16} className="text-success" /> Custom report generation</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer className="landing-footer" style={{ background: 'var(--bg-topnav)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div className="sidebar-logo-icon" style={{ width: '28px', height: '28px' }}>
              <Shield size={14} color="#fff" />
            </div>
            <span style={{ fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)' }}>Network Guardian Pro</span>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-6)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
            <span>&copy; {new Date().getFullYear()} Network Guardian Pro. All rights reserved.</span>
            <a href="#" className="nav-item" style={{ width: 'auto', padding: 0 }}>Privacy Policy</a>
            <a href="#" className="nav-item" style={{ width: 'auto', padding: 0 }}>Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
