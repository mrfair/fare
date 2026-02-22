import template from "./index.html?raw";
import "./index.scss";

import { $ } from "../../app/dom.ts";
import type { FareApi } from "../../app/api/index.ts";

export { template };

type Item = {
  id: string;
  title: string;
  createdAt?: string;
};

type ApiDemoContext = {
  root: Element;
  api: FareApi;
};

export function mount(ctx: ApiDemoContext) {
  const root = ctx.root;
  const out = $("#out", root);
  if (!out) return () => {};

  const schoolsEndpoint = ctx.api.endpoint("/health");
  const itemsResource = ctx.api.resource<Item, Pick<Item, "title">>("items");

  const show = (value: unknown) => {
    out.text(typeof value === "string" ? value : JSON.stringify(value, null, 2));
  };

  const handlePing = async () => {
    try {
      const health = await schoolsEndpoint.get();
      show(health);
    } catch (error) {
      show({ error: String(error) });
    }
  };

  const handleLoad = async () => {
    try {
      const items = await itemsResource.list();
      show(items);
    } catch (error) {
      show({ error: String(error) });
    }
  };

  const handleAdd = async () => {
    try {
      const title = `New Item ${Math.floor(Math.random() * 1_000)}`;
      const created = await itemsResource.create({ title });
      show(created);
    } catch (error) {
      show({ error: String(error) });
    }
  };

  const pingBtn = $("#ping", root);
  const loadBtn = $("#load", root);
  const addBtn = $("#add", root);

  pingBtn.on("click", handlePing);
  loadBtn.on("click", handleLoad);
  addBtn.on("click", handleAdd);

  return () => {
    pingBtn.destroy();
    loadBtn.destroy();
    addBtn.destroy();
  };
}
