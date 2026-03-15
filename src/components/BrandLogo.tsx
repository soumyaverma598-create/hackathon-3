import Image from 'next/image';

type BrandLogoProps = {
  className?: string;
};

export default function BrandLogo({ className = 'w-full h-full' }: BrandLogoProps) {
  return (
    <div className={`relative ${className}`} aria-label="PARIVESH logo" role="img">
      <Image
        src="/images.png"
        alt="PARIVESH logo"
        fill
        sizes="100vw"
        className="object-contain"
        priority
      />
    </div>
  );
}