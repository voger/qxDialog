/**
 * This class serves as a base class for other dialogs.
 * It can also be used on it's own. It provides a window
 * widget which contains a buttons pane {@link qxDialogs.ButtonBox} and
 * a content pane {@link qx.ui.container.Composite}
 *
 *
 */
qx.Class.define("qxDialogs.Dialog", {
  extend: qx.ui.window.Window,
  include: [qx.ui.core.MExecutable],
  events: {
    /**
     * Emmited when the dialog is closed with `accepted` or `rejected`.
     *
     */
    "finished": "qx.event.type.Data",

    /**
     * Emited when the dialog is closed with `accepted`.
     *
     */
    "accepted": "qx.event.type.Event",

    /**
     * Emited when the dialog is closed with `rejected`.
     *
     */
    "rejected": "qx.event.type.Data",

    /**
     * Emited when a button is clicked.
     * The method {@link qx.event.type.Data#getData} returns the
     * clicked button instance.
     *
     */
    "clicked": "qx.event.type.Data",

    /**
     * Emmited when the color of the blocker changes
     *
     */
    "changeBlockerColor": "qx.event.type.Data",

    /**
     * Emmited when the blocker opacity changes
     *
     */
    "changeBlockerOpacity": "qx.event.type.Data"
  },

  properties: {
    orientation: {
      check: ["horizontal", "vertical"],
      nullable: false,
      init: "horizontal",
      event: "changeOrientation",
      apply: "_refreshButtonBoxPosition"
    },

    /**
     * The position of the buttons
     * when the orientation is horizontal.
     *
     */
    verticalButtonsPosition: {
      check: ["left", "right"],
      nullable: false,
      init: "left",
      event: "changeVerticalButtonsPosition",
      apply: "_refreshButtonBoxPosition"
    },

    useBlocker: {
      check: "Boolean"
    },

    blockerColor: {
      init: "qxDialogs.blocker",
      nullable: false,
      event: "changeBlockerColor"
    },

    blockerOpacity: {
      check: "Number",
      init: 0.2,
      nullable: false,
      event: "changeBlockerOpacity"
    },

    centerButtons: {
      check: "Boolean",
      nullable: false,
      init: true,
      event: "changeCenterButtons"
    },

    /**
     * The parent widget. Defaults to application root
     *
     */
    parent: {
      check: "qx.ui.core.LayoutItem",
      nullable: false,
      deferredInit: true
    },

    // overrides
    visibility: {
      refine: true,
      init: "hidden"
    },

    allowMinimize: {
      refine: true,
      init: false
    },

    allowMaximize: {
      refine: true,
      init: false
    },

    alwaysOnTop: {
      refine: true,
      init: true
    },

    modal: {
      refine: true,
      init: true
    },

    resizableTop: {
      refine: true,
      init: false
    },

    resizableLeft: {
      refine: true,
      init: false
    },

    resizableRight: {
      refine: true,
      init: false
    },

    resizableBottom: {
      refine: true,
      init: false
    },

    showMaximize: {
      refine: true,
      init: false
    },

    showMinimize: {
      refine: true,
      init: false
    },

    showStatusbar: {
      refine: true,
      init: false
    }
  },

  statics: {
    returnCode: {
      ACCEPTED: "ACCEPTED",
      REJECTED: "REJECTED"
    }
  },

  construct: function (parent, sButtons = []) {
    this.base(arguments);

    this.set({
      centerOnAppear: true,
      centerOnContainerResize: true
    });

    const dockLayout = new qx.ui.layout.Dock();
    dockLayout.setSort("x");
    this.getChildrenContainer().setLayout(dockLayout);

    // initialize the blocked item. If none is passed, the default
    // is the application root.
    this.initParent(parent || qx.core.Init.getApplication().getRoot());
    const blocker = (this.__blocker = new qx.ui.core.Blocker(this.getParent()));

    const bBox = this.getButtonBox();
    bBox.addStandardButtons(sButtons);

    bBox.addListener("accepted", this.accept, this);
    bBox.addListener("rejected", this.reject, this);
    bBox.addListener("clicked", (e) => {
      this.fireDataEvent("clicked", e.getData());
    });

    this.add(bBox, {edge: this.__buttonBoxPosition()});

    const content = this.getContentPane();
    this.add(content, {edge: "north"});

    const escCommand = new qx.ui.command.Command("Esc");
    escCommand.addListener("execute", this.reject, this);

    const enterCommand = new qx.ui.command.Command("Enter");
    enterCommand.addListener("execute", this.handleEnter, this);

    const commandGroup = (this.__commandGroup = new qx.ui.command.Group());
    commandGroup.add("enter", enterCommand);
    commandGroup.add("esc", escCommand);
    commandGroup.setActive(false);

    this.addListener("activate", this._activateCommands, this);
    this.addListener("activate", this.__trackDefault, this);
    this.addListener("deactivate", this._deactivateCommands, this);

    this.bind("blockerColor", this.__blocker, "color");
    this.bind("blockerOpacity", this.__blocker, "opacity");

    this.addListener("appear", this.__block, this);
    this.addListener("close", this.__unblock, this);
  },

  members: {
    __blocker: null,
    __result: null,
    __bBox: null,
    __content: null,
    __commandGroup: null,

    /**
     * Returns the buttons container
     *
     */
    getButtonBox: function () {
      if (this.__bBox) {
        return this.__bBox;
      }

      const bBox = (this.__bBox = new qxDialogs.ButtonBox());
      this.bind("orientation", bBox, "orientation");
      this.bind("centerButtons", bBox, "center");
      return bBox;
    },

    /**
     * Returns the content pane
     *
     */
    getContentPane: function () {
      if (this.__content) {
        return this.__content;
      }

      const content = (this.__content = new qx.ui.container.Composite());

      return content;
    },

    addButton: function (button, role) {
      this.getButtonBox().addButton(button, role);
    },

    removeButton: function (button) {
      return this.getButtonBox().removeButton(button);
    },

    /**
     * Sets the button as default.
     *
     * @param button {qx.ui.form.Button | String} can be a button or one of
     * the values of qx.ButtonBox.standardButtons enum.
     *
     * @throws if the button is not included in this widget.
     */
    setDefaultButton: function (button) {
      const bBox = this.getButtonBox();

      const defaultBtn = qx.lang.Type.isString(button)
        ? bBox.fromStandardButton(button)
        : button;

      bBox.setDefault(defaultBtn);
    },

    handleEnter: function () {
      const defaultButton = this.getButtonBox().getDefaultButton();
      defaultButton?.execute();
    },

    unsetDefaultButton: function (button) {
      this.getButtonBox().unsetDefault(button);
    },

    done: function (result) {
      this.hide();
      this.setResult(result);
      this.fireDataEvent("finished", result);

      if (qxDialogs.Dialog.returnCode.ACCEPTED === result) {
        this.fireEvent("accepted");
      } else if (qxDialogs.Dialog.returnCode.REJECTED === result) {
        this.fireEvent("rejected");
      }

      // if autoDestroy is true then also destroy the window
      this.close();
    },

    accept: function () {
      this.done(qxDialogs.Dialog.returnCode.ACCEPTED);
    },

    reject: function () {
      this.done(qxDialogs.Dialog.returnCode.REJECTED);
    },

    setResult: function (result) {
      this.__result = result;
    },

    getResult: function () {
      return this.__result;
    },

    _refreshButtonBoxPosition: function () {
      const bBox = this.getButtonBox();
      this.remove(bBox);
      this.add(bBox, {edge: this.__buttonBoxPosition()});
    },

    _activateCommands: function () {
      this.__commandGroup.setActive(true);
    },

    _deactivateCommands: function () {
      this.__commandGroup.setActive(false);
    },

    __block: function () {
      if (this.getModal()) {
        this.__blocker.block();
      }
    },

    __unblock: function () {
      this.__blocker.unblock();
    },

    __trackDefault: function (evt) {
      const target = evt.getTarget();
      const bBox = this.getButtonBox();

      if (bBox.buttons().includes(target)) {
        bBox.setDefaultButton(target);
      } else {
        bBox.resetDefaultButton();
      }
    },

    // helper function to calculate the buttonBox edge
    __buttonBoxPosition: function () {
      let edge;
      const orientation = this.getOrientation();

      if (orientation === "horizontal") {
        edge = "center";
      } else if (orientation === "vertical") {
        const hPosition = this.getVerticalButtonsPosition();

        if (hPosition === "left") {
          edge = "west";
        } else if (hPosition === "right") {
          edge = "east";
        }
      }
      return edge;
    }
  }
});
