import { useState } from 'react';
import { getTodayISO, addCalendarDays, formatDateISO } from '../utils/dateUtils';

const DURATION_PRESETS = [
  { label: '1 Week', days: 7 },
  { label: '2 Weeks', days: 14 },
  { label: '1 Month', days: 30 },
  { label: '3 Months', days: 90 },
  { label: '6 Months', days: 180 },
  { label: '1 Year', days: 365 },
];

export default function ProjectSetupForm({ project, onUpdate }) {
  const [activePreset, setActivePreset] = useState(null);

  const handleChange = (field, value) => {
    onUpdate({ ...project, [field]: value });
  };

  const applyPreset = (days) => {
    const newEndDate = formatDateISO(addCalendarDays(project.startDate || getTodayISO(), days));
    onUpdate({ ...project, endDate: newEndDate, durationDays: days });
    setActivePreset(days);
  };

  const handleStartDateChange = (e) => {
    const newStart = e.target.value;
    handleChange('startDate', newStart);
    setActivePreset(null);
  };

  const handleEndDateChange = (e) => {
    handleChange('endDate', e.target.value);
    setActivePreset(null);
  };

  return (
    <div className="card setup-card">
      <div className="card-header">
        <div className="card-icon">🚀</div>
        <div>
          <h2 className="card-title">Project Setup</h2>
          <p className="card-subtitle">Define your project basics</p>
        </div>
      </div>

      <div className="form-grid">
        <div className="form-group full-width">
          <label className="form-label">Project Name</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g., Website Redesign 2026"
            value={project.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Project Type</label>
          <select
            className="form-input form-select"
            value={project.type}
            onChange={(e) => handleChange('type', e.target.value)}
          >
            <option value="software">Software Development</option>
            <option value="marketing">Marketing Campaign</option>
            <option value="construction">Construction</option>
            <option value="research">Research & Development</option>
            <option value="event">Event Planning</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Team Size</label>
          <input
            type="number"
            className="form-input"
            min="1"
            max="500"
            value={project.teamSize}
            onChange={(e) => handleChange('teamSize', Number(e.target.value))}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Start Date</label>
          <input
            type="date"
            className="form-input"
            value={project.startDate}
            onChange={handleStartDateChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Target End Date</label>
          <input
            type="date"
            className="form-input"
            value={project.endDate}
            min={project.startDate}
            onChange={handleEndDateChange}
          />
        </div>

        <div className="form-group full-width">
          <label className="form-label">Duration Presets</label>
          <div className="preset-grid">
            {DURATION_PRESETS.map((preset) => (
              <button
                key={preset.days}
                className={`preset-btn ${activePreset === preset.days ? 'preset-btn-active' : ''}`}
                onClick={() => applyPreset(preset.days)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group full-width">
          <label className="form-label">Project Description</label>
          <textarea
            className="form-input form-textarea"
            placeholder="Brief description of project goals and deliverables..."
            value={project.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}
