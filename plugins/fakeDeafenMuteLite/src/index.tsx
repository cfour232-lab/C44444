import { registerCommand } from "@vendetta/commands";
import { showToast } from "@vendetta/ui/toasts";

let fakeMute = false;
let fakeDeaf = false;
let lastChannelId: string | null | undefined = undefined;
let origSend: typeof WebSocket.prototype.send;
let unregisterMuteCmd: (() => void) | undefined;
let unregisterDeafCmd: (() => void) | undefined;

export const onLoad = () => {
    origSend = WebSocket.prototype.send;

    WebSocket.prototype.send = function (data: any) {
        try {
            if (typeof data === "string" && data.includes('"op":4')) {
                const obj = JSON.parse(data);
                if (obj.d) {
                    const switchingChannel = obj.d.channel_id !== lastChannelId;
                    lastChannelId = obj.d.channel_id;

                    if (!switchingChannel) {
                        if (fakeDeaf && obj.d.self_deaf === false) {
                            return;
                        }
                        if (fakeMute && obj.d.self_mute === false) {
                            return;
                        }
                    }
                }
            }
        } catch (e) {
            // not JSON or not relevant, fall through
        }
        return origSend.apply(this, arguments as any);
    };

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
};

export const onUnload = () => {
    if (origSend) WebSocket.prototype.send = origSend;
    unregisterMuteCmd?.();
    unregisterDeafCmd?.();
    fakeMute = false;
    fakeDeaf = false;
    lastChannelId = undefined;
}; 
