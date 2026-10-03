/**
 * Format duration in seconds or minutes to human readable string
 * e.g., 75 -> "1h 15m", 45 -> "45m", 3720 -> "1h 2m"
 */
export function formatDuration(secondsOrMinutes: number, unit: "seconds" | "minutes" = "minutes"): string {
  const totalMinutes = unit === "seconds" ? Math.round(secondsOrMinutes / 60) : secondsOrMinutes;
  
  if (totalMinutes < 60) {
    return `${Math.max(1, totalMinutes)}m`;
  }
  
  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}
