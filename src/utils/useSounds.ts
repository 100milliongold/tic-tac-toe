import { useRef, useEffect } from "react";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";

import { useSettings } from "@contexts/settings-context";

type SoundType = "pop1" | "pop2" | "win" | "loss" | "draw";

export default function useSounds(): (sound: SoundType) => void {
    const { settings } = useSettings();

    const popSoundref = useRef<Audio.Sound | null>(null);
    const pop2Soundref = useRef<Audio.Sound | null>(null);
    const winSoundref = useRef<Audio.Sound | null>(null);
    const lossSoundref = useRef<Audio.Sound | null>(null);
    const drawSoundref = useRef<Audio.Sound | null>(null);

    const playSound = async (sound: SoundType): Promise<void> => {
        const soundMap = {
            pop1: popSoundref,
            pop2: pop2Soundref,
            win: winSoundref,
            loss: lossSoundref,
            draw: drawSoundref
        };
        try {
            const status = await soundMap[sound].current?.getStatusAsync();
            status &&
                status.isLoaded &&
                settings?.sounds &&
                soundMap[sound].current?.replayAsync();

            if (settings?.haptics) {
                switch (sound) {
                    case "pop1":
                    case "pop2":
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        break;
                    case "win":
                        Haptics.notificationAsync(
                            Haptics.NotificationFeedbackType.Success
                        );
                        break;
                    case "loss":
                        Haptics.notificationAsync(
                            Haptics.NotificationFeedbackType.Error
                        );
                        break;
                    case "draw":
                        Haptics.notificationAsync(
                            Haptics.NotificationFeedbackType.Warning
                        );

                        break;

                    default:
                        break;
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        //여기에서 사운드를 로드
        const popSoundObject = new Audio.Sound();
        const pop2SoundObject = new Audio.Sound();
        const winSoundObject = new Audio.Sound();
        const lossSoundObject = new Audio.Sound();
        const drawSoundObject = new Audio.Sound();

        const loadSounds = async () => {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            await popSoundObject.loadAsync(require("@assets/pop_1.wav"));
            popSoundref.current = popSoundObject;

            // eslint-disable-next-line @typescript-eslint/no-var-requires
            await pop2SoundObject.loadAsync(require("@assets/pop_2.wav"));
            pop2Soundref.current = pop2SoundObject;

            // eslint-disable-next-line @typescript-eslint/no-var-requires
            await winSoundObject.loadAsync(require("@assets/win.mp3"));
            winSoundref.current = winSoundObject;

            // eslint-disable-next-line @typescript-eslint/no-var-requires
            await lossSoundObject.loadAsync(require("@assets/loss.mp3"));
            lossSoundref.current = lossSoundObject;

            // eslint-disable-next-line @typescript-eslint/no-var-requires
            await drawSoundObject.loadAsync(require("@assets/draw.mp3"));
            drawSoundref.current = drawSoundObject;
        };
        loadSounds();

        return () => {
            // 여기에서 사운드를 헤제
            popSoundObject && popSoundObject.unloadAsync();
            pop2SoundObject && pop2SoundObject.unloadAsync();
            winSoundObject && winSoundObject.unloadAsync();
            lossSoundObject && lossSoundObject.unloadAsync();
            drawSoundObject && drawSoundObject.unloadAsync();
        };
    }, []);

    return playSound;
}
