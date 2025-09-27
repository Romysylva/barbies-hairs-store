import { Star } from "lucide-react";

type RatingProps = {
  value: number; // rating value from 0 to 5
  max?: number;
  onRate?: (value: number) => void;
  size?: number;
};

const Rating = ({ value, max = 5, onRate, size = 20 }: RatingProps) => {
  return (
    <div className="bhs:flex bhs:space-x-1">
      {Array.from({ length: max }, (_, i) => {
        const filled = i < value;
        return (
          <Star
            key={i}
            size={size}
            fill={filled ? "#facc15" : "none"}
            stroke="#facc15"
            className="cursor-pointer"
            onClick={() => onRate && onRate(i + 1)}
          />
        );
      })}
    </div>
  );
};

export default Rating;
