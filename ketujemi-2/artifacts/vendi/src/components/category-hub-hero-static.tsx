/** Static full-bleed hub hero — no slideshow or crossfade. */

type Props = {
  imageUrl: string;
  alt?: string;
};

export function CategoryHubHeroStatic({ imageUrl, alt = "" }: Props) {
  return (
    <div className="absolute inset-0" aria-hidden>
      <img
        src={imageUrl}
        alt={alt}
        draggable={false}
        loading="eager"
        sizes="100vw"
        className="absolute inset-0 h-full w-full object-cover object-center max-w-none"
      />
    </div>
  );
}
