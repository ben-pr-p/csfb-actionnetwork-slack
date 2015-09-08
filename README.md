# CSFB Action Network Slack Integration

Automatically invites your entire Action Network email list to Slack as a regular Slack user.

This was written for use by College Students for Bernie, but can be used for any paid Action Network user that would also like to use Slack.

### How to use
This can be run locally, if you're only interested in running it once, but you'll need MongoDB and NodeJS installed.

It's much easier to run it on Heroku, and you can use the Heroku Scheduler addon to have it check for additions / modifications to the email list on a specific interval. 

### Usage / Installation

To run it, make sure you have `git` and the heroku command line installed, and that you are logged into heroku. 

Then, go to your command line and enter:

```sh
$ git clone https://github.com/ben-pr-p/csfb-actionnetwork.git
(feel free to change the directory name)
$ cd csfb-actionnetwork
$ heroku apps:create `app name` <your-app-name>
$ heroku addons:create mongolab
$ heroku config:set ACTION_NETWORK_API_KEY=<example-api-key>
$ heroku config:set SLACK_TOKEN=<example-slack-token>
$ heroku config:set SLACK_URL=<example.slack.com>
$ git push heroku master
```
To schedule it to run on an interval, enter:
```sh
$ heroku addons:create scheduler:standard
$ heroku addons:open scheduler
```

The heroku scheduler addon should open. Next to the `$`, enter:
```sh
$ node app.js
```

### Running it locally
If you'd like to run it locally, make sure you have NodeJS and MongoDB installed. In one command line window, start MongoDB by entering:
```sh
$ sudo mongod
```
In other command line window, enter:
```sh
$ export ACTION_NETWORK_API_KEY=<example-api-key>
$ export SLACK_TOKEN=<example-slack-token>
$ export SLACK_URL=<example.slack.com>
```

### Questions?

I'm happy to help out. Email ben.paul.ryan.packer@gmail.com.

If you'd like a more customized interval behavior, that's pretty easy to do. Just wrap everything after the `Get it started` inside a single function (we'll call it `main`), and then add:

`setInterval(main, Interval)`

Now, `node app.js` will make it run on the scheduled interval in milliseconds. In order to do heroku stuff, you'll also need to make a Procfile, so that complicates things a bit. Just email me.

### Time

Both NodeJS and Heroku's scheduler addon use UTC (Coordinated Universal Time), so don't be surprised when it doesn't match up with your local time!
