"use client";
import { useState, useEffect, useRef } from "react";
import { auth, firestore } from "@/config/firebase"; // firestore instead of db for messagesRef
import {
  collection,
  query,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
  onSnapshot,
  deleteDoc,
  doc,
  getDocs,
  where,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SyntaxHighlighter from "react-syntax-highlighter/dist/light";
import atelierLakesideLight from "react-syntax-highlighter/dist/styles/atelier-lakeside-light"; // Import light themes
import vs from "react-syntax-highlighter/dist/styles/vs"; // Another light theme
import {
  ClipboardDocumentIcon,
  CheckIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import {
  MessageSquarePlus,
  Send,
  Sparkles,
  Trash,
  Trash2,
  X,
  XCircle,
} from "lucide-react";

function Chatroom({ workspaceId, setIsChatOpen }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAIProcessing, setIsAIProcessing] = useState(false);

  const userId = auth.currentUser?.uid;
  const name = auth.currentUser?.displayName;

  const messagesRef = collection(firestore, "messages"); // Ensure firestore is imported and used correctly

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!workspaceId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const workspaceMessagesQuery = query(
      messagesRef,
      where("workspaceId", "==", workspaceId),
      orderBy("createdAt")
    );

    const unsubscribe = onSnapshot(
      workspaceMessagesQuery,
      (snapshot) => {
        const messagesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(messagesData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching messages:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [workspaceId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, newMessage, isAIProcessing]);

  const generateAIResponse = async (prompt) => {
    setIsAIProcessing(true);
    try {
      const response = await fetch("/api/getChatResponse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: prompt }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Unknown API error" }));
        throw new Error(
          `API request failed: ${response.status} ${response.statusText} - ${
            errorData.message || "No message"
          }`
        );
      }

      const data = await response.json();
      return data.aiResponse;
    } catch (error) {
      console.error("API Error:", error);
      return "Sorry, I couldn't process that request. Please try again.";
    } finally {
      setIsAIProcessing(false);
    }
  };

  const sendMessage = async () => {
    if (newMessage.trim() === "") return;

    if (!userId || !name) {
      console.error("User not authenticated or display name not available.");
      return;
    }

    const imageUrl = auth.currentUser?.photoURL;
    const aiMatch = newMessage.match(/@(.+)/);
    let aiPrompt = null;
    let userMessage = newMessage;

    if (aiMatch) {
      aiPrompt = aiMatch[1].trim();
    }

    try {
      await addDoc(messagesRef, {
        text: userMessage,
        createdAt: serverTimestamp(),
        imageUrl,
        userId,
        name,
        workspaceId,
      });

      if (aiPrompt) {
        const aiResponse = await generateAIResponse(aiPrompt);
        await addDoc(messagesRef, {
          text: `🤖 ${aiResponse}`,
          createdAt: serverTimestamp(),
          imageUrl: "/ai-avatar.png", // Ensure this path is correct for your AI avatar
          userId: "AI_BOT",
          name: "CodeBot",
          workspaceId,
        });
      }

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const clearChat = async () => {
    if (
      !window.confirm(
        "Are you sure you want to clear all messages in this workspace? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const q = query(messagesRef, where("workspaceId", "==", workspaceId));
      const querySnapshot = await getDocs(q);

      const deletePromises = querySnapshot.docs.map((docItem) =>
        deleteDoc(doc(firestore, "messages", docItem.id))
      );
      await Promise.all(deletePromises);
      setMessages([]);
    } catch (error) {
      console.error("Error clearing chat:", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const MessageBubble = ({ msg }) => {
    const isCurrentUser = msg.userId === userId;
    const isAI = msg.userId === "AI_BOT";
    const [copiedCode, setCopiedCode] = useState(null);

    const parseMessage = (text) => {
      const parts = [];
      const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
      let lastIndex = 0;
      let match;

      while ((match = codeBlockRegex.exec(text)) !== null) {
        const [fullMatch, lang, code] = match;
        const startIndex = match.index;
        const endIndex = codeBlockRegex.lastIndex;

        if (startIndex > lastIndex) {
          parts.push({
            type: "text",
            content: text.substring(lastIndex, startIndex),
          });
        }

        parts.push({
          type: "code",
          lang: lang || "text",
          code: code.trim(),
        });

        lastIndex = endIndex;
      }

      if (lastIndex < text.length) {
        parts.push({
          type: "text",
          content: text.substring(lastIndex),
        });
      }

      return parts;
    };

    const copyToClipboard = async (code, index) => {
      try {
        await navigator.clipboard.writeText(code);
        setCopiedCode(index);
        setTimeout(() => setCopiedCode(null), 2000);
      } catch (err) {
        console.error("Failed to copy text: ", err);
      }
    };

    return (
      <div
        className={`flex flex-col gap-1 ${
          isCurrentUser
            ? "items-end"
            : isAI
            ? "items-center w-full"
            : "items-start"
        }`}
      >
        {!isAI && (
          <span className="text-xs text-gray-500">
            {isCurrentUser ? "You" : msg.name}
          </span>
        )}

        <div className="flex justify-end gap-2">
          {!isCurrentUser && !isAI && (
            <img
              src={msg.imageUrl || "/robotic.png"}
              alt="Avatar"
              className="w-6 h-6 rounded-full flex-shrink-0"
            />
          )}

          <div
            className={`py-2 px-4 text-sm rounded-2xl mx-auto max-w-[550px] break-words shadow-sm ${
              // Added subtle shadow to bubbles
              isAI
                ? "bg-blue-50 border border-blue-200 text-blue-800" // Light blue for AI, with border and darker text
                : isCurrentUser
                ? "bg-purple-100 border border-purple-200 text-purple-800" // Light purple for current user, with border and darker text
                : "bg-gray-100 border border-gray-200 text-gray-800" // Light gray for other users, with border and darker text
            }`}
          >
            {isAI && <span className="text-blue-600 mr-2">⚡</span>}

            {parseMessage(msg.text).map((part, index) => {
              if (part.type === "text") {
                return (
                  <span
                    key={index}
                    className="whitespace-pre-wrap text-gray-800"
                  >
                    {part.content}
                  </span>
                );
              }

              if (part.type === "code") {
                return (
                  <div key={index} className="relative my-2 group">
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button
                        onClick={() => copyToClipboard(part.code, index)}
                        className="p-1 rounded bg-gray-200/80 hover:bg-gray-300/80 backdrop-blur-sm text-gray-700" // Light button, dark text
                      >
                        {copiedCode === index ? (
                          <CheckIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <ClipboardDocumentIcon className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                    </div>
                    <SyntaxHighlighter
                      language={part.lang}
                      style={vs} // Changed to a light theme for code highlighting
                      customStyle={{
                        background: "#f8f8f8", // Very light background for code block
                        borderRadius: "0.5rem",
                        padding: "1rem",
                        margin: "0.5rem 0",
                        color: "#333", // Default text color for code
                      }}
                      codeTagProps={{
                        style: { fontFamily: "Fira Code, monospace" },
                      }}
                    >
                      {part.code}
                    </SyntaxHighlighter>
                  </div>
                );
              }

              return null;
            })}

            {isAI && (
              <div className="text-xs text-blue-600/70 mt-1">
                AI-generated response
              </div>
            )}
          </div>

          {isCurrentUser && !isAI && (
            <img
              src={msg.imageUrl || "/robotic.png"}
              alt="Avatar"
              className="w-6 h-6 rounded-full flex-shrink-0"
            />
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-600">
        Loading messages...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-gray-50 border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg border border-blue-200">
            {" "}
            {/* Light blue background, blue border */}
            <Sparkles className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">
            Collaborative AI Chat
            <span className="text-blue-500 text-sm font-normal ml-2">v1.2</span>
          </h2>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={clearChat}
            className="px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-sm" // Light gray button, darker on hover, dark text
          >
            <Trash className="h-4 w-4 text-red-500" />
            <span>Clear</span>
          </Button>
          <Button
            onClick={() => setIsChatOpen(false)}
            className="p-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-all duration-200 shadow-sm" // Light gray button, darker on hover, dark text
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-600 text-sm animate-fade-in">
            <div className="mb-4 animate-float">
              <MessageSquarePlus className="h-8 w-8 text-gray-400 opacity-60" />
            </div>
            <p>Start a conversation with AI</p>
            <p className="text-sm mt-1 text-gray-500">
              Type @ followed by your query
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              className="animate-message-enter"
            />
          ))
        )}

        {isAIProcessing && (
          <div className="flex justify-center animate-pulse">
            <div className="flex items-center gap-3 text-blue-500 text-sm py-2 px-4 rounded-full bg-blue-100 border border-blue-200">
              <div className="flex space-x-1">
                <div
                  className="h-2 w-2 bg-blue-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0s" }}
                />
                <div
                  className="h-2 w-2 bg-blue-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="h-2 w-2 bg-blue-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
              <span>Analyzing request...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Section */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-3"
        >
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (@ for AI commands)"
            className="flex-1 bg-gray-100 border border-gray-300 text-gray-800 placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" // Light input, dark text, subtle border
          />
          <Button
            type="submit"
            disabled={isAIProcessing}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 flex items-center gap-2 transition-all duration-200 shadow-sm group" // Solid blue button, shadow
          >
            <PaperAirplaneIcon className="h-5 w-5 text-white group-hover:translate-x-0.5 transition-transform" />
            <span>Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}

export default Chatroom;
