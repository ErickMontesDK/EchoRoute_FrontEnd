const businessDataStr = localStorage.getItem("business_data");
let businessData: any = null;
try {
    if (businessDataStr) businessData = JSON.parse(businessDataStr);
} catch { /* ignore corrupted data */ }

const DEFAULT_TIMEZONE = businessData?.time_zone || "America/Mexico_City";
const DEFAULT_LOCALE = businessData?.locale || "es-ES";

export function formatDatetime(datetime: string, timezone: string = DEFAULT_TIMEZONE, locale: string = DEFAULT_LOCALE) {
    const date = new Date(datetime);
    const formatDate = new Intl.DateTimeFormat(locale, {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
    const formatTime = new Intl.DateTimeFormat(locale, {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });

    return { formattedDate: formatDate.format(date), formattedTime: formatTime.format(date) };
}

