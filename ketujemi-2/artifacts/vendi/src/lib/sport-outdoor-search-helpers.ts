/** Sport & Outdoor hub slug (matches seeded category). */
export const SPORT_OUTDOOR_HUB_SLUG = "sport-outdoor";

export const SPORT_OUTDOOR_HERO_PHOTO =
  "https://images.pexels.com/photos/4164752/pexels-photo-4164752.jpeg?auto=compress&cs=tinysrgb&w=1400&q=85";

export const SPORT_TYPE_KEYS = [
  "football",
  "fitness",
  "bike",
  "camping",
  "martial",
  "winter",
  "water",
  "hobby",
] as const;

export type SportTypeKey = (typeof SPORT_TYPE_KEYS)[number];

export const SPORT_TYPE_PHOTOS: Record<SportTypeKey, string> = {
  football:
    "https://images.pexels.com/photos/30872561/pexels-photo-30872561.jpeg?auto=compress&cs=tinysrgb&w=400",
  fitness:
    "https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg?auto=compress&cs=tinysrgb&w=400",
  bike:
    "https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&w=400",
  camping:
    "https://images.pexels.com/photos/1687845/pexels-photo-1687845.jpeg?auto=compress&cs=tinysrgb&w=400",
  martial:
    "https://images.pexels.com/photos/16538177/pexels-photo-16538177.jpeg?w=400&q=80",
  winter:
    "https://images.pexels.com/photos/848599/pexels-photo-848599.jpeg?auto=compress&cs=tinysrgb&w=400",
  water:
    "https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?w=400&q=80",
  hobby:
    "https://images.pexels.com/photos/411207/pexels-photo-411207.jpeg?w=400&q=80",
};

/** Maps UI sport cards to seeded subcategory slugs when present. */
export const SPORT_TYPE_DB_SLUG: Record<SportTypeKey, string> = {
  football: "sport-type-top",
  fitness: "sport-type-fitnes-joga",
  bike: "sport-type-bicikleta",
  camping: "sport-type-kampingu",
  martial: "sport-type-ajrore",
  winter: "sport-type-dimerore",
  water: "sport-type-ujit",
  hobby: "sport-type-rekreative",
};

/** i18n keys under `so_type_*` in app-extra-i18n. */
export const SPORT_TYPE_LABEL_KEY: Record<SportTypeKey, string> = {
  football: "so_type_football",
  fitness: "so_type_fitness",
  bike: "so_type_bike",
  camping: "so_type_camping",
  martial: "so_type_martial",
  winter: "so_type_winter",
  water: "so_type_water",
  hobby: "so_type_hobby",
};

export const SPORT_DEVICE_KEYS = [
  "fb_fut_topa",
  "fb_fut_kepuce",
  "fb_fut_mbrojt",
  "fb_fut_doreza",
  "fb_fut_uniforma",
  "fb_bas_topa",
  "fb_bas_rrethe",
  "fb_bas_patika",
  "fb_vol_topa",
  "fb_vol_rrjeta",
  "fb_vol_mbrojt",
  "fb_ten_reketa",
  "fb_ten_topa",
  "fb_ten_pingpong",
  "fit_mac_traka",
  "fit_mac_bicikleta",
  "fit_mac_orbitek",
  "fit_pes_tega",
  "fit_pes_shufra",
  "fit_pes_stola",
  "fit_pes_llastike",
  "fit_yog_dyshek",
  "fit_yog_roller",
  "fit_yog_fitball",
  "fit_sup_shaker",
  "fit_sup_rripa",
  "fit_sup_doreza",
  "bike_bik_mtb",
  "bike_bik_road",
  "bike_bik_kids",
  "bike_bik_electric",
  "bike_tro_electric",
  "bike_tro_standard",
  "bike_tro_roller",
  "bike_tro_skate",
  "bike_pjese_helmet",
  "bike_pjese_lights",
  "bike_pjese_goma",
  "bike_pjese_pompa",
  "camp_sleep_tenda",
  "camp_sleep_thase",
  "camp_sleep_dyshek",
  "camp_food_kuzhina",
  "camp_food_termos",
  "camp_food_frigo",
  "camp_tool_llamba",
  "camp_tool_canta",
  "air_fly_para",
  "air_fly_sky",
  "air_fly_drone",
  "air_safe_rripa",
  "air_safe_helmet",
  "air_safe_vario",
  "win_ski_ski",
  "win_ski_kepuce",
  "win_ski_shkop",
  "win_ski_lidhese",
  "win_sb_derrasa",
  "win_sb_kepuce",
  "win_sb_lidhese",
  "win_cl_jakne",
  "win_cl_goggles",
  "win_cl_doreza",
  "wat_boat_barka",
  "wat_boat_kajak",
  "wat_boat_zhytje",
  "wat_boat_neoprene",
  "wat_beach_surf",
  "wat_beach_jastek",
  "wat_beach_jelek",
  "hob_game_shah",
  "hob_game_pikado",
  "hob_game_bilardo",
  "hob_game_letra",
  "hob_act_peshkim",
  "hob_act_hark",
  "hob_act_teleskop",
] as const;

