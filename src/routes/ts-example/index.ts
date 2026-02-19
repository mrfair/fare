import template from "./index.html?raw";
import "./index.scss";
import { $ } from "../../app/dom";

enum DemoMode {
  Default = "default",
  Typed = "typed",
}

type CounterState = {
  value: number;
  step: number;
};

type TsExampleContext = {
  root: Element;
  query?: Record<string, string>;
  navigate?: (path: string, options?: { replace?: boolean }) => Promise<void>;
};

export { template };

export function mount({ root, query = {}, navigate }: TsExampleContext) {
  const mode = query.mode === DemoMode.Typed ? DemoMode.Typed : DemoMode.Default;
  $("#tsMode", root).text(`Mode: ${mode}`);

  const counter: CounterState = {
    value: Number(query.start) || 0,
    step: Number(query.step) || 1,
  };

  const valueEl = $("#tsValue", root);

  const renderValue = () => {
    valueEl.text(String(counter.value));
  };

  const increment = () => {
    counter.value += counter.step;
    renderValue();
  };

  const reset = () => {
    counter.value = Number(query.start) || 0;
    renderValue();
  };

  renderValue();

  const incBtn = $("#tsInc", root);
  const resetBtn = $("#tsReset", root);
  const navBtn = $("#tsNav", root);

  incBtn.on("click", increment);
  resetBtn.on("click", reset);
  const handleNavigate = () => {
    navigate?.("/about?mode=demo");
  };

  navBtn.on("click", handleNavigate);

  return () => {
    incBtn.off("click", increment);
    resetBtn.off("click", reset);
    navBtn.off("click", handleNavigate);
  };
}
