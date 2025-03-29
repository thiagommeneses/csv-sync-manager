
const Logo = () => {
  return (
    <div className="flex items-center justify-center p-2">
      <div className="flex items-center space-x-2">
        <div className="h-8 w-8 rounded-md bg-csvManager flex items-center justify-center">
          <svg 
            viewBox="0 0 24 24" 
            width="18" 
            height="18" 
            stroke="currentColor" 
            strokeWidth="2" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="text-white"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </div>
        <div className="font-bold text-lg text-gray-800 dark:text-gray-200">CSV Sync</div>
      </div>
    </div>
  );
};

export default Logo;
