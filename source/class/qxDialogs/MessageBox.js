/**
 * Message box can be used to inform, alert or ask the user.
 *
 */
qx.Class.define("qxDialogs.MessageBox", {
  extend: qxDialogs.Dialog,

  events: {
    /**
     * One of the buttons is clicked.
     * data says which.
     *
     */
    "buttonClicked": "qx.event.type.Data"
  },

  properties: {
    message: {
      check: "String",
      nullable: true,
      apply: "_applyMessage"
    },

    text: {
      check: "String",
      nullable: true,
      apply: "_applyText"
    },

    messageIcon: {
      nullable: true,
      // check: qx.module.util.Object.getValues(this.contructor.type),
      apply: "_applyMessageIcon",
      themeable: true
    },

    showIcon: {
      nullable: true,
      check: "Boolean",
      apply: "_applyShowIcon"
    },

    type: {
      nullable: false,
      deferredInit: true,
      apply: "_applyType"
    },

    appearance: {
      refine: true,
      init: "qxdialogs-messageBox"
    }
  },

  statics: {
    type: {
      QUESTION: "QUESTION",
      INFORMATION: "INFORMATION",
      WARNING: "WARNING",
      ERROR: "ERROR",
      SUCCESS: "SUCCESS"
    },

    critical: function (parent, title, message, text, buttons = [qxDialogs.ButtonBox.standardButtons.CLOSE]) {
      return new this.constructor(parent, title, message, text, buttons).set({
        type: qxDialogs.MessageBox.type.ERROR,
        centerButtons: true
      });
    },

    info: function (parent, title, message, text, buttons = [qxDialogs.ButtonBox.standardButtons.CLOSE]) {
      return new this.constructor(parent, title, message, text, buttons).set({
        type: qxDialogs.MessageBox.type.INFORMATION,
        centerButtons: true
      });
    },

    warning: function (parent, title, message, text, buttons = [qxDialogs.ButtonBox.standardButtons.CLOSE]) {
      return new this.constructor(parent, title, message, text, buttons).set({
        type: qxDialogs.MessageBox.type.WARNING,
        centerButtons: true
      });
    },
    success: function (parent, title, message, text, buttons = [qxDialogs.ButtonBox.standardButtons.CLOSE]) {
      return new this.constructor(parent, title, message, text, buttons).set({
        type: qxDialogs.MessageBox.type.SUCCESS,
        centerButtons: true
      });
    },

    question: function (parent, title, message, text, buttons = [qxDialogs.ButtonBox.standardButtons.YES, qxDialogs.ButtonBox.standardButtons.NO]) {
      return new this.constructor(parent, title, message, text, buttons).set({
        type: qxDialogs.MessageBox.type.QUESTION,
        centerButtons: true
      });
    }
  },

  /**
   * Construct a new MessageBox.
   *
   * @param parent {qx.ui.core.Widget} Any widget that can contain a window.
   * @param title {String} The title of the dialog.
   * @param message {String} The message.
   * @param text {String} An informative text.
   * @param buttons {Array} An array of buttons. Each item can be one of the
   *                        enum values of qxDialogs.ButtonBox.standardButtons.
   */
  construct: function (parent, title, message, text, sButtons = []) {
    this.base(arguments, parent, sButtons);
    const content = this.getContentPane();
    content.setLayout(new qx.ui.layout.Atom());

    this.set({
      caption: title,
      message: message,
      text: text,
      showIcon: true
    });

    content.setAppearance("qxdialogs-messageBox-content");

    // buttons
    const bBox = this.getButtonBox();
    bBox.set({
      center: true
    });

    bBox.addListener("clicked", this.__onClicked, this);
  },

  members: {
    _createChildControlImpl(id) {
      let control;

      switch (id) {
        case "strings": {
          // a container to hold the message
          // and informative text
          control = new qx.ui.container.Composite();
          const layout = new qx.ui.layout.VBox();
          control.setLayout(layout);

          const contentPane = this.getContentPane();
          contentPane.add(control);
          break;
        }
        case "message": {
          // the message of the message box
          control = new qx.ui.basic.Label();

          const strings = this.getChildControl("strings", false);
          strings.addAt(control, 0);
          break;
        }
        case "text": {
          // informative text
          control = new qx.ui.basic.Label();

          const strings = this.getChildControl("strings", false);
          strings.addAt(control, 1);
          break;
        }
        case "messageIcon": {
          control = new qx.ui.basic.Image();

          const contentPane = this.getContentPane();
          contentPane.addAt(control, 0);
          break;
        }
      }

      return control || this.base(arguments, id);
    },

    /**
     * Adds a button. Button can be:
     * * {String} In this case a new qx.ui.form.Button is created and the
     *            string serves as it's label.
     *
     *
     * @param button  The button to be added
     * @param role {qxDialog.ButtonBox.roles} one of the ButtonBox roles
     */
    addButton: function (button, role) {
      this.getButtonBox().addButton(button, role);
    },

    _applyMessageIcon: function (val) {
      const icon = this.getChildControl("messageIcon", false);
      val ? icon.setSource(val) : icon.resetSource();
    },

    _applyShowIcon: function (val) {
      const icon = this.getChildControl("messageIcon", false);
      val ? icon.show() : icon.exclude();
    },

    _applyMessage: function (val) {
      this.getChildControl("message", false).setValue(val);
    },

    _applyText: function (val) {
      this.getChildControl("text", false).setValue(val);
    },

    _applyType(val, old) {
      if (old !== null) {
        this.removeState(old);
      }

      this.addState(val);
    },

    __onClicked: function (evt) {
      const button = evt.getData();
      this.fireDataEvent("buttonClicked", button);
    }
  },

  destruct: function () {
    this._disposeObjects("__msgLabel", "__txtLabel", "__dlgIcon");
  }
});
