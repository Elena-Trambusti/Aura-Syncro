export function roundMoney(n: number): number {
  return Math.round(n * 100) / 100
}

/** Scorporo IVA/IGIC da prezzo lordo (menu IVA inclusa). */
export function computeGuestOrderTax(grossAmount: number, taxRate: number) {
  const rate = taxRate / 100
  const taxableBase = roundMoney(grossAmount / (1 + rate))
  const tax = roundMoney(grossAmount - taxableBase)
  const total = roundMoney(grossAmount)
  return { subtotal: taxableBase, tax, total }
}