export type SportDeviceKey = (typeof SPORT_DEVICE_KEYS)[number];

export const SPORT_DEVICE_LABEL_KEY: Record<SportDeviceKey, string> = {
  fb_fut_topa: "so_dev_fb_fut_topa",
  fb_fut_kepuce: "so_dev_fb_fut_kepuce",
  fb_fut_mbrojt: "so_dev_fb_fut_mbrojt",
  fb_fut_doreza: "so_dev_fb_fut_doreza",
  fb_fut_uniforma: "so_dev_fb_fut_uniforma",
  fb_bas_topa: "so_dev_fb_bas_topa",
  fb_bas_rrethe: "so_dev_fb_bas_rrethe",
  fb_bas_patika: "so_dev_fb_bas_patika",
  fb_vol_topa: "so_dev_fb_vol_topa",
  fb_vol_rrjeta: "so_dev_fb_vol_rrjeta",
  fb_vol_mbrojt: "so_dev_fb_vol_mbrojt",
  fb_ten_reketa: "so_dev_fb_ten_reketa",
  fb_ten_topa: "so_dev_fb_ten_topa",
  fb_ten_pingpong: "so_dev_fb_ten_pingpong",
  fit_mac_traka: "so_dev_fit_mac_traka",
  fit_mac_bicikleta: "so_dev_fit_mac_bicikleta",
  fit_mac_orbitek: "so_dev_fit_mac_orbitek",
  fit_pes_tega: "so_dev_fit_pes_tega",
  fit_pes_shufra: "so_dev_fit_pes_shufra",
  fit_pes_stola: "so_dev_fit_pes_stola",
  fit_pes_llastike: "so_dev_fit_pes_llastike",
  fit_yog_dyshek: "so_dev_fit_yog_dyshek",
  fit_yog_roller: "so_dev_fit_yog_roller",
  fit_yog_fitball: "so_dev_fit_yog_fitball",
  fit_sup_shaker: "so_dev_fit_sup_shaker",
  fit_sup_rripa: "so_dev_fit_sup_rripa",
  fit_sup_doreza: "so_dev_fit_sup_doreza",
  bike_bik_mtb: "so_dev_bike_bik_mtb",
  bike_bik_road: "so_dev_bike_bik_road",
  bike_bik_kids: "so_dev_bike_bik_kids",
  bike_bik_electric: "so_dev_bike_bik_electric",
  bike_tro_electric: "so_dev_bike_tro_electric",
  bike_tro_standard: "so_dev_bike_tro_standard",
  bike_tro_roller: "so_dev_bike_tro_roller",
  bike_tro_skate: "so_dev_bike_tro_skate",
  bike_pjese_helmet: "so_dev_bike_pjese_helmet",
  bike_pjese_lights: "so_dev_bike_pjese_lights",
  bike_pjese_goma: "so_dev_bike_pjese_goma",
  bike_pjese_pompa: "so_dev_bike_pjese_pompa",
  camp_sleep_tenda: "so_dev_camp_sleep_tenda",
  camp_sleep_thase: "so_dev_camp_sleep_thase",
  camp_sleep_dyshek: "so_dev_camp_sleep_dyshek",
  camp_food_kuzhina: "so_dev_camp_food_kuzhina",
  camp_food_termos: "so_dev_camp_food_termos",
  camp_food_frigo: "so_dev_camp_food_frigo",
  camp_tool_llamba: "so_dev_camp_tool_llamba",
  camp_tool_canta: "so_dev_camp_tool_canta",
  air_fly_para: "so_dev_air_fly_para",
  air_fly_sky: "so_dev_air_fly_sky",
  air_fly_drone: "so_dev_air_fly_drone",
  air_safe_rripa: "so_dev_air_safe_rripa",
  air_safe_helmet: "so_dev_air_safe_helmet",
  air_safe_vario: "so_dev_air_safe_vario",
  win_ski_ski: "so_dev_win_ski_ski",
  win_ski_kepuce: "so_dev_win_ski_kepuce",
  win_ski_shkop: "so_dev_win_ski_shkop",
  win_ski_lidhese: "so_dev_win_ski_lidhese",
  win_sb_derrasa: "so_dev_win_sb_derrasa",
  win_sb_kepuce: "so_dev_win_sb_kepuce",
  win_sb_lidhese: "so_dev_win_sb_lidhese",
  win_cl_jakne: "so_dev_win_cl_jakne",
  win_cl_goggles: "so_dev_win_cl_goggles",
  win_cl_doreza: "so_dev_win_cl_doreza",
  wat_boat_barka: "so_dev_wat_boat_barka",
  wat_boat_kajak: "so_dev_wat_boat_kajak",
  wat_boat_zhytje: "so_dev_wat_boat_zhytje",
  wat_boat_neoprene: "so_dev_wat_boat_neoprene",
  wat_beach_surf: "so_dev_wat_beach_surf",
  wat_beach_jastek: "so_dev_wat_beach_jastek",
  wat_beach_jelek: "so_dev_wat_beach_jelek",
  hob_game_shah: "so_dev_hob_game_shah",
  hob_game_pikado: "so_dev_hob_game_pikado",
  hob_game_bilardo: "so_dev_hob_game_bilardo",
  hob_game_letra: "so_dev_hob_game_letra",
  hob_act_peshkim: "so_dev_hob_act_peshkim",
  hob_act_hark: "so_dev_hob_act_hark",
  hob_act_teleskop: "so_dev_hob_act_teleskop",
};

