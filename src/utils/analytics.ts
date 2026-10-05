import { LifeForgeState, DailySummary } from '../types/lifeforge';
import { getPastDateStr, getTodayDateStr } from './initialState';

export function calculateDaySummary(state: LifeForgeState, targetDate: string): DailySummary {
  // Study hours
  const studyHours = state.studyRecords
    .filter((s) => s.date === targetDate)
    .reduce((acc, curr) => acc + curr.durationHours, 0);

  // Tasks
  const dayTasks = state.tasks.filter((t) => t.dueDate === targetDate);
  const tasksCompleted = dayTasks.filter((t) => t.completed).length;
  const tasksTotal = dayTasks.length;

  // Water
  const waterMl = state.waterLogs
    .filter((w) => w.date === targetDate)
    .reduce((acc, curr) => acc + curr.amountMl, 0);
  const waterIntakeLiters = Number((waterMl / 1000).toFixed(2));

  // Sleep
  const sleep = state.sleepRecords.find((s) => s.date === targetDate);
  const sleepHours = sleep ? sleep.durationHours : 0;

  // Exercise
  const exercises = state.exerciseRecords.filter((e) => e.date === targetDate);
  const exerciseCompleted = exercises.length > 0;
  const exerciseMinutes = exercises.reduce((acc, curr) => acc + curr.durationMinutes, 0);

  // Social media
  const social = state.socialMediaLogs.filter((s) => s.date === targetDate);
  const socialMediaMinutes = social.reduce((acc, curr) => acc + curr.durationMinutes, 0);

  // Nutrition
  const meals = state.nutritionMeals.filter((m) => m.date === targetDate);
  const caloriesConsumed = meals.reduce((acc, curr) => acc + curr.calories, 0);

  // Goals
  const studyTargetHours = state.profile.goals.studyHoursDaily;
  const waterTargetLiters = state.profile.goals.waterLitersDaily;
  const sleepTargetHours = state.profile.goals.sleepHoursDaily;
  const socialMediaLimitMinutes = state.profile.goals.socialMediaMaxMinutesDaily;
  const caloriesTarget = state.profile.goals.calorieTargetDaily;

  // Factor scores
  const studyScore = studyTargetHours > 0 ? Math.min(100, (studyHours / studyTargetHours) * 100) : 100;
  const taskScore = tasksTotal > 0 ? (tasksCompleted / tasksTotal) * 100 : 100;
  const waterScore = waterTargetLiters > 0 ? Math.min(100, (waterIntakeLiters / waterTargetLiters) * 100) : 100;
  const sleepScore = sleepTargetHours > 0 ? Math.min(100, (sleepHours / sleepTargetHours) * 100) : 100;
  const exerciseScore = exerciseCompleted ? 100 : 0;
  const socialScore =
    socialMediaMinutes <= socialMediaLimitMinutes
      ? 100
      : Math.max(0, 100 - ((socialMediaMinutes - socialMediaLimitMinutes) / socialMediaLimitMinutes) * 100);

  // Weighted total: study (25%), tasks (20%), exercise (15%), water (15%), sleep (15%), social (10%)
  const overall =
    studyScore * 0.25 +
    taskScore * 0.2 +
    exerciseScore * 0.15 +
    waterScore * 0.15 +
    sleepScore * 0.15 +
    socialScore * 0.1;

  return {
    date: targetDate,
    studyHours: Number(studyHours.toFixed(1)),
    studyTargetHours,
    tasksCompleted,
    tasksTotal,
    waterIntakeLiters,
    waterTargetLiters,
    sleepHours: Number(sleepHours.toFixed(2)),
    sleepTargetHours,
    exerciseCompleted,
    exerciseMinutes,
    socialMediaMinutes,
    socialMediaLimitMinutes,
    caloriesConsumed,
    caloriesTarget,
    overallScorePercent: Math.round(overall),
  };
}

export interface DayVsDayComparison {
  metric: string;
  yesterday: string;
  today: string;
  improved: boolean;
  neutral: boolean;
  deltaText: string;
}

