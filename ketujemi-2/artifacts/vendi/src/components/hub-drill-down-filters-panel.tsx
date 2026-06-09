import type { GetListingsParams } from "@workspace/api-client-react";
import { KafshetSearchPanel } from "@/components/kafshet-search-panel";
import { BujqesiBlegtoriSearchPanel } from "@/components/bujqesi-blegtori-search-panel";
import { MobiljeDekorimSearchPanel } from "@/components/mobilje-dekorim-search-panel";
import { LokaleZyreSearchPanel } from "@/components/lokale-zyre-search-panel";
import { MuzikeHobbySearchPanel } from "@/components/muzike-hobby-search-panel";
import { RrobaKepuceSearchPanel } from "@/components/rroba-kepuce-search-panel";
import { PuneSherbimeSearchPanel } from "@/components/pune-sherbime-search-panel";
import { TvElektronikeSearchPanel } from "@/components/tv-elektronike-search-panel";
import type { HubDrillDownRegistryKey } from "@/lib/hub-drill-down-registry";

type CategoryRow = {
  id: number;
  name: string;
  slug: string | null;
  parent_id: number | null;
};

type Props = {
  hubKey: HubDrillDownRegistryKey;
  hubCategoryId: number;
  scopeCategoryId: number;
  lockedTypeKey: string;
  categories: CategoryRow[];
  previewTotal: number | null;
  previewLoading: boolean;
  onListingParamsChange: (params: GetListingsParams) => void;
  onScrollToResults?: () => void;
};

export function HubDrillDownFiltersPanel({
  hubKey,
  hubCategoryId,
  scopeCategoryId,
  lockedTypeKey,
  categories,
  previewTotal,
  previewLoading,
  onListingParamsChange,
  onScrollToResults,
}: Props) {
  const shared = {
    hubId: hubCategoryId,
    scopeCategoryId,
    categories,
    previewTotal,
    previewLoading,
    onListingParamsChange,
    onScrollToResults,
    lockedTypeKey,
  };

  switch (hubKey) {
    case "kafshet":
      return <KafshetSearchPanel {...shared} lockedTypeKey={lockedTypeKey as never} />;
    case "bujqesi":
      return <BujqesiBlegtoriSearchPanel {...shared} lockedTypeKey={lockedTypeKey as never} />;
    case "mobilje":
      return <MobiljeDekorimSearchPanel {...shared} lockedTypeKey={lockedTypeKey as never} />;
    case "lokale":
      return <LokaleZyreSearchPanel {...shared} lockedTypeKey={lockedTypeKey as never} />;
    case "muzike":
      return <MuzikeHobbySearchPanel {...shared} lockedTypeKey={lockedTypeKey as never} />;
    case "rroba":
      return <RrobaKepuceSearchPanel {...shared} lockedTypeKey={lockedTypeKey as never} />;
    case "pune":
      return <PuneSherbimeSearchPanel {...shared} lockedTypeKey={lockedTypeKey as never} />;
    case "tv":
      return <TvElektronikeSearchPanel {...shared} lockedTypeKey={lockedTypeKey as never} />;
    default:
      return null;
  }
}
