// components/ui/Badge.tsx
type BadgeProps = {
  text: string;
  status: "Pending" | "Delivered" | "Cancelled";
};

const Badge = ({ text, status }: BadgeProps) => {
  const colors = {
    Pending: "bhs:bg-yellow-500",
    Delivered: "bhs:bg-green-500",
    Cancelled: "bhs:bg-red-500",
  };

  return (
    <span
      className={`bhs:text-xs bhs:text-white bhs:px-2 bhs:py-1 bhs:rounded ${colors[status]}`}
    >
      {text}
    </span>
  );
};

export default Badge;

// usage

{
  /* <Badge text="Delivered" status="Delivered" />; */
}
