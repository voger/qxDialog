qx.Class.define("qxDialogs.ButtonBox", {
  extend: qx.ui.container.Composite,

  properties: {
    appearance: {
      refine: true,
      init: "qxdialogs-buttonBox"
    },

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

    /**
     * Whether the buttons should be
     * centered or follow layout spacing
     *
     */
    center: {
      nullable: false,
      check: "Boolean",
      init: false,
      apply: "_applyCenter"
    },

    /**
     * A map holding prefered layouts for horizontal
     * and vertical orientation.
     *
     */
    buttonsLayout: {
      nullable: true,
      apply: "_applyButtonsLayout"
    },

    /**
     * The distance between the buttons
     *
     */
    buttonsDistance: {
      nullable: false,
      init: 5,
      check: "Integer",
      themeable: true,
      apply: "_applyButtonsDistance"
    },

    /**
     * Minimum width for the buttons.
     * Used only in horizontal orientation.
     * Has no effect in vertical orientation.
     */
    buttonMinWidth: {
      nullable: true,
      check: "Integer",
      themeable: true,
      apply: "_applyButtonMinWidth"
    },

    /**
     * Default button
     *
     */
    defaultButton: {
      nullable: true,
      check: function (val) {
        return this.buttons().includes(val);
      },
      apply: "_applyDefaultButton"
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
    // prettier-ignore
    roles: {
      INVALID     : "INVALID",     // The button is invalid.
      ACCEPT      : "ACCEPT",      // Clicking the button causes the dialog to be accepted (e.g. OK).
      REJECT      : "REJECT",      // Clicking the button causes the dialog to be rejected (e.g. Cancel).
      DESTRUCTIVE : "DESTRUCTIVE", // Clicking the button causes a destructive change (e.g. for Discarding Changes) and closes the dialog.
      ACTION      : "ACTION",      // Clicking the button causes changes to the elements within the dialog.
      HELP        : "HELP",        // The button can be clicked to request help.
      YES         : "YES",         // The button is a "Yes"-like button.
      NO          : "NO",          // The button is a "No"-like button.
      APPLY       : "APPLY",       // The button applies current changes.
      RESET       : "RESET",       // The button resets the dialog's fields to default values.}

      SPACER      : "SPACER"       // Not a button.
    },

    // prettier-ignore
    standardButtons: {
      OK              : "OK_BUTTON",              // An "OK" button defined with the AcceptRole.
      OPEN            : "OPEN_BUTTON",            // An "Open" button defined with the AcceptRole.
      SAVE            : "SAVE_BUTTON",            // A "Save" button defined with the AcceptRole.
      CANCEL          : "CANCEL_BUTTON",          // A "Cancel" button defined with the RejectRole.
      CLOSE           : "CLOSE_BUTTON",           // A "Close" button defined with the RejectRole.
      DISCARD         : "DISCARD_BUTTON",         // A "Discard" or "Don't Save" button, defined with the DestructiveRole.
      APPLY           : "APPLY_BUTTON",           // An "Apply" button defined with the ApplyRole.
      RESET           : "RESET_BUTTON",           // A "Reset" button defined with the ResetRole.
      RESTOREDEFAULTS : "RESTOREDEFAULTS_BUTTON", // A "Restore Defaults" button defined with the ResetRole.
      HELP            : "HELP_BUTTON",            // A "Help" button defined with the HelpRole.
      SAVEALL         : "SAVEALL_BUTTON",         // A "Save All" button defined with the AcceptRole.
      YES             : "YES_BUTTON",             // A "Yes" button defined with the YesRole.
      YESTOALL        : "YESTOALL_BUTTON",        // A "Yes to All" button defined with the YesRole.
      NO              : "NO_BUTTON",              // A "No" button defined with the NoRole.
      NOTOALL         : "NOTOALL_BUTTON",         // A "No to All" button defined with the NoRole.
      ABORT           : "ABORT_BUTTON",           // An "Abort" button defined with the RejectRole.
      RETRY           : "RETRY_BUTTON",           // A "Retry" button defined with the AcceptRole.
      IGNORE          : "IGNORE_BUTTON",          // An "Ignore" button defined with the AcceptRole.
      NOBUTTON        : "NOBUTTON_BUTTON"         // An invalid button.
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
    // contains all the buttons of this widget
    __buttonLists: null,

    // contains only the standard buttons
    __standardButtons: null,


    __assignedDefaultButton: null,

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

    /**
     * Creates and adds standard buttons to the widget
     * @param sButtons {Array} array of the standard buttons
     *                         to be created
     */
    addStandardButtons: function (sButtons) {
      this.__createStandardButtons(sButtons);
    },

    __addButton: function (button, role) {
      if (!qx.lang.Object.contains(this.constructor.roles, role)) {
        this.warn(`Role ${role} is invalid. Button not added`);
        return;
      }

      button.addListener("execute", this.__handleButtonExecute, this);

      if (this.getLayout() instanceof qx.ui.layout.HBox) {
        button.setMinWidth(this.getButtonMinWidth());
      }

      button.setAppearance("qxDialogs-dialogbox-button");

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
     * Removes a button. Returns the button it is found
     * in the internal list, false otherwise.
     * Regarding standard buttons: Because the calling code is
     * responsible for their creation, it is also responsible for
     * their disposal as it would do with any other non-standard
     * buttons added to this widget.
     *
     * @param button {qx.ui.form.Button}
     *
     * @return {qx.ui.form.Button | undefined}
     *
     */
    removeButton: function (button) {
      button.removeListener("execute", this.__handleButtonExecute, this);
      let isRemoved = false;

      for (const role of this.__buttonLists.values()) {
        if (qx.lang.Array.remove(role, button)) {
          isRemoved = true;
        }
      }

      this.remove(button);
      return isRemoved ? button : undefined;
    },

    /**
     * Removes a standard button
     *
     * @param button {String} One of the standardButtons values
     */
    removeStandardButton: function (sButton) {
      for (const [button, value] of this.__standardButtons.entries()) {
        if (value === sButton) {
          this.__standardButtons.delete(button);
          return this.removeButton(button);
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
     * Return button from standardButtons enum value or `undefined`
     * if no such button exist.
     *
     * @param sButton {String} One of the standard buttons enum values.
     * @return {qx.ui.form.Button | undefined}
     *
     */
    fromStandardButton: function (sButton) {
      for (const [button, val] of this.__standardButtons.entries()) {
        if (val === sButton) {
          return button;
        }
      }
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

    /**
     * Resets the default button to the assigned default.
     * If the assigned default is <code>null</code> then
     * there is no default button.
     */
    resetDefaultButton: function () {
      console.log("Resetting default..");
      this.setDefaultButton(this.getAssignedDefaultButton());
    },

    /**
     * Set a button as default. This is the fallback button
     * to be set as default when no other button of this widget
     * has focus.
     *
     * @param button {qx.ui.form.Button|null} The button to set as default.
     * @throws {Error} when button is not a member of this widget.
     *
     */
    setAssignedDefault: function (button) {
      let tmpButton;

      if (qx.lang.Type.isString(button)) {
        tmpButton = this.fromStandardButton(button);
      } else if (button === null || this.includes(button)) {
        tmpButton = button;
      } else {
        throw new qx.core.AssertionError(
          "NOT INCLUDED",
          `Cannot assign ${button} as default. Please ensure that it is a qx.ui.form.Button and it is included in this ${this.constructor.classname}`
        );
      }

      this.__assignedDefaultButton = tmpButton;
    },

    /**
     * Returns the assigned default button or <code>null<null> if there is none.
     * @return {qx.ui.form.Button|null} The assigned default button.
     */
    getAssignedDefaultButton: function () {
      return this.__assignedDefaultButton;
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

    /**
     * Whether the button is included in this widget.
     *
     * @param button {qx.ui.form.Button} The button to test
     * @return {Boolean} whether is included or not.
     *
     */
    includes: function (button) {
      return this.buttons().includes(button);
    },

    _applyCenter: function (val) {
      this.__resetButtonsLayout();
    },

    _applyButtonsDistance: function (val) {
      const layout = this.getLayout();
      layout.setSpacing(val);
    },

    _applyDefaultButton: function (val, old) {
      old?.removeState("focused");
      val?.addState("focused");
    },

    _applyButtonMinWidth: function (val) {
      const layout = this.getLayout();
      const minWidth = this.getOrientation() === "horizontal" ? val : null;

      const buttons = this.buttons();

      for (const button of buttons) {
        button.setMinWidth(minWidth);
      }
    },

    _applyOrientation: function (val) {
      const oldLayout = this.getLayout();
      let newLayout;

      const buttonsDistance = this.getButtonsDistance();

      if ("horizontal" === val) {
        this.setLayout(new qx.ui.layout.HBox(buttonsDistance));
      } else {
        this.setLayout(new qx.ui.layout.VBox(buttonsDistance));
      }
      oldLayout && oldLayout.dispose();

      // FIXME: maybe there is a better way to refresh the
      // buttons minWidth at this point.
      this._applyButtonMinWidth(this.getButtonMinWidth());

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
      switch (this.buttonRole(button)) {
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
  },

  destruct: function () {
    for (const button of this.buttons()) {
      button.removeAllBindings();
      button.dispose();
    }
  }
});
