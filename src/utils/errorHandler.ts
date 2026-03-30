export const parseApiError = (error: any): string => {
    const data = error?.response?.data;

    if (!data) return error?.message || "Unknown error";

    if (data.message && typeof data.message === 'object') {
        return Object.entries(data.message)
            .map(([field, errors]) => {
                const msgs = Array.isArray(errors) ? errors.join(', ') : errors;
                return `Field "${field}": ${msgs}`;
            })
            .join(' | ');
    }

    if (typeof data.message === 'string') return data.message;

    return data.error || error?.message || "Unknown error";
};