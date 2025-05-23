
import { Categories, loadPosts } from './api.js'
import { toast, wschat } from './chat.js'
import { header, postinput } from './components.js'
import { sort } from './sort.js'
export let renderMainPage = async () => {
    document.body.innerHTML = ""
    let posts = document.createElement('div')
    posts.classList.add('posts')
    document.body.append(header())
    let right = document.createElement('div')
    right.classList.add('right')
    right.append(postinput(await Categories()))
    right.append(posts)
    loadPosts(0, posts)
    wschat()
    document.body.append(right)
    sort()
    toast({err:"logged in",code:200})
}