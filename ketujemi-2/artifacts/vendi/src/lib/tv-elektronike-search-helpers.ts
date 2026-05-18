/** Elektronikë & Pajisje Shtëpiake hub slug (matches seeded category). */
export const TV_ELEKTRONIKE_HUB_SLUG = "tv-elektronike";

export const TV_ELEKTRONIKE_HERO_PHOTO =
  "https://images.pexels.com/photos/1571458/pexels-photo-1571458.jpeg?auto=compress&cs=tinysrgb&w=1400&q=85";

export const EP_TYPE_KEYS = [
  "pajisje_medha",
  "klimatizim",
  "televizore",
  "konzola",
  "audio",
  "kamera",
  "laptop_kompjutere",
] as const;

export type EpTypeKey = (typeof EP_TYPE_KEYS)[number];

export const EP_TYPE_DB_SLUG: Record<EpTypeKey, string> = {
  pajisje_medha: "tv-type-pajisje-medha-shtepiake",
  klimatizim: "tv-type-klimatizim-ngrohje",
  televizore: "tv-type-televizore-projektor",
  konzola: "tv-type-konzola-gaming",
  audio: "tv-type-audio-zeri",
  kamera: "tv-type-kamera-foto-smartwatch",
  laptop_kompjutere: "tv-type-laptop-kompjutere",
};

export const EP_TYPE_PHOTOS: Record<EpTypeKey, string> = {
  pajisje_medha:
    "https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=400",
  klimatizim:
    "https://images.pexels.com/photos/16592625/pexels-photo-16592625.jpeg?auto=compress&cs=tinysrgb&w=400",
  televizore:
    "https://images.pexels.com/photos/1571458/pexels-photo-1571458.jpeg?auto=compress&cs=tinysrgb&w=400",
  konzola:
    "https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg?auto=compress&cs=tinysrgb&w=400",
  audio:
    "https://images.pexels.com/photos/1037999/pexels-photo-1037999.jpeg?auto=compress&cs=tinysrgb&w=400",
  kamera:
    "https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg?auto=compress&cs=tinysrgb&w=400",
  laptop_kompjutere:
    "https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400",
};

export const EP_TYPE_LABEL_KEY: Record<EpTypeKey, string> = {
  pajisje_medha: "ep_type_pajisje",
  klimatizim: "ep_type_klimatizim",
  televizore: "ep_type_tv",
  konzola: "ep_type_konzola",
  audio: "ep_type_audio",
  kamera: "ep_type_kamera",
  laptop_kompjutere: "ep_type_laptop",
};

/** Subcategories for Laptopë & Kompjuterë (grouped sections). */
export const EP_LAPTOP_SUB_ITEM_KEYS = [
  "desktop_gaming",
  "desktop_office",
  "desktop_workstation",
  "desktop_aio",
  "desktop_mini",
  "laptop_gaming",
  "laptop_ultrabook",
  "laptop_student",
  "laptop_2in1",
  "monitor_gaming",
  "monitor_office",
  "monitor_4k",
  "monitor_curved",
  "monitor_ultrawide",
  "hw_cpu",
  "hw_gpu",
  "hw_mobo",
  "hw_ram",
  "hw_ssd_hdd",
  "hw_psu",
  "hw_case",
  "hw_cooler",
  "srv_rack",
  "srv_tower",
  "srv_parts",
  "srv_network",
  "tab_ipad",
  "tab_android",
  "tab_windows",
  "tab_drawing",
] as const;

export type EpLaptopSubItemKey = (typeof EP_LAPTOP_SUB_ITEM_KEYS)[number];