/** Futboll & sporte me top — foto për kartat në faqen e tipit (nivel 2). */
export const SPORT_FB_DEVICE_PHOTOS: Partial<Record<SportDeviceKey, string>> = {
  fb_fut_topa:
    "https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?w=400&q=80",
  fb_fut_kepuce:
    "https://images.pexels.com/photos/774321/pexels-photo-774321.jpeg?w=400&q=80",
  fb_fut_mbrojt:
    "https://images.pexels.com/photos/3732792/pexels-photo-3732792.jpeg?w=400&q=80",
  fb_fut_doreza:
    "https://images.pexels.com/photos/21222660/pexels-photo-21222660.jpeg?w=400&q=80",
  fb_fut_uniforma:
    "https://images.pexels.com/photos/16678677/pexels-photo-16678677.jpeg?w=400&q=80",
  fb_bas_topa:
    "https://images.pexels.com/photos/16955708/pexels-photo-16955708.jpeg?w=400&q=80",
  fb_bas_rrethe:
    "https://images.pexels.com/photos/6217724/pexels-photo-6217724.jpeg?w=400&q=80",
  fb_bas_patika:
    "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?w=400&q=80",
  fb_vol_topa:
    "https://images.pexels.com/photos/1263426/pexels-photo-1263426.jpeg?w=400&q=80",
  fb_vol_rrjeta:
    "https://images.pexels.com/photos/14392174/pexels-photo-14392174.jpeg?w=400&q=80",
  fb_vol_mbrojt:
    "https://images.pexels.com/photos/6203585/pexels-photo-6203585.jpeg?w=400&q=80",
  fb_ten_reketa:
    "https://images.pexels.com/photos/1103829/pexels-photo-1103829.jpeg?w=400&q=80",
  fb_ten_topa:
    "https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg?w=400&q=80",
  fb_ten_pingpong:
    "https://images.pexels.com/photos/976873/pexels-photo-976873.jpeg?w=400&q=80",
  fit_mac_traka:
    "https://images.pexels.com/photos/3888343/pexels-photo-3888343.jpeg?w=400&q=80",
  fit_mac_bicikleta:
    "https://images.pexels.com/photos/3836831/pexels-photo-3836831.jpeg?w=400&q=80",
  fit_mac_orbitek:
    "https://images.pexels.com/photos/4162595/pexels-photo-4162595.jpeg?w=400&q=80",
  fit_pes_tega:
    "https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?w=400&q=80",
  fit_pes_shufra:
    "https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?w=400&q=80",
  fit_pes_stola:
    "https://images.pexels.com/photos/3837757/pexels-photo-3837757.jpeg?w=400&q=80",
  fit_pes_llastike:
    "https://images.pexels.com/photos/6339645/pexels-photo-6339645.jpeg?w=400&q=80",
  fit_yog_roller:
    "https://images.pexels.com/photos/4587694/pexels-photo-4587694.jpeg?w=400&q=80",
  fit_yog_fitball:
    "https://images.pexels.com/photos/3768593/pexels-photo-3768593.jpeg?w=400&q=80",
  fit_sup_shaker:
    "https://images.pexels.com/photos/5327558/pexels-photo-5327558.jpeg?w=400&q=80",
  fit_sup_rripa:
    "https://images.pexels.com/photos/5327461/pexels-photo-5327461.jpeg?w=400&q=80",
  fit_sup_doreza:
    "https://images.pexels.com/photos/45058/pexels-photo-45058.jpeg?w=400&q=80",
  bike_bik_mtb:
    "https://images.pexels.com/photos/12328608/pexels-photo-12328608.jpeg?w=400&q=80",
  bike_bik_kids:
    "https://images.pexels.com/photos/206443/pexels-photo-206443.jpeg?w=400&q=80",
  bike_bik_electric:
    "https://images.pexels.com/photos/12265482/pexels-photo-12265482.jpeg?w=400&q=80",
  bike_tro_electric:
    "https://images.pexels.com/photos/13344135/pexels-photo-13344135.jpeg?w=400&q=80",
  bike_tro_standard:
    "https://images.pexels.com/photos/13311432/pexels-photo-13311432.jpeg?w=400&q=80",
  bike_tro_roller:
    "https://images.pexels.com/photos/18186110/pexels-photo-18186110.jpeg?w=400&q=80",
  bike_tro_skate:
    "https://images.pexels.com/photos/4577823/pexels-photo-4577823.jpeg?w=400&q=80",
  bike_pjese_helmet:
    "https://images.pexels.com/photos/12956080/pexels-photo-12956080.jpeg?w=400&q=80",
  bike_pjese_lights:
    "https://images.pexels.com/photos/30557807/pexels-photo-30557807.jpeg?w=400&q=80",
  bike_pjese_goma:
    "https://images.pexels.com/photos/255934/pexels-photo-255934.jpeg?w=400&q=80",
  bike_pjese_pompa:
    "https://images.pexels.com/photos/5808019/pexels-photo-5808019.jpeg?w=400&q=80",
  camp_sleep_tenda:
    "https://images.pexels.com/photos/8220281/pexels-photo-8220281.jpeg?w=400&q=80",
  camp_sleep_thase:
    "https://images.pexels.com/photos/6299741/pexels-photo-6299741.jpeg?w=400&q=80",
  camp_sleep_dyshek:
    "https://images.pexels.com/photos/5538697/pexels-photo-5538697.jpeg?w=400&q=80",
  camp_food_kuzhina:
    "https://images.pexels.com/photos/590078/pexels-photo-590078.jpeg?w=400&q=80",
  camp_food_termos:
    "https://images.pexels.com/photos/15782410/pexels-photo-15782410.jpeg?w=400&q=80",
  camp_food_frigo:
    "https://images.pexels.com/photos/3974682/pexels-photo-3974682.jpeg?w=400&q=80",
  camp_tool_llamba:
    "https://images.pexels.com/photos/5538611/pexels-photo-5538611.jpeg?w=400&q=80",
  camp_tool_canta:
    "https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?w=400&q=80",
  air_fly_para:
    "https://images.pexels.com/photos/16538177/pexels-photo-16538177.jpeg?auto=compress&cs=tinysrgb&w=400",
  air_fly_sky:
    "https://images.pexels.com/photos/11114515/pexels-photo-11114515.jpeg?auto=compress&cs=tinysrgb&w=400",
  air_fly_drone:
    "https://images.pexels.com/photos/997128/pexels-photo-997128.jpeg?auto=compress&cs=tinysrgb&w=400",
  air_safe_rripa:
    "https://images.pexels.com/photos/5968096/pexels-photo-5968096.jpeg?auto=compress&cs=tinysrgb&w=400",
  air_safe_helmet:
    "https://images.pexels.com/photos/8454446/pexels-photo-8454446.jpeg?auto=compress&cs=tinysrgb&w=400",
  air_safe_vario:
    "https://images.pexels.com/photos/19589880/pexels-photo-19589880.jpeg?auto=compress&cs=tinysrgb&w=400",
  wat_boat_barka:
    "https://images.pexels.com/photos/575408/pexels-photo-575408.jpeg?auto=compress&cs=tinysrgb&w=400",
  wat_boat_kajak:
    "https://images.pexels.com/photos/31027349/pexels-photo-31027349.jpeg?auto=compress&cs=tinysrgb&w=400",
  wat_boat_zhytje:
    "https://images.pexels.com/photos/20051782/pexels-photo-20051782.jpeg?auto=compress&cs=tinysrgb&w=400",
  wat_boat_neoprene:
    "https://images.pexels.com/photos/10314265/pexels-photo-10314265.jpeg?auto=compress&cs=tinysrgb&w=400",
  wat_beach_surf:
    "https://images.pexels.com/photos/4603824/pexels-photo-4603824.jpeg?auto=compress&cs=tinysrgb&w=400",
  wat_beach_jastek:
    "https://images.pexels.com/photos/36568259/pexels-photo-36568259.jpeg?auto=compress&cs=tinysrgb&w=400",
  wat_beach_jelek:
    "https://images.pexels.com/photos/3098607/pexels-photo-3098607.jpeg?auto=compress&cs=tinysrgb&w=400",
  hob_game_shah:
    "https://images.pexels.com/photos/411207/pexels-photo-411207.jpeg?auto=compress&cs=tinysrgb&w=400",
  hob_game_pikado:
    "https://images.pexels.com/photos/20766692/pexels-photo-20766692.jpeg?auto=compress&cs=tinysrgb&w=400",
  hob_game_bilardo:
    "https://images.pexels.com/photos/3596554/pexels-photo-3596554.jpeg?auto=compress&cs=tinysrgb&w=400",
  hob_game_letra:
    "https://images.pexels.com/photos/1679602/pexels-photo-1679602.jpeg?auto=compress&cs=tinysrgb&w=400",
  hob_act_peshkim:
    "https://images.pexels.com/photos/12465522/pexels-photo-12465522.jpeg?auto=compress&cs=tinysrgb&w=400",
  hob_act_hark:
    "https://images.pexels.com/photos/6620413/pexels-photo-6620413.jpeg?auto=compress&cs=tinysrgb&w=400",
  hob_act_teleskop:
    "https://images.pexels.com/photos/2034892/pexels-photo-2034892.jpeg?auto=compress&cs=tinysrgb&w=400",
  win_ski_ski:
    "https://images.pexels.com/photos/30417375/pexels-photo-30417375.jpeg?w=400&q=80",
  win_ski_kepuce:
    "https://images.pexels.com/photos/34006713/pexels-photo-34006713.jpeg?w=400&q=80",
  win_ski_shkop:
    "https://images.pexels.com/photos/7219260/pexels-photo-7219260.jpeg?w=400&q=80",
  win_ski_lidhese:
    "https://images.pexels.com/photos/20091365/pexels-photo-20091365.jpeg?w=400&q=80",
  win_sb_derrasa:
    "https://images.pexels.com/photos/7406822/pexels-photo-7406822.jpeg?w=400&q=80",
  win_sb_kepuce:
    "https://images.pexels.com/photos/7406675/pexels-photo-7406675.jpeg?w=400&q=80",
  win_sb_lidhese:
    "https://images.pexels.com/photos/20146487/pexels-photo-20146487.jpeg?w=400&q=80",
  win_cl_jakne:
    "https://images.pexels.com/photos/36084981/pexels-photo-36084981.jpeg?w=400&q=80",
  win_cl_goggles:
    "https://images.pexels.com/photos/36548332/pexels-photo-36548332.jpeg?w=400&q=80",
  win_cl_doreza:
    "https://images.pexels.com/photos/35591365/pexels-photo-35591365.jpeg?w=400&q=80",
};

