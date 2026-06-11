/**
 * Run: pnpm exec tsx ./src/scripts/verify-self-duplicate-rules.ts
 * Exits 0 when all cases pass (duplicate detection + non-duplicate controls).
 */
import {
  isSelfDuplicateListingMatch,
  listingTextSimilarity,
  significantTitleTokenOverlap,
} from "../lib/listing-text-similarity";

const WATCH_CATEGORY = 42;

type Case = {
  name: string;
  a: { title: string; description: string; categoryId: number };
  b: { title: string; description: string; categoryId: number };
  expectDuplicate: boolean;
};

const cases: Case[] = [
  {
    name: "exact same title+desc",
    a: {
      title: "Orë dore me kuadrant të kuq",
      description: "Orë në gjendje të mirë",
      categoryId: WATCH_CATEGORY,
    },
    b: {
      title: "Orë dore me kuadrant të kuq",
      description: "Orë në gjendje të mirë",
      categoryId: WATCH_CATEGORY,
    },
    expectDuplicate: true,
  },
  {
    name: "user watch 1 vs watch 2 (AI titles)",
    a: {
      title: "Orë dore me kuadrant të kuq dhe rrip lëkurë",
      description: "Shitet orë dore, përdorur pak.",
      categoryId: WATCH_CATEGORY,
    },
    b: {
      title: "Orë Dore me Brez të Zi",
      description: "Orë elegante, funksionon mirë.",
      categoryId: WATCH_CATEGORY,
    },
    expectDuplicate: true,
  },
  {
    name: "user watch 1 vs watch 3 (Boucheron)",
    a: {
      title: "Orë dore me kuadrant të kuq dhe rrip lëkurë",
      description: "Kuadrant i kuq, rrip lëkure.",
      categoryId: WATCH_CATEGORY,
    },
    b: {
      title: "Orë dore Boucheron me kornizë çeliku dhe rrip lëkure",
      description: "Markë Boucheron, çelik.",
      categoryId: WATCH_CATEGORY,
    },
    expectDuplicate: true,
  },
  {
    name: "watch vs headphones — different product",
    a: {
      title: "Orë dore me kuadrant të kuq dhe rrip lëkurë",
      description: "Orë dore.",
      categoryId: WATCH_CATEGORY,
    },
    b: {
      title: "Kufje Wireless të Zeza me Kuti",
      description: "Kufje bluetooth me kuti origjinale.",
      categoryId: 99,
    },
    expectDuplicate: false,
  },
  {
    name: "same words different category (car vs watch)",
    a: {
      title: "BMW X5 diesel full options",
      description: "Automjet në gjendje të shkëlqyer.",
      categoryId: 10,
    },
    b: {
      title: "BMW orë koleksioni",
      description: "Orë dore BMW.",
      categoryId: WATCH_CATEGORY,
    },
    expectDuplicate: false,
  },
  {
    name: "two distinct watches same category",
    a: {
      title: "Rolex Submariner 2019",
      description: "Orë origjinale me kutinë.",
      categoryId: WATCH_CATEGORY,
    },
    b: {
      title: "Casio G-Shock i zi sport",
      description: "Orë sportive digjitale.",
      categoryId: WATCH_CATEGORY,
    },
    expectDuplicate: false,
  },
];

// Repeat core watch pair many times (stress 10–50 runs)
for (let i = 0; i < 12; i++) {
  cases.push({
    name: `stress watch pair #${i + 1}`,
    a: {
      title: "Orë dore me kuadrant të kuq dhe rrip lëkurë",
      description: `Përdorur pak, prova ${i}`,
      categoryId: WATCH_CATEGORY,
    },
    b: {
      title: "Orë moderne me kornizë metalike dhe rrip të zi",
      description: `Funksionon mirë, prova ${i}`,
      categoryId: WATCH_CATEGORY,
    },
    expectDuplicate: true,
  });
}

let failed = 0;
for (const c of cases) {
  const got = isSelfDuplicateListingMatch(c.a, c.b);
  const sim = listingTextSimilarity(c.a.title, c.a.description, c.b.title, c.b.description);
  const overlap = significantTitleTokenOverlap(c.a.title, c.b.title);
  if (got !== c.expectDuplicate) {
    failed++;
    console.error(
      `FAIL [${c.name}] expected=${c.expectDuplicate} got=${got} sim=${sim.toFixed(2)} overlap=${overlap}`,
    );
  }
}

if (failed > 0) {
  console.error(`\n${failed}/${cases.length} cases failed`);
  process.exit(1);
}

console.log(`OK — ${cases.length} self-duplicate cases passed`);
