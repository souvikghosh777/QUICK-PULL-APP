import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const ProgressChart = ({ boards }) => {
  // Calculate overall progress data
  const totalTasks = boards.reduce((sum, board) => sum + (board.stats?.total || 0), 0);
  const completedTasks = boards.reduce((sum, board) => sum + (board.stats?.done || 0), 0);
  const inProgressTasks = boards.reduce((sum, board) => sum + (board.stats?.inprogress || 0), 0);
  const todoTasks = boards.reduce((sum, board) => sum + (board.stats?.todo || 0), 0);

  // Doughnut chart data for task status distribution
  const doughnutData = {
    labels: ['Completed', 'In Progress', 'To Do'],
    datasets: [
      {
        data: [completedTasks, inProgressTasks, todoTasks],
        backgroundColor: ['#10B981', '#3B82F6', '#F59E0B'],
        borderColor: ['#059669', '#2563EB', '#D97706'],
        borderWidth: 2,
      },
    ],
  };

  // Bar chart data for board-wise progress
  const barData = {
    labels: boards.slice(0, 6).map(board => board.title.length > 10 ? board.title.substring(0, 10) + '...' : board.title),
    datasets: [
      {
        label: 'Completed',
        data: boards.slice(0, 6).map(board => board.stats?.done || 0),
        backgroundColor: '#10B981',
      },
      {
        label: 'In Progress',
        data: boards.slice(0, 6).map(board => board.stats?.inprogress || 0),
        backgroundColor: '#3B82F6',
      },
      {
        label: 'To Do',
        data: boards.slice(0, 6).map(board => board.stats?.todo || 0),
        backgroundColor: '#F59E0B',
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const percentage = totalTasks > 0 ? ((context.parsed / totalTasks) * 100).toFixed(1) : 0;
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          },
        },
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        beginAtZero: true,
      },
    },
  };

  if (totalTasks === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No task data to display</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Overall Progress Doughnut Chart */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          Overall Task Distribution
        </h3>
        <div className="h-64">
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
        <div className="mt-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{totalTasks}</p>
          <p className="text-sm text-gray-600">Total Tasks</p>
          <p className="text-lg font-semibold text-green-600 mt-2">
            {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}% Complete
          </p>
        </div>
      </div>

      {/* Board-wise Progress Bar Chart */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          Progress by Board
        </h3>
        <div className="h-64">
          <Bar data={barData} options={barOptions} />
        </div>
        {boards.length > 6 && (
          <p className="text-sm text-gray-500 text-center mt-2">
            Showing top 6 boards
          </p>
        )}
      </div>
    </div>
  );
};

export default ProgressChart;