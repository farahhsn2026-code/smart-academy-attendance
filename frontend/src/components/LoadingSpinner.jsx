import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ message = 'Loading records...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <Loader2 size={36} className="text-blue-600 animate-spin mb-3" />
      <p className="text-sm font-medium text-gray-500">{message}</p>
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 6 }) => {
  return (
    <div className="w-full divide-y divide-gray-100 animate-pulse">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="flex items-center gap-4 py-4 px-6">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <div
              key={cIdx}
              className={`h-4 bg-gray-200 rounded-md ${
                cIdx === 0 ? 'w-24' : cIdx === 1 ? 'w-48' : 'w-28'
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default LoadingSpinner;
