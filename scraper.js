const puppeteer = require("puppeteer");

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
  await page.setDefaultNavigationTimeout(5000);
  await page.goto(`https://www.r18.com/common/search/searchword=${movieId}/`);
  try {
    await page.waitForSelector(searchPage);

    // use xpath / css selector
    r18MovieLink = await page.$$eval(
      searchPage,
      (elems) => elems.map((el) => el.href)[0]
    );

    // scrape - 2 (Get Video Trailer Link)
    page = await browser.newPage();
    await page.setDefaultNavigationTimeout(5000);
    await page.goto(r18MovieLink);
    await page.waitForSelector(videoLink);
    await page.waitForSelector(videoPoster);

    const r18MoviePoster = await page.$$eval(
      videoPoster,
      (elems) => elems.map((el) => el.src)[0]
    );

    const r18TrailerLink = await page.$$eval(
      videoLink,
      (elems) => elems.map((el) => el.src)[0]
    );

    movie.trailer = r18TrailerLink.replace("_sm_", "_dmb_");
    movie.poster = r18MoviePoster.split("&")[1].replace("poster=", "");
  } catch (e) {
    console.log(code + "==============" + e);
    movie.trailer = null;
    movie.poster = null;
    return movie;
  }
  browser.close();
  console.log(console.log("Scraping R18 ========> ", movie));
  return movie;
}

module.exports = scrapeR18;
