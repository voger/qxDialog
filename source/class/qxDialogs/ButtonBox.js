qx.Class.define("qxDialogs.ButtonBox", {
  extend: qx.ui.container.Composite,

  properties: {
    /**
     * Orientation of the widget.
     * Can be "horizontal" or "vertical".
     * Default "horizontal"
     *
     */
    orientation: {
      nullable: false,
      check: ["horizontal", "vertical"],
      deferredInit: true,
      apply: "_applyOrientation"
    },

    center: {
      nullable: false,
      check: "Boolean",
      init: false,
      apply: "_applyCenter"
    },

    buttonsLayout: {
      nullable: true,
      apply: "_applyButtonsLayout"
    },

    allowGrowX: {
      refine: true,
      init: true
    },

    allowGrowY: {
      refine: true,
      init: true
    },

    focusable: {
      refine: true,
      init: false
    }
  },

  events: {
    /**
     * The event is fired when one of the buttons is clicked.
     *
     * The method {@link qx.event.type.Data#getData} returns the
     * clicked button instance.
     *
     */

    "clicked": "qx.event.type.Data",

    /**
     * The event if fired when one of the buttons with YES or ACCEPT
     * roles is clicked.
     *
     */
    "accepted": "qx.event.type.Event",

    /**
     * Te event if fired when onte of the button with NO or REJECT
     * roles is clicked.
     *
     */
    "rejected": "qx.event.type.Event"
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

  /**
   * Constructs a new qxDialogs.ButtonBox.
   * @param buttonsArr {Array} Optional. An array of standard buttons to create
   *                           for convinience.
   */
  construct: function (buttonsArr = [], orientation = "horizontal") {
    this.base(arguments);

    this.__standardButtons = new Map();
    this.__initButtonLists();

    this.initOrientation(orientation);
    this.__createStandardButtons(buttonsArr);
  },

  members: {
    _forwardStates: {
      focused: true
    },

    // contains all the buttons of this widget
    __buttonLists: null,

    // contains only the standard buttons
    __standardButtons: null,

    /**
     * Adds a button. Button can be:
     * * {String} In this case a new qx.ui.form.Button is created and the
     *            string serves as it's label.
     *
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
      }

      this.__resetButtonsLayout();
    },

    __addButton: function (button, role) {
      if (!qx.lang.Object.contains(this.constructor.roles, role)) {
        this.warn(`Role ${role} is invalid. Button not added`);
        return;
      }

      button.addListener("execute", this.__handleButtonExecute, this);

      const roleArray = this.__buttonLists.get(role);
      roleArray.push(button);
      return button;
    },

    /**
     * Creates a standard button.
     * @param sButton {String} one of the entries in standard
     * buttons enum from this class
     */
    __createStandardButton: function (sButton) {
      // there this standard button is already created
      // do nothing
      if ([...this.__standardButtons.values()].includes(sButton)) {
        return;
      }

      const buttonText = this.__standardButtonText(sButton);
      const button = new qx.ui.form.Button(buttonText);

      this.__standardButtons.set(button, sButton);
      const role = this.__buttonRole(sButton);

      this.__addButton(button, role);
    },

    __createStandardButtons: function (buttonsArr) {
      for (const standardButton of buttonsArr) {
        this.addButton(standardButton);
      }
    },

    /**
     * Removes a button.
     * @param button {qx.ui.form.Button}
     *
     * @return {qx.ui.form.Button}
     *
     */
    removeButton: function (button) {
      button.removeListener("execute", this.__handleButtonExecute, this);

      const isStandard = this.__standardButtons.delete(button);

      for (const role of this.__buttonLists.values()) {
        qx.lang.Array.remove(role, button);
      }

      this.__resetButtonsLayout();

      // If the button is a standardButton, we are responsible for it's
      // disposal and we don't have to return anything. Otherwise return
      // it as it is and let the caller decide what to do with it.
      if (isStandard) {
        button.dispose();
        return;
      }
      return button;
    },

    /**
     * Removes a standard button
     *
     * @param button {String} One of the standardButtons values
     */
    removeStandardButton: function (sButton) {
      for (const [button, value] of this.__standardButtons.entries()) {
        if (value === sButton) {
          this.removeButton(button);
          return;
        }
      }
    },

    /**
     * Clears the buttons from the container but doesn't delete them from the internal list
     * @return the removed buttons
     */
    clearButtons: function () {
      return this.removeAll().filter((item) => {
        // filter out any spacers from the return.
        return !(item instanceof qx.ui.core.Spacer);
      });
    },

    /**
     * Returns all the child buttons
     *
     * @return {Array} A list of the buttons
     */
    buttons: function () {
      let buttons = [];

      for (const value of this.__buttonLists.values()) {
        buttons = buttons.concat(value);
      }

      // ensure unique elements
      return [...new Set(buttons)];
    },

    /**
     * Returns the standard button enum value corresponding to the given button, or NOBUTTON if the given button
     * is not a standard button.
     *
     * @param button {qx.ui.form.Button}
     */
    standardButton: function (button) {
      return this.__standardButtons.get(button) || this.constructor.NOBUTTON;
    },

    /**
     * Return a list of standard buttons used
     *
     * @return {Array} A list of standardButtons enum values used.
     */
    standardButtons: function () {
      return [...this.__standardButtons.values()];
    },

    /**
     * Return role for button
     *
     * @param {qx.ui.form.Button} The button for which we seek the role
     * @return {String} the role
     */
    buttonRole: function (button) {
      for (const [role, buttons] of this.__buttonLists.entries()) {
        if (buttons.includes(button)) {
          return role;
        }
      }

      return this.constructor.role.INVALID;
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
              this.add(new qx.ui.core.Spacer(), {flex: 1});
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

    _applyCenter: function (val) {
      this.__resetButtonsLayout();
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
      this.__resetButtonsLayout();
    },

    _applyLayout: function (val, old, name) {
      this.base(arguments, val, old, name);
      this.__resetButtonsLayout();
    },

    _applyButtonsLayout: function () {
      this.__resetButtonsLayout();
    },

    __addButtons: function (buttonsArr) {
      for (const button of buttonsArr) {
        this.add(button);
      }
    },

    __resetButtonsLayout() {
      this.clearButtons();
      this.layoutButtons();
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

    __standardButtonText(sbutton) {
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

    __handleButtonExecute: function (event) {
      const button = event.getTarget();

      this.fireDataEvent("clicked", button);

      const roles = this.constructor.roles;
      switch (this.__buttonRole(button)) {
        case roles.ACCEPT:
        case roles.YES:
          this.fireEvent("accepted");
          break;
        case roles.REJECT:
        case roles.NO:
          this.fireEvent("rejected");
          break;
        default:
          break;
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