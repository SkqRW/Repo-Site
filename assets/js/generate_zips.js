import { Octokit } from "https://esm.sh/octokit";

const octokit = new Octokit({ });

async function getPaginatedData(url) {
  const nextPattern = /(?<=<)([\S]*)(?=>; rel="Next")/i;
  let pagesRemaining = true;
  let data = [];

  while (pagesRemaining) {
    const response = await octokit.request(`GET ${url}`, {
      per_page: 1000,
      headers: {
        "X-GitHub-Api-Version":
          "2022-11-28",
      },
    });

    const parsedData = parseData(response.data)
    data = [...data, ...parsedData];

    const linkHeader = response.headers.link;

    pagesRemaining = linkHeader && linkHeader.includes(`rel=\"next\"`);

    if (pagesRemaining) {
      url = linkHeader.match(nextPattern)[0];
    }
  }

  return data;
}

function parseData(data) {
  // If the data is an array, return that
    if (Array.isArray(data)) {
      return data
    }

  // Some endpoints respond with 204 No Content instead of empty array
  //   when there is no data. In that case, return an empty array.
  if (!data) {
    return []
  }

  // Otherwise, the array of items that we want is in an object
  // Delete keys that don't include the array of items
  delete data.incomplete_results;
  delete data.repository_selection;
  delete data.total_count;
  // Pull out the array of items
  const namespaceKey = Object.keys(data)[0];
  data = data[namespaceKey];

  return data;
}

const data = await getPaginatedData("/repos/solaristheworstcatever/The-Level-Editor-Warehouse/contents/Graphics");

console.log(data);

// async function getGitHubFolderContents(path) {
//     let url = `https://api.github.com/repos/solaristheworstcatever/The-Level-Editor-Warehouse/contents/${path}`;
//     let headers = {
//         'Accept': 'application/vnd.github.v3+json' // Specify API version
//     };

//     try {
//         let response = await fetch(url, { headers });
//         if (!response.ok) {
//             throw new Error(`GitHub API error: ${response.status} - ${response.statusText}`);
//         }
//         let data = await response.json();
//         return data; // This will be an array of objects representing files and subfolders
//     } catch (error) {
//         console.error("Error fetching GitHub folder contents:", error);
//         return null;
//     }
// }

function GetDirectoryName(path) {
    if (!path) {
        return "Download"
    }
    if (!path.includes("/") && !path.includes("\\")) {
        return path
    }
    else {
        let array = null
        if (path.includes("/")) {
            array = path.split("/")
        }
        else if (path.includes("\\")) {
            array = path.split("\\")
        }
        
        if (typeof array == "object") {
            return array[array.length - 1]
        }
        return path
    }
}

// async function GetFile(path) {
//     if (path.includes('.')) {
//         console.log(path)
//         return await fetch(path).then(r => {
//             if (r.ok) {
//                 return r.blob()
//             }
//         })
//     }
//     else {
        
//         console.log("Not a valid file! Trying as a folder...")
//         getGitHubFolderContents(path)
//             .then(contents => {
//                 if (contents) {
//                     GenerateZipDownloadFromFolder(zip, contents)
//                     GenerateZip(zip)
//                     .then((r) => {
//                         if (r.ok) {
//                             return r
//                         }
//                     })
//                     .catch((e) => {
//                         console.log(e)
//                     })
//                     return null
//                 }
//             })
//     }
// }

// async function GetImageDownload(path) {
//     let imageDownload = `https://raw.githubusercontent.com/solaristheworstcatever/The-Level-Editor-Warehouse/main/${path}`;
//     GetFile(imageDownload)
//     .then((r) => {
//         return r
//     })
// }

// async function GenerateZipDownloadFromFolder(zip, contents) {
//     contents.forEach(content => {
//         if (content.path) {
//             GetImageDownload(content.path)
//             .then((file) => {
//                 if (file) {
//                     zip.file(`${content.name}`, file); // adds the image file to the zip file
//                 }
//             })
//         }
//     });
// }

// async function GenerateZip(zip) {
//     let zipData = await zip.generateAsync({
//                     type: "blob",
//                     streamFiles: true
//                 });

//     return zipData
// }

let linkElements = Array.prototype.slice.call(document.getElementsByTagName("a"));
linkElements.forEach((link) => {
    let repoLink = link.getAttribute("repolink")
    if (repoLink) {
        link.addEventListener('click', (e) => {
            let zip = new JSZip(); // Create a new zip
            getGitHubFolderContents(repoLink)
            .then((files) => {
                // The inner git files from the folder
                if (files) {
                    files.forEach((file) => {
                        if (file.path) {
                            console.log(file.path)
                            if (file.path.includes('.')) {
                            }
                            else {
                            }
                        }
                    })
                }
            })
            // getGitHubFolderContents(repoLink)
            // .then(contents => {
            //     if (contents) {
            //         GenerateZipDownloadFromFolder(zip, contents)
            //         GenerateZip(zip)
            //         .then((r) => {
            //             if (r.ok) {
            //                 return r
            //             }
            //         })
            //         .catch((e) => {
            //             console.log(e)
            //         })
            //         return null
            //     }
            // })
            // .then((download) => {
            //     if (download) {
            //         let a = document.createElement("a")
            //         a.href = window.URL.createObjectURL(download);
            //         a.download = GetDirectoryName(repoLink);
            //         a.click();
            //         console.log("A")
            //     }
            // });
        })}
});