import type { Localised } from "@/app/lab/_i18n";
import type { DemoStationId } from "../_utils/timeline";

/**
 * Mock translations for the text layer, shaped like the real
 * `messages/*.json`: one object per station, one fixed key per line.
 * Lines are looked up by station id, never by index.
 */
type LineKey = `l${number}`;
type StationLines = Readonly<Record<LineKey, string>>;

export const LINES = {
  "en-GB": {
    tangier: {
      l1: "Tangier, 1325.",
      l2: "At twenty-one, Ibn Battuta left home for Mecca.",
      l3: "By his own account, he set out alone.",
    },
    mecca: {
      l1: "Mecca, around 1326.",
      l2: "The pilgrimage he had set out for was complete.",
      l3: "He did not turn for home. He kept travelling.",
    },
    samarkand: {
      l1: "Samarkand, the early 1330s.",
      l2: "He describes it as one of the largest and finest of cities.",
      l3: "Yet he also writes of palaces lying in ruins by the river.",
    },
  },
  "zh-TW": {
    tangier: {
      l1: "丹吉爾，1325 年。",
      l2: "二十一歲的伊本‧巴圖塔離開家鄉，前往麥加朝聖。",
      l3: "據他所寫，他是獨自上路的。",
    },
    mecca: {
      l1: "麥加，約 1326 年。",
      l2: "他完成了出發時立下的朝聖。",
      l3: "但他沒有回家，而是繼續旅行。",
    },
    samarkand: {
      l1: "撒馬爾罕，1330 年代初。",
      l2: "他記述這是世上規模最大、最美的城市之一。",
      l3: "但他也寫到，河畔的宮殿已成廢墟。",
    },
  },
} as const satisfies Localised<Record<DemoStationId, StationLines>>;
