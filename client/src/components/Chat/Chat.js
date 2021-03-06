import React, { useEffect, useContext } from "react";
import io from "socket.io-client";
import "./Chat.css";
import { UserContext } from "../Global/UserContext";

// const socket = io("http://localhost:5000");
const socket = io();

export default function Chat() {
  const { user } = useContext(UserContext);
  console.log("Logged in as", user);

  socket.emit("new-user", user.name);

  const appendMessage = (data, self) => {
    const messageElement = document.createElement("div");
    messageElement.className = "message-element";

    messageElement.innerHTML = `<div>
        ${
          data.user
            ? `<div class="message-element-user">${data.user}</div>`
            : ""
        }
        <div class="message-element-body">${data.message}</div>
        <div class="message-element-time">${data.time}</div>
      </div>`;

    if (self) messageElement.classList.add("message-element-right");
    document.getElementById("chat-body").append(messageElement);

    // AUTO SCROLL TO BOTTOM
    let chatBody = document.getElementById("chat-body");
    chatBody.scrollTop = chatBody.scrollHeight;
  };

  const ping = () => {
    socket.on("chat-message", (data) => {
      appendMessage(data);
    });
    socket.on("typing", (data) => {
      document.getElementById(
        "status-box"
      ).innerHTML = `${data.user} is typing...`;
      setTimeout(
        () => (document.getElementById("status-box").innerHTML = ""),
        1000
      );
    });
  };

  const submit = () => {
    if (!document.getElementById("text-message-input").value) return;
    let data = {
      user: user.name,
      message: document.getElementById("text-message-input").value,
      time: new Date().toLocaleTimeString(),
    };
    socket.emit("send-message", data);
    document.getElementById("text-message-input").value = "";
    appendMessage(data, "self");
  };
  useEffect(() => {
    ping();
    return () => {
      socket.emit("disconnect", user.name);

      socket.off();
    };
  }, []);
  return (
    <div>
      <div className="chat-container">
        <div id="chat-body"></div>
        <div id="status-box"></div>
        <div className="chat-control">
          <input
            onKeyDown={(e) => {
              if (e.keyCode === 13) submit();
              else {
                socket.emit("typing", { user: user.name });
              }
            }}
            type="text"
            id="text-message-input"
            placeholder="message"
          />

          <button className="chat-send" onClick={() => submit()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
