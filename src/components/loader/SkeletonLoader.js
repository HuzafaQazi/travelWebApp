import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const SkeletonLoader = ({ width = 300, height = 100 }) => {
  return (
    <div>
      <Skeleton height={height} width={width} />
      <Skeleton count={5} />
    </div>
  );
};

export default SkeletonLoader;
