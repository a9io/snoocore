---
title: Snoocore configuration
layout: default
---

# Configuration Options

Adjust the following default options as necessary when initializing Snoocore. Only global settings are shown here - settings specific to a part of how Snoocore operates will apper in that specific documentation.

```javascript
{
  /*
  REQUIRED - Uniquely identify your application
  */
  userAgent: 'snoocore-default',

  /*
  OPTIONAL - <default: varies>
  
  Milliseconds to throttle requests at.

  - The default wait is 1 request per 2 seconds (2000ms)
  - If using OAuth, will adjust to 1 request per second (1000ms)
  - To disable, set to 0
  */
  throttle: <varies>,

  /*
  OPTIONAL - <default: false>

  Globally decode html entities from reddits response.
  */
  decodeHtmlEntities: false

  /*
  OPTIONAL - <default: "json">

  Auto fill the `api_type` parameter with this value.
  Set to `false` to not auto-fill this parameter.
  */
  apiType: "json"

  /*
  See the cookie login section for more information
  */
  login: {},

  /*
  See the oauth login section for more information
  */
  oauth: {}
}
```

## Identifying your app with Reddit

Reddit has a [set of API rules](https://github.com/reddit/reddit/wiki/API#wiki-rules) that outline how to identify your app using a `User-Agent` string. To set your `User-Agent`, make sure to include it when initializing Snoocore:


```javascript
var reddit = new Snoocore({ userAgent: 'myAppsName@0.0.5 by username' });
/* every call after this uses the set userAgent */
```