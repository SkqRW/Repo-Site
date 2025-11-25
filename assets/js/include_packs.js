async function fetchPacks(packFolder) {
    try {
        let r = await fetch(packFolder)
        if (!r.ok) {
            throw new Error(`fetch error: ${response.status} - ${response.statusText}`);
        }
        let data = await r.text()
        return data
    }
    catch (error) {
        console.error("Error fetching folder contents:", error);
        return null;
    }
}

async function tryFetch(url) {
    try {
        let r = await fetch(url)
        return r.ok
    }
    catch (error) {
        return false;
    }
}

async function generatePacks() {
    const categories = document.getElementsByClassName("category")
    if (categories && categories.length > 0) {
        for (i in categories) {
            let category = categories[i]
            let packFolder = category.getAttribute("packfolder")
            if (packFolder) {
                // We have a packfolder attribute to inject into
                
                let grid = document.createElement("div")
                grid.classList.add("grid")
                grid.id = "first_grid"
                category.appendChild(grid)
    
                fetchPacks(packFolder)
                .then((html) => {
                    if (html) {
                        let temp = document.createElement('html')
                        temp.innerHTML = html

                        let templinks = temp.getElementsByTagName("a")
                        for (i = 0; i < templinks.length; i++) {
                            if (i == 0) {
                                continue
                            }
                            let button = document.createElement("a")
                            button.href = templinks[i].href
                            button.download = templinks[i].innerHTML
                            button.draggable = false
                            grid.appendChild(button)

                            let border = document.createElement("div")
                            border.classList.add("border")
                            button.appendChild(border)

                            let zipText = templinks[i].innerHTML

                            let img = document.createElement("img")
                            let directories = packFolder.split("/")

                            let imgUrl = `assets/media/img/lists/${directories[directories.length - 1]}/${zipText.split('.')[0]}.webp`
                            tryFetch(imgUrl)
                            .then((res) => {
                                if (res) {
                                img.src = imgUrl
                                }
                                else {
                                    img.src = "assets/media/img/default.webp"
                                }
                            })
                            

                            img.alt = zipText.split('.')[0]
                            img.draggable = false
                            button.appendChild(img)

                            let header = document.createElement("h3")
                            header.innerHTML = zipText.split(".")[0]
                            button.appendChild(header)
                        }
                    }
                })
            }
        }
    } 
}
generatePacks();
