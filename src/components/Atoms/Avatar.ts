export interface AvatarOptions {
  label?: string;
  imageUrl?: string;
  size?: number;
}

export function Avatar({ label = "", imageUrl, size = 40 }: AvatarOptions = {}): HTMLDivElement {
  const avatar = document.createElement("div");
  avatar.classList.add("avatar");
  if (size) {
    avatar.style.width = `${size}px`;
    avatar.style.height = `${size}px`;
    avatar.style.fontSize = `${size / 3}px`;
  }
  if (imageUrl) {
    avatar.style.backgroundImage = `url(${imageUrl})`;
    avatar.style.backgroundSize = "cover";
    avatar.textContent = "";
  } else {
    avatar.textContent = label;
  }
  return avatar;
}
