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

async function scrapeJavDbActress(actressName) {
  let actressDetails = {};
  //   actressName = actressName.toLowerCase().split(" ").join("-");
  const javDbUrl = `${javDatabaseUrl}${actressName}/`;

  // Jav Database XPath Collections
  const photoXPath = '//*[@id="content"]/div[2]/div[1]/a/img';
  const nameXPath = '//*[@id="content"]/div[2]/div[2]/table/tbody/tr[1]/td[2]';
  const dobXPath = '//*[@id="content"]/div[2]/div[2]/table/tbody/tr[5]/td[2]';
  const heightXPath =
    '//*[@id="content"]/div[2]/div[2]/table/tbody/tr[8]/td[2]';
  const cupXPath = '//*[@id="content"]/div[2]/div[2]/table/tbody/tr[9]/td[2]';
  const measurementXPath =
    '//*[@id="content"]/div[2]/div[2]/table/tbody/tr[10]/td[2]';
  const bodyTypeXPath =
    '//*[@id="content"]/div[2]/div[2]/table/tbody/tr[12]/td[2]';
  const twitterXPath =
    '//*[@id="content"]/div[2]/div[2]/table/tbody/tr[20]/td[2]';

  console.log("Start Scraping Jav Database URL =========> ", javDbUrl);
  try {
    browser = await puppeteer.launch({ args: ["--no-sandbox"] });
    let page = await browser.newPage();
    await page.goto(javDbUrl);
    // get picture
    // const javDbPhotoEl = await page.$x(photoXPath);
    // const javDbPhoto = await page.evaluate((el) => el.src, javDbPhotoEl[0]);
    // console.log("Getting photo: ", javDbPhoto);
    // get name
    const javDbNameEl = await page.$x(nameXPath, { timeout: 5000 });
    const javDbName = await page.evaluate(
      (el) => el.textContent,
      javDbNameEl[0]
    );
    console.log("Getting Name: ", javDbName);
    // get dob
    const javDbDobEl = await page.$x(dobXPath, { timeout: 5000 });
    const javDbDob = await page.evaluate((el) => el.innerText, javDbDobEl[0]);
    console.log("Getting photo: ", javDbDob);
    // get dob
    const javDbHeightEl = await page.$x(heightXPath, { timeout: 5000 });
    const javDbHeight = await page.evaluate(
      (el) => el.innerText,
      javDbHeightEl[0]
    );
    console.log("Getting height: ", javDbHeight);
    // get cup
    const javDbCupEl = await page.$x(cupXPath, { timeout: 5000 });
    const javDbCup = await page.evaluate((el) => el.innerText, javDbCupEl[0]);
    console.log("Getting cup: ", javDbCup);
    // get measurement
    const javDbMeasurementEl = await page.$x(measurementXPath, {
      timeout: 5000,
    });
    const javDbMeasurement = await page.evaluate(
      (el) => el.textContent,
      javDbMeasurementEl[0]
    );
    console.log("Getting measurement: ", javDbMeasurement);

    // get body type array
    const javDbBodyTypeEl = await page.$x(bodyTypeXPath, { timeout: 5000 });
    const javDbBodyTypes = await page.evaluate((el) => {
      const bodyTypeList = [];
      const bodyTypeInnerList = el.querySelectorAll("a");
      for (const el of bodyTypeInnerList) {
        bodyTypeList.push(el.innerText.trim());
      }
      return bodyTypeList;
    }, javDbBodyTypeEl[0]);
    console.log("Getting body type: ", javDbBodyTypes);

    // get twitter
    const javDbTwitterEl = await page.$x(twitterXPath, {
      timeout: 1000,
    });
    const javDbTwitter = await page.evaluate(
      (el) => el.textContent,
      javDbTwitterEl[0]
    );
    console.log("Getting twitter: ", javDbTwitter);

    actressDetails.photo = `https://www.javdatabase.com/idolimages/full/${actressName}.webp`;
    actressDetails.name = javDbName;
    actressDetails.dob = javDbDob;
    actressDetails.height = javDbHeight;
    actressDetails.cup = javDbCup;
    actressDetails.measurement = javDbMeasurement;
    actressDetails.bodyTypes = javDbBodyTypes;
    actressDetails.twitter = javDbTwitter.replace("\n", "");
  } catch (e) {
    console.log("Error while scrapping jav database ", e);
    return null;
  }
  browser.close();
  return actressDetails;
  //   console.log(actressDetails);
}

async function scrapeR18Actress(actressUrl) {
  let r18MovieList = {};
  actressUrl = decodeURIComponent(actressUrl);

  // R18 XPath Collection
  const r18MovieListXPath = '//*[@id="contents"]/div[2]/section/ul[2]';

  console.log("Start Scraping R18 Actress URL =========> ", actressUrl);
  try {
    browser = await puppeteer.launch({ args: ["--no-sandbox"] });
    let page = await browser.newPage();
    await page.goto(actressUrl);
    // get Actresses + Actress URL
    const r18MovieListEl = await page.$x(r18MovieListXPath, { timeout: 5000 });
    r18MovieList = await page.evaluate((el) => {
      const trailerList = [];
      const actressInnerList = el.querySelectorAll("li");
      for (const el of actressInnerList) {
        const linkEl = el.querySelector("a ");
        const imgEl = el.querySelector("a > p > img");
        trailerList.push({
          id: imgEl.alt,
          thumbnail: imgEl.src,
          trailer: linkEl.href,
        });
      }
      return trailerList;
    }, r18MovieListEl[0]);
    // console.log(r18MovieList);
  } catch (e) {
    console.log("Error while scrapping R18 actress ", e);
    return null;
  }
  browser.close();
  return r18MovieList;
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
    const r18MoviePoster = await page.$$eval(
      videoPoster,
      (elems) => elems.map((el) => el.src)[0]
    );
  } catch (e) {
    return null;
  }
}

module.exports.scrapeJavHD = scrapeJavHD;
module.exports.scrapeR18 = scrapeR18;
module.exports.scrapeR18Actress = scrapeR18Actress;
module.exports.scrapeJavDbActress = scrapeJavDbActress;
