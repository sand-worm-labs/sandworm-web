import React from "react";
import type { IconProps } from "./Menu/types";

export const GitFork: React.FC<IconProps> = ({
    size, className
}) => {
    return (
        <svg width={size} height={size} className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 5.5V7C4 7.26522 4.10536 7.51957 4.29289 7.70711C4.48043 7.89464 4.73478 8 5 8H11C11.2652 8 11.5196 7.89464 11.7071 7.70711C11.8946 7.51957 12 7.26522 12 7V5.5" stroke="currentColor" stroke-width="0.75" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M8 8V10.5" stroke="currentColor"  stroke-width="0.75" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M4 5.5C4.82843 5.5 5.5 4.82843 5.5 4C5.5 3.17157 4.82843 2.5 4 2.5C3.17157 2.5 2.5 3.17157 2.5 4C2.5 4.82843 3.17157 5.5 4 5.5Z" stroke="currentColor"  stroke-width="0.75" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M8 13.5C8.82843 13.5 9.5 12.8284 9.5 12C9.5 11.1716 8.82843 10.5 8 10.5C7.17157 10.5 6.5 11.1716 6.5 12C6.5 12.8284 7.17157 13.5 8 13.5Z" stroke="currentColor"  stroke-width="0.75" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M12 5.5C12.8284 5.5 13.5 4.82843 13.5 4C13.5 3.17157 12.8284 2.5 12 2.5C11.1716 2.5 10.5 3.17157 10.5 4C10.5 4.82843 11.1716 5.5 12 5.5Z" stroke="currentColor"  stroke-width="0.75" stroke-linecap="round" stroke-linejoin="round" />
        </svg>

    );
};
