export async function fetcher(url: string) {
    const res = await fetch(url);
    const result = await res.json();
    if (result.success === false) {
        throw new Error('API request failed', {
            cause: {
                status: res.status,
                message: result.error || result.message
            }
        });
    }
    return result;
};