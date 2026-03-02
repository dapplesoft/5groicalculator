'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from 'recharts';
import {
  Wifi, TrendingUp, DollarSign, Clock, Zap, Building2,
  ChevronDown, Download, RefreshCw, ArrowRight, CheckCircle2,
  Activity, Globe, Layers, AlertCircle,
} from 'lucide-react';
import { calculateROI, getIndustryDefaults, formatCurrency, CalculatorInputs, ROIResults } from '@/lib/calculations';

const INDUSTRIES = ['Manufacturing','Healthcare','Retail','Logistics','Smart City','Media/Entertainment','Finance','Other'];

const DEFAULT_INPUTS: CalculatorInputs = {
  industry: 'Manufacturing',
  employees: 500,
  annualRevenue: 50_000_000,
  numSites: 3,
  monthlyNetworkCost: 15_000,
  annualDowntimeHours: 120,
  hourlyDowntimeCost: 5_000,
  iotDevices: 200,
  implementationCost: 500_000,
  annualMaintenanceCost: 80_000,
  timelineMonths: 6,
  productivityGain: 22,
  downtimeReduction: 45,
  iotEfficiencyGain: 30,
  newRevenueOpportunity: 12,
};

const PIE_COLORS = ['#6366f1', '#34d399', '#f59e0b', '#f43f5e'];

function NumberInput({ label, value, onChange, prefix = '', suffix = '', min = 0, step = 1, hint }: any) {
  return (
    <div>
      <label className="label">{label}{hint && <span className="text-slate-600 ml-1">({hint})</span>}</label>
      <div className="relative flex items-center">
        {prefix && <span className="absolute left-3 text-slate-400 text-sm pointer-events-none">{prefix}</span>}
        <input
          type="number"
          className={`input-field ${prefix ? 'pl-7' : ''} ${suffix ? 'pr-10' : ''}`}
          value={value}
          min={min}
          step={step}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
        />
        {suffix && <span className="absolute right-3 text-slate-400 text-sm pointer-events-none">{suffix}</span>}
      </div>
    </div>
  );
}

