const Page = require("./helpers/page");

let page, customPage;
beforeEach(async () => {
  page = await Page.build();
  customPage = new Page(page); // Initialize customPage

  await page.goto("http://localhost:3000/");
});

afterEach(async () => {
  await customPage.close();
});

describe("When logged in", () => {
  beforeEach(async () => {
    await customPage.login();
    await page.click("a.btn-floating");
  });

  test("Can see blog create form", async () => {
    const label = await customPage.getContentsOf("form label");

    expect(label).toEqual("Blog Title");
  });

  describe("And using valid inputs", () => {
    beforeEach(async () => {
      await page.type(".title input", "My Title");
      await page.type(".content input", "My Content");
      await page.click("form button");
    });

    test("Submitting takes user to review screen", async () => {
      const text = await customPage.getContentsOf("h5");
      expect(text).toEqual("Please confirm your entries");
    });

    test("Submitting then saving adds blog to index page", async () => {
      await page.click("button.green");
      await page.waitForSelector(".card");

      const title = await customPage.getContentsOf(".card-title");
      const content = await customPage.getContentsOf("p");

      expect(title).toEqual("My Title");
      expect(content).toEqual("My Content");
    });
  });

  describe("And using invalid inputs", () => {
    beforeEach(async () => {
      await page.click("form button");
    });

    test("the form shows an error message", async () => {
      const titleError = await customPage.getContentsOf(".title .red-text");
      const contentError = await customPage.getContentsOf(".content .red-text");

      expect(titleError).toEqual("You must provide a value");
      expect(contentError).toEqual("You must provide a value");
    });
  });
});

describe("User is not logged in", () => {
  test("User cannot create blog posts", async () => {
    const result = await page.evaluate(async () => {
      const response = await fetch("/api/blogs", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "My title",
          content: "My second content",
        }),
      });
      return response.json();
    });

    expect(result).toEqual({ error: "You must log in!" });
  });

  test("User cannot get a list of posts", async () => {
    const result = await page.evaluate(() => {
      return fetch("/api/blogs", {
        method: "GET",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => res.json());
    });

    expect(result).toEqual({ error: "You must log in!" });
  });
});