export function resolveSportDevicePhoto(
  deviceKey: SportDeviceKey,
  typeKey: SportTypeKey,
): string {
  return SPORT_FB_DEVICE_PHOTOS[deviceKey] ?? SPORT_TYPE_PHOTOS[typeKey];
}

/** Albanian tokens stored in listings / used for search. */
export const SPORT_DEVICE_SEARCH: Record<SportDeviceKey, string> = {
  fb_fut_topa: "Topa",
  fb_fut_kepuce: "Këpucë Kallçane",
  fb_fut_mbrojt: "Mbrojtëse",
  fb_fut_doreza: "Doreza portieri",
  fb_fut_uniforma: "Uniforma",
  fb_bas_topa: "Topa basketbolli",
  fb_bas_rrethe: "Rrethe Rrjeta",
  fb_bas_patika: "Patika basketbolli",
  fb_vol_topa: "Topa volejboll",
  fb_vol_rrjeta: "Rrjeta",
  fb_vol_mbrojt: "Mbrojtëse gjunjësh",
  fb_ten_reketa: "Reketa tenisi",
  fb_ten_topa: "Topa tenisi",
  fb_ten_pingpong: "Reketa Tavolina pingpongi",
  fit_mac_traka: "Traka vrapimi",
  fit_mac_bicikleta: "Biçikleta statike",
  fit_mac_orbitek: "Orbitek",
  fit_pes_tega: "Tega",
  fit_pes_shufra: "Shufra Disqe",
  fit_pes_stola: "Stola fitnesi",
  fit_pes_llastike: "Llastikë",
  fit_yog_dyshek: "Dyshekë joge",
  fit_yog_roller: "Rollera",
  fit_yog_fitball: "Fitball",
  fit_sup_shaker: "Shakerë",
  fit_sup_rripa: "Rripa pesë",
  fit_sup_doreza: "Dorëza fitnesi",
  bike_bik_mtb: "Mountain Bike",
  bike_bik_road: "Rrugore",
  bike_bik_kids: "Fëmijë",
  bike_bik_electric: "Elektrike",
  bike_tro_electric: "Trotinet Elektrike",
  bike_tro_standard: "Trotinet Standarde",
  bike_tro_roller: "Rollera Patina",
  bike_tro_skate: "Skeitborda",
  bike_pjese_helmet: "Helmeta",
  bike_pjese_lights: "Drita sigurie",
  bike_pjese_goma: "Goma",
  bike_pjese_pompa: "Pompa",
  camp_sleep_tenda: "Tenda Çadra",
  camp_sleep_thase: "Thasë Gjumi",
  camp_sleep_dyshek: "Dyshekë ajri",
  camp_food_kuzhina: "Kuzhina kampingi",
  camp_food_termos: "Termosa Shishe",
  camp_food_frigo: "Çanta frigoriferike",
  camp_tool_llamba: "Llamba koke dore",
  camp_tool_canta: "Çanta shpine Hiking",
  air_fly_para: "Paraglajding",
  air_fly_sky: "Skymotion",
  air_fly_drone: "Drone FPV",
  air_safe_rripa: "Rripa sigurimi",
  air_safe_helmet: "Helmeta ajrore",
  air_safe_vario: "Variometers",
  win_ski_ski: "Ski",
  win_ski_kepuce: "Këpucë skijimi",
  win_ski_shkop: "Shkopinj",
  win_ski_lidhese: "Lidhëse skish",
  win_sb_derrasa: "Dërrasa snowboard",
  win_sb_kepuce: "Këpucë snowboard",
  win_sb_lidhese: "Lidhëse snoubordi",
  win_cl_jakne: "Jakne Pantallona termike",
  win_cl_goggles: "Goggles",
  win_cl_doreza: "Dorëza",
  wat_boat_barka: "Barka gome",
  wat_boat_kajak: "Kajakë Kanoe",
  wat_boat_zhytje: "Pajisje zhytje",
  wat_boat_neoprene: "Kostume Neoprene",
  wat_beach_surf: "Dërrasa Surfi SUP",
  wat_beach_jastek: "Jastëkë uji",
  wat_beach_jelek: "Jelekë shpëtimi",
  hob_game_shah: "Shah",
  hob_game_pikado: "Pikado",
  hob_game_bilardo: "Bilardo",
  hob_game_letra: "Lojëra letra",
  hob_act_peshkim: "Pajisje Peshkimi",
  hob_act_hark: "Hark Shigjeta",
  hob_act_teleskop: "Dylbi Teleskop",
};

