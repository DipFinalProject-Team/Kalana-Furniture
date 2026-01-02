import React from 'react';
import { dashboardStats } from '../data/mockData';

const Dashboard: React.FC = () => {
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen rounded-2xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
        <div className="text-sm text-gray-500">Welcome back, Admin</div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {dashboardStats.map((stat) => (
          <div key={stat.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
                <span className={`text-xs font-medium px-2 py-1 rounded-full mt-2 inline-block ${
                  stat.trend.startsWith('+') ? 'text-green-500 bg-green-50' : 'text-red-500 bg-red-50'
                }`}>
                  {stat.trend} from last month
                </span>
              </div>
              <div className={`p-3 rounded-full text-white ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
