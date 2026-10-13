import { boardClass, listHeadClass } from "@/components/Showcase/BoardKit";
import { cn } from "@/lib/utils";

interface ListTableProps {
  headers: readonly string[];
  children: React.ReactNode;
  busy?: boolean;
  className?: string;
}

export const ListTable = ({
  headers,
  children,
  busy,
  className,
}: ListTableProps) => (
  <div className={cn("overflow-x-auto", boardClass, className)}>
    <table className="block md:table w-full border-collapse">
      <thead className={`hidden md:table-header-group ${listHeadClass}`}>
        <tr>
          {headers.map((header, index) => (
            <th
              key={header}
              className={cn(
                "px-4 py-2.5 font-normal",
                index === headers.length - 1 ? "text-right" : "text-left"
              )}
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="block md:table-row-group" aria-busy={busy || undefined}>
        {children}
      </tbody>
    </table>
  </div>
);
