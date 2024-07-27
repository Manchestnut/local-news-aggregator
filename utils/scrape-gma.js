const axios = require('axios');
const cheerio = require('cheerio');
const crypto = require('crypto');

const gmaUrl = 'https://www.gmanetwork.com/news/'

async function scrapeGMALinks() {
    try {
        const { data } = await axios.get(gmaUrl);
        const $ = cheerio.load(data);
        const linkElements = $('.just-in-content a');
        
        //Extract links and generate unique IDs
        const links = linkElements.map((i, elem) => ({
            id: crypto.randomUUID(),
            url: $(elem).attr('href'),
            source: 'gma'
        })).get()
        return links;
    } catch(err) {
        console.error(err)
    }
}
async function scrapeGMAHeadlines() {
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
async function scrapeGMAPage(url) {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data)
        const title = $('.story_links, .title-line h1').text();
        const paragraphs = [];
        $('.story_main p, .article-body p').each((i, elem) => {
            paragraphs.push($(elem).text());
        })
        const result = {title, paragraphs}

        return result;
    } catch(err) {
        console.error(err)
    }
}

module.exports = { scrapeGMALinks, scrapeGMAHeadlines, scrapeGMAPage };