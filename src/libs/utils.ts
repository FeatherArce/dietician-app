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

export function checkRequiredFields<T>(obj: T, requiredFields: (keyof T)[]): string[] {
    const missingFields: string[] = [];
    for (const field of requiredFields) {
        if (isEmpty(obj[field])) {
            missingFields.push(field as string);
        }
    }
    return missingFields;
}

export function removedUndefinedFields<T>(obj: T): Partial<T> {
    if (!obj || typeof obj !== 'object') {
        return {};
    }
    
    const cleanedObj: Partial<T> = {};
    for (const key in obj) {
        if (obj[key] !== undefined) {
            cleanedObj[key] = obj[key];
        }
    }
    return cleanedObj;
}