export type SportDeviceSection = {
  groupLabelKey: string;
  itemKeys: readonly SportDeviceKey[];
};

export const SPORT_DEVICE_SECTIONS: Record<SportTypeKey, readonly SportDeviceSection[]> = {
  football: [
    {
      groupLabelKey: "so_grp_fb_futboll",
      itemKeys: ["fb_fut_topa", "fb_fut_kepuce", "fb_fut_mbrojt", "fb_fut_doreza", "fb_fut_uniforma"],
    },
    {
      groupLabelKey: "so_grp_fb_basketboll",
      itemKeys: ["fb_bas_topa", "fb_bas_rrethe", "fb_bas_patika"],
    },
    {
      groupLabelKey: "so_grp_fb_volejboll",
      itemKeys: ["fb_vol_topa", "fb_vol_rrjeta", "fb_vol_mbrojt"],
    },
    {
      groupLabelKey: "so_grp_fb_tenis",
      itemKeys: ["fb_ten_reketa", "fb_ten_topa", "fb_ten_pingpong"],
    },
  ],
  fitness: [
    {
      groupLabelKey: "so_grp_fit_machines",
      itemKeys: ["fit_mac_traka", "fit_mac_bicikleta", "fit_mac_orbitek"],
    },
    {
      groupLabelKey: "so_grp_fit_weights",
      itemKeys: ["fit_pes_tega", "fit_pes_shufra", "fit_pes_stola", "fit_pes_llastike"],
    },
    {
      groupLabelKey: "so_grp_fit_yoga",
      itemKeys: ["fit_yog_dyshek", "fit_yog_roller", "fit_yog_fitball"],
    },
    {
      groupLabelKey: "so_grp_fit_supplements",
      itemKeys: ["fit_sup_shaker", "fit_sup_rripa", "fit_sup_doreza"],
    },
  ],
  bike: [
    {
      groupLabelKey: "so_grp_bike_bikes",
      itemKeys: ["bike_bik_mtb", "bike_bik_road", "bike_bik_kids", "bike_bik_electric"],
    },
    {
      groupLabelKey: "so_grp_bike_scooters",
      itemKeys: ["bike_tro_electric", "bike_tro_standard", "bike_tro_roller", "bike_tro_skate"],
    },
    {
      groupLabelKey: "so_grp_bike_parts",
      itemKeys: ["bike_pjese_helmet", "bike_pjese_lights", "bike_pjese_goma", "bike_pjese_pompa"],
    },
  ],
  camping: [
    {
      groupLabelKey: "so_grp_camp_sleep",
      itemKeys: ["camp_sleep_tenda", "camp_sleep_thase", "camp_sleep_dyshek"],
    },
    {
      groupLabelKey: "so_grp_camp_food",
      itemKeys: ["camp_food_kuzhina", "camp_food_termos", "camp_food_frigo"],
    },
    {
      groupLabelKey: "so_grp_camp_tools",
      itemKeys: ["camp_tool_llamba", "camp_tool_canta"],
    },
  ],
  martial: [
    {
      groupLabelKey: "so_grp_air_flight",
      itemKeys: ["air_fly_para", "air_fly_sky", "air_fly_drone"],
    },
    {
      groupLabelKey: "so_grp_air_safety",
      itemKeys: ["air_safe_rripa", "air_safe_helmet", "air_safe_vario"],
    },
  ],
  winter: [
    {
      groupLabelKey: "so_grp_win_ski",
      itemKeys: ["win_ski_ski", "win_ski_kepuce", "win_ski_shkop", "win_ski_lidhese"],
    },
    {
      groupLabelKey: "so_grp_win_snowboard",
      itemKeys: ["win_sb_derrasa", "win_sb_kepuce", "win_sb_lidhese"],
    },
    {
      groupLabelKey: "so_grp_win_clothing",
      itemKeys: ["win_cl_jakne", "win_cl_goggles", "win_cl_doreza"],
    },
  ],
  water: [
    {
      groupLabelKey: "so_grp_wat_boat",
      itemKeys: ["wat_boat_barka", "wat_boat_kajak", "wat_boat_zhytje", "wat_boat_neoprene"],
    },
    {
      groupLabelKey: "so_grp_wat_beach",
      itemKeys: ["wat_beach_surf", "wat_beach_jastek", "wat_beach_jelek"],
    },
  ],
  hobby: [
    {
      groupLabelKey: "so_grp_hob_games",
      itemKeys: ["hob_game_shah", "hob_game_pikado", "hob_game_bilardo", "hob_game_letra"],
    },
    {
      groupLabelKey: "so_grp_hob_activities",
      itemKeys: ["hob_act_peshkim", "hob_act_hark", "hob_act_teleskop"],
    },
  ],
};

