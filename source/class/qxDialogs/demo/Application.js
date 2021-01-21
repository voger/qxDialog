/* ************************************************************************

   Copyright: 2021 voger

   License: MIT license

   Authors: voger

************************************************************************ */

/**
 * This is the main application class of "qxDialogs"
 */
qx.Class.define("qxDialogs.demo.Application", {
  extend: qx.application.Standalone,

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {
    /**
     * This method contains the initial application code and gets called
     * during startup of the application
     *
     * @lint ignoreDeprecated(alert)
     */
    main: function () {
      // Call super class
      this.base(arguments);

      // Enable logging in debug variant
      if (qx.core.Environment.get("qx.debug")) {
        // support native logging capabilities, e.g. Firebug for Firefox
        qx.log.appender.Native;
        // support additional cross-browser console. Press F7 to toggle visibility
        qx.log.appender.Console;
      }

      /*
      -------------------------------------------------------------------------
        Below is your actual application code...
      -------------------------------------------------------------------------
      */

      // Document is the application root
      var doc = this.getRoot();

      const buttonsEnum = qxDialogs.ButtonBox.standardButtons;

      const standardButtons = [
        buttonsEnum.HELP,
        buttonsEnum.YES,
        buttonsEnum.NO
      ];

      const message = {
        message: "Hello there",
        text: "It works. Aren't you happy?"
      };

      const dialog = new qxDialogs.MessageBox(message, standardButtons);

      dialog.setModal(false);

      dialog.addListener("clicked", (e) => {
        console.log("Clicked: ", e.getData().getLabel());
      });

      dialog.addListener("finished", (e) => {
        console.log("Finished: ", e.getData());
      });

      const openDialog = new qx.ui.form.Button("Open MessageBox");

      openDialog.addListener(
        "execute",
        function () {
          dialog.open();
        },
        this
      );

      const orientationButton = new qx.ui.form.Button("Orientation");

      orientationButton.addListener(
        "execute",
        function () {
          const orientation = dialog.getOrientation();
          if (orientation === "vertical") {
            dialog.setOrientation("horizontal");
          } else if (orientation === "horizontal") {
            dialog.setOrientation("vertical");
          }
        },
        this
      );

      doc.add(openDialog, {top: 50, left: 50});
      doc.add(orientationButton, {top: 80, left: 50});
    }
  }
});
