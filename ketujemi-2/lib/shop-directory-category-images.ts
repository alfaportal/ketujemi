/** Unsplash royalty-free photos for /dyqanet category cards. */
export const SHOP_DIRECTORY_CATEGORY_IMAGE_URLS: Record<string, string> = {
  "makina-transport": "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400",
  patundshmeri: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400",
  "elektronike-teknologji": "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400",
  "shtepi-mobilje": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400",
  "moda-veshje": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400",
  "pune-sherbime": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400",
  "femije-nena": "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400",
  "sport-rekreacion": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400",
  "bujqesi-blegtori": "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400",
  "kafshe-shtepiake": "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400",
  "arsim-kurse": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400",
  "evente-dasma": "https://images.unsplash.com/photo-1519741497674-611481863552?w=400",
  "turizem-udhetime": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400",
  "shendetesi-bukuri": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400",
};

export function shopDirectoryCategoryImageUrl(slug: string): string | undefined {
  return SHOP_DIRECTORY_CATEGORY_IMAGE_URLS[slug];
}
