/** Pexels thumbnails for femije-leaf-* rows (distinct per card; not group fallback). */

function pexels(id: number, w = 400): string {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;
}

/** Aktivitet & Sport Fëmijësh — 7 leaves (verified Pexels subjects). */
export const FEMIJE_LEAF_AKTIVITET_SPORT_PHOTOS: Record<string, string> = {
  "femije-leaf-bicikleta": pexels(206443),
  "femije-leaf-trotinet-skiro": pexels(13311432),
  "femije-leaf-shpatulla-patina": pexels(18186110),
  "femije-leaf-trampoline": pexels(8535890),
  "femije-leaf-lekundshe-kopsht": pexels(4997360),
  "femije-leaf-topa-sport": pexels(46798),
  "femije-leaf-kostume-sporti": pexels(16678677),
};
