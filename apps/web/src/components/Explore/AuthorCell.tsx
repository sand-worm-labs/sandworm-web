import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@sandworm/ui/components/avatar";
import Image from "next/image";
import Link from "next/link";

interface AuthorCellProps {
  username?: string | null;
  date?: string;
  href?: string;
}

const nameClassName =
  "text-sm font-medium text-ink-100 dark:text-white block truncate";

export const AuthorCell = ({ username, date, href }: AuthorCellProps) => (
  <div className="flex items-center gap-2.5 min-w-0">
    <Avatar className="h-8 w-8 flex-shrink-0">
      {href ? (
        <AvatarImage src="/img/avatar.svg" alt="" />
      ) : (
        <AvatarFallback>
          <Image src="/img/avatar.svg" alt="" width={32} height={32} />
        </AvatarFallback>
      )}
    </Avatar>
    <div className="min-w-0">
      {href ? (
        <Link href={href} className={`${nameClassName} hover:underline`}>
          @{username}
        </Link>
      ) : (
        <span className={nameClassName}>@{username}</span>
      )}
      {date && <p className="text-xs text-ink-300">{date}</p>}
    </div>
  </div>
);
