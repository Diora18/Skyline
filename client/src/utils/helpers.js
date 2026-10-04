import { useState, useEffect } from 'react';

// Shared utility for formatting currencies
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'INR',
  }).format(value);
};

// Shared utility for formatting dates
export const formatDate = (dateString, formatType = 'full') => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (formatType === 'short') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric', 
    hour: 'numeric', 
    minute: '2-digit' 
  });
};
