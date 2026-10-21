/**
 * Order matching the design: defines position in legend/donut AND the blue shade.
 */
export const COMPANY_ORDER = ['META', 'TSLA', 'NVDA', 'MSFT', 'AAPL', 'GOOG', 'AMZN']

/**
 * Blue shades ranging from light to dark.
 */
export const BLUE_SHADES = [
  '#39daff',
  '#2fc3ea',
  '#29aad0',
  '#2490b4',
  '#1f7898',
  '#1a6482',
  '#16546e',
]

/**
 * Default fallback color for companies not explicitly matched.
 */
export const DEFAULT_COLOR = '#39daff'

/**
 * Returns the corresponding color for a company based on its position in COMPANY_ORDER.
 *
 * @param ticker - The stock ticker symbol (e.g., 'AAPL')
 * @returns The hex color code string
 */
export const getCompanyColor = (ticker: string): string =>
  BLUE_SHADES[COMPANY_ORDER.indexOf(ticker)] ?? DEFAULT_COLOR

/**
 * Sorts arbitrary objects containing a ticker according to COMPANY_ORDER.
 *
 * @param a - First object with a ticker property
 * @param b - Second object with a ticker property
 * @returns Sorting index for comparison
 */
export const byCompanyOrder = (a: { ticker: string }, b: { ticker: string }) =>
  COMPANY_ORDER.indexOf(a.ticker) - COMPANY_ORDER.indexOf(b.ticker)

/**
 * Calculates the Trailing Twelve Months (TTM) value (Sum of the last 4 quarters).
 *
 * @param values - Array of numerical values (e.g., quarterly revenue)
 * @returns The sum of the last 4 elements
 */
export const getTtm = (values: number[]): number =>
  values.slice(-4).reduce((sum, value) => sum + value, 0)

/**
 * Ranks tickers by their TTM revenue in descending order (highest value first).
 *
 * @param companies - Array of company objects containing ticker and revenue array
 * @returns An array of ticker strings sorted by TTM revenue descending
 */
export const getRevenueRanking = (companies: { ticker: string; revenue: number[] }[]): string[] =>
  [...companies].sort((a, b) => getTtm(b.revenue) - getTtm(a.revenue)).map((c) => c.ticker)

/**
 * Returns a blue shade based on the company's rank (highest revenue = lightest shade).
 *
 * @param ranking - Array of sorted ticker strings
 * @param ticker - The target ticker symbol
 * @returns The corresponding hex color code string
 */
export const getRankColor = (ranking: string[], ticker: string): string =>
  BLUE_SHADES[ranking.indexOf(ticker)] ?? DEFAULT_COLOR