export const EP_LAPTOP_SUB_SEARCH: Record<EpLaptopSubItemKey, string> = {
  desktop_gaming: "Gaming PC",
  desktop_office: "Office Home PC",
  desktop_workstation: "Workstation Profesional",
  desktop_aio: "All-in-One PC",
  desktop_mini: "Mini PC",
  laptop_gaming: "Gaming Laptop",
  laptop_ultrabook: "Ultrabook Business",
  laptop_student: "Student Daily Use",
  laptop_2in1: "2-in-1 Touchscreen",
  monitor_gaming: "Gaming Monitor 144Hz 240Hz 360Hz",
  monitor_office: "Office Business Monitor",
  monitor_4k: "Professional 4K Designer Monitor",
  monitor_curved: "Curved Monitor",
  monitor_ultrawide: "Ultrawide Monitor",
  hw_cpu: "Procesor CPU",
  hw_gpu: "Kartela Grafike GPU",
  hw_mobo: "Pllaka Amë Motherboard",
  hw_ram: "RAM Memorie",
  hw_ssd_hdd: "SSD NVMe SATA HDD",
  hw_psu: "Furnizues rryme PSU",
  hw_case: "Shtëpiza PC Cases",
  hw_cooler: "Ftohës CPU Cooler Ujë",
  srv_rack: "Rack Servers",
  srv_tower: "Tower Servers",
  srv_parts: "Server RAM ECC Xeon EPYC",
  srv_network: "Pajisje Rrjeti Switches Racks",
  tab_ipad: "Apple iPad Air Pro Mini",
  tab_android: "Android Tablets Samsung Xiaomi",
  tab_windows: "Windows Tablets Surface",
  tab_drawing: "Drawing Tablets vizatim profesional",
};

export const EP_LAPTOP_SUB_LABEL_KEY: Record<EpLaptopSubItemKey, string> = {
  desktop_gaming: "ep_lap_desktop_gaming",
  desktop_office: "ep_lap_desktop_office",
  desktop_workstation: "ep_lap_desktop_workstation",
  desktop_aio: "ep_lap_desktop_aio",
  desktop_mini: "ep_lap_desktop_mini",
  laptop_gaming: "ep_lap_laptop_gaming",
  laptop_ultrabook: "ep_lap_laptop_ultrabook",
  laptop_student: "ep_lap_laptop_student",
  laptop_2in1: "ep_lap_laptop_2in1",
  monitor_gaming: "ep_lap_monitor_gaming",
  monitor_office: "ep_lap_monitor_office",
  monitor_4k: "ep_lap_monitor_4k",
  monitor_curved: "ep_lap_monitor_curved",
  monitor_ultrawide: "ep_lap_monitor_ultrawide",
  hw_cpu: "ep_lap_hw_cpu",
  hw_gpu: "ep_lap_hw_gpu",
  hw_mobo: "ep_lap_hw_mobo",
  hw_ram: "ep_lap_hw_ram",
  hw_ssd_hdd: "ep_lap_hw_ssd",
  hw_psu: "ep_lap_hw_psu",
  hw_case: "ep_lap_hw_case",
  hw_cooler: "ep_lap_hw_cooler",
  srv_rack: "ep_lap_srv_rack",
  srv_tower: "ep_lap_srv_tower",
  srv_parts: "ep_lap_srv_parts",
  srv_network: "ep_lap_srv_network",
  tab_ipad: "ep_lap_tab_ipad",
  tab_android: "ep_lap_tab_android",
  tab_windows: "ep_lap_tab_windows",
  tab_drawing: "ep_lap_tab_drawing",
};

export const EP_LAPTOP_SUBSECTIONS: readonly {
  sectionLabelKey: string;
  itemKeys: readonly EpLaptopSubItemKey[];
}[] = [
  {
    sectionLabelKey: "ep_lap_sec_desktop",
    itemKeys: [
      "desktop_gaming",
      "desktop_office",
      "desktop_workstation",
      "desktop_aio",
      "desktop_mini",
    ],
  },
  {
    sectionLabelKey: "ep_lap_sec_laptop",
    itemKeys: ["laptop_gaming", "laptop_ultrabook", "laptop_student", "laptop_2in1"],
  },
  {
    sectionLabelKey: "ep_lap_sec_monitor",
    itemKeys: [
      "monitor_gaming",
      "monitor_office",
      "monitor_4k",
      "monitor_curved",
      "monitor_ultrawide",
    ],
  },
  {
    sectionLabelKey: "ep_lap_sec_hardware",
    itemKeys: [
      "hw_cpu",
      "hw_gpu",
      "hw_mobo",
      "hw_ram",
      "hw_ssd_hdd",
      "hw_psu",
      "hw_case",
      "hw_cooler",
    ],
  },
  {
    sectionLabelKey: "ep_lap_sec_server",
    itemKeys: ["srv_rack", "srv_tower", "srv_parts", "srv_network"],
  },
  {
    sectionLabelKey: "ep_lap_sec_tablet",
    itemKeys: ["tab_ipad", "tab_android", "tab_windows", "tab_drawing"],
  },
];

