import { cn } from "@/libs/utils";
import React, { useMemo } from "react";

export interface FieldsetItem {
    label: string;
    content?: string;
    type?: React.HTMLInputTypeAttribute; // e.g. 'text', 'number', 'password', etc.
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

export interface FieldsetColSpan {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
}

export interface FieldsetProps extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
    legend?: string;
    items: FieldsetItem[];
    colSpan?: FieldsetColSpan;
}

const defaultColSpanSettings: { [key: string]: string } = {
    xs: "grid-cols-1",
    sm: "sm:grid-cols-1",
    md: "md:grid-cols-1",
    lg: "lg:grid-cols-1",
    xl: "xl:grid-cols-1",
};

export default function Fieldset({
    legend,
    items = [],
    colSpan,
    ...fieldsetProps
}: FieldsetProps) {
    const mixedColClasses = useMemo(() => {
        if(!colSpan) {
            return Object.values(defaultColSpanSettings).join(' ');
        }
        const newSettings = {
            xs: colSpan.xs ? `grid-cols-${colSpan.xs}` : '',
            sm: colSpan.sm ? `sm:grid-cols-${colSpan.sm}` : '',
            md: colSpan.md ? `md:grid-cols-${colSpan.md}` : '',
            lg: colSpan.lg ? `lg:grid-cols-${colSpan.lg}` : '',
            xl: colSpan.xl ? `xl:grid-cols-${colSpan.xl}` : '',
        };
        return Object.values(newSettings).join(' ');
    }, [colSpan]);

    return (
        <fieldset className="fieldset space-y-2" {...fieldsetProps}>
            {legend && <legend className="fieldset-legend text-xl font-semibold mb-2">
                {legend}
            </legend>}

            <div className={cn("grid gap-4 grid-cols-1", mixedColClasses)}>
                {items.map((item, idx) => (
                    <div key={idx} className="flex flex-col gap-1.5">
                        <label className="label text-base">
                            {item.label}
                        </label>
                        <input
                            type={item.type || 'text'}
                            className={cn("input w-full", item.type ? "input-bordered" : "border-none px-0")}
                            value={item.content ?? ""}
                            readOnly
                            {...item.inputProps}
                        />
                    </div>
                ))}
            </div>
        </fieldset>
    );
}
