# Tutorial III Apify Actors & Webhooks

#### Quiz

### - How do you allocate more CPU for your actor run?
> The amount of CPU is calculated automatically from the memory allocation.

### - How can you get the exact time when the actor was started from within the running actor process?
> You can do it by a startedAt env variable.

### - Which are the default storages an actor run is allocated (connected to)?
> KeyValue store, Dataset, RequestQueue.

### - Can you change the memory allocated to a running actor?
> No. When invoking the actor, the caller has to specify the amount of memory allocated for the actor.

### - How can you run an actor with Puppeteer in a headful (non-headless) mode?
> You have to use Node.js 12 + Chrome + Xvfb on Debian docker image. It opens non-headless Chrome.

### - Imagine the server/instance the container is running on has a 32 GB, 8-core CPU. What would be the most performant (speed/cost) memory allocation for CheerioCrawler? (Hint: NodeJS processes cannot use user-created threads)
> If you have to scrape a single simple page, you have to set up memory to 128 - 512 MB for Cheerio, 1024 MB for Puppeteer.

### - What is the difference between RUN and CMD Dockerfile commands?
- RUN lets you execute commands inside of your Docker image.
- CMD lets you define a default command to run when your container starts.

### - Does your Dockerfile need to contain a CMD command (assuming we don't want to use ENTRYPOINT which is similar)? If yes or no, why?
> Yes cause trying to run an image which doesn't have an ENTRYPOINT or CMD declared will result in an error.

### - How does the FROM command work and which base images Apify provides?
> FROM command provide the image which will be the base image of created container.

> Base Apify images:
- Node.js 12 on Alpine Linux (apify/actor-node-basic)
- Node.js 12 + Chrome on Debian (apify/actor-node-chrome)
- Node.js 12 + Chrome + Xvfb on Debian (apify actor-node-chrome-xvfb)