export const EP_APPLIANCE_KIND_KEYS = [
  "frigorifere",
  "rrobalarese",
  "enelarese",
  "shporeta",
  "furra",
  "aspiratore",
] as const;
export type EpApplianceKindKey = (typeof EP_APPLIANCE_KIND_KEYS)[number];

export const EP_APPLIANCE_KIND_LABEL_KEY: Record<EpApplianceKindKey, string> = {
  frigorifere: "ep_app_frigo",
  rrobalarese: "ep_app_rroba",
  enelarese: "ep_app_ene",
  shporeta: "ep_app_shporeta",
  furra: "ep_app_furra",
  aspiratore: "ep_app_aspirator",
};

export const EP_APPLIANCE_KIND_SEARCH: Record<EpApplianceKindKey, string> = {
  frigorifere: "Frigorifer Side-by-Side Ngrirës",
  rrobalarese: "Rrobalarëse Thonëse",
  enelarese: "Enëlarëse",
  shporeta: "Shporetë Plloca Gatimi Rrymë Gaz Induksion",
  furra: "Furrë Inkaso Standarde",
  aspiratore: "Aspirator",
};

export const EP_ENERGY_KEYS = ["a3plus", "a2plus", "a", "b"] as const;
export type EpEnergyKey = (typeof EP_ENERGY_KEYS)[number];

export const EP_ENERGY_LABEL_KEY: Record<EpEnergyKey, string> = {
  a3plus: "ep_energy_a3",
  a2plus: "ep_energy_a2",
  a: "ep_energy_a",
  b: "ep_energy_b",
};

export const EP_ENERGY_SEARCH: Record<EpEnergyKey, string> = {
  a3plus: "A+++",
  a2plus: "A++",
  a: "A",
  b: "B",
};

export const EP_WIDTH_KEYS = ["w50", "w60", "w90"] as const;
export type EpWidthKey = (typeof EP_WIDTH_KEYS)[number];

export const EP_WIDTH_LABEL_KEY: Record<EpWidthKey, string> = {
  w50: "ep_width_50",
  w60: "ep_width_60",
  w90: "ep_width_90",
};

export const EP_WIDTH_SEARCH: Record<EpWidthKey, string> = {
  w50: "50cm",
  w60: "60cm",
  w90: "90cm",
};

export const EP_CLIMATE_KIND_KEYS = [
  "klima",
  "ngrohjes",
  "mikroval",
  "kuzhine",
  "fshesa",
  "personale",
] as const;
export type EpClimateKindKey = (typeof EP_CLIMATE_KIND_KEYS)[number];

export const EP_CLIMATE_KIND_LABEL_KEY: Record<EpClimateKindKey, string> = {
  klima: "ep_clim_klima",
  ngrohjes: "ep_clim_ngrohje",
  mikroval: "ep_clim_mikroval",
  kuzhine: "ep_clim_kuzhine",
  fshesa: "ep_clim_fshesa",
  personale: "ep_clim_personale",
};

export const EP_CLIMATE_KIND_SEARCH: Record<EpClimateKindKey, string> = {
  klima: "Klima Inverter",
  ngrohjes: "Ngrohëse Radiator",
  mikroval: "Mikrovalë Mini-furrë",
  kuzhine: "Blender Mikser Kafemakinë Air Fryer",
  fshesa: "Fshesë Rrymë Bateri Robot",
  personale: "Fen Presë Makinë rroje",
};

