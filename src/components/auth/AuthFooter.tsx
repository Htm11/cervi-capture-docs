
import React from 'react';

const AuthFooter = () => {
  return (
    <div className="text-center mt-6 space-y-4">
      <p className="text-sm text-cervi-700">
        By using this application, you agree to the terms of service and privacy policy.
      </p>
      
      <div className="flex flex-col items-center">
        <img 
          src="/lovable-uploads/4587ef05-43cd-4550-9707-d8df5017ab8a.png" 
          alt="MednTech Logo" 
          className="h-5 mb-1" 
        />
        <p className="text-xs text-gray-500">© {new Date().getFullYear()} MednTech. All rights reserved.</p>
      </div>
    </div>
  );
};

export default AuthFooter;
