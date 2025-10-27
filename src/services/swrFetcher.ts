export default async function swrFetcher(...args: Parameters<typeof fetch>) {
    const res = await fetch(...args);
    const data = await res.json();
    
    // 如果 API 回應包含 success 欄位，檢查是否成功
    if ('success' in data && !data.success) {
        throw new Error(data.error || 'API request failed');
    }
    
    // 如果 API 回應包含特定的資料欄位，回傳該欄位
    if ('events' in data) {
        return data.events;
    }
    
    return data;
}