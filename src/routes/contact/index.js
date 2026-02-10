import template from "./index.html?raw";
import "./index.scss";
import { $ } from "../../app/dom.js";

export { template };

export function mount({ root }) {
  const status = $("#contactStatus", root);
  const form = $("#contactForm", root).get();
  if (!form) return null;

  const setStatus = (text) => status.text(text);

  const offSubmit = $.on(form, "submit", (event) => {
    event.preventDefault();
    setStatus("กำลังส่ง...");
    setTimeout(() => {
      setStatus("ส่งสำเร็จ! ฝันดี 🤝");
      form.reset();
    }, 800);
  });

  return () => offSubmit?.();
}
