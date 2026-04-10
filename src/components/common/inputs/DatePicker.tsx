import React from 'react';
import { DateTime } from 'luxon';

const business = localStorage.getItem("business_data");
let timezone = "America/Mexico_City";
try {
    if (business) timezone = JSON.parse(business).time_zone;
} catch { /* ignore */ }

interface DatePickerProps {
    name: string;
    id?: string;
    value: string;
    onChange: (isoValue: string) => void;
    label?: string;
    className?: string;
    mode?: 'start' | 'end';
}

const DatePicker: React.FC<DatePickerProps> = ({
    name,
    id,
    value,
    onChange,
    label,
    className = "form-control",
    mode = 'start'
}) => {

    const rawValue = value ? DateTime.fromISO(value, { zone: timezone }).toISODate() : "";

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedValue = e.target.value;
        if (!selectedValue) {
            onChange("");
            return;
        }

        let dateTranslated = DateTime.fromISO(selectedValue, { zone: timezone });
        if (mode === 'start') {
            dateTranslated = dateTranslated.startOf('day');
        } else {
            dateTranslated = dateTranslated.endOf('day');
        }

        onChange(dateTranslated.toFormat('yyyy-MM-dd') || "");
    };

    return (
        <div className="datepicker-container">
            {label && <label htmlFor={id || name} className="form-label">{label}</label>}
            <input
                type="date"
                name={name}
                id={id || name}
                className={className}
                onChange={handleDateChange}
                value={rawValue || ""}
            />
        </div>
    );
};

export default DatePicker;
