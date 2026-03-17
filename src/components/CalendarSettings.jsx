import { useState } from 'react';
import { US_HOLIDAYS_2024_2026 } from '../utils/dateUtils';

export default function CalendarSettings({ settings, onUpdate }) {
  const [customHoliday, setCustomHoliday] = useState('');
  const [holidayName, setHolidayName] = useState('');

  const handleChange = (field, value) => {
    onUpdate({ ...settings, [field]: value });
  };

  const addCustomHoliday = () => {
    if (!customHoliday) return;
    const existing = settings.customHolidays || [];
    if (!existing.find((h) => h.date === customHoliday)) {
      handleChange('customHolidays', [
        ...existing,
        { date: customHoliday, name: holidayName || 'Custom Holiday' },
      ]);
    }
    setCustomHoliday('');
    setHolidayName('');
  };

  const removeCustomHoliday = (date) => {
    handleChange(
      'customHolidays',
      (settings.customHolidays || []).filter((h) => h.date !== date)
    );
  };

  const toggleUSHolidays = () => {
    handleChange('useUSHolidays', !settings.useUSHolidays);
  };

  const allHolidays = [
    ...(settings.useUSHolidays ? US_HOLIDAYS_2024_2026 : []),
    ...(settings.customHolidays || []).map((h) => h.date),
  ];

  return (
    <div className="card settings-card">
      <div className="card-header">
        <div className="card-icon">⚙️</div>
        <div>
          <h2 className="card-title">Calendar Settings</h2>
          <p className="card-subtitle">Configure working days & holidays</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Working Days Configuration */}
        <div className="settings-section">
          <h3 className="settings-section-title">Working Days</h3>
          <div className="toggle-group">
            <label className="toggle-item">
              <div className="toggle-label">
                <span className="toggle-icon">📅</span>
                <div>
                  <span className="toggle-title">Include Weekends</span>
                  <span className="toggle-desc">Count Sat & Sun as working days</span>
                </div>
              </div>
              <div
                className={`toggle-switch ${settings.includeWeekends ? 'toggle-on' : ''}`}
                onClick={() => handleChange('includeWeekends', !settings.includeWeekends)}
              >
                <div className="toggle-knob" />
              </div>
            </label>

            <label className="toggle-item">
              <div className="toggle-label">
                <span className="toggle-icon">🇺🇸</span>
                <div>
                  <span className="toggle-title">US Federal Holidays</span>
                  <span className="toggle-desc">Exclude {US_HOLIDAYS_2024_2026.length} US holidays</span>
                </div>
              </div>
              <div
                className={`toggle-switch ${settings.useUSHolidays ? 'toggle-on' : ''}`}
                onClick={toggleUSHolidays}
              >
                <div className="toggle-knob" />
              </div>
            </label>
          </div>
        </div>

        {/* Buffer Settings */}
        <div className="settings-section">
          <h3 className="settings-section-title">Buffer & Risk</h3>
          <div className="form-group">
            <label className="form-label">
              Contingency Buffer: <strong>{settings.bufferPercent}%</strong>
            </label>
            <input
              type="range"
              className="range-input"
              min="0"
              max="50"
              step="5"
              value={settings.bufferPercent}
              onChange={(e) => handleChange('bufferPercent', Number(e.target.value))}
            />
            <div className="range-labels">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
            </div>
            <p className="form-hint">
              Extra time added as a safety net for unexpected delays
            </p>
          </div>
        </div>

        {/* Sprint Settings */}
        <div className="settings-section">
          <h3 className="settings-section-title">Sprint Planning</h3>
          <div className="toggle-item" style={{ marginBottom: '12px' }}>
            <div className="toggle-label">
              <span className="toggle-icon">⚡</span>
              <div>
                <span className="toggle-title">Enable Sprint Mode</span>
                <span className="toggle-desc">Divide project into sprints</span>
              </div>
            </div>
            <div
              className={`toggle-switch ${settings.sprintMode ? 'toggle-on' : ''}`}
              onClick={() => handleChange('sprintMode', !settings.sprintMode)}
            >
              <div className="toggle-knob" />
            </div>
          </div>

          {settings.sprintMode && (
            <div className="form-group">
              <label className="form-label">Sprint Length (working days)</label>
              <div className="sprint-options">
                {[5, 10, 15, 20].map((days) => (
                  <button
                    key={days}
                    className={`sprint-opt ${settings.sprintLength === days ? 'sprint-opt-active' : ''}`}
                    onClick={() => handleChange('sprintLength', days)}
                  >
                    {days}d
                  </button>
                ))}
                <input
                  type="number"
                  className="form-input sprint-custom"
                  min="1"
                  max="60"
                  placeholder="Custom"
                  value={settings.sprintLength}
                  onChange={(e) => handleChange('sprintLength', Number(e.target.value))}
                />
              </div>
            </div>
          )}
        </div>

        {/* Custom Holidays */}
        <div className="settings-section">
          <h3 className="settings-section-title">
            Custom Holidays
            {allHolidays.length > 0 && (
              <span className="badge">{allHolidays.length}</span>
            )}
          </h3>
          <div className="holiday-add-row">
            <input
              type="text"
              className="form-input"
              placeholder="Holiday name"
              value={holidayName}
              onChange={(e) => setHolidayName(e.target.value)}
            />
            <input
              type="date"
              className="form-input"
              value={customHoliday}
              onChange={(e) => setCustomHoliday(e.target.value)}
            />
            <button
              className="btn btn-primary"
              onClick={addCustomHoliday}
              disabled={!customHoliday}
            >
              Add
            </button>
          </div>

          {(settings.customHolidays || []).length > 0 && (
            <div className="holiday-list">
              {(settings.customHolidays || []).map((h) => (
                <div key={h.date} className="holiday-item">
                  <span className="holiday-date">{h.date}</span>
                  <span className="holiday-name">{h.name}</span>
                  <button
                    className="holiday-remove"
                    onClick={() => removeCustomHoliday(h.date)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
