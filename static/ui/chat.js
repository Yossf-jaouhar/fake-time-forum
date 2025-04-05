import { sidebar, userBubble } from "./components"
const wschat = () => {
    const socket = new WebSocket("/chat")
    window.addEventListener('lougout', () => {
        socket.close()
    })

}
const HandelSocket = (msg) => {
    switch (msg.type) { 
        case "status":
            HandleSts(msg.sender)
            break;
        case "signal":
            break
        case "message":
            HandleMsg(msg.data)
            break
        case "clients":
        InitUsers(msg.data)    
        break
        default:
        throw new Error("unrecognized message type");
            break;
    }
}
const InitUsers = (users) => {
    const chat = document.body.querySelector('chat')
    users.forEach(element => {
        chat.append(userBubble(element))
    });
}
const HandleSts = (sender) => {
    const target = document.body.querySelector(`#${sender}`)
    target.classList.toggle("on")
}
const HandleMsg = (msg) => {

}