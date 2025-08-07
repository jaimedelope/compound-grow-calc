import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, PieChart } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface SalaryResult {
  grossAnnual: number;
  grossPeriodic: number;
  socialSecurityContribution: number;
  irpfRetention: number;
  netAnnual: number;
  netPeriodic: number;
  periodName: string;
  periodsPerYear: number;
}

interface NetSalaryChartProps {
  result: SalaryResult;
}

export const NetSalaryChart: React.FC<NetSalaryChartProps> = ({ result }) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Bar Chart Data
  const barData = {
    labels: ['Salario Bruto', 'Seguridad Social', 'IRPF', 'Salario Neto'],
    datasets: [
      {
        label: 'Euros (€)',
        data: [
          result.grossAnnual,
          -result.socialSecurityContribution,
          -result.irpfRetention,
          result.netAnnual
        ],
        backgroundColor: [
          'hsl(142, 75%, 50%)',    // Verde para bruto
          'hsl(0, 84%, 60%)',      // Rojo para SS
          'hsl(38, 92%, 50%)',     // Naranja para IRPF
          'hsl(221, 83%, 53%)'     // Azul para neto
        ],
        borderColor: [
          'hsl(142, 75%, 40%)',
          'hsl(0, 84%, 50%)',
          'hsl(38, 92%, 40%)',
          'hsl(221, 83%, 43%)'
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Desglose del Salario Anual',
        font: {
          size: 16,
          weight: 'bold' as const
        },
        color: 'hsl(220, 20%, 15%)'
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = Math.abs(context.parsed.y);
            return `${context.label}: ${formatCurrency(value)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return formatCurrency(Math.abs(value));
          },
          color: 'hsl(220, 10%, 46%)'
        },
        grid: {
          color: 'hsl(220, 13%, 91%)'
        }
      },
      x: {
        ticks: {
          color: 'hsl(220, 10%, 46%)'
        },
        grid: {
          display: false
        }
      }
    }
  };

  // Doughnut Chart Data
  const doughnutData = {
    labels: ['Salario Neto', 'Seguridad Social', 'IRPF'],
    datasets: [
      {
        data: [
          result.netAnnual,
          result.socialSecurityContribution,
          result.irpfRetention
        ],
        backgroundColor: [
          'hsl(221, 83%, 53%)',    // Azul para neto
          'hsl(0, 84%, 60%)',      // Rojo para SS
          'hsl(38, 92%, 50%)'      // Naranja para IRPF
        ],
        borderColor: [
          'hsl(221, 83%, 43%)',
          'hsl(0, 84%, 50%)',
          'hsl(38, 92%, 40%)'
        ],
        borderWidth: 2,
        hoverOffset: 10
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          },
          color: 'hsl(220, 20%, 15%)'
        }
      },
      title: {
        display: true,
        text: 'Distribución del Salario Bruto',
        font: {
          size: 16,
          weight: 'bold' as const
        },
        color: 'hsl(220, 20%, 15%)'
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.parsed;
            const total = result.grossAnnual;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '60%'
  };

  return (
    <div className="space-y-6">
      {/* Bar Chart */}
      <Card className="backdrop-blur-sm border-0 shadow-elegant bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Desglose del Salario
          </CardTitle>
          <CardDescription>
            Comparación visual entre salario bruto, deducciones y salario neto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <Bar data={barData} options={barOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Doughnut Chart */}
      <Card className="backdrop-blur-sm border-0 shadow-elegant bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            Distribución de Deducciones
          </CardTitle>
          <CardDescription>
            Proporción de cada componente respecto al salario bruto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Card className="backdrop-blur-sm border-0 shadow-elegant bg-gradient-card">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Retención Total</p>
              <p className="text-lg font-bold text-destructive">
                {((result.socialSecurityContribution + result.irpfRetention) / result.grossAnnual * 100).toFixed(1)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Seguridad Social</p>
              <p className="text-lg font-bold text-warning">
                {(result.socialSecurityContribution / result.grossAnnual * 100).toFixed(1)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">IRPF</p>
              <p className="text-lg font-bold text-info">
                {(result.irpfRetention / result.grossAnnual * 100).toFixed(1)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Salario Neto</p>
              <p className="text-lg font-bold text-success">
                {(result.netAnnual / result.grossAnnual * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};