export const EP_BTU_KEYS = ["btu9000", "btu12000", "btu18000", "btu24000"] as const;
export type EpBtuKey = (typeof EP_BTU_KEYS)[number];

export const EP_BTU_LABEL_KEY: Record<EpBtuKey, string> = {
  btu9000: "ep_btu_9000",
  btu12000: "ep_btu_12000",
  btu18000: "ep_btu_18000",
  btu24000: "ep_btu_24000",
};

export const EP_BTU_SEARCH: Record<EpBtuKey, string> = {
  btu9000: "9000 BTU",
  btu12000: "12000 BTU",
  btu18000: "18000 BTU",
  btu24000: "24000 BTU",
};

export const EP_TV_TYPE_KEYS = ["tv", "projektor", "home_cinema"] as const;
export type EpTvTypeKey = (typeof EP_TV_TYPE_KEYS)[number];

export const EP_TV_TYPE_LABEL_KEY: Record<EpTvTypeKey, string> = {
  tv: "ep_tv_type_tv",
  projektor: "ep_tv_type_projektor",
  home_cinema: "ep_tv_type_cinema",
};

export const EP_TV_TYPE_SEARCH: Record<EpTvTypeKey, string> = {
  tv: "Televizor",
  projektor: "Projektor",
  home_cinema: "Home Cinema",
};

export const EP_TV_SIZE_KEYS = ["under32", "s32_43", "s49_55", "s65_75", "over75"] as const;
export type EpTvSizeKey = (typeof EP_TV_SIZE_KEYS)[number];

export const EP_TV_SIZE_LABEL_KEY: Record<EpTvSizeKey, string> = {
  under32: "ep_tv_size_u32",
  s32_43: "ep_tv_size_32_43",
  s49_55: "ep_tv_size_49_55",
  s65_75: "ep_tv_size_65_75",
  over75: "ep_tv_size_o75",
};

export const EP_TV_SIZE_SEARCH: Record<EpTvSizeKey, string> = {
  under32: 'Nën 32"',
  s32_43: '32"-43"',
  s49_55: '49"-55"',
  s65_75: '65"-75"',
  over75: 'Mbi 75"',
};

export const EP_RESOLUTION_KEYS = ["hd", "fhd", "uhd4k", "uhd8k"] as const;
export type EpResolutionKey = (typeof EP_RESOLUTION_KEYS)[number];

export const EP_RESOLUTION_LABEL_KEY: Record<EpResolutionKey, string> = {
  hd: "ep_res_hd",
  fhd: "ep_res_fhd",
  uhd4k: "ep_res_4k",
  uhd8k: "ep_res_8k",
};

export const EP_RESOLUTION_SEARCH: Record<EpResolutionKey, string> = {
  hd: "HD",
  fhd: "Full HD",
  uhd4k: "4K Ultra HD",
  uhd8k: "8K",
};

export const EP_DISPLAY_TECH_KEYS = ["led", "oled", "qled", "smart"] as const;
export type EpDisplayTechKey = (typeof EP_DISPLAY_TECH_KEYS)[number];

export const EP_DISPLAY_TECH_LABEL_KEY: Record<EpDisplayTechKey, string> = {
  led: "ep_tech_led",
  oled: "ep_tech_oled",
  qled: "ep_tech_qled",
  smart: "ep_tech_smart",
};

export const EP_DISPLAY_TECH_SEARCH: Record<EpDisplayTechKey, string> = {
  led: "LED",
  oled: "OLED",
  qled: "QLED",
  smart: "Smart TV",
};

export const EP_CONSOLE_KEYS = [
  "ps5",
  "ps4",
  "xbox_series",
  "xbox_one",
  "switch",
  "pc",
] as const;
export type EpConsoleKey = (typeof EP_CONSOLE_KEYS)[number];

export const EP_CONSOLE_LABEL_KEY: Record<EpConsoleKey, string> = {
  ps5: "ep_console_ps5",
  ps4: "ep_console_ps4",
  xbox_series: "ep_console_xbox_series",
  xbox_one: "ep_console_xbox_one",
  switch: "ep_console_switch",
  pc: "ep_console_pc",
};

