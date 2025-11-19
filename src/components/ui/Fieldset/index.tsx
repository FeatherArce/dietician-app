import LoadingSkeleton from "@/components/LoadingSkeleton";
import { cn } from "@/libs/utils";
import React, { useMemo } from "react";

export interface FieldsetItem {
    label: string;
    content?: React.ReactNode;
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

export interface FieldsetColSpan {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
}

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type FlexDirection = 'row' | 'col';
export interface FieldsetDirection {
    xs?: FlexDirection;
    sm?: FlexDirection;
    md?: FlexDirection;
    lg?: FlexDirection;
    xl?: FlexDirection;
}


export interface FieldsetProps extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
    legend?: string;
    items: FieldsetItem[];
    colSpan?: FieldsetColSpan;
    loading?: boolean;
    direction?: FieldsetDirection;
}

const breakpoints = ["xs", "sm", "md", "lg", "xl"] as const;

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
    loading,
    direction,
    ...fieldsetProps
}: FieldsetProps) {
    const mixedColClasses = useMemo(() => {
        if (!colSpan) {
            return Object.values(defaultColSpanSettings).join(' ');
        }
        return breakpoints.map(bp => {
            const dir = colSpan[bp];
            if (!dir) return '';
            const cls = (bp === "xs") ? `grid-cols-${dir}` : `${bp}:grid-cols-${dir}`;
            return cls;
        }).join(' ');
    }, [colSpan]);

    const mixedDirectionClasses = useMemo(() => {
        if (!direction) return '';
        let base = '';
        const responsive: string[] = [];
        const getRowExtensions = (dir: FlexDirection) => {
            return dir === "row" ? " justify-between items-center" : "items-start";
        }
        breakpoints.forEach(bp => {
            const dir = direction[bp];
            if (!dir) return;
            if (bp === "xs") {
                base = `flex-${dir}` + getRowExtensions(dir);
            } else {
                responsive.push(`${bp}:flex-${dir}` + getRowExtensions(dir));
            }
        });
        return [base, ...responsive].join(' ');
    }, [direction]);

    return (
        <fieldset className="fieldset space-y-2" {...fieldsetProps}>
            {legend && <legend className="fieldset-legend text-xl font-semibold mb-2">
                {legend}
            </legend>}
            {loading ? (<>
                <LoadingSkeleton />
            </>) : (
                <div className={cn("grid gap-4 grid-cols-1", mixedColClasses)}>
                    {items.map((item, idx) => (
                        <div
                            key={idx}
                            className={cn("flex flex-col gap-1.5", mixedDirectionClasses)}
                        >
                            <label className="label text-base font-bold text-black">
                                {item.label}
                            </label>
                            {item.content}
                        </div>
                    ))}
                </div>)}
        </fieldset>
    );
}
