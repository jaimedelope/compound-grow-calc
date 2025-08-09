import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Calculator, Euro, TrendingDown, TrendingUp } from 'lucide-react';
import { NetSalaryChart } from './NetSalaryChart';

interface SalaryParams {
  grossSalary: number;
  payFrequency: 'monthly' | 'biweekly' | 'weekly' | 'daily';
  region: string;
  maritalStatus: 'single' | 'married_no_income' | 'married_with_income';
  childrenUnder25: number;
  childrenOver25: number;
  workerDisability: number;
  familyDisability: number;
}

interface SalaryResult {
  grossAnnual: number;
  grossPeriodic: number;
  socialSecurityContribution: number;
  employerSocialSecurity: number;
  meiWorker: number;
  meiEmployer: number;
  solidarityQuotaWorker: number;
  solidarityQuotaEmployer: number;
  irpfRetention: number;
  netAnnual: number;
  netPeriodic: number;
  periodName: string;
  periodsPerYear: number;
}

const SPANISH_REGIONS = [
  { code: 'AN', name: 'Andalucía' },
  { code: 'AR', name: 'Aragón' },
  { code: 'AS', name: 'Asturias' },
  { code: 'IB', name: 'Islas Baleares' },
  { code: 'CN', name: 'Canarias' },
  { code: 'CB', name: 'Cantabria' },
  { code: 'CL', name: 'Castilla y León' },
  { code: 'CM', name: 'Castilla-La Mancha' },
  { code: 'CT', name: 'Cataluña' },
  { code: 'VC', name: 'Comunidad Valenciana' },
  { code: 'EX', name: 'Extremadura' },
  { code: 'GA', name: 'Galicia' },
  { code: 'MD', name: 'Madrid' },
  { code: 'MC', name: 'Murcia' },
  { code: 'NV', name: 'Navarra' },
  { code: 'PV', name: 'País Vasco' },
  { code: 'LR', name: 'La Rioja' },
  { code: 'CE', name: 'Ceuta' },
  { code: 'ML', name: 'Melilla' }
];

const IRPF_BRACKETS = [
  { min: 0, max: 12450, rate: 0.19 },
  { min: 12450, max: 20200, rate: 0.24 },
  { min: 20200, max: 35200, rate: 0.30 },
  { min: 35200, max: 60000, rate: 0.37 },
  { min: 60000, max: 300000, rate: 0.47 },
  { min: 300000, max: Infinity, rate: 0.47 }
];

