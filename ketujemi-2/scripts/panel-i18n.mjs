/** Merges all hand-maintained category hub panel translations. */
import { HUB_EN, HUB_FR } from "./hub-i18n.mjs";
import { FJ_EN, FJ_FR } from "./fj-i18n.mjs";
import { PANEL_EN_AK_NI_BB, PANEL_FR_AK_NI_BB } from "./panel-i18n-ak-ni-bb.mjs";
import { PANEL_EN_LZ, PANEL_FR_LZ } from "./panel-i18n-lz.mjs";
import { PANEL_EN_EP_MD_KL, PANEL_FR_EP_MD_KL } from "./panel-i18n-ep-md-kl.mjs";
import { PANEL_EN_SO_KSH_TEL, PANEL_FR_SO_KSH_TEL } from "./panel-i18n-so-ksh-tel.mjs";
import { PANEL_EN_MH_PS_RK, PANEL_FR_MH_PS_RK } from "./panel-i18n-mh-ps-rk.mjs";

export const PANEL_EN = {
  ...HUB_EN,
  ...FJ_EN,
  ...PANEL_EN_AK_NI_BB,
  ...PANEL_EN_LZ,
  ...PANEL_EN_EP_MD_KL,
  ...PANEL_EN_SO_KSH_TEL,
  ...PANEL_EN_MH_PS_RK,
};

export const PANEL_FR = {
  ...HUB_FR,
  ...FJ_FR,
  ...PANEL_FR_AK_NI_BB,
  ...PANEL_FR_LZ,
  ...PANEL_FR_EP_MD_KL,
  ...PANEL_FR_SO_KSH_TEL,
  ...PANEL_FR_MH_PS_RK,
};
