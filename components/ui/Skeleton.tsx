export function Skeleton({ 
  className = "", 
  width = "w-full", 
  height = "h-4" 
}: {
  className?: string;
  width?: string;
  height?: string;
}) {
  return (
    <div className={`${width} ${height} bg-gray-300 dark:bg-gray-600 rounded animate-pulse ${className}`}></div>
  );
}
  
export function TableRowSkeleton({ cols = 4 }) {
  return (
    <tr className="border-b animate-pulse">
      {Array(cols).fill(0).map((_, i) => (
        <td key={i} className="border p-2">
          <Skeleton height="h-4" width={i === 0 ? "w-3/4" : "w-1/2"} />
        </td>
      ))}
    </tr>
  );
}
  
export function TableSkeleton({ rows = 3, cols = 4 }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700">
            {Array(cols).fill(0).map((_, i) => (
              <th key={i} className="border p-2 text-left">
                <Skeleton height="h-4" width="w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array(rows).fill(0).map((_, i) => (
            <TableRowSkeleton key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  );
}