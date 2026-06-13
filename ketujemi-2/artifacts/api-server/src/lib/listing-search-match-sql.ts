import { and, inArray, or, sql, type SQL } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import type { TokenCategoryResolution } from "../../../../lib/listing-search-match.js";

function foldedColumnExpr(column: PgColumn): SQL {
  return sql`LOWER(REPLACE(REPLACE(REPLACE(REPLACE(${column}, 'ë', 'e'), 'Ë', 'e'), 'ç', 'c'), 'Ç', 'c'))`;
}

/** Word-start match — mercedes matches Mercedes, not unrelated substrings. */
function foldedWordMatch(column: PgColumn, token: string): SQL {
  return sql`${foldedColumnExpr(column)} ~ ${`\\m${token}`}`;
}

export function listingTitleMatchScoreSql(titleColumn: PgColumn, token: string): SQL {
  return sql`CASE WHEN ${foldedColumnExpr(titleColumn)} ~ ${`\\m${token}`} THEN 1 ELSE 0 END`;
}

export type ListingSearchColumns = {
  title: PgColumn;
  description: PgColumn;
  vehicleModel: PgColumn;
  categoryId: PgColumn;
};

/**
 * Strict listing search SQL:
 * - Brand token (mercedes) → only that brand category + title/model word match (no description).
 * - Category token (tavolin) → category tree + title/model (+ description for 4+ chars).
 */
export function buildListingTokenMatchCondition(
  tokens: string[],
  cols: ListingSearchColumns,
  resolutionByToken: Map<string, TokenCategoryResolution>,
): SQL | undefined {
  if (tokens.length === 0) return undefined;

  const perToken = tokens.map((token) => {
    const resolution = resolutionByToken.get(token);
    const strictBrandIds = resolution?.strictBrandIds ?? [];
    const treeIds = resolution?.treeIds ?? [];

    if (strictBrandIds.length > 0) {
      return or(
        inArray(cols.categoryId, strictBrandIds),
        foldedWordMatch(cols.title, token),
        foldedWordMatch(cols.vehicleModel, token),
      )!;
    }

    const parts: SQL[] = [
      foldedWordMatch(cols.title, token),
      foldedWordMatch(cols.vehicleModel, token),
    ];

    if (treeIds.length > 0) {
      parts.push(inArray(cols.categoryId, treeIds));
    }

    if (token.length >= 4) {
      parts.push(foldedWordMatch(cols.description, token));
    }

    return or(...parts)!;
  });

  return and(...perToken)!;
}
