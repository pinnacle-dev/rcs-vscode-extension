import * as React from "react";

interface RawJsonViewerProps {
  jsonText: string;
}

export const RawJsonViewer: React.FC<RawJsonViewerProps> = ({ jsonText }) => {
  return (
    <details style={{ marginTop: "16px" }}>
      <summary style={{ userSelect: "none" }}>View Raw JSON</summary>
      <pre>{jsonText}</pre>
    </details>
  );
};
