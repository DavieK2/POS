export const BASE_URL = `${import.meta.env.VITE_API_URL}`;

export function formatCurrency(amount: number): string {
    return amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}