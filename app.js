const express = require('express');

const app = express();

app.use(express.static('public'))
app.set('view engine', 'ejs');
app.set('views', 'views');

const { scrapeGMALinks, scrapeGMAHeadlines, scrapeGMAPage } = require('./utils/scrape-gma.js');
const { scrapeInquirerLinks, scrapeInquirerHeadlines, scrapeInquirerPage } = require('./utils/scrape-inquirer.js');
const { addLink, getLink } = require('./utils/url-map-storage.js');

app.get('/', async (req, res) => {
    try {
        const headlinesGMA = await scrapeGMAHeadlines();
        const linksGMA = await scrapeGMALinks();
        const headlinesInquirer = await scrapeInquirerHeadlines();
        const linksInquirer = await scrapeInquirerLinks();

        const now = new Date().toDateString();
        const formattedDate = now

        //Store links in the in-memory store
        linksGMA.forEach(link => addLink(link.id, link.url, link.source));
        linksInquirer.forEach(link => addLink(link.id, link.url, link.source));
        //console.log(linksGMA.map(link => link.id, link.url, link.source))

        res.render('home', { 
            HeadlinesGMA: headlinesGMA,
            HeadlinesInquirer: headlinesInquirer, 
            LinksGMA: linksGMA.map(link => link.id),
            LinksInquirer: linksInquirer.map(link => link.id), 
            Date: formattedDate })
    } catch(error) {
        console.error(error)
    }
})
app.get('/article/:id', async (req, res) => {
    const { id } = req.params
    const now = new Date().toDateString();
    const formattedDate = now
    try {
        const link = getLink(id);
        if(!link) {
            console.log('No link')
            return res.status(404).render('404', { Date: formattedDate });
        }
        let page;
        if(link.source === 'gma') {
            page = await scrapeGMAPage(link.url);
        } else if (link.source === 'inquirer') {
            page = await scrapeInquirerPage(link.url);
        } else {
            return res.status(404).render('404', { Date: formattedDate });
        }

        res.render('page', { Page: page, Date: formattedDate, Source: link.url });
    } catch(error) {
        console.error(error)
        res.status(500).send('Internal server error')
    }
})

app.listen(80, () => {
    console.log('App is running at port 80')
});