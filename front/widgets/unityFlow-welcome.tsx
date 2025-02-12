"use client"

export const UnityFlowWelcome = () => {
    return (
      <div className="relative bg-gradient-to-r from-gray-200/85 to-gray-300/95 text-white text-center py-8 px-5 rounded-3xl shadow-lg w-full max-w-5xl mx-auto">
        
        {/* Додаємо фон для кращого контрасту */}
        <div className="absolute inset-0 bg-black bg-opacity-5 rounded-3xl"></div>
  
        {/* Контент */}
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold tracking-wide drop-shadow-md">
            🌍 Welcome to <span className="text-gray-500">UnityFlow</span>
          </h1>
          
          <p className="mt-4 text-lg text-white font-medium max-w-3xl mx-auto leading-relaxed">
            The future of <span className="font-semibold text-gray-500">decentralized crowdfunding</span> {" "} 
             and <span className="font-semibold text-gray-500">community-driven investments</span>. 
            Launch campaigns, invest in innovative projects, and shape the ecosystem through governance.
          </p>
        </div>
        
      </div>
    );
  };
  