import React, { useState } from 'react';
import { useLifeForge } from '../context/LifeForgeContext';
import { User, Save, Sparkles, Check, Languages } from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { state, updateProfile, updateGoals } = useLifeForge();

  const [name, setName] = useState(state.profile.name);
  const [email, setEmail] = useState(state.profile.email);
  const [foodPreferences, setFoodPreferences] = useState(state.profile.foodPreferences);
  const [preferredLanguage, setPreferredLanguage] = useState(state.profile.preferredLanguage);
  const [motivationStyle, setMotivationStyle] = useState(state.profile.motivationStyle);

  // Goals
  const [studyHoursDaily, setStudyHoursDaily] = useState(String(state.profile.goals.studyHoursDaily));
  const [waterLitersDaily, setWaterLitersDaily] = useState(String(state.profile.goals.waterLitersDaily));
  const [sleepHoursDaily, setSleepHoursDaily] = useState(String(state.profile.goals.sleepHoursDaily));
  const [socialMediaMaxMinutesDaily, setSocialMediaMaxMinutesDaily] = useState(
    String(state.profile.goals.socialMediaMaxMinutesDaily)
  );
  const [exerciseDaysPerWeek, setExerciseDaysPerWeek] = useState(
    String(state.profile.goals.exerciseDaysPerWeek)
  );
  const [calorieTargetDaily, setCalorieTargetDaily] = useState(
    String(state.profile.goals.calorieTargetDaily)
  );
  const [proteinTargetDaily, setProteinTargetDaily] = useState(
    String(state.profile.goals.proteinTargetDaily)
  );

  const [savedNotification, setSavedNotification] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    updateProfile({
      name,
      email,
      foodPreferences,
      preferredLanguage,
      motivationStyle,
    });

    updateGoals({
      studyHoursDaily: Number(studyHoursDaily) || 3,
      waterLitersDaily: Number(waterLitersDaily) || 3,
      sleepHoursDaily: Number(sleepHoursDaily) || 8,
      socialMediaMaxMinutesDaily: Number(socialMediaMaxMinutesDaily) || 120,
      exerciseDaysPerWeek: Number(exerciseDaysPerWeek) || 5,
      calorieTargetDaily: Number(calorieTargetDaily) || 2200,
      proteinTargetDaily: Number(proteinTargetDaily) || 100,
    });

    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Identity & Goal Calibration</span>
            <span aria-hidden="true">·</span>
            <span>Personal Configuration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
            User Profile & Goals
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            The AI Brain references your goals and language preferences in all conversations and actions.
          </p>
        </div>

        {savedNotification && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold rounded-xl animate-in fade-in">
            <Check className="w-3.5 h-3.5" />
            <span>Profile Synced Successfully</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Personal Details */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-400" />
            <span>Personal Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Preferred AI Language
              </label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="auto">Auto (Matches your input language)</option>
                <option value="en">English Primary</option>
                <option value="te">Telugu Primary (తెలుగు)</option>
                <option value="te-en">Telugu + English Mixed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                AI Motivation Style
              </label>
              <select
                value={motivationStyle}
                onChange={(e) => setMotivationStyle(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="honest-evidence">Evidence-Based & Honest (No fake praise)</option>
                <option value="gentle">Supportive & Gentle</option>
                <option value="direct">Direct & High Accountability</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Food & Diet Preferences (Context for AI)
            </label>
            <input
              type="text"
              value={foodPreferences}
              onChange={(e) => setFoodPreferences(e.target.value)}
              placeholder="e.g. Vegetarian, High-protein chicken & egg, South Indian cuisine"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* LifeForge Daily Goals */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Daily Target Goals</span>
            </h2>
            <span className="text-xs text-slate-400">Updates live formulas</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Study Target (Hours/Day)</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="16"
                value={studyHoursDaily}
                onChange={(e) => setStudyHoursDaily(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Water Target (Liters/Day)</label>
              <input
                type="number"
                step="0.25"
                min="1"
                max="8"
                value={waterLitersDaily}
                onChange={(e) => setWaterLitersDaily(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Sleep Target (Hours/Night)</label>
              <input
                type="number"
                step="0.5"
                min="4"
                max="12"
                value={sleepHoursDaily}
                onChange={(e) => setSleepHoursDaily(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Max Social Media (Mins/Day)</label>
              <input
                type="number"
                min="15"
                max="600"
                value={socialMediaMaxMinutesDaily}
                onChange={(e) => setSocialMediaMaxMinutesDaily(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Workout Days (Per Week)</label>
              <input
                type="number"
                min="1"
                max="7"
                value={exerciseDaysPerWeek}
                onChange={(e) => setExerciseDaysPerWeek(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Daily Calories (kcal)</label>
              <input
                type="number"
                min="1200"
                max="5000"
                value={calorieTargetDaily}
                onChange={(e) => setCalorieTargetDaily(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes & Sync to Database</span>
        </button>
      </form>

      {/* Database Reset Action */}
      <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-slate-200">Reset Demo State</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Reset database to initial demo state (0L today's water, fresh DBMS assignment, full history).
          </p>
        </div>
        <button
          onClick={() => {
            if (window.confirm('Reset all records to fresh demo initial state?')) {
              localStorage.removeItem('lifeforge_state_v1');
              window.location.reload();
            }
          }}
          className="px-3.5 py-2 text-xs font-semibold text-rose-400 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 rounded-xl transition-colors cursor-pointer"
        >
          Reset Demo Data
        </button>
      </div>
    </div>
  );
};
