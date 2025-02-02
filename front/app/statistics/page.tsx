"use client";

export default function StatisticsPage() {
    return (
      <div className="w-full h-screen flex flex-col items-center p-6 gap-6">
        <h1 className="text-2xl font-bold">Platform Statistics</h1>
        <p className="text-gray-600">Overview of campaign funding, user participation, and more.</p>
        
        <div className="w-full max-w-4xl grid grid-cols-2 gap-4">
          <div className="border p-4 rounded-lg text-center">
            <h2 className="text-lg font-semibold">Total Campaigns</h2>
            <p className="text-xl font-bold">0</p>
          </div>
          <div className="border p-4 rounded-lg text-center">
            <h2 className="text-lg font-semibold">Total Funds Raised</h2>
            <p className="text-xl font-bold">0 ETH</p>
          </div>
          <div className="border p-4 rounded-lg text-center">
            <h2 className="text-lg font-semibold">Active Users</h2>
            <p className="text-xl font-bold">0</p>
          </div>
          <div className="border p-4 rounded-lg text-center">
            <h2 className="text-lg font-semibold">Total Votes Cast</h2>
            <p className="text-xl font-bold">0</p>
          </div>
        </div>
      </div>
    );
  }