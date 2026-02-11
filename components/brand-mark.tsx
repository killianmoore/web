import Image from "next/image";

type BrandMarkProps = {
  className?: string;
  priority?: boolean;
};

export function BrandMark({ className, priority = false }: BrandMarkProps) {
  return (
    <Image
      alt="Killian Moore signature logo"
      className={className ? `mx-auto h-auto w-full object-contain object-center ${className}` : "mx-auto h-auto w-full object-contain object-center"}
      height={340}
      style={{
        filter:
          "brightness(0) saturate(100%) invert(95%) sepia(9%) saturate(228%) hue-rotate(341deg) brightness(96%) contrast(93%) drop-shadow(0 2px 8px rgba(0,0,0,0.16))",
        opacity: 0.87
      }}
      priority={priority}
      src="/brand/signature.svg"
      width={1600}
    />
  );
}
