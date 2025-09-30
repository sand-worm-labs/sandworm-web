import Image from "next/image";

interface EmptyStateProps {
  message: string;
  imageSrc?: string;
  imageAlt?: string;
  imageSize?: {
    width: number;
    height: number;
  };
}

export const EmptyQueryState = ({
  message,
  imageSrc = "/img/nodata.svg",
  imageAlt = "Empty state",
  imageSize = { width: 300, height: 300 },
}: EmptyStateProps) => {
  return (
    <div className="flex items-center justify-center flex-col text-white font-medium text-sm mt-16 px-3">
      <Image
        src={imageSrc}
        width={imageSize.width}
        height={imageSize.height}
        alt={imageAlt}
      />
      <p className="mt-4 text-center">{message}</p>
    </div>
  );
};
