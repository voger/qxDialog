/* ************************************************************************

   Copyright: 2021 voger

   License: MIT license

   Authors: voger

************************************************************************ */

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

    "qxdialogs-messagebox-content": {
      include: "widget",

      style: function (_) {
        return {
          margin: [10, 20]
        };
      }
    },

    "qxdialogs-messagebox-message": {
      style: function (_) {
        return {
          font: "bold"
        };
      }
    },

    "qxdialogs-messagebox-icon": {
      include: "image",

      style: function (states) {
        let source;

        if (states["ERROR"]) {
          source = "qxDialogs.icon.error";
        } else if (states["WARNING"]) {
          source = "qxDialogs.icon.warning";
        } else if (states["QUESTION"]) {
          source = "qxDialogs.icon.question";
        } else if (states["SUCCESS"]) {
          source = "qxDialogs.icon.success";
        } else if (states["INFORMATION"]) {
          source = "qxDialogs.icon.information";
        } else {
          source = null;
        }

        return {
          source: source,
          paddingRight: 10
        };
      }
    }
  }
});
