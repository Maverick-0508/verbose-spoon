import {
  calculateSprints,
  calculateMilestoneSchedule,
  formatDateDisplay,
  formatDateShort,
  US_HOLIDAYS_2024_2026,
  getTimelineMonths,
  getTotalCalendarDays,
} from '../utils/dateUtils';

function getPositionPercent(date, startDate, endDate) {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const d = new Date(date).getTime();
  if (end === start) return 0;
  return Math.max(0, Math.min(100, ((d - start) / (end - start)) * 100));
}

export default function GanttTimeline({ project, milestones, settings }) {
  if (!project.startDate || !project.endDate) {
    return (
      <div className="card gantt-card">
        <div className="card-header">
          <div className="card-icon">📈</div>
          <div>
            <h2 className="card-title">Timeline View</h2>
            <p className="card-subtitle">Visual project timeline & Gantt chart</p>
          </div>
        </div>
        <div className="empty-state">
          <div className="empty-icon">📈</div>
          <p className="empty-title">Set project dates to view timeline</p>
          <p className="empty-desc">Add start and end dates in Project Setup to generate your visual timeline</p>
        </div>
      </div>
    );
  }

  const holidays = [
    ...(settings.useUSHolidays ? US_HOLIDAYS_2024_2026 : []),
    ...(settings.customHolidays || []).map((h) => h.date),
  ];

  const months = getTimelineMonths(project.startDate, project.endDate);
  const totalDays = getTotalCalendarDays(project.startDate, project.endDate);

  const sprints = settings.sprintMode
    ? calculateSprints(
        project.startDate,
        project.endDate,
        settings.sprintLength || 10,
        holidays
      )
    : [];

  const milestoneSchedule = calculateMilestoneSchedule(
    project.startDate,
    milestones,
    holidays,
    settings.includeWeekends
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayPos = getPositionPercent(today, project.startDate, project.endDate);
  const showToday =
    today >= new Date(project.startDate) && today <= new Date(project.endDate);

  const projectBar = {
    start: getPositionPercent(project.startDate, project.startDate, project.endDate),
    width:
      getPositionPercent(project.endDate, project.startDate, project.endDate) -
      getPositionPercent(project.startDate, project.startDate, project.endDate),
  };

  return (
    <div className="card gantt-card">
      <div className="card-header">
        <div className="card-icon">📈</div>
        <div>
          <h2 className="card-title">Timeline View</h2>
          <p className="card-subtitle">
            {formatDateDisplay(project.startDate)} → {formatDateDisplay(project.endDate)} •{' '}
            {totalDays} days
          </p>
        </div>
      </div>

      <div className="gantt-container">
        {/* Month Header */}
        <div className="gantt-header">
          <div className="gantt-label-col" />
          <div className="gantt-timeline-col">
            <div className="gantt-months">
              {months.map((m, i) => (
                <div
                  key={i}
                  className="gantt-month"
                  style={{ flex: 1 }}
                >
                  {m.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Project Bar */}
        <div className="gantt-row">
          <div className="gantt-label-col">
            <span className="gantt-row-label">🗂️ Project</span>
          </div>
          <div className="gantt-timeline-col">
            <div className="gantt-bar-track">
              <div
                className="gantt-bar gantt-bar-project"
                style={{
                  left: `${projectBar.start}%`,
                  width: `${projectBar.width}%`,
                }}
              >
                <span className="gantt-bar-label">{project.name || 'Project'}</span>
              </div>

              {/* Today indicator */}
              {showToday && (
                <div
                  className="gantt-today-line"
                  style={{ left: `${todayPos}%` }}
                >
                  <div className="gantt-today-dot" />
                  <div className="gantt-today-label">Today</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sprint Rows */}
        {settings.sprintMode && sprints.length > 0 && (
          <>
            <div className="gantt-section-label">Sprints</div>
            {sprints.map((sprint) => {
              const sprintStart = getPositionPercent(
                sprint.start,
                project.startDate,
                project.endDate
              );
              const sprintEnd = getPositionPercent(
                sprint.end,
                project.startDate,
                project.endDate
              );
              return (
                <div key={sprint.id} className="gantt-row">
                  <div className="gantt-label-col">
                    <span className="gantt-row-label">Sprint {sprint.id}</span>
                  </div>
                  <div className="gantt-timeline-col">
                    <div className="gantt-bar-track">
                      <div
                        className="gantt-bar gantt-bar-sprint"
                        style={{
                          left: `${sprintStart}%`,
                          width: `${sprintEnd - sprintStart}%`,
                        }}
                      >
                        <span className="gantt-bar-label">
                          {sprint.workingDays}d • {formatDateShort(sprint.start)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* Milestone Rows */}
        {milestones.length > 0 && (
          <>
            <div className="gantt-section-label">Milestones</div>
            {milestoneSchedule.scheduledMilestones
              .map((milestone) => {
                const pos = getPositionPercent(
                  milestone.scheduledEnd,
                  project.startDate,
                  project.endDate
                );
                return (
                  <div key={milestone.id} className="gantt-row">
                    <div className="gantt-label-col">
                      <span className="gantt-row-label">
                        {milestone.icon} {milestone.name}
                        {milestone.isCritical ? ' • CP' : ''}
                      </span>
                    </div>
                    <div className="gantt-timeline-col">
                      <div className="gantt-bar-track">
                        <div
                          className={`gantt-milestone ${milestone.completed ? 'gantt-milestone-done' : ''} ${milestone.isCritical ? 'gantt-milestone-critical' : ''}`}
                          style={{ left: `${pos}%` }}
                          title={`${milestone.name}: ${milestone.scheduledStart} → ${milestone.scheduledEnd}`}
                        >
                          <div className="gantt-milestone-diamond" />
                          <span className="gantt-milestone-label">
                            {formatDateShort(milestone.scheduledEnd)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </>
        )}
      </div>

      {milestones.length > 0 && (
        <div className="sprint-table-section">
          <h3 className="section-title">Dependency Analysis</h3>
          {milestoneSchedule.hasCycle ? (
            <p className="card-subtitle">Dependency cycle detected. Critical path unavailable until cycle is resolved.</p>
          ) : (
            <p className="card-subtitle">
              Critical Path: {milestoneSchedule.criticalPathIds.length} milestone{milestoneSchedule.criticalPathIds.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}

      {/* Sprint Summary Table */}
      {settings.sprintMode && sprints.length > 0 && (
        <div className="sprint-table-section">
          <h3 className="section-title">Sprint Breakdown</h3>
          <div className="sprint-table-wrapper">
            <table className="sprint-table">
              <thead>
                <tr>
                  <th>Sprint</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Working Days</th>
                  <th>Calendar Days</th>
                  <th>Hours (8h/day)</th>
                </tr>
              </thead>
              <tbody>
                {sprints.map((sprint) => (
                  <tr key={sprint.id}>
                    <td>
                      <span className="sprint-badge">S{sprint.id}</span>
                    </td>
                    <td>{formatDateDisplay(sprint.start)}</td>
                    <td>{formatDateDisplay(sprint.end)}</td>
                    <td>
                      <strong>{sprint.workingDays}</strong>
                    </td>
                    <td>{sprint.calendarDays}</td>
                    <td>{sprint.workingDays * 8}h</td>
                  </tr>
                ))}
                <tr className="sprint-total">
                  <td colSpan={3}>
                    <strong>Total</strong>
                  </td>
                  <td>
                    <strong>{sprints.reduce((s, sp) => s + sp.workingDays, 0)}</strong>
                  </td>
                  <td>
                    <strong>{sprints.reduce((s, sp) => s + sp.calendarDays, 0)}</strong>
                  </td>
                  <td>
                    <strong>{sprints.reduce((s, sp) => s + sp.workingDays * 8, 0)}h</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
