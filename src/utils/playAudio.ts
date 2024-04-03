import { Howl } from "howler";

export const playAudio = async (url: string, options = {}) => {
  const audio = new Howl({ src: [url], ...options });
  audio.play();

  return new Promise<Howl>((resolve) => {
    if (audio.state() === "loaded") {
      resolve(audio);
    } else {
      audio.on("load", () => resolve(audio));
    }
  });
};
