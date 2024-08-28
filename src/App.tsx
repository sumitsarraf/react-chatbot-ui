import { faMailReply } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useState } from "react";
import { ChatUI } from "./components/chat-ui/ChatUI";
import { MessageRole } from "./enums/MessageRole";
import { Conversations } from "./types";

const API_ENDPOINT = "http://localhost:11434/api/generate"; // Replace with your API endpoint

// Function to replace newlines with HTML <br> tags
const formatMessage = (message: string): string => {
  return message
    .replace(/\n\n/g, "<br><br>") // Double newlines to double <br>
    .replace(/\n/g, "<br>") // Single newline to <br>
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
};

function App() {
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [chatConversations, setChatConversations] = useState<Conversations>([
    {
      id: "1",
      role: MessageRole.ASSISTANT,
      message:
        "I am a sample chat ui made by Sumit Ranjan (https://github.com/sumitsarraf). This is a demo on how to build a simple React chat ui from scratch.",
    },
  ]);

  const handleSubmit = useCallback(async (value: string) => {
    setIsQuerying(true);
    setChatConversations((conversations) => [
      ...conversations,
      {
        //userInfo: TEST_USER_INFO,
        id: (conversations.length + 1).toString(),
        role: MessageRole.USER,
        message: value,
      },
    ]);

    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model: "llama3", stream: false, prompt: value }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setChatConversations((conversations) => [
        ...conversations,
        {
          id: (conversations.length + 1).toString(),
          role: MessageRole.ASSISTANT,
          message: formatMessage(data.response || "No response from API"),
        },
      ]);
    } catch (error) {
      console.error("Error fetching response:", error);
      setChatConversations((conversations) => [
        ...conversations,
        {
          id: (conversations.length + 1).toString(),
          role: MessageRole.ASSISTANT,
          message: "Sorry, something went wrong. Please try again later.",
        },
      ]);
    } finally {
      setIsQuerying(false);
    }
  }, []);

  return (
    <ChatUI
      isQuerying={isQuerying}
      onSubmit={handleSubmit}
      placeholder="Type here to interact with this demo"
      disabled={isQuerying}
      //conversations={chatConversations}
      conversations={chatConversations.map((conversation) => ({
        ...conversation,
        message: (
          <div dangerouslySetInnerHTML={{ __html: conversation.message }} />
        ),
      }))}
      customSubmitIcon={<FontAwesomeIcon icon={faMailReply} />}
    />
  );
}

export default App;
