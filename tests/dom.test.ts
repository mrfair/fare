import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { $, $$ } from "../src/app/dom";

describe("MiniQuery helpers", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("chains text and class helpers", () => {
    document.body.innerHTML = "<div id=app></div>";
    const app = $("#app");
    app.text("ready").addClass("ready-state");
    expect(app.text()).toBe("ready");
    expect(app.get()?.classList.contains("ready-state")).toBe(true);
  });

  it("accepts arrays when setting html", () => {
    const wrapper = $("<div>");
    const span = $("<span>");
    span.text("nested");
    wrapper.html([
      span,
      document.createTextNode(" text"),
    ]);

    expect(wrapper.find("span").text()).toBe("nested");
    expect(wrapper.text()).toContain(" text");
  });

  it("registers and removes listeners via destroy", () => {
    const button = document.createElement("button");
    document.body.appendChild(button);
    let count = 0;
    $(button).on("click", () => {
      count += 1;
    });

    button.click();
    expect(count).toBe(1);

    $.destroy(button);
    button.click();
    expect(count).toBe(1);
  });

  it("selects multiple elements with $$", () => {
    document.body.innerHTML = "<div class=box></div><div class=box></div>";
    expect($$(".box")).toHaveLength(2);
  });
});
