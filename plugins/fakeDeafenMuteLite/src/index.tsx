let fakeMute = false;
let fakeDeaf = false;
let unpatchMute, unpatchDeaf, unregisterMuteCmd, unregisterDeafCmd;

function onLoad() {
    fakeMute = vendetta.storage.fakeMute || false;
    fakeDeaf = vendetta.storage.fakeDeaf || false;

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
            vendetta.storage.fakeMute = fakeMute;
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
            vendetta.storage.fakeDeaf = fakeDeaf;
            vendetta.ui.toasts.showToast("Fake Deafen " + (fakeDeaf ? "enabled" : "disabled"));
        }
    });

    var MediaEngineActions = vendetta.metro.findByProps("setSelfMute", "setSelfDeaf");

    if (!MediaEngineActions) {
        vendetta.ui.toasts.showToast("FakeDeafenMuteLite: media engine module not found");
        return;
    }

    unpatchMute = vendetta.patcher.instead("setSelfMute", MediaEngineActions, function (args, orig) {
        if (fakeMute) return orig.apply(MediaEngineActions, [false].concat(args.slice(1)));
        return orig.apply(MediaEngineActions, args);
    });

    unpatchDeaf = vendetta.patcher.instead("setSelfDeaf", MediaEngineActions, function (args, orig) {
        if (fakeDeaf) return orig.apply(MediaEngineActions, [false].concat(args.slice(1)));
        return orig.apply(MediaEngineActions, args);
    });
}

function onUnload() {
    if (unpatchMute) unpatchMute();
    if (unpatchDeaf) unpatchDeaf();
    if (unregisterMuteCmd) unregisterMuteCmd();
    if (unregisterDeafCmd) unregisterDeafCmd();
}

function Settings() {
    var React = vendetta.metro.common.React;
    var Forms = vendetta.ui.components.Forms;

    var muteState = React.useState(fakeMute);
    var deafState = React.useState(fakeDeaf);

    return React.createElement(
        Forms.FormSection,
        null,
        React.createElement(Forms.FormSwitchRow, {
            label: "Fake Mute",
            subLabel: "Others see you muted, your mic keeps working",
            value: muteState[0],
            onValueChange: function (v) {
                fakeMute = v;
                vendetta.storage.fakeMute = v;
                muteState[1](v);
            }
        }),
        React.createElement(Forms.FormSwitchRow, {
            label: "Fake Deafen",
            subLabel: "Others see you deafened, you keep hearing",
            value: deafState[0],
            onValueChange: function (v) {
                fakeDeaf = v;
                vendetta.storage.fakeDeaf = v;
                deafState[1](v);
            }
        })
    );
}

module.exports = { onLoad: onLoad, onUnload: onUnload, settings: Settings }; 
