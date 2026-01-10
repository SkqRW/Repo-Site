const BASE_URL = window.location

async function fetchFiles(path) {
  try {
    const response = await fetch(`./${path}/files.json`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json' // Specify API version
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data; // This will be an array of objects representing files and directories
  } catch (error) {
    console.error('Error fetching GitHub directory:', error);
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

// Cache index packs
let packIndex = null;

async function loadPackIndex() {
    if (packIndex) return packIndex;
    
    try {
        const response = await fetch('./pack_index.json');
        if (response.ok) {
            packIndex = await response.json();
            console.log(`loaded packs: ${packIndex.totalPacks} packs`);
            return packIndex;
        }
    } catch (error) {
        console.warn('Pack index not found, falling back to manual loading');
    }
    return null;
}

async function generatePacks() {
    const categories = document.getElementsByClassName("category")
    if (categories && categories.length > 0) {
         const index = await loadPackIndex();
        
        for (let category of categories) {
            let packFolder = category.getAttribute("packfolder")
            if (packFolder) {
                // We have a packfolder attribute to inject into
                let grid = document.createElement("div")
                grid.classList.add("grid")
                grid.id = "first_grid"
                category.appendChild(grid)
    
                fetchFiles(packFolder)
                .then((json) => {
                    if (json) {
                        for (let item of json) {
                            let button = document.createElement("a")
                            button.href = `Dist/${item.path}`
                            if (item.path.includes("http")) {
                              button.href = item.path
                            }
                            button.download = item.name
                            button.draggable = false
                            grid.appendChild(button)

                            let border = document.createElement("div")
                            border.classList.add("border")
                            button.appendChild(border)

                            let zipText = item.name
                            let a = zipText.split('.')
                            a.pop()
                            let fileName = a.join(".")
                            let imgName = fileName
                            if (fileName.includes('[')) {
                              imgName = fileName.split('[')[0].trim()
                            }

                            let img = document.createElement("img")
                            let directories = packFolder.split("/")
                            let imgUrl = `assets/media/img/lists/${directories[directories.length - 1].toLowerCase()}/${imgName}.webp`
                            tryFetch(imgUrl)
                            .then((res) => {
                                if (res) {
                                img.src = imgUrl
                                }
                                else {
                                    img.src = "assets/media/img/default.webp"
                                }
                            })
                            

                            img.alt = fileName
                            img.draggable = false
                            button.appendChild(img)

                            let header = document.createElement("h3")
                            header.innerHTML = fileName
                            button.appendChild(header)

                            // Search for the element in each pack (only .png)
                            if (index) {
                                // Normalize the path: convert \ to / and remove "Packs/" from the beginning
                                const normalizedPath = item.path
                                    .replace(/\\/g, '/')
                                    .replace(/^Packs\//, '');
                                    
                                // Not the best solution, but a solution i guess
                                const packInfo = index.packs.find(p => p.path === normalizedPath);
                                
                                if (packInfo && packInfo.pngFiles) {
                                    const pngFiles = packInfo.pngFiles.map(f => f.toLowerCase());
                                    button.setAttribute('data-png-files', pngFiles.join('|'));
                                }
                            }
                        }
                    }
                })
            }
        }
    } 
}
generatePacks();
