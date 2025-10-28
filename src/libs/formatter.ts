// 格式化金額
export function formatCurrency(amount: number, locale: string = 'zh-TW', options?: Intl.NumberFormatOptions) {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'TWD',
        minimumFractionDigits: 0,
        ...options
    }).format(amount);
};

export function formatNumber(value: number, locale: string = 'zh-TW', options?: Intl.NumberFormatOptions) {
    return new Intl.NumberFormat(locale, options).format(value);
}