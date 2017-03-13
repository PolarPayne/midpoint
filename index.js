var request = require("request-promise");
var cheerio = require("cheerio");
var moment = require("moment");
var Slack = require("node-slack");
var slack = new Slack(process.env.SLACK_URL);

var DATE_FORMAT = "dddd DD.MM."
var URL = "https://www.fi.issworld.com/palvelumme-service/ruokailupalvelut/ravintolat/midpoint-ruokalistasivu";

function getMenu() {
    return request(URL, {transform: data => {return cheerio.load(data)}}).then(data => {
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
                        if (out[formattedDate] === undefined)
                            out[formattedDate] = [];

                        out[formattedDate].push(data);
                    }
                }
            }
        });
        return out;
    });
}

function todaysMenu() {
    return getMenu()
        .then(data => {
            today = data[moment().format(DATE_FORMAT)];
            if (today === undefined)
                throw Error("No menu for today!\n\n" + JSON.stringify(data));
            return today.join("\n");
        });
}

var SLACK_USERNAME = "Hungry Hungry Hippo";
var SLACK_ICON_EMOJI = ":fork_and_knife:";

todaysMenu().then(data => {
    slack.send({
        text: data,
        username: SLACK_USERNAME,
        icon_emoji: SLACK_ICON_EMOJI
    });
}).catch(err => {
    slack.send({
        text: "Something went wrong when getting the menu :cold_sweat:.\n```" + err + "```",
        username: SLACK_USERNAME,
        icon_emoji: SLACK_ICON_EMOJI
    })
});
