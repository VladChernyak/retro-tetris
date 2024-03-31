export const playAudio = (url: string, options = {}) => {
  const audio = Object.assign(new Audio(url), options);
  audio.play();

  return new Promise<HTMLAudioElement>((resolve) => {
    audio.onloadedmetadata = () => resolve(audio);
  });
};
