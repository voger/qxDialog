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

      const buttonBox = new qxDialogs.ButtonBox(standardButtons).set({
        minWidth: 500
      });

      buttonBox.addButton(
        new qx.ui.form.Button("Test"),
        qxDialogs.ButtonBox.roles.RESET
      );

      const addApplyButton = new qx.ui.form.Button("Add Apply button");
      addApplyButton.addListener("execute", function() {
        buttonBox.addButton(buttonsEnum.APPLY);
      }, this);

      const removeApplyButton = new qx.ui.form.Button("Remove Apply button");
      removeApplyButton.addListener("execute", function(){
        buttonBox.removeStandardButton(buttonsEnum.APPLY);
      },this);


      doc.add(buttonBox, {top: 100, left: 100});

      doc.add(addApplyButton, {top: 150, left: 100});
      doc.add(removeApplyButton, {top: 150, left: 200});
    }
  }
});
