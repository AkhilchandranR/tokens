const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
});

export function formatCurrency(value: number): string {
    return currencyFormatter.format(value);
};

const NUMBER_FORMATTER = new Intl.NumberFormat('en-US');

export function formatNumber(value: number): string {
    return NUMBER_FORMATTER.format(value);
};