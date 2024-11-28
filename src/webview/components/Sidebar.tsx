import * as React from "react";
import { useEffect, useState } from "react";
import { MessageInfo } from "./MessageInfo";
import { CardInfo } from "./CardInfo";
import { RawJsonViewer } from "./RawJsonViewer";
import { sendRCS } from "./RCSSend";

interface vscode {
  postMessage(message: any): void;
}

declare const vscode: vscode;

const Sidebar = () => {
  const [activeFileText, setActiveFileText] = useState<string>("");
  const [parsedJson, setParsedJson] = useState<any>(null);
  const [rcs, setRCS] = useState<string>("");
  const [jsonFiles, setJsonFiles] = useState<string[]>([]);
  const [hasText, setHasText] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);

  const handleSendMessage = async () => {
    if (!apiKey) {
      console.error("API key is required");
      return;
    }

    setIsSending(true);
    console.log("Sending message with API key to the panel:", apiKey);
    console.log("Parsed JSON:", parsedJson);
    vscode.postMessage({ type: "sendRCS", apiKey: apiKey, json: parsedJson });
    console.log("Posted Message sent");
  };

  useEffect(() => {
    // Set up message listener
    console.log("Sidebar mounted");

    window.addEventListener("message", (event) => {
      const message = event.data;
      console.log("Received message:", message);

      switch (message.type) {
        case "activeFile":
          try {
            const jsonValue = JSON.parse(message.value);
            console.log("Parsed JSON:", jsonValue);
            setHasText("text" in jsonValue);
            setActiveFileText(JSON.stringify(jsonValue, null, 2));
            setParsedJson(jsonValue);
            setRCS("");
          } catch (e) {
            console.error("Parse error:", e);
            setHasText(false);
            setActiveFileText(message.value);
            setParsedJson(null);
            setRCS("");
          }
          break;
        case "jsonFiles":
          setJsonFiles(message.value);
          break;
        case "fileChanged":
          if (selectedFile === message.path) {
            try {
              const jsonValue = JSON.parse(message.value);
              setHasText("text" in jsonValue);
              setActiveFileText(JSON.stringify(jsonValue, null, 2));
              setParsedJson(jsonValue);
              setRCS("");
            } catch (e) {
              console.error("Parse error:", e);
              setHasText(false);
              setActiveFileText(message.value);
              setParsedJson(null);
              setRCS("");
            }
          }
          break;
        case "sendComplete":
          setIsSending(false);
          break;
        case "apiKey":
          setApiKey(message.value || "");
          break;
      }
    });

    // Request active file content and API key
    vscode.postMessage({
      type: "getActiveFile",
    });
    vscode.postMessage({
      type: "getApiKey",
    });

    // Add this test message
    console.log("Testing vscode.postMessage");
    vscode.postMessage({ type: "test", value: "test message" });
  }, []);

  useEffect(() => {
    vscode.postMessage({
      type: "getJsonFiles",
    });
  }, []);

  const maskApiKey = (key: string) => {
    if (!key) return "";
    return key.slice(0, 5) + "•".repeat(Math.max(0, key.length - 5));
  };

  return (
    <div className="sidebar" style={{ padding: "12px" }}>
      <div
        style={{ fontSize: "24px", marginBottom: "16px", fontWeight: "bold" }}
      >
        Pinnacle RCS
      </div>
      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {jsonFiles.map((file, index) => (
            <button
              style={{
                paddingTop: "8px",
                paddingBottom: "8px",
                paddingLeft: "12px",
                paddingRight: "12px",
                borderRadius: "12px",
                backgroundColor: selectedFile === file ? "#7733D6" : "#242424",
                color: "#fff",
                border:
                  selectedFile === file
                    ? "2px solid #B883FF"
                    : "2px solid #363636",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "background-color 0.3s",
                cursor: "pointer",
              }}
              key={index}
              onClick={() => {
                setSelectedFile(file);
                vscode.postMessage({ type: "onViewFile", value: file });
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  selectedFile === file ? "#8844E7" : "#3a3a3a";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  selectedFile === file ? "#7733D6" : "#242424";
              }}
            >
              <i className={`codicon codicon-${"json"}`}></i>
              {file.split("/").pop()}
            </button>
          ))}
        </div>
      </div>
      {hasText ? (
        <>
          {parsedJson && <MessageInfo json={parsedJson} />}
          <div style={{ marginTop: "16px", display: "flex", gap: "8px" }}>
            <input
              type="text"
              value={maskApiKey(apiKey)}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter API Key"
              style={{
                padding: "8px 12px",
                borderRadius: "12px",
                backgroundColor: "#242424",
                color: "#fff",
                width: "300px",
                maxWidth: "100%",
                border: "2px solid #363636",
                marginRight: "8px",
                outline: "none",
              }}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isSending}
              style={{
                paddingTop: "8px",
                paddingBottom: "8px",
                paddingLeft: "12px",
                paddingRight: "12px",
                borderRadius: "12px",
                backgroundColor: isSending ? "#4a2085" : "#7733D6",
                color: "#fff",
                border: "2px solid #B883FF",
                cursor: isSending ? "not-allowed" : "pointer",
              }}
            >
              {isSending ? "Sending Message..." : "Send Message"}
            </button>
          </div>
          <RawJsonViewer jsonText={activeFileText} />
        </>
      ) : parsedJson?.cards?.length > 0 ? (
        <>
          <CardInfo
            cards={parsedJson.cards}
            quickReplies={parsedJson.quickReplies}
            to={parsedJson.to}
            from={parsedJson.from}
          />
          <div style={{ marginTop: "16px", display: "flex", gap: "8px" }}>
            <input
              type="text"
              value={maskApiKey(apiKey)}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter API Key"
              style={{
                padding: "8px 12px",
                borderRadius: "12px",
                backgroundColor: "#242424",
                color: "#fff",
                width: "300px",
                maxWidth: "100%",
                border: "2px solid #363636",
                marginRight: "8px",
                outline: "none",
              }}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isSending}
              style={{
                paddingTop: "8px",
                paddingBottom: "8px",
                paddingLeft: "12px",
                paddingRight: "12px",
                borderRadius: "12px",
                backgroundColor: isSending ? "#4a2085" : "#7733D6",
                color: "#fff",
                border: "2px solid #B883FF",
                cursor: isSending ? "not-allowed" : "pointer",
              }}
            >
              {isSending ? "Sending Message..." : "Send Message"}
            </button>
          </div>
          <RawJsonViewer jsonText={activeFileText} />
        </>
      ) : (
        <pre>{activeFileText}</pre>
      )}
      <pre>{rcs}</pre>
    </div>
  );
};

export default Sidebar;
