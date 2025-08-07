import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Calculator, TrendingUp } from 'lucide-react';
import { CompoundInterestChart } from './CompoundInterestChart';

interface CalculationParams {
  initialBalance: number;
  periodicDeposit: number;
  frequency: number;
  depositTiming: 'beginning' | 'end';
  annualInterestRate: number;
  years: number;
}

interface CalculationResult {
  futureValue: number;
  totalDeposits: number;
  totalInterest: number;
  yearlyData: Array<{
    year: number;
    balance: number;
    interest: number;
    deposits: number;
  }>;
}

export const CompoundInterestCalculator: React.FC = () => {
  const [params, setParams] = useState<CalculationParams>({
    initialBalance: 10000,
    periodicDeposit: 500,
    frequency: 12,
    depositTiming: 'end',
    annualInterestRate: 7,
    years: 10
  });

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateInputs = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (params.initialBalance < 0) {
      newErrors.initialBalance = 'El balance inicial no puede ser negativo';
    }
    if (params.periodicDeposit < 0) {
      newErrors.periodicDeposit = 'El depósito periódico no puede ser negativo';
    }
    if (params.annualInterestRate < 0) {
      newErrors.annualInterestRate = 'La tasa de interés no puede ser negativa';
    }
    if (params.years <= 0) {
      newErrors.years = 'La duración debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateCompoundInterest = (): void => {
    if (!validateInputs()) return;

    const { initialBalance, periodicDeposit, frequency, depositTiming, annualInterestRate, years } = params;
    const r = annualInterestRate / 100;
    const n = frequency;
    const t = years;

    // Calcular valor futuro del balance inicial
    const fvPrincipal = initialBalance * Math.pow(1 + r/n, n*t);

    // Calcular valor futuro de los depósitos periódicos
    let fvDeposits = 0;
    if (periodicDeposit > 0 && r > 0) {
      fvDeposits = periodicDeposit * (Math.pow(1 + r/n, n*t) - 1) / (r/n);
      
      // Si es anualidad anticipada (depósitos al inicio)
      if (depositTiming === 'beginning') {
        fvDeposits *= (1 + r/n);
      }
    } else if (periodicDeposit > 0) {
      // Caso especial cuando r = 0
      fvDeposits = periodicDeposit * n * t;
    }

    const futureValue = fvPrincipal + fvDeposits;
    const totalDeposits = initialBalance + (periodicDeposit * n * t);
    const totalInterest = futureValue - totalDeposits;

    // Calcular datos año por año para el gráfico
    const yearlyData = [];
    for (let year = 0; year <= years; year++) {
      const yearlyPrincipal = initialBalance * Math.pow(1 + r/n, n*year);
      
      let yearlyDepositsValue = 0;
      if (periodicDeposit > 0 && year > 0) {
        if (r > 0) {
          yearlyDepositsValue = periodicDeposit * (Math.pow(1 + r/n, n*year) - 1) / (r/n);
          if (depositTiming === 'beginning') {
            yearlyDepositsValue *= (1 + r/n);
          }
        } else {
          yearlyDepositsValue = periodicDeposit * n * year;
        }
      }
      
      const balance = yearlyPrincipal + yearlyDepositsValue;
      const depositsToDate = initialBalance + (periodicDeposit * n * year);
      const interestEarned = balance - depositsToDate;

      yearlyData.push({
        year,
        balance,
        interest: interestEarned,
        deposits: depositsToDate
      });
    }

    setResult({
      futureValue,
      totalDeposits,
      totalInterest,
      yearlyData
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getFrequencyLabel = (freq: number): string => {
    switch (freq) {
      case 1: return 'Anual';
      case 2: return 'Semestral';
      case 4: return 'Trimestral';
      case 12: return 'Mensual';
      default: return `${freq} veces al año`;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Calculadora de Interés Compuesto
        </h1>
        <p className="text-muted-foreground text-lg">
          Calcula el crecimiento de tus inversiones con depósitos periódicos
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Parámetros de Cálculo
            </CardTitle>
            <CardDescription>
              Introduce los datos para calcular el interés compuesto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="initialBalance">Balance Inicial (€)</Label>
                <Input
                  id="initialBalance"
                  type="number"
                  min="0"
                  step="0.01"
                  value={params.initialBalance}
                  onChange={(e) => setParams(prev => ({ ...prev, initialBalance: parseFloat(e.target.value) || 0 }))}
                  className={errors.initialBalance ? 'border-destructive' : ''}
                />
                {errors.initialBalance && (
                  <p className="text-destructive text-sm">{errors.initialBalance}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="periodicDeposit">Depósito Periódico (€)</Label>
                <Input
                  id="periodicDeposit"
                  type="number"
                  min="0"
                  step="0.01"
                  value={params.periodicDeposit}
                  onChange={(e) => setParams(prev => ({ ...prev, periodicDeposit: parseFloat(e.target.value) || 0 }))}
                  className={errors.periodicDeposit ? 'border-destructive' : ''}
                />
                {errors.periodicDeposit && (
                  <p className="text-destructive text-sm">{errors.periodicDeposit}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="frequency">Frecuencia de Depósitos</Label>
                <Select
                  value={params.frequency.toString()}
                  onValueChange={(value) => setParams(prev => ({ ...prev, frequency: parseInt(value) }))}
                >
                  <SelectTrigger id="frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Anual (1 vez al año)</SelectItem>
                    <SelectItem value="2">Semestral (2 veces al año)</SelectItem>
                    <SelectItem value="4">Trimestral (4 veces al año)</SelectItem>
                    <SelectItem value="12">Mensual (12 veces al año)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="depositTiming">Momento del Depósito</Label>
                <Select
                  value={params.depositTiming}
                  onValueChange={(value: 'beginning' | 'end') => setParams(prev => ({ ...prev, depositTiming: value }))}
                >
                  <SelectTrigger id="depositTiming">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="end">Al final del período</SelectItem>
                    <SelectItem value="beginning">Al inicio del período</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="annualInterestRate">Tasa de Interés Anual (%)</Label>
                <Input
                  id="annualInterestRate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={params.annualInterestRate}
                  onChange={(e) => setParams(prev => ({ ...prev, annualInterestRate: parseFloat(e.target.value) || 0 }))}
                  className={errors.annualInterestRate ? 'border-destructive' : ''}
                />
                {errors.annualInterestRate && (
                  <p className="text-destructive text-sm">{errors.annualInterestRate}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="years">Duración (años)</Label>
                <Input
                  id="years"
                  type="number"
                  min="1"
                  step="1"
                  value={params.years}
                  onChange={(e) => setParams(prev => ({ ...prev, years: parseInt(e.target.value) || 1 }))}
                  className={errors.years ? 'border-destructive' : ''}
                />
                {errors.years && (
                  <p className="text-destructive text-sm">{errors.years}</p>
                )}
              </div>
            </div>

            <Button 
              onClick={calculateCompoundInterest}
              className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
              size="lg"
            >
              <Calculator className="mr-2 h-4 w-4" />
              Calcular Interés Compuesto
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                Resultados del Cálculo
              </CardTitle>
              <CardDescription>
                Resumen financiero después de {params.years} años
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gradient-card rounded-lg">
                  <span className="font-medium">Valor Futuro Total:</span>
                  <span className="text-2xl font-bold text-success">
                    {formatCurrency(result.futureValue)}
                  </span>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Balance inicial:</span>
                    <span className="font-medium">{formatCurrency(params.initialBalance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total de depósitos adicionales:</span>
                    <span className="font-medium">
                      {formatCurrency(result.totalDeposits - params.initialBalance)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total invertido:</span>
                    <span className="font-medium">{formatCurrency(result.totalDeposits)}</span>
                  </div>
                  <div className="flex justify-between text-success">
                    <span className="font-medium">Intereses ganados:</span>
                    <span className="font-bold">{formatCurrency(result.totalInterest)}</span>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Frecuencia:</p>
                    <p className="font-medium">{getFrequencyLabel(params.frequency)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Momento:</p>
                    <p className="font-medium">
                      {params.depositTiming === 'beginning' ? 'Al inicio' : 'Al final'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {result && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Evolución del Capital</CardTitle>
            <CardDescription>
              Gráfico de la evolución de tu inversión año tras año
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CompoundInterestChart data={result.yearlyData} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};