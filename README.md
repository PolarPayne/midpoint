# midpoint

## Getting Started
* run `yarn` to install all packages
* use node version 4.3.2 (because of AWS Lambda)

## Environment Variables
* SLACK_URL (**required**) - The Slack callback URL that is to be used (can be requested from [here](https://my.slack.com/services/new/incoming-webhook/)).
* SLACK_USERNAME - The username that is shown when posting the message (defaults to "Hungry Hungry Hippo").
* SLACK_ICON_EMOJI - Emoji icon to use (defaults to ":fork_and_knife:").
* URL - The URL where the manu resides.
* DATE_FORMAT - The date format as specified for moment, that is used in the English date headings of the website (defaults to "dddd DD.MM.").
