# midpoint

## Getting Started
* run `yarn` to install all packages
* node version >= 6.10.0

## Environment Variables
* SLACK_URL (**required**) - The Slack callback URL that is to be used (can be requested from [here](https://my.slack.com/services/new/incoming-webhook/)).
* RESTAURANT_ID (**required**) - Numeric id of restaurant in the api (can be found by clicking the JSON text in the widget, and then taking the first numeric part).
* SLACK_USERNAME - The username that is shown when posting the message (defaults to "Hungry Hungry Hippo").
* SLACK_ICON_EMOJI - Emoji icon to use (defaults to ":fork_and_knife:").
