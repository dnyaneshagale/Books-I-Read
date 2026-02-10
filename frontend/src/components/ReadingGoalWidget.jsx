import { useState, useEffect } from 'react';
import goalApi from '../api/goalApi';
import './ReadingGoalWidget.css';

export default function ReadingGoalWidget({ refreshKey }) {
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [targetInput, setTargetInput] = useState('');
  const [saving, setSaving] = useState(false);

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    loadGoal();
  }, [refreshKey]);

  const loadGoal = async () => {
    try {
      const res = await goalApi.getCurrentGoal();
      if (res.status === 204 || !res.data) {
        setGoal(null);
      } else {
        setGoal(res.data);
        setTargetInput(res.data.targetBooks.toString());
      }
    } catch {
      setGoal(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const target = parseInt(targetInput);
    if (!target || target < 1) return;
    setSaving(true);
    try {
      const res = await goalApi.setGoal(currentYear, target);
      setGoal(res.data);
      setEditing(false);
    } catch (err) {
      console.error('Failed to save goal:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') setEditing(false);
  };

  if (loading) {
    return (
      <div className="goal-widget goal-widget--loading">
        <div className="goal-widget__spinner" />
      </div>
    );
  }

  // No goal set — show CTA
  if (!goal) {
    return (
      <div className="goal-widget goal-widget--empty">
        <div className="goal-widget__icon">🎯</div>
        <div className="goal-widget__empty-text">
          <h4>{currentYear} Reading Goal</h4>
          <p>Set a goal to track your progress</p>
        </div>
        {editing ? (
          <div className="goal-widget__input-row">
            <input
              type="number"
              min="1"
              max="999"
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Books"
              autoFocus
              className="goal-widget__input"
            />
            <button onClick={handleSave} disabled={saving} className="goal-widget__save-btn">
              {saving ? '...' : '✓'}
            </button>
            <button onClick={() => setEditing(false)} className="goal-widget__cancel-btn">✕</button>
          </div>
        ) : (
          <button onClick={() => { setTargetInput('12'); setEditing(true); }} className="goal-widget__set-btn">
            Set Goal
          </button>
        )}
      </div>
    );
  }

  // Goal exists — show progress
  const { targetBooks, booksCompleted, progressPercentage, completed } = goal;
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (Math.min(progressPercentage, 100) / 100) * circumference;
  const pct = Math.round(progressPercentage);

  return (
    <div className={`goal-widget ${completed ? 'goal-widget--completed' : ''}`}>
      <div className="goal-widget__progress">
        <svg className="goal-widget__ring" viewBox="0 0 100 100">
          <circle className="goal-widget__ring-bg" cx="50" cy="50" r="40" />
          <circle
            className="goal-widget__ring-fill"
            cx="50" cy="50" r="40"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="goal-widget__ring-text">
          <span className="goal-widget__count">{booksCompleted}</span>
          <span className="goal-widget__divider">/</span>
          <span className="goal-widget__target">{targetBooks}</span>
        </div>
      </div>

      <div className="goal-widget__info">
        <h4 className="goal-widget__title">
          {completed ? '🎉 Goal Complete!' : `${currentYear} Reading Goal`}
        </h4>
        <p className="goal-widget__subtitle">
          {completed
            ? `You read ${booksCompleted} books!`
            : `${booksCompleted} / ${targetBooks} books completed`}
        </p>
        <div className="goal-widget__bar-row">
          <div className="goal-widget__bar">
            <div className="goal-widget__bar-fill" style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
          <span className="goal-widget__percent">{pct}%</span>
        </div>
      </div>

      {editing ? (
        <div className="goal-widget__input-row">
          <input
            type="number"
            min="1"
            max="999"
            value={targetInput}
            onChange={(e) => setTargetInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="goal-widget__input"
          />
          <button onClick={handleSave} disabled={saving} className="goal-widget__save-btn">
            {saving ? '...' : '✓'}
          </button>
          <button onClick={() => setEditing(false)} className="goal-widget__cancel-btn">✕</button>
        </div>
      ) : (
        <button
          onClick={() => { setTargetInput(targetBooks.toString()); setEditing(true); }}
          className="goal-widget__edit-btn"
          title="Edit goal"
        >
          ✏️
        </button>
      )}
    </div>
  );
}
