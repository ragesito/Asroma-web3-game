import { useId } from "react";

export default function SolanaIcon({ className = "w-4 h-4" }) {
  const gid = useId(); 
  const gradientId = `${gid}-solana-gradient`;

  return (
    <svg
      viewBox="0 0 397 311"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width="16"
      height="16"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00FFA3" />
          <stop offset="100%" stopColor="#DC1FFF" />
        </linearGradient>
      </defs> 

      <path
        d="M64.9 237.9c3.6-3.6 8.5-5.6 13.6-5.6h312.8c8.5 0 12.7 10.3 6.8 16.2l-62.9 62.9c-3.6 3.6-8.5 5.6-13.6 5.6H8.8c-8.5 0-12.7-10.3-6.8-16.2l62.9-62.9z"
        fill={`url(#${gradientId})`}
      />
      <path
        d="M64.9 5.6C68.5 2 73.4 0 78.5 0h312.8c8.5 0 12.7 10.3 6.8 16.2l-62.9 62.9c-3.6 3.6-8.5 5.6-13.6 5.6H8.8C.3 84.7-3.9 74.4 2 68.5L64.9 5.6z"
        fill={`url(#${gradientId})`}
      />
      <path
        d="M332.2 121.8c-3.6-3.6-8.5-5.6-13.6-5.6H5.8c-8.5 0-12.7 10.3-6.8 16.2l62.9 62.9c3.6 3.6 8.5 5.6 13.6 5.6h312.8c8.5 0 12.7-10.3 6.8-16.2l-62.9-62.9z"
        fill={`url(#${gradientId})`}
      />
    </svg>
  );
}
