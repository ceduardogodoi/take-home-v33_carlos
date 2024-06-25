export const formatNumber = (value: number) => {
  return Intl.NumberFormat('en-US').format(value);
}
