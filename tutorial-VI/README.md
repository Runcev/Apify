# Tutorial VI - Apify Proxy & Bypassing Antiscraping Software

#### Quiz

### - What types of proxies does the Apify Proxy include? What are the main differences between them?
> - The basic is one is the Datacenter proxy. 
> - Residential proxy – IP addresses located in homes and offices around the world. These IPs have the lowest chance of blocking.
> - Google SERP proxy - download and extract data from Google Search engine result pages (SERPs)

### - Which proxies (proxy groups) can users access with the Apify Proxy trial? How long does this trial last?
> It is a datacenter proxies.
> Free trial period of Apify Proxy is 30 days

### - How can you prevent a problem that one of the hardcoded proxy groups that a user is using stops working (a problem with a provider)? What should be the best practices?
> You can prevent a blocking of proxy by SessionPool, that filters out blocked or non-working proxies, so your actor does not retry requests over known blocked proxies.

### - Does it make sense to rotate proxies when you are logged in?
> It's depends on if the site has any detection too many requests by IP.

### - Construct a proxy URL that will select proxies only from the US (without specific groups). What do you need to do to rotate proxies (one proxy usually has one IP)? How does this differ for Cheerio Scraper and Puppeteer Scraper?
> http://\<session>,country-US:\<password>@proxy.apify.com:8000_

### - What do you need to do to rotate proxies (one proxy usually has one IP)? How does this differ for Cheerio Scraper and Puppeteer Scraper?
> To rotate proxies you need to set proxy configuration.
> Puppeteer rotates proxy/IP only after the browser changes and use the same IP for 100 requests, unlike Cheerio

### - Try to set up the Apify Proxy (using any group or auto) in your browser. This is useful for testing how websites behave with proxies from specific countries (although most are from the US). You can try Switchy Omega extension but there are many more. Were you successful?
> I set up Apify Proxy using Datacenter proxy.

### - Name a few different ways a website can prevent you from scraping it. Do you know any software companies that develop anti-scraping solutions? Have you ever encountered them on a website?
> - IP blocking
> - Requests settings(headers, user agents, cookies, tokens);
> - Browser fingerprinting
> - IP rate limiting

> Anti-scraping software: for example, Radware Bot Manager.

### - Do you know any software companies that develop anti-scraping solutions? Have you ever encountered them on a website?
> No, i don't.