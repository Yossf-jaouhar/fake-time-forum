import { persoChat, userBubble } from "./components.js"
const wschat = () => {
    const socket = new WebSocket("/chat")
    let pChat = persoChat(socket)
    document.body.appendChild(pChat)
    const chat = document.createElement('chat')
    chat.classList.add('bubblesContainer')
    window.addEventListener('logout', () => {
        socket.close()
    })
    socket.onmessage((rm) => {
        let msg = JSON.parse(rm)
        HandelSocket(msg, pChat, chat)
    })
}
const HandelSocket = (msg, pChat, chat) => {
    switch (msg.type) {
        case "status":
            HandleSts(msg.data)
            break;
        case "signal":
            HandelSignals(msg)
            break
        case "message":
            HandleMsg(msg, pChat, chat)
            break
        case "clients":
            InitUsers(msg, chat)
            break
        default:
            throw new Error("unrecognized message type");
    }
}
const HandelSignals = (signal) => {
    let RegisteredSignals = ["typing"]
    if (!RegisteredSignals.includes(signal.content)) {
        throw new Error("unrecognized signal");
    }
    const target = document.body.querySelector(`#${signal.sender}`)
    if (target.classList.contains(signal.content)) {
        return
    }
    target.classList.add("typing")
    setTimeout(() => {
        target.classList.remove("typing")
    }, 1000)
}

const InitUsers = (users, chat) => {
    users.forEach(element => {
        chat.append(userBubble(element))
    });
}
const HandleSts = (sender, chat) => {
    const target = document.body.querySelector(`#${sender}`)
    if (!target) {
        target = userBubble(sender)
        chat.appendChild(target)
    } else {
        target.classList.toggle("on")
    }
}
const HandleMsg = (msg, pChat, chat) => {
    let target = document.querySelector(`#${msg.sender}`)
    if (chat.id === msg.sender) {
        let msgBubble = document.createElement('msg');
        msgBubble.classList.add('messageRecieved');
        msgBubble.innerText = msg.content
    }
    pChat.prepend(target)
}