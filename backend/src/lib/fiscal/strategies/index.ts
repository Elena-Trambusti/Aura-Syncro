import type { FiscalRegion, TaxRegion } from '@prisma/client'
import type { FiscalConfig } from '../../taxEngine'
import type { FiscalSummary, FiscalTransactionRow } from '../fiscalReportTypes'
import { taxRegionToFiscalRegion } from '../fiscalRegion'
import { CanariasFiscalStrategy } from './CanariasFiscalStrategy'
import { ItaliaFiscalStrategy } from './ItaliaFiscalStrategy'
import { SpagnaPeninsulaFiscalStrategy } from './SpagnaPeninsulaFiscalStrategy'
import type { FiscalOperativeRegime, FiscalStrategy } from './types'

export type {
  FiscalComplianceProfile,
  FiscalDocumentType,
  FiscalOperativeRegime,
  FiscalPdfExportOptions,
  FiscalReportLabels,
  FiscalStrategy,
  CheckoutTipPolicy,
} from './types'

const ITALIA = new ItaliaFiscalStrategy()
const CANARIAS = new CanariasFiscalStrategy()
const PENINSULA = new SpagnaPeninsulaFiscalStrategy()

const BY_FISCAL_REGION: Record<FiscalRegion, FiscalStrategy> = {
  ITALIA,
  ISOLE_CANARIE: CANARIAS,
  SPAGNA_PENINSULA: PENINSULA,
}

export function operativeRegimeFromFiscalRegion(fiscalRegion: FiscalRegion): FiscalOperativeRegime {
  switch (fiscalRegion) {
    case 'ITALIA':
      return 'IT_ITALIA'
    case 'ISOLE_CANARIE':
      return 'ES_CANARIAS'
    case 'SPAGNA_PENINSULA':
      return 'ES_PENINSULA'
    default:
      return 'IT_ITALIA'
  }
}

export function fiscalRegionFromOperativeRegime(regime: FiscalOperativeRegime): FiscalRegion {
  switch (regime) {
    case 'IT_ITALIA':
      return 'ITALIA'
    case 'ES_CANARIAS':
      return 'ISOLE_CANARIE'
    case 'ES_PENINSULA':
      return 'SPAGNA_PENINSULA'
    default:
      return 'ITALIA'
  }
}

/** Factory: risolve la strategia fiscale dal regime Prisma del tenant. */
export function getFiscalStrategy(fiscalRegion: FiscalRegion): FiscalStrategy {
  return BY_FISCAL_REGION[fiscalRegion] ?? ITALIA
}

export function getFiscalStrategyFromConfig(config: FiscalConfig): FiscalStrategy {
  return getFiscalStrategy(config.fiscalRegion)
}

export function getFiscalStrategyByTaxRegion(taxRegion: TaxRegion): FiscalStrategy {
  return getFiscalStrategy(taxRegionToFiscalRegion(taxRegion))
}

/** Aggrega il libro registro fiscale delegando alla strategia del tenant. */
export function buildFiscalSummary(
  rows: FiscalTransactionRow[],
  taxRegion: TaxRegion,
): FiscalSummary {
  return getFiscalStrategyByTaxRegion(taxRegion).buildReportSummary(rows)
}
