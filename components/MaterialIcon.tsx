import React from "react";

interface MaterialIconProps {
  name: string;
  className?: string;
}

export default function MaterialIcon({ name, className = "" }: MaterialIconProps) {
  return (
    <span className={`material-icons ${className}`} style={{ fontStyle: "normal" }}>
      {name}
    </span>
  );
}
