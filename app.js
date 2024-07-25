const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');

const app = express();
app.set('view engine', 'ejs');
app.set('views', 'views');

const gmaUrl = 'https://www.gmanetwork.com/news/'


// ID-URL map storage
const linkStore = new Map();
const MAX_STORE_SIZE = 8; // Maximum number of entries

function addLink(id, url) {
    if (linkStore.size >= MAX_STORE_SIZE) {
        //Remove the oldest entry (FIFO)
        const oldestKey = linkStore.keys().next().value;
        linkStore.delete(oldestKey);
    }   
    linkStore.set(id, url);
}

function getLink(id) {
    return linkStore.get(id);
}

async function scrapeLinks() {
    try {
        const { data } = await axios.get(gmaUrl);
        const $ = cheerio.load(data);
        const linkElements = $('.just-in-content a');
        
        //Extract links and generate unique IDs
        const links = linkElements.map((i, elem) => ({
            id: crypto.randomUUID(),
            url: $(elem).attr('href')
        })).get()
        return links;
    } catch(err) {
        console.error(err)
    }
}
async function scrapeHeadlines() {
    try {
        const { data } = await axios.get(gmaUrl);
        const $ = cheerio.load(data);
        var titles = []
        $('.just-in-content .just-in-story-title').each(function(i, elem) {
            titles[i] = $(elem).text();
        })
        return titles;
    } catch(err) {
        console.error(err)
    }
}
async function scrapePage(url) {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data)
        const title = $('.story_links').text();
        const body = $('.story_main p').text();
        const result = {title, body}

        return result;
    } catch(err) {
        console.error(err)
    }
}

app.get('/', async (req, res) => {
    try {
        const headlines = await scrapeHeadlines()
        const links = await scrapeLinks()

        //Store links in the in-memory store
        links.forEach(link => addLink(link.id, link.url));
        console.log(linkStore)
        res.render('home', { Headlines: headlines, Links: links.map(link => link.id) })
    } catch(error) {
        console.error(error)
    }
})
app.get('/article/:id', async (req, res) => {
    const { id } = req.params
    try {
        const link = getLink(id);
        if(!link) {
            return res.status(404).send('Article not found');
        }
        const page = await scrapePage(link);
        res.render('page', { Page: page });
    } catch(error) {
        console.error(error)
        res.status(500).send('Internal server error')
    }
})

app.listen(3000, () => {
    console.log('App is running at http://localhost:3000')
});