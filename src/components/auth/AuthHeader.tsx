
import React from 'react';

interface AuthHeaderProps {
  activeTab: string;
}

const AuthHeader = ({ activeTab }: AuthHeaderProps) => {
  return (
    <div className="text-center mb-8">
      <img 
        src="/lovable-uploads/77cb8974-0f23-401c-a300-d69d6f0523ce.png" 
        alt="Cervi Scanner Logo" 
        className="h-24 mx-auto mb-4"
      />
      <p className="text-cervi-800 text-lg font-medium">
        {activeTab === "login" 
          ? "Log in to start screening patients" 
          : "Create a new account to get started"}
      </p>
    </div>
  );
};

export default AuthHeader;
