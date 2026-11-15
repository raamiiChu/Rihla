import { describe, expect, it } from "vitest";
import type { Locale } from "./config";
import { detectLocale } from "./detect";

type Spec = {
  case: string;
  cookie: string | undefined;
  header: string | null;
  expected: Locale;
};

const specs: Spec[] = [
  // Cookie
  {
    case: "valid cookie wins",
    cookie: "zh-TW",
    header: "en",
    expected: "zh-TW",
  },
  {
    case: "valid cookie wins without a header",
    cookie: "en-GB",
    header: null,
    expected: "en-GB",
  },
  {
    case: "invalid cookie is ignored",
    cookie: "fr",
    header: "zh",
    expected: "zh-TW",
  },
  {
    case: "empty cookie is ignored",
    cookie: "",
    header: "zh",
    expected: "zh-TW",
  },

  // Defaults
  {
    case: "no cookie, no header",
    cookie: undefined,
    header: null,
    expected: "en-GB",
  },
  {
    case: "empty header",
    cookie: undefined,
    header: "",
    expected: "en-GB",
  },
  {
    case: "unsupported languages only",
    cookie: undefined,
    header: "fr,de",
    expected: "en-GB",
  },

  // Mapping
  {
    case: "Simplified Chinese maps to zh-TW",
    cookie: undefined,
    header: "zh-CN",
    expected: "zh-TW",
  },
  {
    case: "bare zh maps to zh-TW",
    cookie: undefined,
    header: "zh",
    expected: "zh-TW",
  },
  {
    case: "script subtag maps to zh-TW",
    cookie: undefined,
    header: "zh-Hant-HK",
    expected: "zh-TW",
  },
  {
    case: "US English maps to en-GB",
    cookie: undefined,
    header: "en-US",
    expected: "en-GB",
  },
  {
    case: "case-insensitive tags",
    cookie: undefined,
    header: "ZH-tw",
    expected: "zh-TW",
  },

  // Weights
  {
    case: "weight beats order",
    cookie: undefined,
    header: "en;q=0.5,zh;q=0.9",
    expected: "zh-TW",
  },
  {
    case: "equal weights keep header order",
    cookie: undefined,
    header: "en;q=0.8,zh;q=0.8",
    expected: "en-GB",
  },
  {
    case: "missing weight counts as 1",
    cookie: undefined,
    header: "zh;q=0.9,en",
    expected: "en-GB",
  },
  {
    case: "q=0 is excluded",
    cookie: undefined,
    header: "zh;q=0,en",
    expected: "en-GB",
  },
  {
    case: "skips an unsupported first choice",
    cookie: undefined,
    header: "fr,zh;q=0.8",
    expected: "zh-TW",
  },

  // Malformed input
  {
    case: "spaces after commas",
    cookie: undefined,
    header: "fr, en;q=0.5",
    expected: "en-GB",
  },
  {
    case: "spaces around the weight",
    cookie: undefined,
    header: "fr, zh ; q=0.5",
    expected: "zh-TW",
  },
  {
    case: "wildcard is ignored",
    cookie: undefined,
    header: "*",
    expected: "en-GB",
  },
  {
    case: "wildcard does not outrank a real language",
    cookie: undefined,
    header: "*,zh;q=0.5",
    expected: "zh-TW",
  },
  {
    case: "malformed weight is excluded",
    cookie: undefined,
    header: "zh;q=abc,en",
    expected: "en-GB",
  },
];

describe("detectLocale", () => {
  it.each(specs)("$case", ({ cookie, header, expected }) => {
    expect(detectLocale(cookie, header)).toBe(expected);
  });
});
