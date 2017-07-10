const request = require("request-promise");
const moment = require("moment");
const IncomingWebhook = require("@slack/client").IncomingWebhook;

function todaysMenu(restaurant_id, year, month, day) {
  const now = moment();

  restaurant_id = restaurant_id || process.env.RESTAURANT_ID;
  year = year || now.format("YYYY");
  month = month || now.format("MM");
  day = day || now.format("DD");

  const url =
    "http://www.sodexo.fi/ruokalistat/output/daily_json/" +
    restaurant_id +
    "/" +
    year +
    "/" +
    month +
    "/" +
    day +
    "/fi";

  return request(url).then(data => {
    data = JSON.parse(data);

    const out = {
      title: {},
      categories: {}
    };

    for (i of data.courses) {
      const cat = i.category.trim();

      if (cat in out.categories) continue;

      out.categories[cat] = [];
    }

    out.title.text = data.meta.ref_title;
    out.title.url = data.meta.ref_url;

    for (i of data.courses) {
      const course = {
        title: {},
        description: {}
      };

      for (k in i) {
        if (i[k].length === 0) continue;
        else if (k.startsWith("title_"))
          course.title[k.substr("title_".length)] = i[k].trim();
        else if (k.startsWith("desc_"))
          course.description[k.substr("desc_".length)] = i[k].trim();
        else if (k !== "category") course[k] = i[k].trim();
      }

      out.categories[i.category.trim()].push(course);
    }

    return out;
  });
}

function slackFormat(data) {
  const out = {
    text: "", //"Here's todays menu.\nHave a great day! :sunny:",
    attachments: []
  };

  out.attachments.push({
    title: data.title.text,
    title_link: data.title.url
  });

  for (i in data.categories) {
    const cat = {
      title: i,
      fields: []
    };
    for (k of data.categories[i]) {
      cat.fields.push({
        title:
          k.title.fi +
          (k.properties !== undefined ? " (" + k.properties + ")" : ""),
        value: k.price,
        short: true
      });
    }
    out.attachments.push(cat);
  }

  return out;
}

const slack_url = process.env.SLACK_URL;
if (slack_url === undefined || slack_url.length === 0)
  throw new Error("SLACK_URL environment variable is not set.");

const slack = new IncomingWebhook(slack_url, {
  username: process.env.SLACK_USERNAME || "Hungry Hungry Hippo",
  iconEmoji: process.env.SLACK_ICON_EMOJI || ":fork_and_knife:"
});

todaysMenu().then(slackFormat).then(data =>
  slack.send(data, err => {
    if (err) throw Error(err);
  })
);

exports.handler = todaysMenu;
