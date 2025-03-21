import { sidebar } from "./components"

const wschat = ()=>{
    const socket = new WebSocket("/chat")
    let users
    socket.onmessage = (event)=>{
        let msg = JSON.parse(event.data)
   if(!msg.type){
  users = sidebar(msg.clients)
  document.body.appendChild(users)
}else{
if(msg.type == "signal"){
    let user = document.getElementById(msg.client)
    user.dataset.state = msg.signal.toLowerCase()
}else{
let user = document.getElementById(msg.sender)
user.remove()
users.prepend(user)
}
}
}
}
