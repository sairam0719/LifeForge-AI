// Validate model proposals before they reach the application action layer.
const supported = new Set(['record_water','record_study','record_workout','record_sleep','record_meal','record_social_media','create_task','complete_task','delete_task','update_goals','update_commitment','record_attendance','create_custom_field','record_custom_log']);
const safeLogs = new Set(['record_water','record_study','record_workout','record_sleep','record_social_media']);
function positive(value: any, max: number) { return typeof value === 'number' && Number.isFinite(value) && value > 0 && value <= max; }
export function validateReply(reply: any, state: any, today: string) {
  if (!reply || typeof reply.replyText !== 'string' || !reply.replyText.trim()) throw new Error('Local AI returned an invalid reply. Please retry.');
  if (!reply.proposedAction) return { ...reply, proposedAction: null };
  const action = reply.proposedAction;
  const p = action.payload;
  const clarify = () => ({ replyText: 'Please clarify the activity, amount or duration you want to record. No records were changed.', dynamicQuestions: [], proposedAction: null });
  if (!supported.has(action.actionType) || !p || typeof p !== 'object' || Array.isArray(p)) return clarify();
  if (p.date && (!/^\d{4}-\d{2}-\d{2}$/.test(p.date) || Number.isNaN(Date.parse(p.date)))) return clarify();
  switch(action.actionType) {
    case 'record_water': {
      const amount = p.amountMl ?? (p.amountLiters != null ? Number(p.amountLiters)*1000 : NaN);
      if (!positive(amount,20000) || !['set','add'].includes(p.mode)) return clarify();
      p.amountMl = Math.round(amount);
      const current = (state?.waterLogs || []).filter((w:any)=>w.date===today).reduce((n:number,w:any)=>n+Number(w.amountMl||0),0);
      const total = (p.mode === 'add' ? current : 0) + p.amountMl;
      const goal = Number(state?.profile?.goals?.waterLitersDaily || 3)*1000;
      const remaining = Math.max(0,goal-total)/1000;
      const te = /[\u0C00-\u0C7F]/.test(reply.replyText);
      reply.replyText = te ? `ఈరోజు నీటి మొత్తం ${total/1000} లీటర్లు. లక్ష్యానికి ఇంకా ${remaining} లీటర్లు మిగిలాయి.` : `Today's water total is ${total/1000} L. You have ${remaining} L remaining for your ${goal/1000} L goal.`;
      action.description = `${total/1000} L total · ${remaining} L remaining`;
      break;
    }
    case 'record_study': if (!positive(p.durationHours,24) || typeof p.subject !== 'string' || !p.subject.trim()) return clarify(); break;
    case 'record_sleep': if (!positive(p.durationHours ?? p.hours,24)) return clarify(); break;
    case 'record_workout': if (!positive(p.durationMinutes,1440) || !p.activity) return clarify(); break;
    case 'record_social_media': if (!positive(p.durationMinutes ?? p.minutes,1440)) return clarify(); break;
    case 'create_task': if (typeof p.title !== 'string' || !p.title.trim()) return clarify(); break;
    case 'complete_task': case 'delete_task': {
      const matches = (state?.tasks || []).filter((t:any)=>(p.taskId || p.id) ? t.id===(p.taskId || p.id) : p.taskTitle && t.title.toLowerCase().includes(String(p.taskTitle).toLowerCase()));
      if (matches.length !== 1) return { replyText:'Which exact task do you mean? No records were changed.', proposedAction:null, dynamicQuestions:[] };
      p.id = matches[0].id;
      delete p.taskTitle; delete p.title; delete p.taskId; break;
    }
    case 'record_meal': if (!p.food && !p.foods) return clarify();
      if (['calories','protein','carbs','fat'].some(k=>typeof p[k] !== 'number' || !Number.isFinite(p[k]) || p[k]<0)) return clarify();
      p.aiEstimated = true; break;
    case 'record_custom_log': if (!(state?.customFields || []).some((f:any)=>f.id===p.fieldId) || !Number.isFinite(Number(p.value))) return clarify(); break;
    case 'update_goals': {
      const ranges: Record<string,number> = { studyHoursDaily:24, waterLitersDaily:20, sleepHoursDaily:24, exerciseDaysPerWeek:7, socialMediaMinutesDaily:1440, caloriesDaily:20000, proteinDaily:1000 };
      const goals = p.goals || p;
      if (!Object.keys(goals).length || Object.entries(goals).some(([k,v])=>!ranges[k] || !positive(v,ranges[k]))) return clarify();
      action.payload = goals; break;
    }
  }
  // Conservatively confirm all non-logging actions and all nutrition estimates.
  action.requiresConfirmation = !safeLogs.has(action.actionType) || action.requiresConfirmation === true;
  if (action.requiresConfirmation) reply.replyText = /[\u0C00-\u0C7F]/.test(reply.replyText) ? 'ఈ మార్పును సేవ్ చేయడానికి చాట్‌లో Confirm నొక్కండి.' : 'Please review and confirm this proposed change in the chat panel before it is saved.';
  return reply;
}
// Fast path only for unambiguous, present-day English water logging.
export function parseWaterCommand(message: string) {
  const match = message.trim().match(/^(?:i\s+(?:have\s+)?(?:drank|drunk)|add|log)\s+(another\s+)?(\d+(?:\.\d+)?)\s*(ml|milliliters?|millilitres?|l|liters?|litres?)\s*(?:of\s+)?(?:water)?\s*(?:today)?[.!]?$/i);
  if (!match) return null;
  const amountMl = Math.round(Number(match[2])*(match[3].toLowerCase().startsWith('m')?1:1000));
  if (!positive(amountMl,20000)) return null;
  return { replyText:'Water recorded.', proposedAction:{actionType:'record_water',title:'Water intake',description:'',requiresConfirmation:false,payload:{amountMl,mode:match[1] || /^add/i.test(message) ? 'add':'set'}},dynamicQuestions:[] };
}
