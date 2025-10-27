// is none or empty
export function isEmpty(value: unknown): boolean {
    return value === null
        || value === undefined
        || (typeof value === 'string' && value.trim() === '')
        || (Array.isArray(value) && value.length === 0)
        || (typeof value === 'object' && Object.keys(value).length === 0);
}

export function cn(...classes: (string | undefined | false)[]): string {
    return classes.filter(Boolean).join(' ');
}