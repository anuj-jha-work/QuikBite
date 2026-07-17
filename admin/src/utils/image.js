const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const resolveImageUrl = (imagePath) => {
  if (!imagePath) {
    return '';
  }

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
    return imagePath;
  }

  return `${apiBase}${imagePath}`;
};