export const EP_CONSOLE_SEARCH: Record<EpConsoleKey, string> = {
  ps5: "PlayStation 5",
  ps4: "PlayStation 4",
  xbox_series: "Xbox Series X S",
  xbox_one: "Xbox One",
  switch: "Nintendo Switch",
  pc: "PC Gaming",
};

export const EP_GAME_ITEM_KEYS = ["konzola", "lojera", "kontroller", "kufje", "timon"] as const;
export type EpGameItemKey = (typeof EP_GAME_ITEM_KEYS)[number];

export const EP_GAME_ITEM_LABEL_KEY: Record<EpGameItemKey, string> = {
  konzola: "ep_game_konzola",
  lojera: "ep_game_lojera",
  kontroller: "ep_game_kontroller",
  kufje: "ep_game_kufje",
  timon: "ep_game_timon",
};

export const EP_GAME_ITEM_SEARCH: Record<EpGameItemKey, string> = {
  konzola: "Konzolë",
  lojera: "Lojëra CD Digital",
  kontroller: "Gjojstikë",
  kufje: "Kufje Gaming",
  timon: "Timon",
};

export const EP_STORAGE_KEYS = ["gb500", "gb1tb", "gb2tb"] as const;
export type EpStorageKey = (typeof EP_STORAGE_KEYS)[number];

export const EP_STORAGE_LABEL_KEY: Record<EpStorageKey, string> = {
  gb500: "ep_storage_500",
  gb1tb: "ep_storage_1tb",
  gb2tb: "ep_storage_2tb",
};

export const EP_STORAGE_SEARCH: Record<EpStorageKey, string> = {
  gb500: "500GB",
  gb1tb: "1TB",
  gb2tb: "2TB",
};

export const EP_AUDIO_KIND_KEYS = [
  "altoparlante",
  "soundbar",
  "subwoofer",
  "kufje",
  "sound_system",
] as const;
export type EpAudioKindKey = (typeof EP_AUDIO_KIND_KEYS)[number];

export const EP_AUDIO_KIND_LABEL_KEY: Record<EpAudioKindKey, string> = {
  altoparlante: "ep_audio_alto",
  soundbar: "ep_audio_soundbar",
  subwoofer: "ep_audio_sub",
  kufje: "ep_audio_kufje",
  sound_system: "ep_audio_pro",
};

export const EP_AUDIO_KIND_SEARCH: Record<EpAudioKindKey, string> = {
  altoparlante: "Altoparlantë Vuferë",
  soundbar: "Soundbar",
  subwoofer: "Sabvufer Përforcues",
  kufje: "Kufje Wireless Bluetooth",
  sound_system: "Sound System profesional",
};

export const EP_CAMERA_KIND_KEYS = [
  "dslr",
  "mirrorless",
  "cctv",
  "drone",
  "smartwatch",
  "aksesore",
] as const;
export type EpCameraKindKey = (typeof EP_CAMERA_KIND_KEYS)[number];

export const EP_CAMERA_KIND_LABEL_KEY: Record<EpCameraKindKey, string> = {
  dslr: "ep_cam_dslr",
  mirrorless: "ep_cam_mirrorless",
  cctv: "ep_cam_cctv",
  drone: "ep_cam_drone",
  smartwatch: "ep_cam_smartwatch",
  aksesore: "ep_cam_aksesore",
};

export const EP_CAMERA_KIND_SEARCH: Record<EpCameraKindKey, string> = {
  dslr: "Kamera DSLR",
  mirrorless: "Kamera Mirrorless",
  cctv: "Kamera Sigurie CCTV",
  drone: "Drone",
  smartwatch: "Smart Watch Band",
  aksesore: "Objektivë Stativë Karta memorie",
};

export const EP_CONDITION_KEYS = ["new_pack", "used", "damaged"] as const;
export type EpConditionKey = (typeof EP_CONDITION_KEYS)[number];

