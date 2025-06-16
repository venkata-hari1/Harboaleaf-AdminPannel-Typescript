// components/SkeletonRows.tsx
import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

type SkeletonRowsProps = {
  count: number; // number of rows
};

const SkeletonRows: React.FC<SkeletonRowsProps> = ({ count }) => {
  return (
    <>
      {Array.from({ length: 4 }).map((_, rowIndex) => (
        <tr key={rowIndex}>
          {Array.from({ length: count }).map((_, colIndex) => (
            <td key={colIndex}>
              <Skeleton
                height={20}
                width={100}
                baseColor="#202020"
                highlightColor="#444"
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

export default SkeletonRows;