export interface WeekVsWeekComparison {
  metric: string;
  prevWeek: string;
  thisWeek: string;
  improved: boolean;
  neutral: boolean;
  deltaText: string;
}

export function calculateDayVsDay(state: LifeForgeState): DayVsDayComparison[] {
  const today = getTodayDateStr();
  const yesterday = getPastDateStr(1);

  const tSummary = calculateDaySummary(state, today);
  const ySummary = calculateDaySummary(state, yesterday);

  const comparisons: DayVsDayComparison[] = [
    {
      metric: 'Study Duration',
      yesterday: `${ySummary.studyHours}h`,
      today: `${tSummary.studyHours}h`,
      improved: tSummary.studyHours >= ySummary.studyHours,
      neutral: tSummary.studyHours === ySummary.studyHours,
      deltaText: `${tSummary.studyHours >= ySummary.studyHours ? '+' : ''}${(
        tSummary.studyHours - ySummary.studyHours
      ).toFixed(1)}h`,
    },
    {
      metric: 'Exercise Activity',
      yesterday: ySummary.exerciseCompleted ? `${ySummary.exerciseMinutes} mins` : 'Rest / Missed',
      today: tSummary.exerciseCompleted ? `${tSummary.exerciseMinutes} mins` : 'Pending',
      improved: tSummary.exerciseCompleted,
      neutral: !tSummary.exerciseCompleted && !ySummary.exerciseCompleted,
      deltaText: tSummary.exerciseCompleted ? 'Completed' : 'Not yet',
    },
    {
      metric: 'Social Media',
      yesterday: `${Math.floor(ySummary.socialMediaMinutes / 60)}h ${ySummary.socialMediaMinutes % 60}m`,
      today: `${Math.floor(tSummary.socialMediaMinutes / 60)}h ${tSummary.socialMediaMinutes % 60}m`,
      improved: tSummary.socialMediaMinutes <= ySummary.socialMediaMinutes,
      neutral: tSummary.socialMediaMinutes === ySummary.socialMediaMinutes,
      deltaText:
        tSummary.socialMediaMinutes <= ySummary.socialMediaMinutes
          ? `-${ySummary.socialMediaMinutes - tSummary.socialMediaMinutes}m (Better)`
          : `+${tSummary.socialMediaMinutes - ySummary.socialMediaMinutes}m (Higher)`,
    },
    {
      metric: 'Sleep Duration',
      yesterday: `${ySummary.sleepHours}h`,
      today: `${tSummary.sleepHours}h`,
      improved: Math.abs(tSummary.sleepHours - tSummary.sleepTargetHours) <= Math.abs(ySummary.sleepHours - ySummary.sleepTargetHours),
      neutral: tSummary.sleepHours === ySummary.sleepHours,
      deltaText: `${tSummary.sleepHours >= ySummary.sleepHours ? '+' : ''}${(
        tSummary.sleepHours - ySummary.sleepHours
      ).toFixed(2)}h`,
    },
    {
      metric: 'Water Intake',
      yesterday: `${ySummary.waterIntakeLiters}L`,
      today: `${tSummary.waterIntakeLiters}L`,
      improved: tSummary.waterIntakeLiters >= ySummary.waterIntakeLiters,
      neutral: tSummary.waterIntakeLiters === ySummary.waterIntakeLiters,
      deltaText: `${tSummary.waterIntakeLiters >= ySummary.waterIntakeLiters ? '+' : ''}${(
        tSummary.waterIntakeLiters - ySummary.waterIntakeLiters
      ).toFixed(2)}L`,
    },
  ];

  return comparisons;
}

