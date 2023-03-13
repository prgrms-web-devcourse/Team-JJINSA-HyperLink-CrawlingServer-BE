const utils = require("../utils.js");
const axios = require("axios");
const amqp = require("amqplib");
const cheerio = require("cheerio");

const MQ_URL = "amqp://guest:guest@127.0.0.1";

const getHTML = async () => {
  const response = await axios.get("https://www.elle.co.kr/fashion");
  return response.data;
};

async function main() {
  const html = await getHTML();
  const $ = cheerio.load(html);
  const $wraps = $("#contents .contents_wrap .contents .articlebox");

  resultList = [];
  $wraps.each((index, elem) => {
    const $thumb = $(elem).children(".Thumb455");
    const $textbox = $(elem).children(".textbox");
    const style = $($thumb).attr("style");
    const tmpImgUrl = style.substring(style.indexOf("'") + 1);
    const imgUrl = tmpImgUrl.substring(0, tmpImgUrl.indexOf("'"));

    resultList.push({
      title: $textbox.find("em a").text().trim(),
      link: "https://www.elle.co.kr" + $textbox.find("a").attr("href"),
      contentImgLink:
        imgUrl != undefined
          ? imgUrl
          : "https://hyperlink-data.s3.ap-northeast-2.amazonaws.com/content-default-image/logo_elle_beauty.png",
      categoryName: "beauty",
      creatorName: "ELLE 패션",
    });
  });
  return resultList;
}

main().then(async (responses) => {
  console.log(responses);
  // const connect = await amqp.connect(MQ_URL);
  // await utils.connectToChannelAndPublish(connect, responses);
  // await connect.close();
});
