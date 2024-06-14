const link = document.getElementsByTagName("a")

const links = ["https://www.youtube.com/watch?v=dQw4w9WgXcQ"]

for (let i = 0; i < link.length; i++) {
  const rlink = Math.floor(Math.random() * links.length)
  link[i].href = links[rlink];
}
