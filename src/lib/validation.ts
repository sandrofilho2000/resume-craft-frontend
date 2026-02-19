export const normalizeLink = (link: string): string => {
  if (!link || link.trim() === '') return '';
  
  const trimmed = link.trim();
  
  // If it's an email link
  if (trimmed.startsWith('mailto:')) return trimmed;
  
  // If it's already a valid URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  
  // Add https:// prefix
  return `https://${trimmed}`;
};

export const isValidEmail = (email: string): boolean => {
  if (!email || email.trim() === '') return true; // Empty is valid (not required)
  return email.includes('@');
};

export const validateContactItem = (item: { title: string; text: string; link: string }): string[] => {
  const errors: string[] = [];
  
  // Check email format if it looks like an email field
  if (item.title.toLowerCase().includes('email') && item.text && !isValidEmail(item.text)) {
    errors.push('Please enter a valid email address');
  }
  
  return errors;
};
