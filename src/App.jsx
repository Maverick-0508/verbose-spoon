import { useState, useCallback } from 'react';
import ProjectSetupForm from './components/ProjectSetupForm';
import CalendarSettings from './components/CalendarSettings';
import ProjectDashboard from './components/ProjectDashboard';
import GanttTimeline from './components/GanttTimeline';
import MilestonesManager from './components/MilestonesManager';
import ExportPanel from './components/ExportPanel';
import { getTodayISO, addCalendarDays, formatDateISO } from './utils/dateUtils';
import './App.css';

const DEFAULT_PROJECT = {
  name: '',
  type: 'software',
  teamSize: 1,
  startDate: getTodayISO(),
  endDate: formatDateISO(addCalendarDays(new Date(), 90)),
  description: '',
};

const DEFAULT_SETTINGS = {
  includeWeekends: false,
  useUSHolidays: true,
  customHolidays: [],
  bufferPercent: 10,
  sprintMode: false,
  sprintLength: 10,
};

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'setup', label: 'Setup', icon: '🚀' },
  { id: 'timeline', label: 'Timeline', icon: '📈' },
  { id: 'milestones', label: 'Milestones', icon: '🎯' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
  { id: 'export', label: 'Export', icon: '📤' },
];

export default function App() {
  const [project, setProject] = useState(DEFAULT_PROJECT);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [milestones, setMilestones] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  const updateProject = useCallback((updates) => setProject(updates), []);
  const updateSettings = useCallback((updates) => setSettings(updates), []);
  const updateMilestones = useCallback((updates) => setMilestones(updates), []);

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-brand">
            <div className="brand-logo">
              <span className="brand-icon">🗓️</span>
            </div>
            <div className="brand-text">
              <h1 className="brand-title">ProjectCal</h1>
              <p className="brand-tagline">Project Calendar Calculator</p>
            </div>
          </div>
          <div className="header-meta">
            {project.name && (
              <div className="active-project-pill">
                <span className="pill-dot" />
                <span>{project.name}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="app-nav">
        <div className="nav-content">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'nav-tab-active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="nav-tab-icon">{tab.icon}</span>
              <span className="nav-tab-label">{tab.label}</span>
              {tab.id === 'milestones' && milestones.length > 0 && (
                <span className="nav-badge">{milestones.length}</span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="app-main">
        <div className="content-container">
          {activeTab === 'dashboard' && (
            <div className="tab-content">
              <ProjectDashboard
                project={project}
                settings={settings}
                milestones={milestones}
              />
            </div>
          )}

          {activeTab === 'setup' && (
            <div className="tab-content">
              <ProjectSetupForm project={project} onUpdate={updateProject} />
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="tab-content">
              <GanttTimeline
                project={project}
                milestones={milestones}
                settings={settings}
              />
            </div>
          )}

          {activeTab === 'milestones' && (
            <div className="tab-content">
              <MilestonesManager
                milestones={milestones}
                project={project}
                settings={settings}
                onUpdate={updateMilestones}
              />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="tab-content">
              <CalendarSettings settings={settings} onUpdate={updateSettings} />
            </div>
          )}

          {activeTab === 'export' && (
            <div className="tab-content">
              <ExportPanel
                project={project}
                settings={settings}
                milestones={milestones}
              />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>ProjectCal — Accurate project timeline estimation for modern teams</p>
      </footer>
    </div>
  );
}
