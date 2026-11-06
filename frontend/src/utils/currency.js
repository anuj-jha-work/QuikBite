const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2
});

export const formatCurrency = (value) => currencyFormatter.format(Number(value || 0));