export const EP_CONDITION_LABEL_KEY: Record<EpConditionKey, string> = {
  new_pack: "ep_cond_new",
  used: "ep_cond_used",
  damaged: "ep_cond_damaged",
};

export const EP_CONDITION_SEARCH: Record<EpConditionKey, string> = {
  new_pack: "I ri Në paketim",
  used: "I përdorur",
  damaged: "I dëmtuar",
};

export const EP_BRAND_KEYS = [
  "acer",
  "apple",
  "asus",
  "dell",
  "hp",
  "huawei",
  "lenovo",
  "microsoft",
  "msi",
  "razer",
] as const;
export type EpBrandKey = (typeof EP_BRAND_KEYS)[number];

export const EP_BRAND_PHOTOS: Record<EpBrandKey, string> = {
  acer: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400",
  apple: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
  asus: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400",
  dell: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400",
  hp: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400",
  huawei: "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400",
  lenovo: "https://images.unsplash.com/photo-1588702547923-7408785057f9?w=400",
  microsoft: "https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=400",
  msi: "https://images.unsplash.com/photo-1593640408182-31c228b56b9c?w=400",
  razer: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400",
};

export const EP_BRAND_LABEL_KEY: Record<EpBrandKey, string> = {
  acer: "ep_brand_acer",
  apple: "ep_brand_apple",
  asus: "ep_brand_asus",
  dell: "ep_brand_dell",
  hp: "ep_brand_hp",
  huawei: "ep_brand_huawei",
  lenovo: "ep_brand_lenovo",
  microsoft: "ep_brand_microsoft",
  msi: "ep_brand_msi",
  razer: "ep_brand_razer",
};

export const EP_BRAND_SEARCH: Record<EpBrandKey, string> = {
  acer: "Acer",
  apple: "Apple",
  asus: "ASUS",
  dell: "Dell",
  hp: "HP",
  huawei: "Huawei",
  lenovo: "Lenovo",
  microsoft: "Microsoft",
  msi: "MSI",
  razer: "Razer",
};

/** Product line / model filter per computer brand. */
export const EP_BRAND_MODEL_KEYS = [
  "apple_macbook_air",
  "apple_macbook_pro_14",
  "apple_macbook_pro_16",
  "apple_imac",
  "apple_mac_mini",
  "apple_mac_studio",
  "apple_mac_pro",
  "apple_ipad_standard",
  "apple_ipad_air",
  "apple_ipad_pro",
  "apple_ipad_mini",
  "asus_rog_gaming",
  "asus_tuf_gaming",
  "asus_zenbook",
  "asus_vivobook",
  "asus_expertbook",
  "asus_motherboard",
  "asus_gpu",
  "hp_elitebook",
  "hp_probook",
  "hp_zbook",
  "hp_omen",
  "hp_victus",
  "hp_pavilion",
  "hp_envy",
  "hp_essential",
  "lenovo_thinkpad",
  "lenovo_thinkbook",
  "lenovo_legion",
  "lenovo_loq",
  "lenovo_ideapad",
  "lenovo_yoga",
  "msi_stealth",
  "msi_raider",
  "msi_titan",
  "msi_katana",
  "msi_cyborg",
  "msi_prestige",
  "msi_summit",
  "msi_creator",
  "msi_gpu",
  "msi_motherboard",
  "acer_predator",
  "acer_nitro",
  "acer_aspire",
  "acer_swift",
  "acer_spin",
  "acer_conceptd",
  "dell_xps",
  "dell_latitude",
  "dell_vostro",
  "dell_alienware",
  "dell_g_series",
  "dell_precision",
  "huawei_matebook_x_pro",
  "huawei_matebook_d",
  "huawei_matebook_14",
  "huawei_matebook_16",
  "huawei_matepad_pro",
  "huawei_matepad_paper",
  "huawei_mateview",
  "ms_surface_pro",
  "ms_surface_laptop",
  "ms_surface_go",
  "ms_surface_studio",
  "ms_surface_keyboard",
  "ms_surface_mouse",
  "ms_surface_pen",
  "razer_blade_14",
  "razer_blade_15",
  "razer_blade_16",
  "razer_blade_18",
  "razer_kraken",
  "razer_blackshark",
  "razer_deathadder",
  "razer_basilisk",
  "razer_blackwidow",
] as const;

