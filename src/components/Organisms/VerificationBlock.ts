import { Button } from "../Atoms/Button";
import { OTPInput } from "../Molecules/OTPInput";

export interface VerificationBlockOptions {
  length?: number;
  onSubmit?: (value: string) => void;
  onResend?: () => void;
}

export interface VerificationBlockResult {
  root: HTMLDivElement;
}

export function VerificationBlock(options: VerificationBlockOptions): VerificationBlockResult {
  const root = document.createElement("div");
  root.classList.add("flex", "flex-col", "gap-3");

  const otp = OTPInput({ length: options.length });
  const submit = Button({ text: "Verify", variant: "primary" });
  const resent = Button({ text: "Resend code", variant: "ghost" });
  const status = document.createElement("span");
  status.classList.add("text-sm");
  status.style.setProperty("color", "var(--muted)");
  status.textContent = "Waiting for code";

  submit.addEventListener("click", () => {
    options.onSubmit?.(otp.value());
  });

  let seconds = 30;
  let timerId: ReturnType<typeof setInterval> | null = null;

  const resetTimer = () => {
    if (timerId) clearInterval(timerId);
    seconds = 30;
    resent.disabled = true;
    status.textContent = `Resend available in ${seconds}s`;
    timerId = setInterval(() => {
      seconds -= 1;
      status.textContent = `Resend available in ${seconds}s`;
      if (seconds <= 0) {
        if (timerId) clearInterval(timerId);
        timerId = null;
        resent.disabled = false;
        status.textContent = "You can resend now.";
      }
    }, 1000);
  };

  resent.addEventListener("click", () => {
    options.onResend?.();
    resetTimer();
  });

  resetTimer();

  root.appendChild(otp.container);
  root.appendChild(submit);
  root.appendChild(resent);
  root.appendChild(status);

  return { root };
}
