import React from "react";
import type { IconProps } from "./Menu/types";

export const FourSquare: React.FC<IconProps>  = ({ size = 14, className }) => {
  return (
    <svg width={size} height={size} className={className} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.3125 3.375H3.9375C3.62684 3.375 3.375 3.62684 3.375 3.9375V7.3125C3.375 7.62316 3.62684 7.875 3.9375 7.875H7.3125C7.62316 7.875 7.875 7.62316 7.875 7.3125V3.9375C7.875 3.62684 7.62316 3.375 7.3125 3.375Z" stroke="#1C3B5A" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M14.0625 3.375H10.6875C10.3768 3.375 10.125 3.62684 10.125 3.9375V7.3125C10.125 7.62316 10.3768 7.875 10.6875 7.875H14.0625C14.3732 7.875 14.625 7.62316 14.625 7.3125V3.9375C14.625 3.62684 14.3732 3.375 14.0625 3.375Z" stroke="#1C3B5A" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M7.3125 10.125H3.9375C3.62684 10.125 3.375 10.3768 3.375 10.6875V14.0625C3.375 14.3732 3.62684 14.625 3.9375 14.625H7.3125C7.62316 14.625 7.875 14.3732 7.875 14.0625V10.6875C7.875 10.3768 7.62316 10.125 7.3125 10.125Z" stroke="#1C3B5A" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M14.0625 10.125H10.6875C10.3768 10.125 10.125 10.3768 10.125 10.6875V14.0625C10.125 14.3732 10.3768 14.625 10.6875 14.625H14.0625C14.3732 14.625 14.625 14.3732 14.625 14.0625V10.6875C14.625 10.3768 14.3732 10.125 14.0625 10.125Z" stroke="#1C3B5A" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    
  );
};
