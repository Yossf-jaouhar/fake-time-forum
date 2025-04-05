import { sidebar } from "./components"
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
        case "message":
            HandleMsg(msg.data)
            break
        default:
            break;
    }
}
const InitUsers = (users) => {
    const chat = document.body.querySelector('chat')
    
}
const HandleSts = (sender) => {
    const target = document.body.querySelector(`#${sender}`)
    target.classList.toggle("on")
}
const HandleMsg = (msg) => {

}