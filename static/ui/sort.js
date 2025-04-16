export let sort = () => {
    let chat = document.querySelector('.bubblesholder')
    let bubles = [...document.querySelectorAll('.user')]
    let sorted = bubles.sort((a, b) => {
        const timeA = a.dataset.time ? new Date(a.dataset.time) : null;
        const timeB = b.dataset.time ? new Date(b.dataset.time) : null;
        if (timeA && timeB) {
            return timeB - timeA;
        }
        if (!timeA && !timeB) {
            return a.id.localeCompare(b.id);
        } 
        return timeA ? -1 : 1;
    })
    chat.innerHTML =""
    sorted.forEach((e)=>{
        chat.append(e)
    })
}