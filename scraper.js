const puppeteer = require("puppeteer");

const r18VideoUrl = "https://www.r18.com/common/search/searchword=";
const javHDVideoUrl = "https://www2.javhdporn.net/video/";
const javDatabaseUrl = "https://www.javdatabase.com/idols/";

async function scrapeR18(code) {
  console.log("Start Scraping Movie =========> ", code);
  const movie = {};
  const movieId = code.toLowerCase();
  const searchPage = "ul.cmn-list-product01 > li.item-list > a";
  const videoPoster = "iframe";
  const videoLink = "video > source";
  const titleXPath =
    '//*[@id="root"]/div/div/div[1]/div/div[1]/div[2]/div[1]/h1';
  const actressesXPath =
    '//*[@id="root"]/div/div/div[2]/section[1]/div/div/div/div[1]/div[1]/div';
  const categoriesXPath =
    '//*[@id="root"]/div/div/div[2]/section[1]/div/div/div/div[1]/div[2]/div';
  const studioXPath =
    '//*[@id="root"]/div/div/div[2]/section[1]/div/div/div/div[1]/div[3]/div/a';
  const releaseDateXPath =
    '//*[@id="root"]/div/div/div[2]/section[1]/div/div/div/div[2]/div/div[1]/div';
  const lengthXPath =
    '//*[@id="root"]/div/div/div[2]/section[1]/div/div/div/div[2]/div/div[2]/div';

  let r18MovieLink;

  browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  // begin scraping
  // scrape - 1 (Search and get movie link)
  let page = await browser.newPage();
  await page.goto(`${r18VideoUrl}${movieId}/`);
  try {
    await page.waitForSelector(searchPage, { timeout: 5000 });
    // use xpath / css selector
    r18MovieLink = await page.$$eval(
      searchPage,
      (elems) => elems.map((el) => el.href)[0]
    );
    // scrape - 2 (Get Video Trailer Link)
    page = await browser.newPage();
    await page.goto(r18MovieLink);
    await page.waitForSelector(videoLink, { timeout: 5000 });

    // get poster
    const r18MoviePoster = await page.$$eval(
      videoPoster,
      (elems) => elems.map((el) => el.src)[0]
    );

    // get trailer
    const r18TrailerLink = await page.$$eval(
      videoLink,
      (elems) => elems.map((el) => el.src)[0]
    );

    // get Title
    const r18TitleEl = await page.$x(titleXPath);
    const r18Title = await page.evaluate((el) => el.textContent, r18TitleEl[0]);

    // get Actresses + Actress URL
    const r18ActressesEl = await page.$x(actressesXPath);
    const r18Actresses = await page.evaluate((el) => {
      const actressList = [];
      const actressInnerList = el.querySelectorAll("span a");
      for (const el of actressInnerList) {
        // actressList.push(el.href);
        actressList.push({ name: el.innerText.trim(), actressUrl: el.href });
      }
      return actressList;
    }, r18ActressesEl[0]);

    // get Categories
    const r18CategoriesEl = await page.$x(categoriesXPath);
    const r18Categories = await page.evaluate((el) => {
      const categoryList = [];
      const categoryInnerList = el.querySelectorAll("span");
      for (const el of categoryInnerList) {
        categoryList.push(el.innerText.trim());
      }
      return categoryList;
    }, r18CategoriesEl[0]);

    // get Studio
    const r18StudioEl = await page.$x(studioXPath);
    const r18Studio = await page.evaluate(
      (el) => el.textContent,
      r18StudioEl[0]
    );

    // get Release Date
    const r18ReleaseDateEl = await page.$x(releaseDateXPath);
    const r18ReleaseDate = await page.evaluate(
      (el) => el.textContent,
      r18ReleaseDateEl[0]
    );

    // get Length
    const r18LengthEl = await page.$x(lengthXPath);
    const r18Length = await page.evaluate(
      (el) => el.textContent,
      r18LengthEl[0]
    );
    // get HD trailer if available
    movie.id = code.toUpperCase();
    movie.trailer = r18TrailerLink.replace("_sm_", "_dmb_");
    movie.poster = r18MoviePoster.split("&")[1].replace("poster=", "");
    movie.title = r18Title.trim();
    movie.actresses = r18Actresses;
    movie.genres = r18Categories;
    movie.studio = r18Studio.trim();
    movie.releaseDate = r18ReleaseDate.trim();
    movie.length = r18Length.trim();
  } catch (e) {
    console.log(code + "==============" + e);
    movie.trailer = null;
    movie.poster = null;
    movie.title = null;
    movie.actresses = null;
    movie.genres = null;
    movie.studio = null;
    movie.releaseDate = null;
    movie.length = null;
    // throw new Error("Some error occured during scraping");
  }
  browser.close();
  console.log("Done Scraping Movie =========> ", movie);
  return movie;
}

async function scrapeR18Actress(actressUrl) {
  console.log("Start Scraping R18 Actress URL =========> ", actressUrl);
}

async function scrapeJavHD(code) {
  const movieId = code.toLowerCase();
  const videoPlayer = "div.video-player-area";
  const pageUrl = `${javHDVideoUrl}${movieId}/`;
  console.log("Scraping ====> " + pageUrl);
  browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  // begin scraping
  // scrape - 1 (Search and get movie link)
  let page = await browser.newPage();
  await page.goto(pageUrl);
  try {
    await page.waitForSelector(videoPlayer, { timeout: 3000 });
    return pageUrl;
  } catch (e) {
    return null;
  }
}

module.exports.scrapeJavHD = scrapeJavHD;
module.exports.scrapeR18 = scrapeR18;
module.exports.scrapeR18Actress = scrapeR18Actress;
