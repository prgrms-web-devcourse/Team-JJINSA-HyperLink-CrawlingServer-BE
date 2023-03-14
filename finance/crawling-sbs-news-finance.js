const utils = require("../utils.js");
const axios = require("axios");
const amqp = require("amqplib");
const cheerio = require("cheerio");

const MQ_URL = "amqp://guest:guest@127.0.0.1";

const getHTML = async () => {
  const response = await axios.get(
    "https://news.sbs.co.kr/news/newsSection.do?sectionType=02&plink=SNB&cooper=SBSNEWS"
  );
  return response.data;
};

async function main() {
  const html = await getHTML();
  const $ = cheerio.load(html);
  const $newsList = $(".w_news_list ul li");

  resultList = [];
  $newsList.each((index, elem) => {
    const $a = $(elem).find(".news");
    const $img = $(elem).find(".news span img");
    const onerror = $img.attr("onerror");
    const isimgUrl = onerror.split("this.src=")[1];
    const imgUrl = isimgUrl.replaceAll("'", "");

    resultList.push({
      title: $a.attr("title"),
      link: "https://news.sbs.co.kr/" + $a.attr("href"),
      contentImgLink:
        isimgUrl != undefined
          ? imgUrl
          : "https://hyperlink-data.s3.ap-northeast-2.amazonaws.com/content-default-image/logo_sbs_finance.png",
      categoryName: "finance",
      creatorName: "sbs 경제",
    });
  });

  return resultList;
}

main().then(async (responses) => {
  const connect = await amqp.connect(MQ_URL);

  await utils.connectToChannelAndPublish(connect, responses);

  await connect.close();
});
