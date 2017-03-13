var request = require("request-promise");
var cheerio = require("cheerio");
var moment = require("moment");
var Slack = require("node-slack");

if (process.env.SLACK_URL === undefined)
  throw new Error("SLACK_URL environment variable is not set.");
var slack = new Slack(process.env.SLACK_URL);

var URL = process.env.URL ||
  "https://www.fi.issworld.com/palvelumme-service/ruokailupalvelut/ravintolat/midpoint-ruokalistasivu";
var DATE_FORMAT = process.env.DATE_FORMAT || "dddd DD.MM.";
var SLACK_USERNAME = process.env.SLACK_USERNAME || "Hungry Hungry Hippo";
var SLACK_ICON_EMOJI = process.env.SLACK_ICON_EMOJI || ":fork_and_knife:";

function getMenu() {
  return request(URL, {
    transform: data => {
      return cheerio.load(data);
    }
  }).then(data => {
    var out = {};
    var curDate = null;

    data("table tbody tr td").each((i, el) => {
      if (el.children.length > 0) {
        if (el.children[0].data !== undefined) {
          var data = el.children[0].data;
          var d = moment(data, DATE_FORMAT);

          if (d.isValid()) {
            curDate = d;
          } else if (curDate !== null) {
            formattedDate = curDate.format(DATE_FORMAT);
            if (out[formattedDate] === undefined) out[formattedDate] = [];
            out[formattedDate].push(data);
          }
        }
      }
    });
    return out;
  });
}

function todaysMenu() {
  return getMenu().then(data => {
    var today = data[moment().format(DATE_FORMAT)];

    if (today === undefined)
      throw new Error("No menu for today!\n\n" + JSON.stringify(data));
    return today;
  });
}

todaysMenu()
  .then(data => {
    slack.send({
      text: "Here is today's weather and menu.\nHave a great day! :metal:",
      attachments: [
        {
          fallback: "Weather at Espoo right now.",
          image_url: "http://wttr.in/Espoo.png?mp0&lang=en"
        },
        {
          text: data.join("\n")
        }
      ],
      username: SLACK_USERNAME,
      icon_emoji: SLACK_ICON_EMOJI
    });
  })
  .catch(err => {
    slack.send({
      text: "Something went wrong when getting the menu :cold_sweat:.\n```" +
        err +
        "```",
      username: SLACK_USERNAME,
      icon_emoji: SLACK_ICON_EMOJI
    });
  });
