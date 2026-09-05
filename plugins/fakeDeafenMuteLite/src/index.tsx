let fakeMute = false;
let fakeDeaf = false;
let unpatchMute, unpatchDeaf, unregisterMuteCmd, unregisterDeafCmd;

function onLoad() {
    var api: any =
        (typeof (globalThis as any).kettu !== "undefined") ? (globalThis as any).kettu
      : (typeof (globalThis as any).bunny !== "undefined") ? (globalThis as any).bunny
      : (typeof (globalThis as any).vendetta !== "undefined") ? (globalThis as any).vendetta
      : null;

    if (!api) {
        try { console.log("FDML: no API global found (kettu/bunny/vendetta)"); } catch (e) {}
        return;
    }

    try {
        api.ui.toasts.showToast("FDML: onLoad started");

        unregisterMuteCmd = api.commands.registerCommand({
            name: "fakemute",
            displayName: "fakemute",
            description: "Toggle fake mute",
            displayDescription: "Toggle fake mute",
            applicationId: "-1",
            type: 1,
            inputType: 1,
            options: [],
            execute: function () {
                fakeMute = !fakeMute;
                api.ui.toasts.showToast("Fake Mute " + (fakeMute ? "enabled" : "disabled"));
            }
        });

        unregisterDeafCmd = api.commands.registerCommand({
            name: "fakedeafen",
            displayName: "fakedeafen",
            description: "Toggle fake deafen",
            displayDescription: "Toggle fake deafen",
            applicationId: "-1",
            type: 1,
            inputType: 1,
            options: [],
            execute: function () {
                fakeDeaf = !fakeDeaf;
                api.ui.toasts.showToast("Fake Deafen " + (fakeDeaf ? "enabled" : "disabled"));
            }
        });

        api.ui.toasts.showToast("FDML: commands registered, searching module...");

        var MediaEngineActions = api.metro.findByProps("setSelfMute", "setSelfDeaf");

        if (!MediaEngineActions) {
            api.ui.toasts.showToast("FDML: setSelfMute/setSelfDeaf module NOT FOUND");
            return;
        }

        api.ui.toasts.showToast("FDML: module found, patching...");

        unpatchMute = api.patcher.instead("setSelfMute", MediaEngineActions, function (args, orig) {
            if (fakeMute) return orig.apply(MediaEngineActions, [false].concat(args.slice(1)));
            return orig.apply(MediaEngineActions, args);
        });

        unpatchDeaf = api.patcher.instead("setSelfDeaf", MediaEngineActions, function (args, orig) {
            if (fakeDeaf) return orig.apply(MediaEngineActions, [false].concat(args.slice(1)));
            return orig.apply(MediaEngineActions, args);
        });

        api.ui.toasts.showToast("FDML: patch applied successfully");
    } catch (e) {
        try {
            api.ui.toasts.showToast("FDML ERROR: " + (e && e.message ? e.message : String(e)));
        } catch (e2) {
            console.log("FDML ERROR (no toast): " + (e && e.message ? e.message : String(e)));
        }
    }
}

function onUnload() {
    if (unpatchMute) unpatchMute();
    if (unpatchDeaf) unpatchDeaf();
    if (unregisterMuteCmd) unregisterMuteCmd();
    if (unregisterDeafCmd) unregisterDeafCmd();
    fakeMute = false;
    fakeDeaf = false;
}

module.exports = { onLoad: onLoad, onUnload: onUnload };
 
