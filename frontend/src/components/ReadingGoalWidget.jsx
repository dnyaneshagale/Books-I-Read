import { useState, useEffect } from 'react';
import goalApi from '../api/goalApi';
import { Target, Edit3 } from 'lucide-react';

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

  const widgetBase = 'group flex items-center gap-[18px] bg-white border border-gray-200 rounded-2xl p-6 relative transition-all duration-200 h-full box-border hover:border-gray-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:bg-[#1e1e1e] dark:border-[#333] dark:hover:border-[#444] dark:hover:shadow-[0_2px_8px_rgba(0,0,0,0.3)]';
  const inputRowCls = 'flex items-center gap-1.5 ml-auto';
  const inputCls = 'w-[60px] py-1.5 px-2 border border-gray-300 rounded-lg text-[0.85rem] text-center outline-none transition-colors duration-200 focus:border-indigo-500 dark:bg-[#2d2d2d] dark:border-[#444] dark:text-gray-100 dark:focus:border-indigo-400';
  const saveBtnCls = 'w-7 h-7 border-none rounded-md text-[0.85rem] cursor-pointer flex items-center justify-center transition-colors duration-200 bg-emerald-500 text-white hover:bg-emerald-600';
  const cancelBtnCls = 'w-7 h-7 border-none rounded-md text-[0.85rem] cursor-pointer flex items-center justify-center transition-colors duration-200 bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600';

  if (loading) {
    return (
      <div className={`${widgetBase} justify-center min-h-[100px]`}>
        <div className="w-6 h-6 border-[3px] border-gray-200 border-t-indigo-500 rounded-full animate-[g-spin_0.8s_linear_infinite]" />
      </div>
    );
  }

  // No goal set — show CTA
  if (!goal) {
    return (
      <div className={`${widgetBase} flex-wrap`}>
        <div className="text-[2rem]"><Target className="w-8 h-8" /></div>
        <div>
          <h4 className="m-0 text-[0.95rem] font-semibold text-gray-900 dark:text-gray-100">{currentYear} Reading Goal</h4>
          <p className="mt-0.5 mb-0 text-[0.8rem] text-gray-500 dark:text-gray-400">Set a goal to track your progress</p>
        </div>
        {editing ? (
          <div className={inputRowCls}>
            <input type="number" min="1" max="999" value={targetInput} onChange={(e) => setTargetInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Books" autoFocus className={inputCls} />
            <button onClick={handleSave} disabled={saving} className={saveBtnCls}>{saving ? '...' : '✓'}</button>
            <button onClick={() => setEditing(false)} className={cancelBtnCls}>✕</button>
          </div>
        ) : (
          <button onClick={() => { setTargetInput('12'); setEditing(true); }} className="ml-auto bg-indigo-500 text-white border-none rounded-lg py-2 px-4 text-[0.85rem] font-semibold cursor-pointer transition-colors duration-200 hover:bg-indigo-600">
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
    <div className={`${widgetBase} ${completed ? 'bg-gradient-to-br from-amber-100 to-amber-200/[0.125] !border-amber-400 dark:from-yellow-900/[0.125] dark:to-amber-900/[0.125] dark:!border-amber-700' : ''}`}>
      <div className="relative w-[92px] h-[92px] shrink-0">
        <svg className="-rotate-90 w-[92px] h-[92px]" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="6" className="dark:stroke-gray-700" />
          <circle
            cx="50" cy="50" r="40" fill="none"
            stroke={completed ? '#f59e0b' : '#6366f1'}
            strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-600"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center gap-0.5 font-bold">
          <span className={`text-[1.3rem] ${completed ? 'text-amber-600' : 'text-indigo-500'}`}>{booksCompleted}</span>
          <span className="text-[0.85rem] text-gray-400 dark:text-gray-400">/</span>
          <span className="text-[0.85rem] text-gray-500 dark:text-gray-400">{targetBooks}</span>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="m-0 text-base font-bold text-gray-900 dark:text-gray-100">
          {completed ? '🎉 Goal Complete!' : `${currentYear} Reading Goal`}
        </h4>
        <p className="mt-1 mb-0 text-[0.85rem] text-gray-500 dark:text-gray-400">
          {completed
            ? `You read ${booksCompleted} books!`
            : `${booksCompleted} / ${targetBooks} books completed`}
        </p>
        <div className="flex items-center gap-2.5 mt-2.5">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
            <div
              className={`h-full rounded-full transition-[width] duration-600 ${completed ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-indigo-500 to-indigo-400'}`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
          <span className={`text-[0.8rem] font-bold whitespace-nowrap min-w-[36px] text-right ${completed ? 'text-amber-600 dark:text-amber-300' : 'text-indigo-500 dark:text-indigo-300'}`}>{pct}%</span>
        </div>
      </div>

      {editing ? (
        <div className={inputRowCls}>
          <input type="number" min="1" max="999" value={targetInput} onChange={(e) => setTargetInput(e.target.value)} onKeyDown={handleKeyDown} autoFocus className={inputCls} />
          <button onClick={handleSave} disabled={saving} className={saveBtnCls}>{saving ? '...' : '✓'}</button>
          <button onClick={() => setEditing(false)} className={cancelBtnCls}>✕</button>
        </div>
      ) : (
        <button
          onClick={() => { setTargetInput(targetBooks.toString()); setEditing(true); }}
          className="bg-transparent border-none cursor-pointer text-base p-1 opacity-0 transition-opacity duration-200 group-hover:opacity-60 hover:!opacity-100"
          title="Edit goal"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
