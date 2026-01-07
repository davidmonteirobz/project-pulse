/**
 * Formats hours (decimal) to HH:MM:SS format
 * @param hours - Hours as decimal (e.g., 1.5 = 1h 30min)
 * @returns Formatted string in HH:MM:SS format
 */
export function formatHoursToTime(hours: number): string {
  const totalSeconds = Math.floor(hours * 3600);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
