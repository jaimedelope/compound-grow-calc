import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, PieChart } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

interface SalaryResult {
  grossAnnual: number;
  grossPeriodic: number;
  socialSecurityContribution: number;
  employerSocialSecurity: number;
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

  // Stacked Area Chart Data (Employer Cost Breakdown)
  const stackedData = {
    labels: ['0%', '25%', '50%', '75%', '100%'],
    datasets: [
      {
        label: 'SS Empresa',
        data: [result.employerSocialSecurity, result.employerSocialSecurity, result.employerSocialSecurity, result.employerSocialSecurity, result.employerSocialSecurity],
        backgroundColor: 'rgba(0, 184, 217, 0.6)',
        borderColor: '#00B8D9',
        borderWidth: 2,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 5,
      },
      {
        label: 'SS Trabajador',
        data: [result.socialSecurityContribution, result.socialSecurityContribution, result.socialSecurityContribution, result.socialSecurityContribution, result.socialSecurityContribution],
        backgroundColor: 'rgba(45, 156, 219, 0.6)',
        borderColor: '#2D9CDB',
        borderWidth: 2,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 5,
      },
      {
        label: 'IRPF',
        data: [result.irpfRetention, result.irpfRetention, result.irpfRetention, result.irpfRetention, result.irpfRetention],
        backgroundColor: 'rgba(123, 97, 255, 0.6)',
        borderColor: '#7B61FF',
        borderWidth: 2,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 5,
      },
      {
        label: 'Salario Neto',
        data: [result.netAnnual, result.netAnnual, result.netAnnual, result.netAnnual, result.netAnnual],
        backgroundColor: 'rgba(39, 174, 96, 0.6)',
        borderColor: '#27AE60',
        borderWidth: 2,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 5,
      }
    ]
  };

  const stackedOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Distribución',
          color: 'hsl(220, 10%, 46%)'
        },
        ticks: {
          color: 'hsl(220, 10%, 46%)'
        },
        grid: {
          color: 'hsl(220, 13%, 91%)'
        }
      },
      y: {
        stacked: true,
        title: {
          display: true,
          text: 'Euros (€)',
          color: 'hsl(220, 10%, 46%)'
        },
        ticks: {
          callback: function(value: any) {
            return formatCurrency(value);
          },
          color: 'hsl(220, 10%, 46%)'
        },
        grid: {
          color: 'hsl(220, 13%, 91%)'
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const total = result.employerSocialSecurity + result.socialSecurityContribution + result.irpfRetention + result.netAnnual;
            const percentage = ((context.parsed.y / total) * 100).toFixed(1);
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)} (${percentage}%)`;
          }
        }
      },
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
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Stacked Breakdown Chart */}
      <Card className="backdrop-blur-sm border-0 shadow-elegant bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Desglose del Coste vs. Neto
          </CardTitle>
          <CardDescription>
            Distribución del coste total para la empresa en capas apiladas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-40">
            <Line data={stackedData} options={stackedOptions} />
          </div>
        </CardContent>
      </Card>

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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Coste Total Empresa</p>
              <p className="text-lg font-bold text-primary">
                {formatCurrency(result.employerSocialSecurity + result.socialSecurityContribution + result.irpfRetention + result.netAnnual)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">SS Empresa</p>
              <p className="text-lg font-bold" style={{color: '#00B8D9'}}>
                {(result.employerSocialSecurity / result.grossAnnual * 100).toFixed(1)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">SS Trabajador</p>
              <p className="text-lg font-bold" style={{color: '#2D9CDB'}}>
                {(result.socialSecurityContribution / result.grossAnnual * 100).toFixed(1)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">IRPF</p>
              <p className="text-lg font-bold" style={{color: '#7B61FF'}}>
                {(result.irpfRetention / result.grossAnnual * 100).toFixed(1)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Salario Neto</p>
              <p className="text-lg font-bold" style={{color: '#27AE60'}}>
                {(result.netAnnual / result.grossAnnual * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};