const puppeteer = require("puppeteer");

const r18VideoUrl = "https://www.r18.com/common/search/searchword=";
const javHDVideoUrl = "https://www2.javhdporn.net/video/";

async function scrapeR18(code) {
  const movie = {};
  const movieId = code.toLowerCase();
  const searchPage = "ul.cmn-list-product01 > li.item-list > a";
  const videoPoster = "iframe";
  const videoLink = "video > source";

  let r18MovieLink;

  browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  // begin scraping
  // scrape - 1 (Search and get movie link)
  let page = await browser.newPage();
  await page.goto(`${r18VideoUrl}${movieId}/`);
  try {
    await page.waitForSelector(searchPage, { timeout: 7000 });

    // use xpath / css selector
    r18MovieLink = await page.$$eval(
      searchPage,
      (elems) => elems.map((el) => el.href)[0]
    );

    // scrape - 2 (Get Video Trailer Link)
    page = await browser.newPage();
    await page.goto(r18MovieLink);
    await page.waitForSelector(videoLink, { timeout: 5000 });
    await page.waitForSelector(videoPoster);

    const r18MoviePoster = await page.$$eval(
      videoPoster,
      (elems) => elems.map((el) => el.src)[0]
    );

    const r18TrailerLink = await page.$$eval(
      videoLink,
      (elems) => elems.map((el) => el.src)[0]
    );

    // get HD trailer if available
    movie.trailer = r18TrailerLink.replace("_sm_", "_dmb_");
    movie.poster = r18MoviePoster.split("&")[1].replace("poster=", "");
  } catch (e) {
    console.log(code + "==============" + e);
    movie.trailer = null;
    movie.poster = null;
    // throw new Error("Some error occured during scraping");
  }
  browser.close();
  console.log(console.log("Scraping R18 ========> ", movie));
  return movie;
}

async function scrapeJavHD(code) {
  const movieId = code.toLowerCase();
  const searchPage = "ul.cmn-list-product01 > li.item-list > a";
  const videoPoster = "iframe";
  const videoLink = "video > source";

  browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  // begin scraping
  // scrape - 1 (Search and get movie link)
  let page = await browser.newPage();
  await page.goto(`${javHDVideoUrl}${movieId}/`);
  try {
    await page.waitForSelector(searchPage, { timeout: 7000 });
  } catch (e) {
    console.log("Error while scraping: ", e);
  }
}

module.exports = scrapeR18;
