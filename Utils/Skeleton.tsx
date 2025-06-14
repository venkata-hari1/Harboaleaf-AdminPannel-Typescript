// components/SkeletonRows.tsx
import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';



const SkeletonRows: React.FC = () => {
  return (
    <>
      {[...Array(4)].map((_, index) => (
        <tr key={index}>
          <td><Skeleton baseColor="#202020" highlightColor="#444" /></td>
          <td><Skeleton width={100} baseColor="#202020" highlightColor="#444" /></td>
          <td><Skeleton width={120} baseColor="#202020" highlightColor="#444" /></td>
          <td><Skeleton width={120} baseColor="#202020" highlightColor="#444" /></td>
          <td><Skeleton width={120} baseColor="#202020" highlightColor="#444" /></td>
          <td><Skeleton width={80} baseColor="#202020" highlightColor="#444" /></td>
          <td><Skeleton width={100} baseColor="#202020" highlightColor="#444" /></td>
        </tr>
      ))}
    </>
  );
};

export default SkeletonRows;