function SliderInput({ label, value, onChange, min = 0, max = 100, step = 1, suffix = '%' }: any) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="label mb-0">{label}</label>
        <span className="text-indigo-400 font-semibold text-sm">{value}{suffix}</span>
      </div>
      <input
        type="range"
        className="w-full mt-1"
        min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
      />
      <div className="flex justify-between text-xs text-slate-600 mt-0.5">
        <span>{min}{suffix}</span><span>{max}{suffix}</span>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, icon: Icon, color = 'indigo', positive }: any) {
  const colors: Record<string, string> = {
    indigo: 'from-indigo-600/20 to-indigo-900/10 border-indigo-500/20 text-indigo-400',
    green:  'from-emerald-600/20 to-emerald-900/10 border-emerald-500/20 text-emerald-400',
    amber:  'from-amber-600/20 to-amber-900/10 border-amber-500/20 text-amber-400',
    rose:   'from-rose-600/20 to-rose-900/10 border-rose-500/20 text-rose-400',
  };
  return (
    <div className={`rounded-2xl p-4 bg-gradient-to-br ${colors[color]} border animate-slide-up`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className="opacity-70" />
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl p-3 border border-indigo-500/20 text-sm">
      <p className="font-medium text-white mb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="text-white font-medium">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function Calculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const [results, setResults] = useState<ROIResults | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'breakdown' | 'projection'>('overview');

  const set = useCallback((key: keyof CalculatorInputs) => (val: any) => {
    setInputs(prev => ({ ...prev, [key]: val }));
  }, []);

  const onIndustryChange = (industry: string) => {
    const defaults = getIndustryDefaults(industry);
    setInputs(prev => ({ ...prev, industry, ...defaults }));
  };

  useEffect(() => {
    setResults(calculateROI(inputs));
  }, [inputs]);

  const pieData = results ? [
    { name: 'Productivity', value: results.annualProductivityGain },
    { name: 'Downtime Savings', value: results.annualDowntimeSavings },
    { name: 'IoT Efficiency', value: results.annualIoTSavings },
    { name: 'New Revenue', value: results.annualNewRevenue },
  ] : [];

  const handleExportPDF = async () => {
    if (!results) return;
    const { jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(99, 102, 241);
    doc.text('5G ROI Calculator Report', 20, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleDateString()} | Industry: ${inputs.industry}`, 20, 30);

    autoTable(doc, {
      startY: 40,
      head: [['Metric', 'Value']],
      body: [
        ['Annual Productivity Gain', formatCurrency(results.annualProductivityGain)],
        ['Annual Downtime Savings', formatCurrency(results.annualDowntimeSavings)],
        ['IoT Efficiency Savings', formatCurrency(results.annualIoTSavings)],
        ['New Revenue Opportunity', formatCurrency(results.annualNewRevenue)],
        ['Total Annual Benefit', formatCurrency(results.totalAnnualBenefit)],
        ['Total 5G Investment (5yr)', formatCurrency(results.totalInvestment)],
        ['5-Year ROI', `${results.roi}%`],
        ['Payback Period', `${results.paybackMonths} months`],
        ['5-Year Net Benefit', formatCurrency(results.fiveYearNetBenefit)],
        ['Net Present Value', formatCurrency(results.netPresentValue)],
      ],
      headStyles: { fillColor: [99, 102, 241] },
    });

    doc.save('5g-roi-report.pdf');
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-[#2a2a45] sticky top-0 z-50" style={{ background: 'rgba(15,15,26,0.95)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Wifi size={16} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">5G ROI Calculator</div>
              <div className="text-xs text-slate-500">DappleSoft</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setInputs(DEFAULT_INPUTS)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-white/5"
            >
              <RefreshCw size={12} /> Reset
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition font-medium"
            >
              <Download size={12} /> Export PDF
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="relative overflow-hidden py-14 px-4">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
          <div className="absolute -top-20 right-20 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl" />
          <div className="absolute top-10 left-1/2 w-[800px] h-[2px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 text-xs font-medium bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-3 py-1.5 rounded-full mb-5">
            <Zap size={11} /> Enterprise 5G Financial Analysis
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Calculate Your{' '}
            <span className="gradient-text">5G Investment</span>{' '}
            Return
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Get accurate ROI projections, payback analysis, and 5-year financial forecasts
            tailored to your industry.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 xl:grid-cols-[480px_1fr] gap-6">

          {/* ── LEFT: Inputs ── */}
          <div className="space-y-5">

            {/* Company Profile */}
            <div className="card glow-border">
              <div className="flex items-center gap-2 mb-4">
                <Building2 size={16} className="text-indigo-400" />
                <h2 className="font-semibold text-white text-sm">Company Profile</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="label">Industry</label>
                  <div className="relative">
                    <select
                      className="input-field appearance-none pr-8"
                      value={inputs.industry}
                      onChange={e => onIndustryChange(e.target.value)}
                    >
                      {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <NumberInput label="Employees" value={inputs.employees} onChange={set('employees')} min={1} />
                  <NumberInput label="Annual Revenue" value={inputs.annualRevenue} onChange={set('annualRevenue')} prefix="$" step={100000} />
                </div>
                <NumberInput label="Number of Sites / Locations" value={inputs.numSites} onChange={set('numSites')} min={1} />
              </div>
            </div>

            {/* Current Network */}
            <div className="card glow-border">
              <div className="flex items-center gap-2 mb-4">
                <Globe size={16} className="text-amber-400" />
                <h2 className="font-semibold text-white text-sm">Current Network</h2>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <NumberInput label="Monthly Network Cost" value={inputs.monthlyNetworkCost} onChange={set('monthlyNetworkCost')} prefix="$" />
                  <NumberInput label="IoT / Connected Devices" value={inputs.iotDevices} onChange={set('iotDevices')} min={0} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <NumberInput label="Annual Downtime" value={inputs.annualDowntimeHours} onChange={set('annualDowntimeHours')} suffix="hrs" />
                  <NumberInput label="Cost Per Downtime Hour" value={inputs.hourlyDowntimeCost} onChange={set('hourlyDowntimeCost')} prefix="$" />
                </div>
              </div>
            </div>

            {/* 5G Investment */}
            <div className="card glow-border">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign size={16} className="text-emerald-400" />
                <h2 className="font-semibold text-white text-sm">5G Investment Plan</h2>
              </div>
              <div className="space-y-4">
                <NumberInput label="Implementation Cost" value={inputs.implementationCost} onChange={set('implementationCost')} prefix="$" step={10000} />
                <div className="grid grid-cols-2 gap-3">
                  <NumberInput label="Annual Maintenance" value={inputs.annualMaintenanceCost} onChange={set('annualMaintenanceCost')} prefix="$" />
                  <NumberInput label="Deployment Timeline" value={inputs.timelineMonths} onChange={set('timelineMonths')} suffix="mo" min={1} max={36} />
                </div>
              </div>
            </div>

            {/* Expected Improvements */}
            <div className="card glow-border">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={16} className="text-indigo-400" />
                <h2 className="font-semibold text-white text-sm">Expected 5G Improvements</h2>
              </div>
              <p className="text-xs text-slate-500 mb-4">Auto-set for your industry. Adjust as needed.</p>
              <div className="space-y-5">
                <SliderInput label="Productivity Gain" value={inputs.productivityGain} onChange={set('productivityGain')} min={0} max={50} />
                <SliderInput label="Downtime Reduction" value={inputs.downtimeReduction} onChange={set('downtimeReduction')} min={0} max={100} />
                <SliderInput label="IoT Efficiency Gain" value={inputs.iotEfficiencyGain} onChange={set('iotEfficiencyGain')} min={0} max={80} />
                <SliderInput label="New Revenue Opportunities" value={inputs.newRevenueOpportunity} onChange={set('newRevenueOpportunity')} min={0} max={40} />
              </div>
            </div>
          </div>

          {/* ── RIGHT: Results ── */}
          <div className="space-y-5">
            {results ? (
              <>
                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <MetricCard label="5-Year ROI" value={`${results.roi}%`} sub="Return on investment" icon={TrendingUp} color="indigo" />
                  <MetricCard label="Payback Period" value={results.paybackMonths > 100 ? 'N/A' : `${results.paybackMonths}mo`} sub="Break-even point" icon={Clock} color="amber" />
                  <MetricCard label="Annual Benefit" value={formatCurrency(results.totalAnnualBenefit)} sub="Total yearly gain" icon={DollarSign} color="green" />
                  <MetricCard label="5-Yr Net Benefit" value={formatCurrency(results.fiveYearNetBenefit)} sub="After all costs" icon={Activity} color={results.fiveYearNetBenefit > 0 ? 'green' : 'rose'} />
                </div>

                {/* Tabs */}
                <div className="card glow-border">
                  <div className="flex gap-1 mb-5 bg-[#0f0f1a] rounded-xl p-1">
                    {(['overview','breakdown','projection'] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2 text-xs font-medium rounded-lg capitalize transition-all ${
                          activeTab === tab
                            ? 'bg-indigo-600 text-white shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Overview Tab */}
                  {activeTab === 'overview' && (
                    <div className="space-y-5 animate-fade-in">
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: 'Productivity Gain', value: results.annualProductivityGain, color: '#6366f1' },
                          { label: 'Downtime Savings', value: results.annualDowntimeSavings, color: '#34d399' },
                          { label: 'IoT Efficiency', value: results.annualIoTSavings, color: '#f59e0b' },
                          { label: 'New Revenue', value: results.annualNewRevenue, color: '#f43f5e' },
                        ].map(item => (
                          <div key={item.label} className="bg-[#0f0f1a] rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                              <span className="text-xs text-slate-400">{item.label}</span>
                            </div>
                            <div className="text-xl font-bold text-white">{formatCurrency(item.value)}</div>
                            <div className="text-xs text-slate-600">per year</div>
                          </div>
                        ))}
                      </div>

                      <div>
                        <p className="text-xs text-slate-500 mb-3">Annual Benefit Distribution</p>
                        <div className="h-52">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                              </Pie>
                              <Tooltip content={<CustomTooltip />} />
                              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#2a2a45]">
                        <div className="text-center">
                          <div className="text-xs text-slate-500 mb-1">Total Investment (5yr)</div>
                          <div className="text-xl font-bold text-rose-400">{formatCurrency(results.totalInvestment)}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-slate-500 mb-1">Net Present Value</div>
                          <div className={`text-xl font-bold ${results.netPresentValue > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {formatCurrency(results.netPresentValue)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Breakdown Tab */}
                  {activeTab === 'breakdown' && (
                    <div className="animate-fade-in">
                      <p className="text-xs text-slate-500 mb-4">Annual benefit vs. cost breakdown per year</p>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={results.yearlyProjection} barGap={4}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e38" />
                            <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tickFormatter={v => formatCurrency(v)} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} width={70} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                            <Bar dataKey="benefit" name="Annual Benefit" fill="#6366f1" radius={[4,4,0,0]} />
                            <Bar dataKey="cost" name="Annual Cost" fill="#f43f5e" radius={[4,4,0,0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-4 space-y-2">
                        {results.yearlyProjection.map(y => (
                          <div key={y.year} className="flex items-center justify-between bg-[#0f0f1a] rounded-xl px-4 py-2.5">
                            <span className="text-xs font-medium text-slate-400">{y.year}</span>
                            <span className="text-xs text-emerald-400">+{formatCurrency(y.benefit)}</span>
                            <span className="text-xs text-rose-400">-{formatCurrency(y.cost)}</span>
                            <span className={`text-xs font-bold ${y.netValue > 0 ? 'text-white' : 'text-rose-400'}`}>
                              Net: {formatCurrency(y.netValue)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Projection Tab */}
                  {activeTab === 'projection' && (
                    <div className="animate-fade-in">
                      <p className="text-xs text-slate-500 mb-4">Cumulative 5-year benefit vs. investment curve</p>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={results.yearlyProjection}>
                            <defs>
                              <linearGradient id="benefitGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                              </linearGradient>
                              <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e38" />
                            <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tickFormatter={v => formatCurrency(v)} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} width={70} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                            <Area type="monotone" dataKey="cumulativeBenefit" name="Cumulative Benefit" stroke="#6366f1" strokeWidth={2} fill="url(#benefitGrad)" />
                            <Area type="monotone" dataKey="cumulativeCost" name="Cumulative Cost" stroke="#f43f5e" strokeWidth={2} fill="url(#costGrad)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      {results.paybackMonths <= 60 && (
                        <div className="mt-4 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                          <p className="text-xs text-emerald-300">
                            Break-even point at <span className="font-bold">{results.paybackMonths} months</span>. After that, every month generates pure net profit.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Investment Summary */}
                <div className="card glow-border">
                  <div className="flex items-center gap-2 mb-4">
                    <Layers size={16} className="text-indigo-400" />
                    <h3 className="font-semibold text-white text-sm">Investment Summary</h3>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { label: 'Implementation Cost', value: inputs.implementationCost, neg: true },
                      { label: 'Annual Maintenance (×5)', value: inputs.annualMaintenanceCost * 5, neg: true },
                      { label: 'Annual Productivity Gain', value: results.annualProductivityGain * 5 },
                      { label: 'Annual Downtime Savings', value: results.annualDowntimeSavings * 5 },
                      { label: 'IoT Efficiency Savings', value: results.annualIoTSavings * 5 },
                      { label: 'New Revenue (5yr)', value: results.annualNewRevenue * 5 },
                    ].map(row => (
                      <div key={row.label} className="flex items-center justify-between py-1.5 border-b border-[#1e1e38] last:border-0">
                        <span className="text-xs text-slate-400">{row.label}</span>
                        <span className={`text-sm font-semibold ${row.neg ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {row.neg ? '-' : '+'}{formatCurrency(row.value)}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between pt-3">
                      <span className="text-sm font-bold text-white">5-Year Net Benefit</span>
                      <span className={`text-lg font-bold ${results.fiveYearNetBenefit > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {results.fiveYearNetBenefit > 0 ? '+' : ''}{formatCurrency(results.fiveYearNetBenefit)}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-64 text-slate-500">
                <div className="text-center">
                  <Activity size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Fill in the details to see your ROI analysis</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#2a2a45] py-8 px-4 text-center">
        <p className="text-xs text-slate-600">
          © {new Date().getFullYear()} DappleSoft · 5G ROI Calculator ·
          <span className="ml-1">Results are estimates based on industry averages. Actual ROI may vary.</span>
        </p>
      </footer>
    </div>
  );
}
