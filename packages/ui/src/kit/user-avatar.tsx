import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@sandworm/ui/components/avatar";

const sizeClassNames = { sm: "size-8", md: "size-9" } as const;

const BLOCKS: readonly (readonly [number, number])[] = [
  [0, 7.333],
  [5.332, 7.333],
  [5.332, 12.667],
  [5.332, 18],
  [10.668, 18],
  [16, 23.333],
  [5.332, 23.333],
  [5.332, 28.667],
  [10.668, 7.333],
  [16, 7.333],
  [13.332, 2],
  [21.332, 7.333],
  [21.332, 12.667],
  [21.332, 18],
  [21.332, 23.333],
  [21.332, 28.667],
  [26.668, 7.333],
];

function AvatarArtwork() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 size-full"
    >
      <rect width="32" height="32" fill="#7104A8" />
      {BLOCKS.map(([x, y]) => (
        <rect
          key={`${x}-${y}`}
          x={x}
          y={y}
          width="5.333"
          height="5.333"
          fill="#E1FF00"
        />
      ))}
    </svg>
  );
}

type UserAvatarProps = {
  name: string;
  src?: string;
  size?: keyof typeof sizeClassNames;
};

export function UserAvatar({ name, src, size = "sm" }: UserAvatarProps) {
  return (
    <Avatar className={sizeClassNames[size]}>
      <AvatarImage src={src} alt={name} />
      <AvatarFallback className="relative overflow-hidden">
        <AvatarArtwork />
        <span className="relative z-10 font-body text-xl font-bold text-white">
          {name.charAt(0)}
        </span>
      </AvatarFallback>
    </Avatar>
  );
}