export const NetSalaryCalculator: React.FC = () => {
  const [params, setParams] = useState<SalaryParams>({
    grossSalary: 35000,
    payFrequency: 'monthly',
    region: 'MD',
    maritalStatus: 'single',
    childrenUnder25: 0,
    childrenOver25: 0,
    workerDisability: 0,
    familyDisability: 0
  });

  const [result, setResult] = useState<SalaryResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateInputs = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (params.grossSalary <= 0) {
      newErrors.grossSalary = 'El salario bruto debe ser mayor que 0';
    }
    if (params.grossSalary > 1000000) {
      newErrors.grossSalary = 'El salario bruto no puede exceder 1.000.000€';
    }
    if (params.childrenUnder25 < 0) {
      newErrors.childrenUnder25 = 'Número de hijos no puede ser negativo';
    }
    if (params.childrenOver25 < 0) {
      newErrors.childrenOver25 = 'Número de hijos no puede ser negativo';
    }
    if (params.workerDisability < 0 || params.workerDisability > 100) {
      newErrors.workerDisability = 'El porcentaje de discapacidad debe estar entre 0 y 100';
    }
    if (params.familyDisability < 0 || params.familyDisability > 100) {
      newErrors.familyDisability = 'El porcentaje de discapacidad debe estar entre 0 y 100';
    }
    if (!params.region) {
      newErrors.region = 'Debe seleccionar una comunidad autónoma';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateSocialSecurity = (grossSalary: number): number => {
    // Cotización a la Seguridad Social 2024 - Trabajador
    const ssBase = Math.min(grossSalary, 53760); // Base máxima de cotización 2024
    const commonContingencies = ssBase * 0.047; // 4.7%
    const unemployment = ssBase * 0.0155; // 1.55%
    const training = ssBase * 0.001; // 0.1%
    
    return commonContingencies + unemployment + training;
  };

  const calculateEmployerSocialSecurity = (grossSalary: number): number => {
    // Cotización a la Seguridad Social 2024 - Empresa
    const ssBase = Math.min(grossSalary, 53760); // Base máxima de cotización 2024
    const commonContingencies = ssBase * 0.236; // 23.6%
    const unemployment = ssBase * 0.055; // 5.5%
    const training = ssBase * 0.006; // 0.6%
    const workplaceAccidents = ssBase * 0.0065; // 0.65% (promedio)
    const fogasa = ssBase * 0.002; // 0.2%
    
    return commonContingencies + unemployment + training + workplaceAccidents + fogasa;
  };

  const calculateIRPF = (grossSalary: number, socialSecurity: number, params: SalaryParams): number => {
    const taxableIncome = grossSalary - socialSecurity;
    
    // Mínimo personal y familiar
    let personalMinimum = 5550; // Mínimo personal 2024
    
    // Deducciones por estado civil
    if (params.maritalStatus === 'married_no_income') {
      personalMinimum += 3400; // Mínimo del cónyuge sin ingresos
    }
    
    // Deducciones por hijos
    const totalChildren = params.childrenUnder25 + params.childrenOver25;
    if (totalChildren >= 1) personalMinimum += 2400;
    if (totalChildren >= 2) personalMinimum += 2700;
    if (totalChildren >= 3) personalMinimum += 4000;
    if (totalChildren >= 4) personalMinimum += (totalChildren - 3) * 4500;
    
    // Deducciones por discapacidad
    if (params.workerDisability >= 33) {
      personalMinimum += params.workerDisability >= 65 ? 9000 : 3000;
    }
    if (params.familyDisability >= 33) {
      personalMinimum += params.familyDisability >= 65 ? 9000 : 3000;
    }
    
    const taxableBase = Math.max(0, taxableIncome - personalMinimum);
    
    // Aplicar tramos del IRPF
    let tax = 0;
    for (const bracket of IRPF_BRACKETS) {
      if (taxableBase > bracket.min) {
        const taxableInBracket = Math.min(taxableBase, bracket.max) - bracket.min;
        tax += taxableInBracket * bracket.rate;
      }
    }
    
    // Ajuste por región (simplificado)
    const regionMultiplier = getRegionMultiplier(params.region);
    
    return tax * regionMultiplier;
  };

  const getRegionMultiplier = (region: string): number => {
    // Multiplicadores simplificados por región
    const multipliers: Record<string, number> = {
      'MD': 1.0,   // Madrid (referencia)
      'CT': 1.05,  // Cataluña
      'AN': 0.95,  // Andalucía
      'VC': 1.02,  // Valencia
      'PV': 0.90,  // País Vasco
      'NV': 0.88,  // Navarra
      'CN': 0.92   // Canarias
    };
    return multipliers[region] || 1.0;
  };

  const getPeriodsPerYear = (frequency: string): number => {
    switch (frequency) {
      case 'monthly': return 12;
      case 'biweekly': return 26;
      case 'weekly': return 52;
      case 'daily': return 365;
      default: return 12;
    }
  };

  const getPeriodName = (frequency: string): string => {
    switch (frequency) {
      case 'monthly': return 'mes';
      case 'biweekly': return 'quincena';
      case 'weekly': return 'semana';
      case 'daily': return 'día';
      default: return 'mes';
    }
  };

  // Mecanismo de Equidad Intergeneracional (MEI) - 2025
  const calculateMEI = (grossSalary: number) => {
    const ssBase = Math.min(grossSalary, 53760); // Base máxima de cotización 2024
    const meiRate = 0.008; // 0.8% total
    const meiEmployer = ssBase * 0.0067; // 0.67% empresa
    const meiWorker = ssBase * 0.0013; // 0.13% trabajador
    
    return { meiEmployer, meiWorker };
  };

  // Cuota de Solidaridad - 2025
  const calculateSolidarityQuota = (grossSalary: number) => {
    const maxBase2025 = 58908; // Base máxima 2025: 4.909€/mes * 12
    
    if (grossSalary <= maxBase2025) {
      return { solidarityQuotaEmployer: 0, solidarityQuotaWorker: 0 };
    }
    
    const excessSalary = grossSalary - maxBase2025;
    const monthlyExcess = excessSalary / 12;
    
    let totalQuota = 0;
    
    // Primer tramo: hasta 10% por encima (hasta 490,90€/mes excess)
    const firstBracketLimit = (4909 * 0.1) * 12; // 5.890,8€ anuales
    if (excessSalary > 0) {
      const firstBracketAmount = Math.min(excessSalary, firstBracketLimit);
      totalQuota += firstBracketAmount * 0.0092; // 0.92%
    }
    
    // Segundo tramo: entre 10% y 50% por encima (hasta 1.963,60€/mes excess)
    const secondBracketLimit = (4909 * 0.4) * 12; // 23.563,2€ anuales adicionales
    if (excessSalary > firstBracketLimit) {
      const secondBracketAmount = Math.min(excessSalary - firstBracketLimit, secondBracketLimit);
      totalQuota += secondBracketAmount * 0.01; // 1%
    }
    
    // Tercer tramo: más del 50% por encima
    if (excessSalary > firstBracketLimit + secondBracketLimit) {
      const thirdBracketAmount = excessSalary - firstBracketLimit - secondBracketLimit;
      totalQuota += thirdBracketAmount * 0.0117; // 1.17%
    }
    
    // Distribución: 83.39% empresa, 16.61% trabajador
    const solidarityQuotaEmployer = totalQuota * 0.8339;
    const solidarityQuotaWorker = totalQuota * 0.1661;
    
    return { solidarityQuotaEmployer, solidarityQuotaWorker };
  };

  const calculateSalary = () => {
    if (!validateInputs()) return;

    const grossAnnual = params.grossSalary;
    const socialSecurity = calculateSocialSecurity(grossAnnual);
    const employerSS = calculateEmployerSocialSecurity(grossAnnual);
    const { meiEmployer, meiWorker } = calculateMEI(grossAnnual);
    const { solidarityQuotaEmployer, solidarityQuotaWorker } = calculateSolidarityQuota(grossAnnual);
    
    // IRPF se calcula sobre el salario bruto menos las cotizaciones del trabajador (incluyendo MEI)
    const totalWorkerContributions = socialSecurity + meiWorker + solidarityQuotaWorker;
    const irpf = calculateIRPF(grossAnnual, totalWorkerContributions, params);
    const netAnnual = grossAnnual - totalWorkerContributions - irpf;
    
    const periodsPerYear = getPeriodsPerYear(params.payFrequency);
    const grossPeriodic = grossAnnual / periodsPerYear;
    const netPeriodic = netAnnual / periodsPerYear;
    const periodName = getPeriodName(params.payFrequency);

    const calculationResult: SalaryResult = {
      grossAnnual,
      grossPeriodic,
      socialSecurityContribution: socialSecurity,
      employerSocialSecurity: employerSS,
      meiWorker,
      meiEmployer,
      solidarityQuotaWorker,
      solidarityQuotaEmployer,
      irpfRetention: irpf,
      netAnnual,
      netPeriodic,
      periodName,
      periodsPerYear
    };

    setResult(calculationResult);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (value: number): string => {
    return `${value}%`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/50 to-accent/30 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-gradient-to-br from-primary to-success rounded-full shadow-elegant">
              <Calculator className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
            Calculadora de Salario Neto
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Calcula tu salario neto anual y por período en España, incluyendo deducciones de Seguridad Social e IRPF
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card className="backdrop-blur-sm border-0 shadow-elegant bg-gradient-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Euro className="h-6 w-6 text-primary" />
                Parámetros del Salario
              </CardTitle>
              <CardDescription>
                Introduce tus datos para calcular el salario neto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="grossSalary">Salario Bruto Anual (€)</Label>
                  <Input
                    id="grossSalary"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1000000"
                    value={params.grossSalary}
                    onChange={(e) => setParams(prev => ({ ...prev, grossSalary: parseFloat(e.target.value) || 0 }))}
                    className={errors.grossSalary ? 'border-destructive' : ''}
                  />
                  {errors.grossSalary && (
                    <p className="text-sm text-destructive">{errors.grossSalary}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payFrequency">Periodicidad del Cobro</Label>
                  <Select 
                    value={params.payFrequency} 
                    onValueChange={(value: 'monthly' | 'biweekly' | 'weekly' | 'daily') => 
                      setParams(prev => ({ ...prev, payFrequency: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Mensual</SelectItem>
                      <SelectItem value="biweekly">Quincenal</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="daily">Diario</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region">Comunidad Autónoma</Label>
                  <Select 
                    value={params.region} 
                    onValueChange={(value) => setParams(prev => ({ ...prev, region: value }))}
                  >
                    <SelectTrigger className={errors.region ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Selecciona tu CCAA" />
                    </SelectTrigger>
                    <SelectContent>
                      {SPANISH_REGIONS.map(region => (
                        <SelectItem key={region.code} value={region.code}>
                          {region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.region && (
                    <p className="text-sm text-destructive">{errors.region}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maritalStatus">Estado Civil</Label>
                  <Select 
                    value={params.maritalStatus} 
                    onValueChange={(value: 'single' | 'married_no_income' | 'married_with_income') => 
                      setParams(prev => ({ ...prev, maritalStatus: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Soltero/a</SelectItem>
                      <SelectItem value="married_no_income">Casado/a (cónyuge sin ingresos)</SelectItem>
                      <SelectItem value="married_with_income">Casado/a (cónyuge con ingresos)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="childrenUnder25">Hijos menores de 25 años</Label>
                  <Input
                    id="childrenUnder25"
                    type="number"
                    min="0"
                    max="20"
                    value={params.childrenUnder25}
                    onChange={(e) => setParams(prev => ({ ...prev, childrenUnder25: parseInt(e.target.value) || 0 }))}
                    className={errors.childrenUnder25 ? 'border-destructive' : ''}
                  />
                  {errors.childrenUnder25 && (
                    <p className="text-sm text-destructive">{errors.childrenUnder25}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="childrenOver25">Hijos mayores de 25 años</Label>
                  <Input
                    id="childrenOver25"
                    type="number"
                    min="0"
                    max="20"
                    value={params.childrenOver25}
                    onChange={(e) => setParams(prev => ({ ...prev, childrenOver25: parseInt(e.target.value) || 0 }))}
                    className={errors.childrenOver25 ? 'border-destructive' : ''}
                  />
                  {errors.childrenOver25 && (
                    <p className="text-sm text-destructive">{errors.childrenOver25}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workerDisability">Discapacidad del trabajador (%)</Label>
                  <Input
                    id="workerDisability"
                    type="number"
                    min="0"
                    max="100"
                    value={params.workerDisability}
                    onChange={(e) => setParams(prev => ({ ...prev, workerDisability: parseInt(e.target.value) || 0 }))}
                    className={errors.workerDisability ? 'border-destructive' : ''}
                  />
                  {errors.workerDisability && (
                    <p className="text-sm text-destructive">{errors.workerDisability}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="familyDisability">Discapacidad familiar a cargo (%)</Label>
                  <Input
                    id="familyDisability"
                    type="number"
                    min="0"
                    max="100"
                    value={params.familyDisability}
                    onChange={(e) => setParams(prev => ({ ...prev, familyDisability: parseInt(e.target.value) || 0 }))}
                    className={errors.familyDisability ? 'border-destructive' : ''}
                  />
                  {errors.familyDisability && (
                    <p className="text-sm text-destructive">{errors.familyDisability}</p>
                  )}
                </div>
              </div>

              <Separator />
              
              <Button 
                onClick={calculateSalary} 
                className="w-full h-12 text-lg bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-elegant"
                size="lg"
              >
                <Calculator className="mr-2 h-5 w-5" />
                Calcular Salario Neto
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <div className="space-y-6">
              <Card className="backdrop-blur-sm border-0 shadow-elegant bg-gradient-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <TrendingUp className="h-6 w-6 text-success" />
                    Resultados del Cálculo
                  </CardTitle>
                  <CardDescription>
                    Desglose completo de tu salario neto
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-primary">Salario Bruto</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Bruto anual:</span>
                          <span className="font-semibold">{formatCurrency(result.grossAnnual)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Bruto por {result.periodName}:</span>
                          <span className="font-semibold">{formatCurrency(result.grossPeriodic)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-destructive">Deducciones del Trabajador</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Seguridad Social:</span>
                          <span className="font-semibold text-destructive">-{formatCurrency(result.socialSecurityContribution)}</span>
                        </div>
                        {result.meiWorker > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">MEI (Trabajador):</span>
                            <span className="font-semibold text-destructive">-{formatCurrency(result.meiWorker)}</span>
                          </div>
                        )}
                        {result.solidarityQuotaWorker > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Cuota Solidaridad:</span>
                            <span className="font-semibold text-destructive">-{formatCurrency(result.solidarityQuotaWorker)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Retención IRPF:</span>
                          <span className="font-semibold text-destructive">-{formatCurrency(result.irpfRetention)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="bg-gradient-success p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-success-foreground mb-4">Salario Neto</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-success-foreground/80 text-sm">Neto anual</p>
                        <p className="text-2xl font-bold text-success-foreground">{formatCurrency(result.netAnnual)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-success-foreground/80 text-sm">Neto por {result.periodName}</p>
                        <p className="text-2xl font-bold text-success-foreground">{formatCurrency(result.netPeriodic)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• Cotización SS: {((result.socialSecurityContribution / result.grossAnnual) * 100).toFixed(2)}%</p>
                    {result.meiWorker > 0 && (
                      <p>• MEI Trabajador: {((result.meiWorker / result.grossAnnual) * 100).toFixed(2)}%</p>
                    )}
                    {result.solidarityQuotaWorker > 0 && (
                      <p>• Cuota Solidaridad: {((result.solidarityQuotaWorker / result.grossAnnual) * 100).toFixed(2)}%</p>
                    )}
                    <p>• Retención IRPF: {((result.irpfRetention / result.grossAnnual) * 100).toFixed(2)}%</p>
                    <p>• Total deducciones: {(((result.socialSecurityContribution + result.meiWorker + result.solidarityQuotaWorker + result.irpfRetention) / result.grossAnnual) * 100).toFixed(2)}%</p>
                  </div>

                  {/* Coste para la empresa */}
                  <Separator />
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Coste Total para la Empresa</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Salario bruto:</span>
                        <span>{formatCurrency(result.grossAnnual)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SS Empresa:</span>
                        <span>{formatCurrency(result.employerSocialSecurity)}</span>
                      </div>
                      {result.meiEmployer > 0 && (
                        <div className="flex justify-between">
                          <span>MEI Empresa:</span>
                          <span>{formatCurrency(result.meiEmployer)}</span>
                        </div>
                      )}
                      {result.solidarityQuotaEmployer > 0 && (
                        <div className="flex justify-between">
                          <span>Cuota Solidaridad Empresa:</span>
                          <span>{formatCurrency(result.solidarityQuotaEmployer)}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between font-semibold">
                        <span>Total coste:</span>
                        <span>{formatCurrency(result.grossAnnual + result.employerSocialSecurity + result.meiEmployer + result.solidarityQuotaEmployer)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Chart */}
              <NetSalaryChart result={result} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};