export const SPORT_CONDITION_SEARCH = {
  new: "E re",
  used: "E përdorur",
} as const;

export const SPORT_BIKE_SIZES = ['20"', '24"', '26"', '27.5"', '29"'] as const;
export const SPORT_BIKE_TYPE_KEYS = ["mtb", "road", "city", "kids"] as const;
export type SportBikeTypeKey = (typeof SPORT_BIKE_TYPE_KEYS)[number];

export const SPORT_BIKE_TYPE_SEARCH: Record<SportBikeTypeKey, string> = {
  mtb: "MTB",
  road: "Road",
  city: "Qyteti",
  kids: "Fëmijë",
};

export const SPORT_BIKE_TYPE_LABEL_KEY: Record<SportBikeTypeKey, string> = {
  mtb: "so_bike_mtb",
  road: "so_bike_road",
  city: "so_bike_city",
  kids: "so_bike_kids",
};

export const SPORT_GENDER_KEYS = ["male", "female", "kids"] as const;
export type SportGenderKey = (typeof SPORT_GENDER_KEYS)[number];

export const SPORT_GENDER_SEARCH: Record<SportGenderKey, string> = {
  male: "Meshkuj",
  female: "Femra",
  kids: "Fëmijë",
};

export const SPORT_GENDER_LABEL_KEY: Record<SportGenderKey, string> = {
  male: "so_gender_male",
  female: "so_gender_female",
  kids: "so_gender_kids",
};

