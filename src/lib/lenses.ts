/**
 * LENSES — the single source of truth for all perspective lenses.
 *
 * To add a new lens, just push a new entry here.
 * The API and UI both derive from this array — no other code needs touching.
 */
export interface LensConfig {
  /** Value used in API calls and internal state */
  value: string;
  /** Human-readable label shown in the dropdown */
  label: string;
  /** Material Symbols icon name for the dropdown */
  icon: string;
  /** Short description shown as the dropdown option tooltip */
  description: string;
}

export const LENSES: LensConfig[] = [
  {
    value: 'Skeptic',
    label: 'Skeptic',
    icon: 'search',
    description: 'Question every assumption. What is the counter-argument?',
  },
  {
    value: 'Teacher',
    label: 'Teacher',
    icon: 'school',
    description: 'Explain this as if to a bright 10-year-old.',
  },
  {
    value: 'Auditor',
    label: 'Auditor',
    icon: 'fact_check',
    description: 'Scrutinise for bias, missing data, or unsupported claims.',
  },
];

/** The "off" sentinel — not an API lens, just the UI default. */
export const NO_LENS = 'None' as const;
export type LensValue = typeof LENSES[number]['value'] | typeof NO_LENS;
