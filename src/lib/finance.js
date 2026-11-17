export const money = (value, currency = 'INR') => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency, maximumFractionDigits: 0,
}).format(Number.isFinite(Number(value)) ? Number(value) : 0)

export function calculateEmi(principal, annualRate, months) {
  const P = Math.max(0, Number(principal) || 0)
  const n = Math.max(1, Math.round(Number(months) || 1))
  const annual = Math.max(0, Number(annualRate) || 0)
  const r = annual / 1200
  const payment = r === 0 ? P / n : P * r * ((1 + r) ** n) / (((1 + r) ** n) - 1)
  return { payment, total: payment * n, interest: payment * n - P, principal: P, months: n }
}

export function assessPurchase({ balance, emergencySavings = 0, income, expenses, emi, credit, price, monthsUntil = 0 }) {
  const B = Math.max(0, Number(balance) || 0)
  const emergency = Math.max(0, Number(emergencySavings) || 0)
  const I = Math.max(0, Number(income) || 0)
  const E = Math.max(0, Number(expenses) || 0)
  const D = Math.max(0, Number(emi) || 0) + Math.max(0, Number(credit) || 0)
  const C = Math.max(0, Number(price) || 0)
  const months = Math.max(0, Math.min(24, Number(monthsUntil) || 0))
  const monthlySurplus = I - E - D
  const projectedCash = B + monthlySurplus * months
  const cashAfterPurchase = projectedCash - C
  const emergencyTarget = E * 3
  const remainingReserves = Math.max(0, emergency + cashAfterPurchase)
  const monthsOfCover = E > 0 ? remainingReserves / E : (remainingReserves > 0 ? 99 : 0)
  const recoveryMonths = monthlySurplus > 0 ? Math.ceil(C / monthlySurplus) : null
  let score = 0
  if (cashAfterPurchase >= 0) score += 30
  if (remainingReserves >= emergencyTarget) score += 35
  else if (emergencyTarget > 0) score += Math.round(35 * remainingReserves / emergencyTarget)
  if (monthlySurplus > 0) score += 20
  if (monthlySurplus >= C / 3) score += 15
  score = Math.min(100, score)
  const status = cashAfterPurchase < 0 || monthlySurplus <= 0 ? 'Not recommended' : score >= 75 ? 'Affordable' : 'Risky'
  const explanation = status === 'Affordable'
    ? `After this purchase, your available cash and dedicated emergency savings still cover at least three months of expenses. Your monthly surplus can rebuild the purchase amount in about ${recoveryMonths} month${recoveryMonths === 1 ? '' : 's'}.`
    : status === 'Risky'
      ? `You can cover the price, but it would leave about ${monthsOfCover.toFixed(1)} month${monthsOfCover === 1 ? '' : 's'} of expenses in reserve. Consider waiting or choosing a lower price.`
      : monthlySurplus <= 0
        ? 'Your current monthly commitments use all of your income. Adding this purchase could increase financial pressure.'
        : `This purchase is about ${money(Math.abs(cashAfterPurchase))} more than your projected cash at the purchase date. Saving first would reduce the risk.`
  return { status, score, monthlySurplus, projectedCash, cashAfterPurchase, emergencyTarget, remainingReserves, monthsOfCover, recoveryMonths, explanation }
}
