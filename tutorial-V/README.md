# Tutorial V - Tasks, Storage, Apify API & Client

#### Quiz

### - What is the relationship between actor and task?
> Actor tasks is like a configuration for your actor. You can configure specific parameters, inputs and run actor with it.

### - What are the differences between default (unnamed) and named storage? Which one would you choose for everyday usage?
> Unnamed datasets expire after 14 days unless otherwise specified
> Named datasets retained indefinitely
> If you want to retain some data, you have to select named storage. In use cases when it isn't required, you have to select the unnamed storage.

### - What is the relationship between the Apify API and the Apify client? Are there any significant differences?
> Apify Api is a REST api, Apify client is an implementation of this API, and it implements exponential backoff which helps with random API outages.

### - Is it possible to use a request queue for deduplication of product IDs? If yes, how would you do that?
> The request queue manages the process of adding the requests so that no duplicates added.

### - What is data retention and how does it work for all types of storage (default and named)?
> Unnamed default storages have limited retention time (14 days). Named storages persisted indefinitely.
> It also depends on the selected service package

### - How do you pass input when running an actor or task via the API?
> Via request body.