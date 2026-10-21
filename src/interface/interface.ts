/**
 * @file interface.ts
 * Defines TypeScript data structures and interfaces for company stock and financial metrics.
 */

/**
 * Represents a company's detailed financial and profile information.
 */
export interface Company {
  /** Full name of the company */
  name: string
  /** Stock market ticker symbol (e.g., 'AAPL') */
  ticker: string
  /** Business sector the company operates in */
  sector: string
  /** Currency used for financial values (e.g., 'USD') */
  currency: string
  /** Total market capitalization in billions */
  marketCap: number
  /** Price-to-Earnings ratio */
  peRatio: number
  /** URL pointing to the company's logo asset */
  logoUrl: string
  /** Identifier of the most recent reporting quarter */
  latestQuarter: string
  /** Historical quarterly revenue values */
  revenue: number[]
  /** Historical quarterly net income values */
  netIncome: number[]
  /** Historical quarterly gross margin percentages */
  grossMargin: number[]
}
