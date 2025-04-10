
import { loadPosts } from './api.js'
import { wschat } from './chat.js'
import { header, postinput } from './components.js'
import { sort } from './sort.js'
export let renderMainPage = () => {
    document.body.innerHTML = ""
    let posts = document.createElement('div')
    posts.classList.add('posts')
    document.body.append(header())
    let right =document.createElement('div')
    right.classList.add('right')
    posts.append(postinput(['pain','suffering']))
    right.append(posts)
    loadPosts(0, posts)
    wschat()
    document.body.append(right)
    sort()
}