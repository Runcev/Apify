# Tutorial II apify sdk

#### Quiz

### - Where and how can you use JQuery with the SDK?
> Within Cheerio, you get $ property in handlePageFunction().
> Within this property you can work with DOM of HTML page, but Cheerio does not have full JQuery API.
> Within Puppeteer you have a function to do that after injecting it to the page with Apify.utils.

### - What is the main difference between Cheerio and JQuery?
> Cheerio for Node.js because parses HTML from HTTP responses.
> JQuery run in a browser and connect to the DOM.
> Cheerio does not have full JQuery API.

### - When would you use CheerioCrawler and what are its limitations?
> CheerioCrawler should be use for simpler WEB without require execute JS.
> Limitations are in ability to crawl sites with JS.

### - What are the main classes for managing requests and when and why would you use one instead of another?
> The main classes are RequestList and RequestQueue.
> RequestList is static, immutable list of URLs.
> RequestQueue represents a dynamic queue of Requests, and can be updated at runtime by adding more pages.
> Use RequestList when you have pre-existing list of your own URLs. Use RequestQueue when you need to add URLs dynamically.

### - How can you extract data from a page in Puppeteer without using JQuery?
> Use methods of browser environment

### - What is the default concurrency/parallelism the SDK is running?
- minConcurrency scale up automatically if you hadn't set this parameter before.
- maxConcurrency default value equal minConcurrency
- desiredConcurrency default value equal minConcurrency
- desiredConcurrency default value equal minConcurrency
