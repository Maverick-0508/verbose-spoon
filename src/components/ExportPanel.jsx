import {
  countWorkingDays,
  getTotalCalendarDays,
  formatDateDisplay,
  applyBuffer,
  calculateSprints,
  US_HOLIDAYS_2024_2026,
  daysUntilDeadline,
  getProjectProgress,
  getProjectStatus,
} from '../utils/dateUtils';

function generateTextReport(project, settings, milestones) {
  const holidays = [
    ...(settings.useUSHolidays ? US_HOLIDAYS_2024_2026 : []),
    ...(settings.customHolidays || []).map((h) => h.date),
  ];

  const workingDays = countWorkingDays(
    project.startDate,
    project.endDate,
    holidays,
    settings.includeWeekends
  );

  const calendarDays = getTotalCalendarDays(project.startDate, project.endDate);
  const buffered = applyBuffer(workingDays, settings.bufferPercent || 0);
  const daysLeft = daysUntilDeadline(project.endDate);
  const progress = getProjectProgress(project.startDate, project.endDate);
  const status = getProjectStatus(daysLeft);

  const sprints = settings.sprintMode
    ? calculateSprints(project.startDate, project.endDate, settings.sprintLength || 10, holidays)
    : [];

  const lines = [
    '═══════════════════════════════════════════════════════════════',
    '              PROJECT CALENDAR REPORT',
    '═══════════════════════════════════════════════════════════════',
    '',
    `  Project: ${project.name || 'Unnamed Project'}`,
    `  Type: ${project.type || 'N/A'}`,
    `  Team Size: ${project.teamSize || 'N/A'}`,
    project.description ? `  Description: ${project.description}` : '',
    '',
    '───────────────────────────────────────────────────────────────',
    '  TIMELINE SUMMARY',
    '───────────────────────────────────────────────────────────────',
    `  Start Date:        ${formatDateDisplay(project.startDate)}`,
    `  End Date:          ${formatDateDisplay(project.endDate)}`,
    `  Status:            ${status.label}`,
    `  Progress:          ${progress}%`,
    '',
    `  Calendar Days:     ${calendarDays}`,
    `  Working Days:      ${workingDays}`,
    settings.bufferPercent > 0
      ? `  Buffered Days:     ${buffered} (${settings.bufferPercent}% buffer = +${buffered - workingDays}d)`
      : '',
    `  Days Remaining:    ${Math.max(0, daysLeft)} calendar days`,
    '',
    settings.useUSHolidays || (settings.customHolidays || []).length > 0
      ? `  Holidays Excluded: ${holidays.length}`
      : '',
    settings.includeWeekends ? '  Weekend Mode:      Included' : '  Weekend Mode:      Excluded (Mon-Fri)',
    '',
  ];

  if (milestones.length > 0) {
    lines.push(
      '───────────────────────────────────────────────────────────────',
      '  MILESTONES',
      '───────────────────────────────────────────────────────────────'
    );
    [...milestones]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .forEach((m) => {
        const status = m.completed ? '[✓]' : '[ ]';
        lines.push(`  ${status} ${m.date}  ${m.icon} ${m.name}`);
        if (m.description) lines.push(`        → ${m.description}`);
      });
    lines.push('');
  }

  if (sprints.length > 0) {
    lines.push(
      '───────────────────────────────────────────────────────────────',
      '  SPRINT PLAN',
      '───────────────────────────────────────────────────────────────',
      `  Sprint Length: ${settings.sprintLength} working days`,
      ''
    );
    sprints.forEach((s) => {
      lines.push(
        `  Sprint ${String(s.id).padStart(2, '0')}:  ${formatDateDisplay(s.start)} → ${formatDateDisplay(s.end)}  (${s.workingDays} working days)`
      );
    });
    lines.push(
      '',
      `  Total Sprints: ${sprints.length}`,
      `  Total Hours:   ${sprints.reduce((a, s) => a + s.workingDays * 8, 0)}h (at 8h/day)`
    );
    lines.push('');
  }

  lines.push(
    '═══════════════════════════════════════════════════════════════',
    `  Generated: ${new Date().toLocaleString()}`,
    '  Project Calendar Calculator',
    '═══════════════════════════════════════════════════════════════'
  );

  return lines.filter((l) => l !== null && l !== undefined).join('\n');
}

