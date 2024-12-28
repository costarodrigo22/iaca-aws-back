export function calculateFreightRate(distance: number): number {
  if (distance < 1) return 6.0;
  if (distance <= 2.4) return 7.0;
  if (distance <= 3.2) return 8.0;
  if (distance <= 4) return 9.0;
  if (distance <= 4.8) return 10.0;
  if (distance <= 5.6) return 11.0;
  if (distance <= 6.4) return 12.0;
  if (distance <= 7.2) return 13.0;
  if (distance <= 8) return 14.0;
  if (distance <= 8.8) return 15.0;
  if (distance <= 9.6) return 16.0;
  if (distance <= 10.4) return 17.0;
  if (distance <= 11.2) return 18.0;
  if (distance <= 12) return 19.0;
  if (distance <= 13) return 20.0;
  if (distance <= 15) return 25.0;

  return -1;
}
