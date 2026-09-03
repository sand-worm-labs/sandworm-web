import { PiCheckCircleFill, PiCircle } from "react-icons/pi";

interface Props {
  password: string;
}

const CHECKS = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Includes a number", test: (p: string) => /\d/.test(p) },
  { label: "Includes a symbol", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const LEVELS = [
  { label: "Weak", bar: "bg-error", text: "text-error" },
  { label: "Fair", bar: "bg-warning", text: "text-warning" },
  { label: "Good", bar: "bg-link", text: "text-link" },
  { label: "Strong", bar: "bg-success", text: "text-success" },
];

export default function PasswordStrength({ password }: Props) {
  const checks = CHECKS.map(check => ({
    label: check.label,
    met: check.test(password),
  }));

  const score =
    checks.filter(check => check.met).length + (password.length >= 12 ? 1 : 0);

  const level = LEVELS[Math.max(score, 1) - 1] ?? LEVELS[0]!;
  const visible = password.length > 0;

  return (
    <div
      className="grid transition-[grid-template-rows] duration-300 ease-in-out"
      style={{ gridTemplateRows: visible ? "1fr" : "0fr" }}
    >
      <div className="overflow-hidden">
        <div
          className={`space-y-2 px-1 pb-1 pt-2 transition-opacity duration-300 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="text-ink-400">Password Strength</span>
            <span
              className={`flex items-center gap-1.5 font-medium ${level.text}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${level.bar}`} />
              {level.label}
            </span>
          </div>

          <div className="flex gap-1">
            {LEVELS.map((segment, index) => (
              <div
                key={segment.label}
                className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                  index < score
                    ? segment.bar
                    : "bg-border-secondary dark:bg-border-tertiary"
                }`}
              />
            ))}
          </div>

          <ul className="space-y-1 pt-1">
            {checks.map(check => (
              <li key={check.label} className="flex items-center gap-2 text-xs">
                {check.met ? (
                  <PiCheckCircleFill
                    className="shrink-0 text-success"
                    size={14}
                  />
                ) : (
                  <PiCircle
                    className="shrink-0 text-ink-400 dark:text-ink-400"
                    size={14}
                  />
                )}
                <span
                  className={
                    check.met
                      ? "text-ink-100 dark:text-white"
                      : "text-ink-400 dark:text-ink-400"
                  }
                >
                  {check.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