export function calculateWeekVsWeek(state: LifeForgeState): WeekVsWeekComparison[] {
  // Last 7 days: days 0 to 6
  // Previous 7 days: days 7 to 13
  const thisWeekDates = Array.from({ length: 7 }, (_, i) => getPastDateStr(i));
  const prevWeekDates = Array.from({ length: 7 }, (_, i) => getPastDateStr(i + 7));

  // Study hours total
  const thisWeekStudy = state.studyRecords
    .filter((s) => thisWeekDates.includes(s.date))
    .reduce((acc, curr) => acc + curr.durationHours, 0);
  const prevWeekStudy = state.studyRecords
    .filter((s) => prevWeekDates.includes(s.date))
    .reduce((acc, curr) => acc + curr.durationHours, 0);

  // Exercise days
  const thisWeekExerciseDays = new Set(
    state.exerciseRecords.filter((e) => thisWeekDates.includes(e.date)).map((e) => e.date)
  ).size;
  const prevWeekExerciseDays = new Set(
    state.exerciseRecords.filter((e) => prevWeekDates.includes(e.date)).map((e) => e.date)
  ).size;

  // Average sleep
  const thisWeekSleeps = state.sleepRecords.filter((s) => thisWeekDates.includes(s.date));
  const thisWeekSleepAvg =
    thisWeekSleeps.length > 0
      ? thisWeekSleeps.reduce((a, b) => a + b.durationHours, 0) / thisWeekSleeps.length
      : 0;

  const prevWeekSleeps = state.sleepRecords.filter((s) => prevWeekDates.includes(s.date));
  const prevWeekSleepAvg =
    prevWeekSleeps.length > 0
      ? prevWeekSleeps.reduce((a, b) => a + b.durationHours, 0) / prevWeekSleeps.length
      : 7.2; // Baseline estimate if empty

  // Average social media
  const thisWeekSocial = state.socialMediaLogs.filter((s) => thisWeekDates.includes(s.date));
  const thisWeekSocialAvg =
    thisWeekSocial.length > 0
      ? thisWeekSocial.reduce((a, b) => a + b.durationMinutes, 0) / thisWeekSocial.length
      : 0;

  const prevWeekSocial = state.socialMediaLogs.filter((s) => prevWeekDates.includes(s.date));
  const prevWeekSocialAvg =
    prevWeekSocial.length > 0
      ? prevWeekSocial.reduce((a, b) => a + b.durationMinutes, 0) / prevWeekSocial.length
      : 140;

  return [
    {
      metric: 'Total Study Time',
      prevWeek: `${prevWeekStudy.toFixed(1)}h`,
      thisWeek: `${thisWeekStudy.toFixed(1)}h`,
      improved: thisWeekStudy >= prevWeekStudy,
      neutral: thisWeekStudy === prevWeekStudy,
      deltaText: `${thisWeekStudy >= prevWeekStudy ? '+' : ''}${(thisWeekStudy - prevWeekStudy).toFixed(1)}h`,
    },
    {
      metric: 'Active Exercise Days',
      prevWeek: `${prevWeekExerciseDays} days`,
      thisWeek: `${thisWeekExerciseDays} days`,
      improved: thisWeekExerciseDays >= prevWeekExerciseDays,
      neutral: thisWeekExerciseDays === prevWeekExerciseDays,
      deltaText: `${thisWeekExerciseDays >= prevWeekExerciseDays ? '+' : ''}${
        thisWeekExerciseDays - prevWeekExerciseDays
      } days`,
    },
    {
      metric: 'Average Sleep Duration',
      prevWeek: `${prevWeekSleepAvg.toFixed(2)}h`,
      thisWeek: `${thisWeekSleepAvg.toFixed(2)}h`,
      improved: thisWeekSleepAvg >= 7.0 && thisWeekSleepAvg <= 9.0,
      neutral: false,
      deltaText: `${(thisWeekSleepAvg - prevWeekSleepAvg).toFixed(2)}h avg`,
    },
    {
      metric: 'Avg Daily Social Media',
      prevWeek: `${Math.round(prevWeekSocialAvg)} mins`,
      thisWeek: `${Math.round(thisWeekSocialAvg)} mins`,
      improved: thisWeekSocialAvg <= prevWeekSocialAvg,
      neutral: Math.round(thisWeekSocialAvg) === Math.round(prevWeekSocialAvg),
      deltaText:
        thisWeekSocialAvg <= prevWeekSocialAvg
          ? `-${Math.round(prevWeekSocialAvg - thisWeekSocialAvg)} mins/day`
          : `+${Math.round(thisWeekSocialAvg - prevWeekSocialAvg)} mins/day`,
    },
  ];
}
