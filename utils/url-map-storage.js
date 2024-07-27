// ID-URL map storage
const linkStore = new Map();
const MAX_STORE_SIZE = 60; // Maximum number of entries

function addLink(id, url, source) {
    if (linkStore.size >= MAX_STORE_SIZE) {
        //Remove the oldest entry (FIFO)
        const oldestKey = linkStore.keys().next().value;
        linkStore.delete(oldestKey);
    }  
    const linkData = { url, source } 
    linkStore.set(id, linkData);
    //console.log(`Added link: ${id}, ${JSON.stringify(linkData)}`);
}

function getLink(id) {
    const link = linkStore.get(id);
    //console.log(`Getting link for id: ${id}, link: ${JSON.stringify(link)}`); // Debugging line
    return link;
    
}

module.exports = { addLink, getLink };