export type EpBrandModelKey = (typeof EP_BRAND_MODEL_KEYS)[number];

export const EP_BRAND_MODELS_BY_BRAND: Record<EpBrandKey, readonly EpBrandModelKey[]> = {
  apple: [
    "apple_macbook_air",
    "apple_macbook_pro_14",
    "apple_macbook_pro_16",
    "apple_imac",
    "apple_mac_mini",
    "apple_mac_studio",
    "apple_mac_pro",
    "apple_ipad_standard",
    "apple_ipad_air",
    "apple_ipad_pro",
    "apple_ipad_mini",
  ],
  asus: [
    "asus_rog_gaming",
    "asus_tuf_gaming",
    "asus_zenbook",
    "asus_vivobook",
    "asus_expertbook",
    "asus_motherboard",
    "asus_gpu",
  ],
  hp: [
    "hp_elitebook",
    "hp_probook",
    "hp_zbook",
    "hp_omen",
    "hp_victus",
    "hp_pavilion",
    "hp_envy",
    "hp_essential",
  ],
  lenovo: [
    "lenovo_thinkpad",
    "lenovo_thinkbook",
    "lenovo_legion",
    "lenovo_loq",
    "lenovo_ideapad",
    "lenovo_yoga",
  ],
  msi: [
    "msi_stealth",
    "msi_raider",
    "msi_titan",
    "msi_katana",
    "msi_cyborg",
    "msi_prestige",
    "msi_summit",
    "msi_creator",
    "msi_gpu",
    "msi_motherboard",
  ],
  acer: ["acer_predator", "acer_nitro", "acer_aspire", "acer_swift", "acer_spin", "acer_conceptd"],
  dell: [
    "dell_xps",
    "dell_latitude",
    "dell_vostro",
    "dell_alienware",
    "dell_g_series",
    "dell_precision",
  ],
  huawei: [
    "huawei_matebook_x_pro",
    "huawei_matebook_d",
    "huawei_matebook_14",
    "huawei_matebook_16",
    "huawei_matepad_pro",
    "huawei_matepad_paper",
    "huawei_mateview",
  ],
  microsoft: [
    "ms_surface_pro",
    "ms_surface_laptop",
    "ms_surface_go",
    "ms_surface_studio",
    "ms_surface_keyboard",
    "ms_surface_mouse",
    "ms_surface_pen",
  ],
  razer: [
    "razer_blade_14",
    "razer_blade_15",
    "razer_blade_16",
    "razer_blade_18",
    "razer_kraken",
    "razer_blackshark",
    "razer_deathadder",
    "razer_basilisk",
    "razer_blackwidow",
  ],
};

