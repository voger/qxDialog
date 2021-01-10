qx.Class.define("qxDialogs.ButtonBox", {
  extend: qx.ui.container.Composite,

  properties: {
    orientation: {
      nullable: false,
      check: ["horizontal", "vertical"],
      init: "horizontal",
      apply: "_applyOrientation"
    },

    center: {
      nullable: false,
      check: "Boolean",
      init: false
    },

    buttonsLayout: {
      nullable: true
    },

    allowGrowX: {
      refine: true,
      init: true
    },

    allowGrowY: {
      refine: true,
      init: true
    }
  },

  statics: {
    roles: {
      INVALID: "INVALID", // The button is invalid.
      ACCEPT: "ACCEPT", // Clicking the button causes the dialog to be accepted (e.g. OK).
      REJECT: "REJECT", // Clicking the button causes the dialog to be rejected (e.g. Cancel).
      DESTRUCTIVE: "DESTRUCTIVE", // Clicking the button causes a destructive change (e.g. for Discarding Changes) and closes the dialog.
      ACTION: "ACTION", // Clicking the button causes changes to the elements within the dialog.
      HELP: "HELP", // The button can be clicked to request help.
      YES: "YES", // The button is a "Yes"-like button.
      NO: "NO", // The button is a "No"-like button.
      APPLY: "APPLY", // The button applies current changes.
      RESET: "RESET", // The button resets the dialog's fields to default values.}

      SPACER: "SPACER" // Not a button.
    },

    standardButtons: {
      OK: "OK_BUTTON", // An "OK" button defined with the AcceptRole.
      OPEN: "OPEN_BUTTON", // An "Open" button defined with the AcceptRole.
      SAVE: "SAVE_BUTTON", // A "Save" button defined with the AcceptRole.
      CANCEL: "CANCEL_BUTTON", // A "Cancel" button defined with the RejectRole.
      CLOSE: "CLOSE_BUTTON", // A "Close" button defined with the RejectRole.
      DISCARD: "DISCARD_BUTTON", // A "Discard" or "Don't Save" button, depending on the platform, defined with the DestructiveRole.
      APPLY: "APPLY_BUTTON", // An "Apply" button defined with the ApplyRole.
      RESET: "RESET_BUTTON", // A "Reset" button defined with the ResetRole.
      RESTOREDEFAULTS: "RESTOREDEFAULTS_BUTTON", // A "Restore Defaults" button defined with the ResetRole.
      HELP: "HELP_BUTTON", // A "Help" button defined with the HelpRole.
      SAVEALL: "SAVEALL_BUTTON", // A "Save All" button defined with the AcceptRole.
      YES: "YES_BUTTON", // A "Yes" button defined with the YesRole.
      YESTOALL: "YESTOALL_BUTTON", // A "Yes to All" button defined with the YesRole.
      NO: "NO_BUTTON", //	A "No" button defined with the NoRole.
      NOTOALL: "NOTOALL_BUTTON", // A "No to All" button defined with the NoRole.
      ABORT: "ABORT_BUTTON", // An "Abort" button defined with the RejectRole.
      RETRY: "RETRY_BUTTON", // A "Retry" button defined with the AcceptRole.
      IGNORE: "IGNORE_BUTTON", // An "Ignore" button defined with the AcceptRole.
      NOBUTTON: "NOBUTTON_BUTTON" //	An invalid button.
    }
  },

  construct: function () {
    this.base(arguments);

    this.initOrientation();
    this.__standardButtons = new Map();
    this.__initButtonLists();
  },

  members: {
    __standardButtons: null,

    __buttonLists: null,

    /**
     * Adds a button. Button can be:
     * * {String} In this case a new qx.ui.form.Button is created and the
     *            string serves as it's label.
     * *
     *
     * @param button  The button to be added
     * @param role {qxDialog.ButtonBox.roles} one of the ButtonBox roles
     *
     * @ return {qx.ui.form.Button} The button.
     */
    addButton: function (button, role) {
      if (button instanceof qx.ui.form.Button) {
        // if button is already a button object just add it
        this.__addButton(button, role);
      } else if (
        qx.lang.Object.contains(this.constructor.standardButtons, button)
      ) {
        // if `button` is one of the values of the standardButtons enum
        // then create the button and assign to it it's standard role
        // The `role` method param is ignored. Standard buttons have
        // predefined roles.
        this.__createStandardButton(button);
      } else {
        // In any other case the `button` param is handled as a string
        // and that string is the button's label.
        this.__createButtonFromString(button.toString(), role);
      }

      this.layoutButtons();
    },

    __addButton: function (button, role) {
      if (!qx.lang.Object.contains(this.constructor.roles, role)) {
        this.warn(`Role ${role} is invalid. Button not added`);
        return;
      }

      const roleArray = this.__buttonLists.get(role);
      roleArray.push(button);

      return button;
    },

    __createButtonFromString: function (label, role) {
      const button = new qx.ui.form.Button(label);

      const roleArray = this.__buttonLists.get(role);
      roleArray.push(button);

      return button;
    },

    /**
     * Creates a standard button.
     * @param standardButton {String} one of the entries in standard
     * buttons from this class
     * @return {qx.ui.form.Button} the created button
     */
    __createStandardButton: function (standardButton) {
      const buttonText = this._standardButtonText(standardButton);
      const button = new qx.ui.form.Button(buttonText);

      this.__standardButtons.set(button.standardButton);

      const role = this.__buttonRole(standardButton);

      this.__addButton(button, role);

      return button;
    },

    /**
     * Clears the buttons from the container but doesn't delete them from the internal list
     * @return the removed buttons
     */
    clearButtons: function () {
      return this.removeAll();
    },

    layoutButtons: function () {
      if (this.getCenter()) {
        this.add(new qx.ui.core.Spacer());
      }

      const roles = this.constructor.roles;
      const buttonsLayout = (this.getButtonsLayout() ||
        this._defaultButtonsLayout())[this.getOrientation()];

      for (const role of buttonsLayout) {
        switch (role) {
          case roles.SPACER:
            if (!this.getCenter()) {
              this.add(new qx.ui.core.Spacer());
            }
            break;
          case roles.ACCEPT:
            // only add the first button
            const button = this.__buttonLists.get(role)[0];
            button && this.add(button);

            break;
          case roles.DESTRUCTIVE:
          case roles.ACTION:
          case roles.HELP:
          case roles.YES:
          case roles.NO:
          case roles.APPLY:
          case roles.RESET:
            const buttonsArr = this.__buttonLists.get(role);
            this.__addButtons(buttonsArr);
        }
      }

      if (this.getCenter()) {
        this.add(new qx.ui.core.Spacer());
      }
    },

    _applyOrientation: function (val) {
      const oldLayout = this.getLayout();
      let newLayout;

      if ("horizontal" === val) {
        this.setLayout(new qx.ui.layout.HBox());
      } else {
        this.setLayout(new qx.ui.layout.VBox());
      }
      oldLayout && oldLayout.dispose();
    },

    __addButtons: function (buttonsArr) {
      for (const button of buttonsArr) {
        this.add(button);
      }
    },

    __buttonRole: function (sbutton) {
      const sbuttons = this.constructor.standardButtons;
      const roles = this.constructor.roles;
      let role;
      switch (sbutton) {
        case sbuttons.OK:
        case sbuttons.SAVE:
        case sbuttons.OPEN:
        case sbuttons.SAVEALL:
        case sbuttons.RETRY:
        case sbuttons.IGNORE:
          role = roles.ACCEPT;
          break;
        case sbuttons.CANCEL:
        case sbuttons.CLOSE:
        case sbuttons.ABORT:
          role = roles.REJECT;
          break;
        case sbuttons.DISCARD:
          role = roles.DESTRUCTIVE;
          break;
        case sbuttons.HELP:
          role = roles.HELP;
          break;
        case sbuttons.APPLY:
          role = roles.APPLY;
          break;
        case sbuttons.YES:
        case sbuttons.YESTOALL:
          role = roles.YES;
          break;
        case sbuttons.NO:
        case sbuttons.NOTOALL:
          role = roles.NO;
          break;
        case sbuttons.RESET:
        case sbuttons.RESTORE_DEFAULTS:
          role = roles.RESET;
          break;
        default:
          role = roles.INVALID;
      }
      return role;
    },

    _defaultStandardButtonText(sbutton) {
      const sbuttons = this.constructor.standardButtons;
      let text;
      switch (sbutton) {
        case sbuttons.OK:
          text = this.tr("OK");
          break;
        case sbuttons.CANCEL:
          text = this.tr("Cancel");
          break;
        case sbuttons.OPEN:
          text = this.tr("Open");
          break;
        case sbuttons.SAVE:
          text = this.tr("Save");
          break;
        case sbuttons.CLOSE:
          text = this.tr("Close");
          break;
        case sbuttons.DISCARD:
          text = this.tr("Discard");
          break;
        case sbuttons.APPLY:
          text = this.tr("Apply");
          break;
        case sbuttons.RESET:
          text = this.tr("Reset");
          break;
        case sbuttons.RESTOREDEFAULTS:
          text = this.tr("Restore Defaults");
          break;
        case sbuttons.HELP:
          text = this.tr("Help");
          break;
        case sbuttons.SAVEALL:
          text = this.tr("Save All");
          break;
        case sbuttons.YES:
          text = this.tr("Yes");
          break;
        case sbuttons.YESTOALL:
          text = this.tr("Yes To All");
          break;
        case sbuttons.NO:
          text = this.tr("No");
          break;
        case sbuttons.NOTOALL:
          text = this.tr("No To All");
          break;
        case sbuttons.ABORT:
          text = this.tr("Abort");
          break;
        case sbuttons.RETRY:
          text = this.tr("Retry");
          break;
        case sbuttons.IGNORE:
          text = this.tr("Ignore");
          break;
        default:
          break;
      }

      return text;
    },

    __initButtonLists: function () {
      const buttonLists = (this.__buttonLists = new Map());

      for (const key in this.constructor.roles) {
        buttonLists.set(key, []);
      }
    },

    _defaultButtonsLayout() {
      return {
        horizontal: [
          this.constructor.roles.RESET,
          this.constructor.roles.SPACER,
          this.constructor.roles.YES,
          this.constructor.roles.ACCEPT,
          this.constructor.roles.DESTRUCTIVE,
          this.constructor.roles.NO,
          this.constructor.roles.ACTION,
          this.constructor.roles.REJECT,
          this.constructor.roles.APPLY,
          this.constructor.roles.HELP
        ],
        vertical: [
          this.constructor.roles.ACTION,
          this.constructor.roles.YES,
          this.constructor.roles.ACCEPT,
          this.constructor.roles.DESTRUCTIVE,
          this.constructor.roles.NO,
          this.constructor.roles.REJECT,
          this.constructor.roles.APPLY,
          this.constructor.roles.RESET,
          this.constructor.roles.HELP,
          this.constructor.roles.SPACER
        ]
      };
    }
  }
});
