import * as React from "react";

interface FromToInfoProps {
  from?: string;
  to?: string;
}

export const FromToInfo: React.FC<FromToInfoProps> = ({ from, to }) => {
  if (!from && !to) return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        gap: "8px",
        marginBottom: "16px",
      }}
    >
      {from && (
        <div>
          <strong>From:</strong> {from}
        </div>
      )}
      {to && (
        <div>
          <strong>To:</strong> {to}
        </div>
      )}
    </div>
  );
};
