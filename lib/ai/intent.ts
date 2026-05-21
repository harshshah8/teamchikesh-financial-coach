export type CoachIntent =
  | "GREETING"
  | "DATE"
  | "WEATHER"
  | "EVENT_SUMMARY"
  | "NET_WORTH"
  | "MONTHLY_SUMMARY"
  | "GENERAL_FINANCE"
  | "OUT_OF_SCOPE";

const greetingPattern = /^(hi|hello|hey|namaste|yo|good morning|good evening|good afternoon)[!. ]*$/i;
const datePattern = /\b(today|date|day is it|which day|what day)\b/i;
const weatherPattern = /\b(weather|temperature|rain|raining|forecast|humidity)\b/i;
const eventPattern = /\b(trip|goa|event|cost|paid|spend|spent)\b/i;
const netWorthPattern = /\b(net worth|assets|liabilities|wealth)\b/i;
const monthlyPattern = /\b(month|monthly|income|expense|expenses|investment|investments|saving|savings|report|category|categories)\b/i;
const financePattern = /\b(afford|budget|money|finance|financial|credit card|card|upi|cash|salary|sip|mutual fund|improve|doing|enough)\b/i;

export function detectCoachIntent(question: string): CoachIntent {
  const normalized = question.trim().toLowerCase();

  if (!normalized) return "OUT_OF_SCOPE";
  if (greetingPattern.test(normalized)) return "GREETING";
  if (weatherPattern.test(normalized)) return "WEATHER";
  if (datePattern.test(normalized)) return "DATE";
  if (eventPattern.test(normalized)) return "EVENT_SUMMARY";
  if (netWorthPattern.test(normalized)) return "NET_WORTH";
  if (monthlyPattern.test(normalized)) return "MONTHLY_SUMMARY";
  if (financePattern.test(normalized)) return "GENERAL_FINANCE";

  return "OUT_OF_SCOPE";
}