export default function ExportPanel({ project, settings, milestones }) {
  const canExport = project.startDate && project.endDate;

  const handleTextExport = () => {
    const report = generateTextReport(project, settings, milestones);
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(project.name || 'project').replace(/\s+/g, '_')}_calendar_report.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCSVExport = () => {
    const holidays = [
      ...(settings.useUSHolidays ? US_HOLIDAYS_2024_2026 : []),
      ...(settings.customHolidays || []).map((h) => h.date),
    ];

    const rows = [
      ['Field', 'Value'],
      ['Project Name', project.name || ''],
      ['Type', project.type || ''],
      ['Team Size', project.teamSize || ''],
      ['Start Date', project.startDate || ''],
      ['End Date', project.endDate || ''],
      ['Calendar Days', getTotalCalendarDays(project.startDate, project.endDate)],
      [
        'Working Days',
        countWorkingDays(project.startDate, project.endDate, holidays, settings.includeWeekends),
      ],
      ['Buffer %', settings.bufferPercent || 0],
      ['Include Weekends', settings.includeWeekends ? 'Yes' : 'No'],
      ['US Holidays', settings.useUSHolidays ? 'Yes' : 'No'],
      ['Sprint Mode', settings.sprintMode ? 'Yes' : 'No'],
      settings.sprintMode ? ['Sprint Length', settings.sprintLength] : null,
      [],
      ['Milestones'],
      ['Name', 'Date', 'Status', 'Description'],
      ...milestones.map((m) => [m.name, m.date, m.completed ? 'Completed' : 'Pending', m.description || '']),
    ].filter(Boolean);

    const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(project.name || 'project').replace(/\s+/g, '_')}_calendar.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const text = generateTextReport(project, settings, milestones);
    if (navigator.share) {
      await navigator.share({
        title: `${project.name} - Project Calendar`,
        text,
      });
    } else {
      await navigator.clipboard.writeText(text);
      alert('Report copied to clipboard!');
    }
  };

  return (
    <div className="card export-card">
      <div className="card-header">
        <div className="card-icon">📤</div>
        <div>
          <h2 className="card-title">Export & Share</h2>
          <p className="card-subtitle">Download or share your project report</p>
        </div>
      </div>

      <div className="export-grid">
        <button
          className={`export-btn ${!canExport ? 'export-btn-disabled' : ''}`}
          onClick={handleTextExport}
          disabled={!canExport}
        >
          <span className="export-btn-icon">📄</span>
          <span className="export-btn-title">Text Report</span>
          <span className="export-btn-desc">Download .txt summary</span>
        </button>

        <button
          className={`export-btn ${!canExport ? 'export-btn-disabled' : ''}`}
          onClick={handleCSVExport}
          disabled={!canExport}
        >
          <span className="export-btn-icon">📊</span>
          <span className="export-btn-title">CSV Export</span>
          <span className="export-btn-desc">Download .csv data</span>
        </button>

        <button
          className="export-btn"
          onClick={handlePrint}
        >
          <span className="export-btn-icon">🖨️</span>
          <span className="export-btn-title">Print</span>
          <span className="export-btn-desc">Print or save as PDF</span>
        </button>

        <button
          className={`export-btn ${!canExport ? 'export-btn-disabled' : ''}`}
          onClick={handleShare}
          disabled={!canExport}
        >
          <span className="export-btn-icon">🔗</span>
          <span className="export-btn-title">Share / Copy</span>
          <span className="export-btn-desc">Copy report to clipboard</span>
        </button>
      </div>

      {!canExport && (
        <p className="export-hint">Set project start and end dates to enable export</p>
      )}
    </div>
  );
}
