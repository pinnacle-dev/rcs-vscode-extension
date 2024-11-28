import * as React from "react";
import { FromToInfo } from "./FromToInfo";

interface Button {
  title: string;
  type: string;
  payload: string;
}

interface Card {
  title: string;
  subtitle?: string;
  mediaUrl?: string;
  buttons?: Button[];
}

interface QuickReply {
  title: string;
  type: string;
  payload: string;
}

interface CardInfoProps {
  cards: Card[];
  quickReplies?: QuickReply[];
  to?: string;
  from?: string;
}

export const CardInfo: React.FC<CardInfoProps> = ({
  cards,
  quickReplies,
  to,
  from,
}) => {
  const [currentCardIndex, setCurrentCardIndex] = React.useState(0);

  React.useEffect(() => {
    setCurrentCardIndex(0);
  }, [cards]);

  const currentCard = cards[currentCardIndex];
  if (!currentCard) {
    return null;
  }

  const handlePrevCard = () => {
    setCurrentCardIndex((prev) => (prev > 0 ? prev - 1 : cards.length - 1));
  };

  const handleNextCard = () => {
    setCurrentCardIndex((prev) => (prev < cards.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="cards-container">
      <FromToInfo from={from} to={to} />
      {cards.length > 0 && (
        <div style={{ position: "relative", maxWidth: "300px" }}>
          {cards.length > 1 && (
            <>
              <button
                onClick={handlePrevCard}
                style={{
                  position: "absolute",
                  left: "-20px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  backgroundColor: "#242424",
                  color: "#fff",
                  border: "1px solid #363636",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ←
              </button>
              <button
                onClick={handleNextCard}
                style={{
                  position: "absolute",
                  right: "-20px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  backgroundColor: "#242424",
                  color: "#fff",
                  border: "1px solid #363636",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                →
              </button>
            </>
          )}

          <div
            key={currentCardIndex}
            style={{
              border: "1px solid #363636",
              borderRadius: "8px",
              marginBottom: "8px",
              overflow: "hidden",
              maxWidth: "300px",
            }}
          >
            {currentCard.mediaUrl && (
              <img
                src={currentCard.mediaUrl}
                alt={currentCard.title}
                style={{
                  width: "100%",
                  maxHeight: "200px",
                  objectFit: "cover",
                }}
              />
            )}
            <div style={{ padding: "16px" }}>
              <h3 style={{ margin: "0 0 8px 0" }}>{currentCard.title}</h3>
              {currentCard.subtitle && (
                <p style={{ margin: "0 0 12px 0", color: "#888" }}>
                  {currentCard.subtitle}
                </p>
              )}
              {currentCard.buttons && (
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {currentCard.buttons.map((button, btnIndex) => (
                    <button
                      key={btnIndex}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "6px",
                        backgroundColor: "#242424",
                        color: "#fff",
                        border: "1px solid #363636",
                        cursor: "pointer",
                      }}
                    >
                      {button.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {cards.length > 1 && (
            <div
              style={{
                display: "flex",
                gap: "8px",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              {cards.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentCardIndex(index)}
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor:
                      index === currentCardIndex ? "#fff" : "#363636",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {quickReplies && quickReplies.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            marginTop: "16px",
          }}
        >
          {quickReplies.map((reply, index) => (
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
