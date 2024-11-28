import * as React from "react";
import { FromToInfo } from "./FromToInfo";

interface MessageInfoProps {
  json: {
    text?: string;
    from?: string;
    to?: string;
    quickReplies?: Array<{
      title: string;
      type: string;
      payload: string;
    }>;
    [key: string]: any;
  };
}

export const MessageInfo: React.FC<MessageInfoProps> = ({ json }) => {
  return (
    <div style={{ marginBottom: "20px" }}>
      <FromToInfo from={json.from} to={json.to} />
      {json.text && (
        <div
          style={{
            marginTop: "8px",
            paddingTop: "4px",
            paddingBottom: "4px",
            paddingLeft: "8px",
            paddingRight: "8px",
            borderRadius: "12px",
            backgroundColor: "#35C759",
            border: "2px solid #35C759",
            color: "#ffffff",
            width: "fit-content",
            fontSize: "14px",
          }}
        >
          {json.text}
        </div>
      )}
      {json.quickReplies && json.quickReplies.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            marginTop: "16px",
          }}
        >
          {json.quickReplies.map((reply, index) => (
            <button
              key={index}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                backgroundColor: "#242424",
                color: "#fff",
                border: "1px solid #363636",
                cursor: "pointer",
              }}
            >
              {reply.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
