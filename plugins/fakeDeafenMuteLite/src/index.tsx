import { findByProps } from "@vendetta/metro";
import { instead } from "@vendetta/patcher";
import { registerCommand } from "@vendetta/commands";
import { showToast } from "@vendetta/ui/toasts";

let fakeMute = false;
let fakeDeaf = false;
let unpatchMute: (() => void) | undefined;
let unpatchDeaf: (() => void) | undefined;
let unregisterMuteCmd: (() => void) | undefined;
let unregisterDeafCmd: (() => void) | undefined;

function log(text: string) {
    console.log(`[FakeDeafenMuteLite] ${text}`);
}

export const onLoad = () => {
    unregisterMuteCmd = registerCommand({
        name: "fakemute",
        displayName: "fakemute",
        description: "Toggle fake mute: your mic keeps working while others see you as muted",
        displayDescription: "Toggle fake mute: your mic keeps working while others see you as muted",
        applicationId: "-1",
        type: 1,
        inputType: 1,
        options: [],
        execute: () => {
            fakeMute = !fakeMute;
            showToast(`Fake Mute ${fakeMute ? "enabled" : "disabled"}`);
        }
    });

    unregisterDeafCmd = registerCommand({
        name: "fakedeafen",
        displayName: "fakedeafen",
        description: "Toggle fake deafen: you keep hearing while others see you as deafened",
        displayDescription: "Toggle fake deafen: you keep hearing while others see you as deafened",
        applicationId: "-1",
        type: 1,
        inputType: 1,
        options: [],
        execute: () => {
            fakeDeaf = !fakeDeaf;
            showToast(`Fake Deafen ${fakeDeaf ? "enabled" : "disabled"}`);
        }
    });

    const MediaEngineActions = findByProps("setSelfMute", "setSelfDeaf");

    if (!MediaEngineActions) {
        showToast("FakeDeafenMuteLite: couldn't find the media engine module - Discord may have changed internally.");
        log("MediaEngineActions module not found, aborting");
        return;
    }

    unpatchMute = instead("setSelfMute", MediaEngineActions, (args, orig) => {
        if (fakeMute) {
            return orig.apply(MediaEngineActions, [false, ...args.slice(1)]);
        }
        return orig.apply(MediaEngineActions, args);
    });

    unpatchDeaf = instead("setSelfDeaf", MediaEngineActions, (args, orig) => {
        if (fakeDeaf) {
            return orig.apply(MediaEngineActions, [false, ...args.slice(1)]);
        }
        return orig.apply(MediaEngineActions, args);
    });

    log("Ready");
};

export const onUnload = () => {
    unpatchMute?.();
    unpatchDeaf?.();
    unregisterMuteCmd?.();
    unregisterDeafCmd?.();
    fakeMute = false;
    fakeDeaf = false;
    log("Disarmed");
}; 
