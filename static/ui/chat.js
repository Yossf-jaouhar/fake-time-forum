import { loadChat } from "./api.js";
import { persoChat, userBubble } from "./components.js";
import { msg } from "./components.js";
import { sort } from "./sort.js";
export const wschat = () => {
  const socket = new WebSocket("/chat");
  let pChat = persoChat(socket);
  const chat = document.createElement("div");
  chat.classList.add("bubblesholder");
  document.body.appendChild(chat);
  document.body.appendChild(pChat);
  window.addEventListener("logout", () => {
    socket.close();
  });
  socket.onmessage = (rm) => {
    let msg = JSON.parse(rm.data);
    HandelSocket(msg, pChat, chat);
  };
};
const HandelSocket = (msg, pChat, chat) => {
  switch (msg.type) {
    case "status":
      HandleSts(msg, chat, pChat);
      break;
    case "signal":
      HandelSignals(msg);
      break;
    case "message":
      HandleMsg(msg, pChat, chat);
      break;
    case "clients":
      InitUsers(msg.data, chat, pChat);
      break;
    case "err":
      toast(msg);
      break;
    default:
      throw new Error("unrecognized message type");
  }
};
export function toast({ err, code }) {
  const toast = document.createElement("div");
  toast.className = `toast ${getCodeCategory(code)}`;
  toast.textContent =
    code !== 200 ? `Error ${code}: ${err}` : `Success! ${err} Code ${code}`;
  document.body.appendChild(toast);
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
    toast.addEventListener("transitionend", () => toast.remove());
  }, 3000);
}

function getCodeCategory(code) {
  if (!code) return "neutral";
  const firstDigit = Math.floor(code / 100);
  switch (firstDigit) {
    case 2:
      return "success";
    case 4:
      return "client-error";
    case 5:
      return "server-error";
    default:
      return "neutral";
  }
}

let id;
const HandelSignals = (signal) => {
  let RegisteredSignals = ["typing"];
  if (!RegisteredSignals.includes(signal.content)) {
    throw new Error("unrecognized signal");
  }
  const target = document.body.querySelector(`#${signal.sender}`);
  if (!target) {
    throw new Error("uxepected error");
  }

  target.classList.add(signal.content);
  clearTimeout(id);
  id = setTimeout(() => {
    target.classList.remove(signal.content);
  }, 1111);
};

const InitUsers = (users, chat, pChat) => {
  users?.forEach((element) => {
    chat.append(userBubble(element, pChat));
  });
  sort();
};
const HandleSts = (sender, chat, Chat) => {
  let target = document.body.querySelector(`#${sender.name}`);
  if (!target) {
    sender.time = null;
    target = userBubble(sender, Chat);
    chat.append(target);
    sort();
  } else {    
    if (sender.state) {
      target.classList.add("on");
    } else {
      target.classList.remove("on");
    }
  }
};
const HandleMsg = (mesg, pChat, chat) => {
  let target;
  if (pChat.id === mesg.reciever || pChat.id === mesg.sender) {
    target = document.querySelector(
      `#${pChat.id === mesg.reciever ? mesg.reciever : mesg.sender}`
    );
  } else {
    target = document.querySelector(`#${mesg.sender}`);
  }
  if (pChat.id === mesg.sender || pChat.id === mesg.reciever) {
    let msgB = msg(mesg, pChat.id === mesg.sender);
    let msgs = document.querySelector(".messages");
    msgs.append(msgB);
    if (pChat.id === mesg.reciever) {
      msgs.scrollTop = msgs.scrollHeight;
    }
  }
  if (target) {
    target.dataset.time = mesg.sent_at;
    if (target.id === mesg.sender && pChat.id !== mesg.sender) {
      target.classList.add("note");
      notify(target, pChat);
    }
    chat.prepend(target);
  }
};
const notify = (target, personalChat) => {
  let ntf = document.createElement("div");
  ntf.classList.add("notifications");
  ntf.innerText = `message from ${target.id}`;
  document.body.append(ntf);
  const msgs = document.querySelector(".messages");
  let e = setTimeout(() => {
    ntf.remove();
  }, 3000);
  ntf.addEventListener("click", () => {
    msgs.innerHTML = "";
    ntf.remove();
    clearTimeout(e);
    target.classList.remove("note");
    personalChat.id = target.id;
    personalChat.classList.add("show");
    loadChat(target.id, 0, msgs);
  });
};
