const utils = require("../utils.js");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const amqp = require("amqplib");

const run = async () => {
  resultList = [];
  try {
    const browser = await puppeteer.launch({
      headless: true,
    });
    const page = await browser.newPage();
    const url = "https://www.youtube.com/@SmartMoney0/videos";
    const youtubeDefaultURL = "https://www.youtube.com";
    const thumbnailDefaultURL = "https://i.ytimg.com/vi/";
    await page.goto(url);

    const content = await page.content();

    const $ = cheerio.load(content);

    const rows = $("#contents").children(
      "ytd-rich-grid-row.ytd-rich-grid-renderer"
    );

    await rows.each(async (idx, row) => {
      const videos = $(row).children("#contents");
      videos.each(async (idx, video) => {
        const link = $(video).find("#thumbnail").attr("href");
        const videoId = link.split("=")[1];
        const thumbnailLink = thumbnailDefaultURL + videoId + "/hqdefault.jpg";

        resultList.push({
          title: $(video).find("#video-title-link").attr("title"),
          link: youtubeDefaultURL + link,
          contentImgLink: thumbnailLink,
          categoryName: "finance",
          creatorName: "미래에셋 스마트머니",
        });
      });
    });

    await page.close();
    await browser.close();
    return resultList;
  } catch (e) {
    console.log(e);
  }
};

run().then(async (responses) => {
  const connect = await amqp.connect(MQ_URL);

  await utils.connectToChannelAndPublish(connect, responses);

  await connect.close();
});
