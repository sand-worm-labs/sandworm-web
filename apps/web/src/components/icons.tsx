type IconProps = React.HTMLAttributes<SVGElement>;

export const Icons = {
  Database: (props: IconProps) => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      {...props}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9 9C12.4173 9 15.1875 7.48896 15.1875 5.625C15.1875 3.76104 12.4173 2.25 9 2.25C5.58274 2.25 2.8125 3.76104 2.8125 5.625C2.8125 7.48896 5.58274 9 9 9Z"
        fill="#A6554D"
        stroke="#A6554D"
        strokeWidth="1.125"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.8125 5.625V9C2.8125 10.864 5.58281 12.375 9 12.375C12.4172 12.375 15.1875 10.864 15.1875 9V5.625"
        stroke="#A6554D"
        strokeWidth="1.125"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.8125 9V12.375C2.8125 14.239 5.58281 15.75 9 15.75C12.4172 15.75 15.1875 14.239 15.1875 12.375V9"
        stroke="#A6554D"
        strokeWidth="1.125"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};