export const EP_BRAND_MODEL_SEARCH: Record<EpBrandModelKey, string> = {
  apple_macbook_air: "MacBook Air",
  apple_macbook_pro_14: "MacBook Pro 14",
  apple_macbook_pro_16: "MacBook Pro 16",
  apple_imac: "iMac",
  apple_mac_mini: "Mac Mini",
  apple_mac_studio: "Mac Studio",
  apple_mac_pro: "Mac Pro",
  apple_ipad_standard: "iPad Standard",
  apple_ipad_air: "iPad Air",
  apple_ipad_pro: "iPad Pro",
  apple_ipad_mini: "iPad Mini",
  asus_rog_gaming: "ROG Gaming",
  asus_tuf_gaming: "TUF Gaming",
  asus_zenbook: "ZenBook",
  asus_vivobook: "VivoBook",
  asus_expertbook: "ExpertBook",
  asus_motherboard: "ASUS Motherboard",
  asus_gpu: "ASUS GPU ROG/TUF",
  hp_elitebook: "EliteBook",
  hp_probook: "ProBook",
  hp_zbook: "ZBook",
  hp_omen: "OMEN",
  hp_victus: "Victus",
  hp_pavilion: "Pavilion",
  hp_envy: "HP Envy",
  hp_essential: "HP Essential",
  lenovo_thinkpad: "ThinkPad",
  lenovo_thinkbook: "ThinkBook",
  lenovo_legion: "Legion",
  lenovo_loq: "LOQ",
  lenovo_ideapad: "IdeaPad",
  lenovo_yoga: "Yoga",
  msi_stealth: "Stealth",
  msi_raider: "Raider",
  msi_titan: "Titan",
  msi_katana: "Katana",
  msi_cyborg: "Cyborg",
  msi_prestige: "Prestige",
  msi_summit: "Summit",
  msi_creator: "Creator",
  msi_gpu: "MSI GPU",
  msi_motherboard: "MSI Motherboard",
  acer_predator: "Predator",
  acer_nitro: "Nitro",
  acer_aspire: "Aspire",
  acer_swift: "Swift",
  acer_spin: "Spin",
  acer_conceptd: "ConceptD",
  dell_xps: "XPS",
  dell_latitude: "Latitude",
  dell_vostro: "Vostro",
  dell_alienware: "Alienware",
  dell_g_series: "Dell G-Series",
  dell_precision: "Precision Workstation",
  huawei_matebook_x_pro: "MateBook X Pro",
  huawei_matebook_d: "MateBook D",
  huawei_matebook_14: "MateBook 14",
  huawei_matebook_16: "MateBook 16",
  huawei_matepad_pro: "MatePad Pro",
  huawei_matepad_paper: "MatePad Paper",
  huawei_mateview: "MateView Monitor",
  ms_surface_pro: "Surface Pro",
  ms_surface_laptop: "Surface Laptop",
  ms_surface_go: "Surface Go",
  ms_surface_studio: "Surface Studio",
  ms_surface_keyboard: "Surface Keyboard",
  ms_surface_mouse: "Surface Mouse",
  ms_surface_pen: "Surface Pen",
  razer_blade_14: "Blade 14",
  razer_blade_15: "Blade 15",
  razer_blade_16: "Blade 16",
  razer_blade_18: "Blade 18",
  razer_kraken: "Kraken",
  razer_blackshark: "BlackShark",
  razer_deathadder: "DeathAdder",
  razer_basilisk: "Basilisk",
  razer_blackwidow: "BlackWidow Keyboard",
};

export function getEpBrandModelsForBrand(brand: EpBrandKey | ""): EpBrandModelKey[] {
  if (brand) return [...EP_BRAND_MODELS_BY_BRAND[brand]];
  return [...EP_BRAND_MODEL_KEYS];
}

export const EP_WARRANTY_SEARCH = "Garanci e vlefshme";

export {
  LOKALE_ZYRE_CITY_KEYS as EP_CITY_KEYS,
  LOKALE_ZYRE_CITY_LABEL_KEY as EP_CITY_LABEL_KEY,
  LOKALE_ZYRE_CITY_SEARCH as EP_CITY_SEARCH,
  type LokaleCityKey as EpCityKey,
} from "@/lib/lokale-zyre-search-helpers";

export type TvElektronikeCategoryRow = {
  id: number;
  name: string;
  slug: string | null;
  parent_id: number | null;
};

export function getTvElektronikeLeafCategoryIds(
  categories: TvElektronikeCategoryRow[],
  hubId: number,
): number[] {
  return categories
    .filter(
      (c) =>
        c.parent_id === hubId &&
        typeof c.slug === "string" &&
        (c.slug as string).startsWith("tv-type-"),
    )
    .map((c) => c.id);
}

export function resolveTvElektronikeTypeCategoryId(
  categories: TvElektronikeCategoryRow[],
  hubId: number,
  typeKey: EpTypeKey,
): number | undefined {
  const slug = EP_TYPE_DB_SLUG[typeKey];
  const row = categories.find((c) => c.parent_id === hubId && c.slug === slug);
  return row?.id;
}
