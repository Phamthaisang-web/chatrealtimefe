"use client";
import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

type Message =
  | { type: "system"; text: string }
  | { type: "chat"; user: string; text: string };

export default function Home() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [username, setUsername] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const connect = () => {
    if (!username.trim()) {
      alert("Please enter your name");
      return;
    }

    const newSocket: Socket = io("https://chatrealtime-17zk.onrender.com");
    setSocket(newSocket);
    setCurrentUser(username);

    newSocket.on("connect", () => {
      newSocket.emit("join", username);
    });

    newSocket.on("chat message", (msg: { user: string; text: string }) => {
      setMessages((prev) => [...prev, { type: "chat", ...msg }]);
    });

    newSocket.on("system", (msg: string) => {
      setMessages((prev) => [...prev, { type: "system", text: msg }]);
    });
  };

  const send = () => {
    if (!message.trim() || !socket) return;
    socket.emit("chat message", message);
    setMessage("");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-blue-500 text-white p-4 text-lg font-bold text-center">
        💬 Fullscreen Chat
      </div>

      {/* Join Section */}
      {!currentUser ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-3">
          <input
            className="p-3 border border-gray-300 rounded-full w-72 text-lg"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your name..."
          />
          <button
            className="px-6 py-3 bg-blue-500 text-white rounded-full text-lg hover:bg-blue-600"
            onClick={connect}
          >
            Join Chat
          </button>
        </div>
      ) : (
        <>
          {/* Chat Messages */}
          <div className="flex flex-col flex-1 p-4 overflow-y-auto bg-[#e5ddd5]">
            {messages.map((msg, idx) =>
              msg.type === "system" ? (
                <div
                  key={idx}
                  className="text-center text-gray-500 text-sm my-2"
                >
                  🟢 {msg.text}
                </div>
              ) : (
                <div
                  key={idx}
                  className={`max-w-[60%] px-4 py-2 rounded-2xl mb-2 break-words ${
                    msg.user === currentUser
                      ? "bg-green-200 self-end rounded-br-none"
                      : "bg-white self-start rounded-bl-none"
                  }`}
                >
                  <span className="font-semibold">{msg.user}:</span> {msg.text}
                </div>
              )
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex p-3 bg-gray-200 border-t border-gray-300">
            <input
              className="flex-1 p-3 border border-gray-300 rounded-full mr-2 text-lg"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button
              className="px-5 py-3 bg-blue-500 text-white rounded-full text-lg hover:bg-blue-600"
              onClick={send}
            >
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
}