export type SportOutdoorCategoryRow = {
  id: number;
  name: string;
  slug: string | null;
  parent_id: number | null;
};

export function getSportOutdoorLeafCategoryIds(
  categories: SportOutdoorCategoryRow[],
  hubId: number,
): number[] {
  return categories.filter((c) => c.parent_id === hubId).map((c) => c.id);
}

export function resolveSportTypeCategoryId(
  categories: SportOutdoorCategoryRow[],
  hubId: number,
  sportKey: SportTypeKey,
): number | undefined {
  const slug = SPORT_TYPE_DB_SLUG[sportKey];
  const row = categories.find((c) => c.parent_id === hubId && c.slug === slug);
  return row?.id;
}

export function resolveSportTypeKeyFromSlug(slug: string | null | undefined): SportTypeKey | null {
  if (!slug) return null;
  for (const key of SPORT_TYPE_KEYS) {
    if (SPORT_TYPE_DB_SLUG[key] === slug) return key;
  }
  return null;
}

export const SPORT_DEVICE_QUERY_PARAM = "pajisja";

export function parseSportDeviceFromSearch(search: string): SportDeviceKey | null {
  const raw = new URLSearchParams(search).get(SPORT_DEVICE_QUERY_PARAM)?.trim();
  if (!raw || !(SPORT_DEVICE_KEYS as readonly string[]).includes(raw)) return null;
  return raw as SportDeviceKey;
}

export function isSportDeviceValidForType(
  sportKey: SportTypeKey,
  deviceKey: SportDeviceKey,
): boolean {
  return SPORT_DEVICE_SECTIONS[sportKey].some((s) => s.itemKeys.includes(deviceKey));
}

export function sportDeviceLeafPath(categoryPath: string, deviceKey: SportDeviceKey): string {
  return `${categoryPath}?${SPORT_DEVICE_QUERY_PARAM}=${encodeURIComponent(deviceKey)}`;
}

/** Short intro per sport type (i18n key suffix). */
export const SPORT_TYPE_INTRO_KEY: Record<SportTypeKey, string> = {
  football: "so_intro_football",
  fitness: "so_intro_fitness",
  bike: "so_intro_bike",
  camping: "so_intro_camping",
  martial: "so_intro_martial",
  winter: "so_intro_winter",
  water: "so_intro_water",
  hobby: "so_intro_hobby",
};
