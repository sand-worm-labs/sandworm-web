"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

function CheckMarkIcon(){
  return (
    <svg width="35" height="35" viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="0.5" y="0.5" width="34" height="34" rx="12" stroke="url(#paint0_linear_4117_36387)"/>
<g filter="url(#filter0_i_4117_36387)">
<rect x="3.49902" y="3.5" width="28" height="28" rx="8.4" fill="url(#paint1_linear_4117_36387)"/>
<rect x="3.49902" y="3.5" width="28" height="28" rx="8.4" stroke="url(#paint2_linear_4117_36387)" stroke-width="0.7"/>
<g filter="url(#filter1_i_4117_36387)">
<path d="M13.562 15.8189L12.4608 16.5809C12.2063 16.7571 12.1427 17.1062 12.3189 17.3607L14.9634 21.1822C15.1396 21.4368 15.4887 21.5003 15.7432 21.3242L16.8444 20.5622C17.0989 20.386 17.1624 20.0369 16.9863 19.7824L14.3418 15.9609C14.1656 15.7063 13.8165 15.6428 13.562 15.8189Z" fill="#7D39D1"/>
</g>
<path d="M13.562 15.8189L12.4608 16.5809C12.2063 16.7571 12.1427 17.1062 12.3189 17.3607L14.9634 21.1822C15.1396 21.4368 15.4887 21.5003 15.7432 21.3242L16.8444 20.5622C17.0989 20.386 17.1624 20.0369 16.9863 19.7824L14.3418 15.9609C14.1656 15.7063 13.8165 15.6428 13.562 15.8189Z" stroke="white" stroke-width="0.560457"/>
<g filter="url(#filter2_i_4117_36387)">
<path d="M14.2065 20.1298L14.9803 21.2226C15.1592 21.4752 15.509 21.535 15.7616 21.3561L23.9947 15.5262C24.2473 15.3474 24.3071 14.9976 24.1282 14.745L23.3544 13.6521C23.1755 13.3995 22.8257 13.3397 22.5731 13.5186L14.34 19.3485C14.0874 19.5274 14.0276 19.8771 14.2065 20.1298Z" fill="#7D39D1"/>
</g>
<path d="M14.2065 20.1298L14.9803 21.2226C15.1592 21.4752 15.509 21.535 15.7616 21.3561L23.9947 15.5262C24.2473 15.3474 24.3071 14.9976 24.1282 14.745L23.3544 13.6521C23.1755 13.3995 22.8257 13.3397 22.5731 13.5186L14.34 19.3485C14.0874 19.5274 14.0276 19.8771 14.2065 20.1298Z" stroke="white" stroke-width="0.560457"/>
</g>
<defs>
<filter id="filter0_i_4117_36387" x="3.14905" y="3.1499" width="28.7" height="29.7002" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="1"/>
<feGaussianBlur stdDeviation="1.5"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 0.0863131 0 0 0 0 0.0287251 0 0 0 0 0.0287251 0 0 0 0.55 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_4117_36387"/>
</filter>
<filter id="filter1_i_4117_36387" x="11.939" y="15.439" width="5.42725" height="7.61023" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="1.3451"/>
<feGaussianBlur stdDeviation="0.672548"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_4117_36387"/>
</filter>
<filter id="filter2_i_4117_36387" x="13.8231" y="13.1353" width="10.6885" height="9.9491" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="1.3451"/>
<feGaussianBlur stdDeviation="0.672548"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_4117_36387"/>
</filter>
<linearGradient id="paint0_linear_4117_36387" x1="-0.14394" y1="6.36715" x2="37.3957" y2="12.0307" gradientUnits="userSpaceOnUse">
<stop stop-color="#6368FF"/>
<stop offset="0.153846" stop-color="#CBECFF"/>
<stop offset="0.25" stop-color="#7BFF42"/>
<stop offset="0.427885" stop-color="#2DB2FF"/>
<stop offset="0.610577" stop-color="#FF0000"/>
<stop offset="0.817308" stop-color="#DED757"/>
<stop offset="1" stop-color="#FF00E1"/>
</linearGradient>
<linearGradient id="paint1_linear_4117_36387" x1="17.499" y1="3.5" x2="17.499" y2="31.5" gradientUnits="userSpaceOnUse">
<stop offset="0.0364778" stop-color="#523E76"/>
<stop offset="0.283403" stop-color="#1A071C"/>
</linearGradient>
<linearGradient id="paint2_linear_4117_36387" x1="17.499" y1="3.5" x2="17.499" y2="31.5" gradientUnits="userSpaceOnUse">
<stop stop-color="#0D0D1F"/>
<stop offset="1" stop-color="#111223"/>
</linearGradient>
</defs>
</svg>

  )
}

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CheckMarkIcon  />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
