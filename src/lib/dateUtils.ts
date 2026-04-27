export const formatDate = (
  dateString?: string | null,
  style: 'long' | 'short' = 'long'
): string => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: style,
    day: 'numeric',
  });
};
