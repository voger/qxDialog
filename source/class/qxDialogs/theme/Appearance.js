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
    }
  }
});
