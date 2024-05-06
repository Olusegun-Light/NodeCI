const puppeteer = require("puppeteer");
const Page = require("./helpers/page");

let page, customPage;

beforeEach(async () => {
  page = await Page.build();
  customPage = new Page(page); // Initialize customPage
  // redirects to this page
  await page.goto("http://localhost:3000/");
});

afterEach(async () => {
  await customPage.close();
});

test("The header has the correct text", async () => {
  const text = await customPage.getContentsOf("a.brand-logo");

  expect(text).toEqual("Blogster");
});

test("Clicking login starts oauth flow", async () => {
  await page.click(".right a");
  const url = await page.url();
  expect(url).toMatch(/accounts\.google\.com/);
});

test("When signed in, shows logout button", async () => {
  await customPage.login();
  const text = await page.$eval('a[href="/auth/logout"]', (el) => el.innerHTML);

  expect(text).toEqual("Logout");
});
