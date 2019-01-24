import { ElementManager } from "./ElementManager";
import { Resources } from "./Resources";

export class SoundManager {
  public static initialise(): void {
    this.wasps = ElementManager.getElement(Resources.soundWasps) as HTMLAudioElement;
    this.splat = ElementManager.getElement(Resources.soundSplat) as HTMLAudioElement;
    this.gameOver = ElementManager.getElement(Resources.soundGameover) as HTMLAudioElement;
    this.seesaw = ElementManager.getElement(Resources.soundSeesaw) as HTMLAudioElement;
    this.bonus = ElementManager.getElement(Resources.soundBonus) as HTMLAudioElement;
    this.music = ElementManager.getElement(Resources.music) as HTMLAudioElement;
    this.music.volume = 0.3;
  }

  public play(sound: HTMLAudioElement): void {
    sound.pause();
    sound.currentTime = 0;
    sound.play();
  }

  public static gameOver: HTMLAudioElement;
  public static splat: HTMLAudioElement;
  public static wasps: HTMLAudioElement;
  public static seesaw: HTMLAudioElement;
  public static bonus: HTMLAudioElement;
  public static music: HTMLAudioElement;
}
