# Tutorial VII - Actor Migrations & Maintaining State

#### Quiz

### - Actors have a Restart on error option in their Settings. Would you use this for your regular actors? Why? When would you use it, and when not?
> I guess this option might to be used carefully because there could be any exception which could be thrown any time, and it could cost too much.
> So this option should be used with caution after you decided that actor really needed

### - Migrations happen randomly, but by setting Restart on error and then throwing an error in the main process, you can force a similar situation. Observe what happens. What changes and what stays the same in a restarted actor run?
> Any actor run in terminal state, i.e. run with status FINISHED, FAILED, ABORTED and TIMED-OUT, might be resurrected back to a RUNNING state. This is helpful in many cases, for example when the timeout for actor run was too low or any a case of an unexpected error.

### - Why don't you usually need to add any special code to handle migrations in normal crawling/scraping? Is there a component, that essentially solves this problem for you?
> Because the state persisted in to the apify_storage during scraping and this storage handled across instances.

### - How can you intercept the migration event? How much time do you need after this takes place and before the actor migrates?
> You have to use Apify.events which receives an instance of a Node.js EventEmitter class, that emits various events from the SDK, or the Apify platform. By on method, subscribe on migrating event.

### - When would you persist data to a default key-value store and when would you use a named key-value store?
> Default key-value store is good when you don't need to store your data long. Use named key-value store when you need to store data for a long and when you want to get access to it from another place, because it doesn't attach to a specific run, and you can simply reach it.

