export const BASE_URL = `${import.meta.env.VITE_API_URL}`;

export function formatCurrency(amount: number): string {
    return amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

let searchTimeout: ReturnType<typeof setTimeout> | null = null;

export async function apiSearch(p: {
    searchKey: string,
    url: string,
    searchAfterChars?: number
}): Promise<any[]> {

    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }

    return new Promise((resolve) => {
        const threshold = p.searchAfterChars ?? 3;

        if (p.searchKey.length > threshold) {
            searchTimeout = setTimeout(async () => {
                try {
                    const req = await fetch(p.url);
                    const results = await req.json();
                    resolve(results);
                } catch (error) {
                    console.error("Fetch failed:", error);
                    resolve([]);
                }
            }, 1000);
        } else {
            resolve([]);
        }
    });
}