import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ChartData {
  year: number;
  balance: number;
  interest: number;
  deposits: number;
}

interface CompoundInterestChartProps {
  data: ChartData[];
}

export const CompoundInterestChart: React.FC<CompoundInterestChartProps> = ({ data }) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const chartData = {
    labels: data.map(item => `Año ${item.year}`),
    datasets: [
      {
        label: 'Valor Total',
        data: data.map(item => item.balance),
        borderColor: 'hsl(142, 75%, 36%)',
        backgroundColor: 'hsl(142, 75%, 36%, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: 'hsl(142, 75%, 36%)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Depósitos Acumulados',
        data: data.map(item => item.deposits),
        borderColor: 'hsl(221, 83%, 53%)',
        backgroundColor: 'hsl(221, 83%, 53%, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: 'hsl(221, 83%, 53%)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        borderDash: [5, 5],
        fill: false,
        tension: 0.4,
      },
      {
        label: 'Intereses Ganados',
        data: data.map(item => item.interest),
        borderColor: 'hsl(38, 92%, 50%)',
        backgroundColor: 'hsl(38, 92%, 50%, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: 'hsl(38, 92%, 50%)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        fill: false,
        tension: 0.4,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: 500,
          },
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: 'hsl(220, 20%, 15%)',
        bodyColor: 'hsl(220, 20%, 15%)',
        borderColor: 'hsl(220, 13%, 91%)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold' as const,
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = formatCurrency(context.parsed.y);
            return `${label}: ${value}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Años',
          font: {
            size: 14,
            weight: 'bold' as const,
          },
          color: 'hsl(220, 10%, 46%)',
        },
        grid: {
          color: 'hsl(220, 13%, 91%)',
          lineWidth: 1,
        },
        ticks: {
          color: 'hsl(220, 10%, 46%)',
          font: {
            size: 12,
          },
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Cantidad (€)',
          font: {
            size: 14,
            weight: 'bold' as const,
          },
          color: 'hsl(220, 10%, 46%)',
        },
        grid: {
          color: 'hsl(220, 13%, 91%)',
          lineWidth: 1,
        },
        ticks: {
          color: 'hsl(220, 10%, 46%)',
          font: {
            size: 12,
          },
          callback: function(value) {
            return formatCurrency(value as number);
          },
        },
      },
    },
    elements: {
      point: {
        hoverRadius: 8,
      },
    },
  };

  return (
    <div className="h-96 w-full">
      <Line data={chartData} options={options} />
    </div>
  );
};