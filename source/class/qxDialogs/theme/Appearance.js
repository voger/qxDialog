/* ************************************************************************

   Copyright: 2021 voger

   License: MIT license

   Authors: voger

************************************************************************ */
/**
 * @asset(qx/icon/Tango/48/status/dialog-information.png)
 *
 */
qx.Theme.define("qxDialogs.theme.Appearance", {
  extend: qx.theme.indigo.Appearance,

  appearances: {
    "qxdialogs-buttonBox": {
      include: "widget",

      style: function (_) {
        return {
          buttonsDistance: 5,
          buttonMinWidth: 80
        };
      }
    },

    "qxdialogs-messageBox": {
      alias: "window",
      include: "window",

      style: function (states) {
        let source;

        if (states[qxDialogs.MessageBox.type.ERROR]) {
          source = "qxDialogs.icon.error";
        } else if (states[qxDialogs.MessageBox.type.WARNING]) {
          source = "qxDialogs.icon.warning";
        } else if (states[qxDialogs.MessageBox.type.QUESTION]) {
          source = "qxDialogs.icon.question";
        } else if (states[qxDialogs.MessageBox.type.SUCCESS]) {
          source = "qxDialogs.icon.success";
        } else if (states[qxDialogs.MessageBox.type.INFORMATION]) {
          source = "qxDialogs.icon.information";
        } else {
          source = null;
        }

        return {
          messageIcon: source,
          minWidth: 500
        };
      }
    },

    "qxdialogs-messageBox-content": {
      include: "widget",

      style: function (_) {
        return {
          margin: [10, 20]
        };
      }
    },

    "qxdialogs-messageBox/strings": {
      include: "widget",
      style: function (_) {
        return {
          paddingLeft: 10
        };
      }
    },

    "qxdialogs-messageBox/message": {
      alias: "label",

      style: function (_) {
        return {
          font: "bold",
          marginBottom: 10
        };
      }
    },

    "qxdialogs-messageBox/text": {
      alias: "label",

      style: function (_) {
        return {
          marginBottom: 10
        };
      }
    },

    "qxDialogs-messageBox/messageIcon": "image"
  }
});
