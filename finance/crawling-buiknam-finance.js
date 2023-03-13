const utils = require("../utils.js");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const amqp = require("amqplib");

const MQ_URL = 'amqp://guest:guest@127.0.0.1';

const run = async () => {
  resultList = [];
  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true,
    });

    await new Promise(r => setTimeout(r, 2000));

    const page = await browser.newPage();

    await new Promise(r => setTimeout(r, 2000));

    const url = "https://www.youtube.com/@buiknam_tv/videos";
    const youtubeDefaultURL = "https://www.youtube.com";
    const thumbnailDefaultURL = "https://i.ytimg.com/vi/";
    await page.goto(url);

    await new Promise(r => setTimeout(r, 2000));

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
          creatorName: "부읽남TV 내집마련부터건물주까지",
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
