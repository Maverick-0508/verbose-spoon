import {
  countWorkingDays,
  calculateMilestoneSchedule,
  daysUntilDeadline,
  getProjectProgress,
  getProjectStatus,
  formatDateDisplay,
  getTotalCalendarDays,
  applyBuffer,
  US_HOLIDAYS_2024_2026,
} from '../utils/dateUtils';

export default function ProjectDashboard({ project, settings, milestones }) {
  if (!project.startDate || !project.endDate) {
    return (
      <div className="card dashboard-card">
        <div className="card-header">
          <div className="card-icon">📊</div>
          <div>
            <h2 className="card-title">Project Dashboard</h2>
            <p className="card-subtitle">Set start and end dates to see your project analysis</p>
          </div>
        </div>
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <p className="empty-title">No project dates configured</p>
          <p className="empty-desc">Fill in the Project Setup section to calculate your timeline</p>
        </div>
      </div>
    );
  }

  const holidays = [
    ...(settings.useUSHolidays ? US_HOLIDAYS_2024_2026 : []),
    ...(settings.customHolidays || []).map((h) => h.date),
  ];

  const baseWorkingDays = countWorkingDays(
    project.startDate,
    project.endDate,
    holidays,
    settings.includeWeekends
  );

  const bufferedWorkingDays = applyBuffer(baseWorkingDays, settings.bufferPercent || 0);
  const calendarDays = getTotalCalendarDays(project.startDate, project.endDate);
  const daysLeft = daysUntilDeadline(project.endDate);
  const workingDaysLeft = countWorkingDays(
    new Date(),
    project.endDate,
    holidays,
    settings.includeWeekends
  );
  const progress = getProjectProgress(project.startDate, project.endDate);
  const status = getProjectStatus(daysLeft);

  const completedMilestones = milestones.filter((m) => m.completed).length;
  const milestoneSchedule = calculateMilestoneSchedule(
    project.startDate,
    milestones,
    holidays,
    settings.includeWeekends
  );

  const upcomingMilestones = milestoneSchedule.scheduledMilestones
    .filter((m) => !m.completed)
    .sort((a, b) => new Date(a.scheduledEnd) - new Date(b.scheduledEnd))
    .slice(0, 3);

  const criticalMilestones = milestoneSchedule.scheduledMilestones.filter((m) => m.isCritical).length;

  const velocity = project.teamSize > 0
    ? Math.round((baseWorkingDays * 8) / project.teamSize)
    : 0;

  return (
    <div className="card dashboard-card">
      <div className="card-header">
        <div className="card-icon">📊</div>
        <div>
          <h2 className="card-title">
            {project.name || 'Your Project'}
          </h2>
          <p className="card-subtitle">
            {formatDateDisplay(project.startDate)} → {formatDateDisplay(project.endDate)}
          </p>
        </div>
        <div className={`status-badge ${status.color}`}>
          {status.label}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <div className="progress-header">
          <span className="progress-label">Time Elapsed</span>
          <span className="progress-value">{progress}%</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
          <div className="progress-today" />
        </div>
        <div className="progress-dates">
          <span>{formatDateDisplay(project.startDate)}</span>
          <span>Today</span>
          <span>{formatDateDisplay(project.endDate)}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-icon">📅</div>
          <div className="stat-value">{calendarDays}</div>
          <div className="stat-label">Total Calendar Days</div>
        </div>

        <div className="stat-card stat-success">
          <div className="stat-icon">💼</div>
          <div className="stat-value">{baseWorkingDays}</div>
          <div className="stat-label">Working Days</div>
        </div>

        <div className="stat-card stat-warning">
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{daysLeft > 0 ? daysLeft : 0}</div>
          <div className="stat-label">Calendar Days Left</div>
        </div>

        <div className="stat-card stat-info">
          <div className="stat-icon">🏃</div>
          <div className="stat-value">{workingDaysLeft > 0 ? workingDaysLeft : 0}</div>
          <div className="stat-label">Working Days Left</div>
        </div>

        {settings.bufferPercent > 0 && (
          <div className="stat-card stat-purple">
            <div className="stat-icon">🛡️</div>
            <div className="stat-value">{bufferedWorkingDays - baseWorkingDays}</div>
            <div className="stat-label">Buffer Days ({settings.bufferPercent}%)</div>
          </div>
        )}

        <div className="stat-card stat-neutral">
          <div className="stat-icon">🏖️</div>
          <div className="stat-value">{calendarDays - baseWorkingDays}</div>
          <div className="stat-label">Non-Working Days</div>
        </div>

        {project.teamSize > 1 && (
          <div className="stat-card stat-teal">
            <div className="stat-icon">👥</div>
            <div className="stat-value">{project.teamSize}</div>
            <div className="stat-label">Team Members</div>
          </div>
        )}

        {project.teamSize > 0 && velocity > 0 && (
          <div className="stat-card stat-orange">
            <div className="stat-icon">⚡</div>
            <div className="stat-value">{velocity}h</div>
            <div className="stat-label">Hours per Member</div>
          </div>
        )}

        {milestones.length > 0 && (
          <div className="stat-card stat-purple">
            <div className="stat-icon">🧭</div>
            <div className="stat-value">{criticalMilestones}</div>
            <div className="stat-label">Critical Path Milestones</div>
          </div>
        )}
      </div>

      {/* Milestones Summary */}
      {milestones.length > 0 && (
        <div className="dashboard-section">
          <h3 className="section-title">Milestone Progress</h3>
          <div className="milestone-progress">
            <div className="milestone-progress-bar">
              <div
                className="milestone-progress-fill"
                style={{
                  width: `${milestones.length > 0 ? (completedMilestones / milestones.length) * 100 : 0}%`,
                }}
              />
            </div>
            <span className="milestone-progress-text">
              {completedMilestones}/{milestones.length} completed
            </span>
          </div>

          {upcomingMilestones.length > 0 && (
            <div className="upcoming-milestones">
              <h4 className="upcoming-title">Upcoming</h4>
              {upcomingMilestones.map((m) => {
                const d = new Date(m.scheduledEnd);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const dLeft = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
                return (
                  <div key={m.id} className="upcoming-item">
                    <span className="upcoming-icon">{m.icon}</span>
                    <span className="upcoming-name">
                      {m.name}{m.isCritical ? ' • CP' : ''}
                    </span>
                    <span className={`upcoming-days ${dLeft <= 7 ? 'urgent' : ''}`}>
                      {dLeft < 0 ? `${Math.abs(dLeft)}d ago` : dLeft === 0 ? 'Today!' : `in ${dLeft}d`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Deadline Countdown */}
      <div className={`deadline-countdown ${daysLeft < 0 ? 'countdown-overdue' : daysLeft <= 7 ? 'countdown-critical' : 'countdown-normal'}`}>
        {daysLeft < 0 ? (
          <>
            <span className="countdown-icon">⚠️</span>
            <span className="countdown-text">
              Project is <strong>{Math.abs(daysLeft)} days overdue</strong>
            </span>
          </>
        ) : daysLeft === 0 ? (
          <>
            <span className="countdown-icon">🎯</span>
            <span className="countdown-text"><strong>Deadline is TODAY!</strong></span>
          </>
        ) : (
          <>
            <span className="countdown-icon">🏁</span>
            <span className="countdown-text">
              <strong>{daysLeft} calendar days</strong> ({workingDaysLeft} working days) until deadline
            </span>
          </>
        )}
      </div>
    </div>
  );
}
