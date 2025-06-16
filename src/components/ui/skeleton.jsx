import { cn } from "@/lib/utils";

export function Skeleton(props) {
  const { className, ...rest } = props;

  return (
    <div
      className={`animate-pulse rounded-md bg-muted ${className || ""}`}
      {...rest}
    />
  );
}
