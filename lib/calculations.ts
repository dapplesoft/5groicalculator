export interface CalculatorInputs {
  // Company
  industry: string;
  employees: number;
  annualRevenue: number;
  numSites: number;

  // Current Network
  monthlyNetworkCost: number;
  annualDowntimeHours: number;
  hourlyDowntimeCost: number;
  iotDevices: number;

  // 5G Investment
  implementationCost: number;
  annualMaintenanceCost: number;
  timelineMonths: number;

  // Expected Gains (%)
  productivityGain: number;
  downtimeReduction: number;
  iotEfficiencyGain: number;
  newRevenueOpportunity: number;
}

export interface ROIResults {
  // Annual Benefits
  annualProductivityGain: number;
  annualDowntimeSavings: number;
  annualIoTSavings: number;
  annualNewRevenue: number;
  totalAnnualBenefit: number;

  // Investment
  totalInvestment: number;
  annualTotalCost: number;

  // Key Metrics
  roi: number;
  paybackMonths: number;
  fiveYearNetBenefit: number;
  netPresentValue: number;

  // Yearly projection
  yearlyProjection: YearlyData[];
}

export interface YearlyData {
  year: string;
  benefit: number;
  cost: number;
  cumulativeBenefit: number;
  cumulativeCost: number;
  netValue: number;
}

const INDUSTRY_DEFAULTS: Record<string, Partial<CalculatorInputs>> = {
  Manufacturing:       { productivityGain: 22, downtimeReduction: 45, iotEfficiencyGain: 30, newRevenueOpportunity: 12 },
  Healthcare:          { productivityGain: 18, downtimeReduction: 60, iotEfficiencyGain: 25, newRevenueOpportunity: 10 },
  Retail:              { productivityGain: 15, downtimeReduction: 40, iotEfficiencyGain: 20, newRevenueOpportunity: 18 },
  Logistics:           { productivityGain: 20, downtimeReduction: 50, iotEfficiencyGain: 35, newRevenueOpportunity: 14 },
  'Smart City':        { productivityGain: 16, downtimeReduction: 55, iotEfficiencyGain: 40, newRevenueOpportunity: 8  },
  'Media/Entertainment':{ productivityGain: 12, downtimeReduction: 35, iotEfficiencyGain: 15, newRevenueOpportunity: 25 },
  Finance:             { productivityGain: 17, downtimeReduction: 65, iotEfficiencyGain: 22, newRevenueOpportunity: 15 },
  Other:               { productivityGain: 15, downtimeReduction: 40, iotEfficiencyGain: 20, newRevenueOpportunity: 10 },
};

export function getIndustryDefaults(industry: string): Partial<CalculatorInputs> {
  return INDUSTRY_DEFAULTS[industry] ?? INDUSTRY_DEFAULTS['Other'];
}

export function calculateROI(inputs: CalculatorInputs): ROIResults {
  const avgSalary = inputs.annualRevenue * 0.35 / Math.max(inputs.employees, 1);

  // Annual benefits
  const annualProductivityGain =
    inputs.employees * avgSalary * (inputs.productivityGain / 100);

  const annualDowntimeSavings =
    inputs.annualDowntimeHours * inputs.hourlyDowntimeCost * (inputs.downtimeReduction / 100);

  const iotHourlySavings = inputs.iotDevices * 0.5; // $0.50/device/hour baseline efficiency
  const annualIoTSavings = iotHourlySavings * 8760 * (inputs.iotEfficiencyGain / 100);

  const annualNewRevenue = inputs.annualRevenue * (inputs.newRevenueOpportunity / 100);

  const totalAnnualBenefit =
    annualProductivityGain + annualDowntimeSavings + annualIoTSavings + annualNewRevenue;

  // Costs
  const currentAnnualNetworkCost = inputs.monthlyNetworkCost * 12;
  const annualTotalCost = inputs.implementationCost + inputs.annualMaintenanceCost;
  const totalInvestment = inputs.implementationCost + inputs.annualMaintenanceCost * 5;

  // ROI
  const fiveYearBenefit = totalAnnualBenefit * 5;
  const roi = totalInvestment > 0 ? ((fiveYearBenefit - totalInvestment) / totalInvestment) * 100 : 0;

  // Payback period
  const netAnnualGain = totalAnnualBenefit - inputs.annualMaintenanceCost;
  const paybackMonths = netAnnualGain > 0
    ? (inputs.implementationCost / netAnnualGain) * 12
    : 999;

  // NPV (discount rate 8%)
  const discountRate = 0.08;
  let npv = -inputs.implementationCost;
  for (let y = 1; y <= 5; y++) {
    npv += (totalAnnualBenefit - inputs.annualMaintenanceCost) / Math.pow(1 + discountRate, y);
  }

  // 5-year projection
  const yearlyProjection: YearlyData[] = [];
  let cumBenefit = 0;
  let cumCost = inputs.implementationCost;

  for (let y = 1; y <= 5; y++) {
    cumBenefit += totalAnnualBenefit;
    if (y > 1) cumCost += inputs.annualMaintenanceCost;

    yearlyProjection.push({
      year: `Year ${y}`,
      benefit: Math.round(totalAnnualBenefit),
      cost: y === 1
        ? Math.round(inputs.implementationCost + inputs.annualMaintenanceCost)
        : Math.round(inputs.annualMaintenanceCost),
      cumulativeBenefit: Math.round(cumBenefit),
      cumulativeCost: Math.round(cumCost),
      netValue: Math.round(cumBenefit - cumCost),
    });
  }

  return {
    annualProductivityGain: Math.round(annualProductivityGain),
    annualDowntimeSavings: Math.round(annualDowntimeSavings),
    annualIoTSavings: Math.round(annualIoTSavings),
    annualNewRevenue: Math.round(annualNewRevenue),
    totalAnnualBenefit: Math.round(totalAnnualBenefit),
    totalInvestment: Math.round(totalInvestment),
    annualTotalCost: Math.round(annualTotalCost),
    roi: Math.round(roi * 10) / 10,
    paybackMonths: Math.round(paybackMonths),
    fiveYearNetBenefit: Math.round(fiveYearBenefit - totalInvestment),
    netPresentValue: Math.round(npv),
    yearlyProjection,
  };
}

export function formatCurrency(val: number): string {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}K`;
  return `$${val.toLocaleString()}`;
}

export function formatNumber(val: number): string {
  return val.toLocaleString();
}
