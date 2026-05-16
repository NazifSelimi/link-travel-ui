export function formatCurrency(amount?: number | null, currency = 'EUR') {
  const numericAmount = typeof amount === 'number' ? amount : Number(amount ?? 0);

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: numericAmount % 1 === 0 ? 0 : 2,
    }).format(numericAmount);
  } catch {
    const symbol = currency === 'USD' ? '$' : `${currency} `;
    return `${symbol}${numericAmount}`;
  }
}
