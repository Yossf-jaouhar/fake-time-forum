
document.addEventListener("DOMContentLoaded", function () {
    statement()
})

const creatpost = `
<style>
    .creatpost {
      position: absolute;
      top: 50px;
      left: 50px;
      width: 500px;
      height: 500px;
      background-color: blue;
      color: white;
      text-align: center;
      line-height: 100px;
      font-size: 20px;
      border-radius: 10px;
    }
</style>
<div class="creatpost">Absolute Div</div>
`
function statement() {
    console.log("hi")
    const addpost = document.getElementById("AddPost")
    addpost.addEventListener("click" , function () {
        addpost.outerHTML = creatpost
    } )
}