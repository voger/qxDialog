qx.Class.define("qxDialogs.MessageBox", {
  extend: qxDialogs.Dialog,

  events: {
    /**
     * Emmited when the dialog is closed with `accepted` or `rejected`.
     * By default calling `getData()` on this event returns `undefined`.
     * Set a function to the property `onDone` to return something meaningful.
     *
     */
    "done": "qx.event.type.Data",

    /**
     * Emited when the dialog is closed with `accepted`.
     * By default calling `getData()` on this event returns `undefined`.
     * Set a function to the property `onAccepted` to return something meaningful.
     *
     */
    "accepted": "qx.event.type.Data",

    /**
     * Emited when the dialog is closed with `rejected`.
     * By default calling `getData()` on this event returns `undefined`.
     * Set a function to the property `onRejected` to return something meaningful.
     *
     */
    "rejected": "qx.event.type.Data"
  },

  properties: {
    message: {
      check: "String",
      nullable: true
    },

    text: {
      check: "String",
      nullable: true
    },

    dialogIcon: {
      nullable: true
    },

  },

  /**
   * Text is the informative text
   * Message is the informative message
   * Buttons is an array of default buttons
   */
  // construct: function (text, message, icon, buttons = []) {
  //   this.base(arguments);

  //   this.setText(text);
  //   this.setMessage(message);
  //   this.setDialogIcon(icon);


  // },

  // members: {

  // }
});
