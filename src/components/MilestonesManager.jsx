import { useState } from 'react';

const MILESTONE_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#10b981',
  '#06b6d4', '#f59e0b', '#ef4444', '#84cc16', '#3b82f6',
];

const MILESTONE_ICONS = ['🎯', '🏆', '📋', '🔑', '⭐', '🚀', '✅', '📌', '🔥', '💡'];

export default function MilestonesManager({ milestones, project, onUpdate }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    name: '',
    date: '',
    description: '',
    color: MILESTONE_COLORS[0],
    icon: MILESTONE_ICONS[0],
    completed: false,
  });

  // holidays variable reserved for future use with working day calculation in milestones

  const addMilestone = () => {
    if (!newMilestone.name || !newMilestone.date) return;
    const milestone = {
      ...newMilestone,
      id: Date.now(),
      color: MILESTONE_COLORS[milestones.length % MILESTONE_COLORS.length],
      icon: MILESTONE_ICONS[milestones.length % MILESTONE_ICONS.length],
    };
    onUpdate([...milestones, milestone]);
    setNewMilestone({
      name: '',
      date: '',
      description: '',
      color: MILESTONE_COLORS[(milestones.length + 1) % MILESTONE_COLORS.length],
      icon: MILESTONE_ICONS[(milestones.length + 1) % MILESTONE_ICONS.length],
      completed: false,
    });
    setIsAdding(false);
  };

  const removeMilestone = (id) => {
    onUpdate(milestones.filter((m) => m.id !== id));
  };

  const toggleComplete = (id) => {
    onUpdate(milestones.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m)));
  };

  const sortedMilestones = [...milestones].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="card milestones-card">
      <div className="card-header">
        <div className="card-icon">🎯</div>
        <div>
          <h2 className="card-title">Milestones & Phases</h2>
          <p className="card-subtitle">
            {milestones.length} milestone{milestones.length !== 1 ? 's' : ''} •{' '}
            {milestones.filter((m) => m.completed).length} completed
          </p>
        </div>
        <button
          className="btn btn-primary ml-auto"
          onClick={() => setIsAdding(!isAdding)}
        >
          {isAdding ? 'Cancel' : '+ Add Milestone'}
        </button>
      </div>

      {isAdding && (
        <div className="milestone-add-form">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Milestone Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., MVP Release"
                value={newMilestone.name}
                onChange={(e) => setNewMilestone({ ...newMilestone, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Target Date *</label>
              <input
                type="date"
                className="form-input"
                value={newMilestone.date}
                min={project.startDate}
                max={project.endDate}
                onChange={(e) => setNewMilestone({ ...newMilestone, date: e.target.value })}
              />
            </div>
            <div className="form-group full-width">
              <label className="form-label">Description</label>
              <input
                type="text"
                className="form-input"
                placeholder="Brief description of this milestone..."
                value={newMilestone.description}
                onChange={(e) =>
                  setNewMilestone({ ...newMilestone, description: e.target.value })
                }
              />
            </div>
            <div className="form-group full-width">
              <label className="form-label">Icon</label>
              <div className="icon-picker">
                {MILESTONE_ICONS.map((icon) => (
                  <button
                    key={icon}
                    className={`icon-btn ${newMilestone.icon === icon ? 'icon-btn-active' : ''}`}
                    onClick={() => setNewMilestone({ ...newMilestone, icon })}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="milestone-add-actions">
            <button
              className="btn btn-secondary"
              onClick={() => setIsAdding(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={addMilestone}
              disabled={!newMilestone.name || !newMilestone.date}
            >
              Add Milestone
            </button>
          </div>
        </div>
      )}

      {sortedMilestones.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎯</div>
          <p className="empty-title">No milestones yet</p>
          <p className="empty-desc">Add milestones to track key project phases and deliverables</p>
        </div>
      ) : (
        <div className="milestones-list">
          {sortedMilestones.map((milestone, idx) => {
            const today = new Date();
            const mDate = new Date(milestone.date);
            const daysLeft = Math.ceil((mDate - today) / (1000 * 60 * 60 * 24));
            const isOverdue = daysLeft < 0 && !milestone.completed;
            const isUpcoming = daysLeft >= 0 && daysLeft <= 7 && !milestone.completed;

            return (
              <div
                key={milestone.id}
                className={`milestone-item ${milestone.completed ? 'milestone-done' : ''} ${isOverdue ? 'milestone-overdue' : ''}`}
                style={{ '--milestone-color': milestone.color }}
              >
                <div className="milestone-indicator">
                  <button
                    className="milestone-check"
                    onClick={() => toggleComplete(milestone.id)}
                    title={milestone.completed ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {milestone.completed ? '✓' : ''}
                  </button>
                  {idx < sortedMilestones.length - 1 && (
                    <div className="milestone-line" />
                  )}
                </div>

                <div className="milestone-content">
                  <div className="milestone-header">
                    <span className="milestone-icon">{milestone.icon}</span>
                    <div className="milestone-info">
                      <span className={`milestone-name ${milestone.completed ? 'milestone-name-done' : ''}`}>
                        {milestone.name}
                      </span>
                      {milestone.description && (
                        <span className="milestone-desc">{milestone.description}</span>
                      )}
                    </div>
                    <div className="milestone-meta">
                      <span className="milestone-date">{milestone.date}</span>
                      {!milestone.completed && (
                        <span className={`milestone-badge ${isOverdue ? 'badge-overdue' : isUpcoming ? 'badge-soon' : 'badge-normal'}`}>
                          {isOverdue
                            ? `${Math.abs(daysLeft)}d overdue`
                            : daysLeft === 0
                            ? 'Today!'
                            : `${daysLeft}d left`}
                        </span>
                      )}
                      {milestone.completed && (
                        <span className="milestone-badge badge-done">Done ✓</span>
                      )}
                    </div>
                    <button
                      className="milestone-delete"
                      onClick={() => removeMilestone(milestone.id)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
