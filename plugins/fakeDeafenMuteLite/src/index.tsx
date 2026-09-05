let fakeMute = false;
let fakeDeaf = false;
let unpatchMute, unpatchDeaf, unregisterMuteCmd, unregisterDeafCmd;

function onLoad() {
    try {
        vendetta.ui.toasts.showToast("FDML: onLoad started");

        unregisterMuteCmd = vendetta.commands.registerCommand({
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
                vendetta.ui.toasts.showToast("Fake Mute " + (fakeMute ? "enabled" : "disabled"));
            }
        });

        unregisterDeafCmd = vendetta.commands.registerCommand({
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
                vendetta.ui.toasts.showToast("Fake Deafen " + (fakeDeaf ? "enabled" : "disabled"));
            }
        });

        vendetta.ui.toasts.showToast("FDML: commands registered, searching module...");

        var MediaEngineActions = vendetta.metro.findByProps("setSelfMute", "setSelfDeaf");

        if (!MediaEngineActions) {
            vendetta.ui.toasts.showToast("FDML: setSelfMute/setSelfDeaf module NOT FOUND");
            return;
        }

        vendetta.ui.toasts.showToast("FDML: module found, patching...");

        unpatchMute = vendetta.patcher.instead("setSelfMute", MediaEngineActions, function (args, orig) {
            if (fakeMute) return orig.apply(MediaEngineActions, [false].concat(args.slice(1)));
            return orig.apply(MediaEngineActions, args);
        });

        unpatchDeaf = vendetta.patcher.instead("setSelfDeaf", MediaEngineActions, function (args, orig) {
            if (fakeDeaf) return orig.apply(MediaEngineActions, [false].concat(args.slice(1)));
            return orig.apply(MediaEngineActions, args);
        });

        vendetta.ui.toasts.showToast("FDML: patch applied successfully");
    } catch (e) {
        vendetta.ui.toasts.showToast("FDML ERROR: " + (e && e.message ? e.message : String(e)));
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
