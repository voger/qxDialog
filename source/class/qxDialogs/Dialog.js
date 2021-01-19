qx.Class.define("qxDialogs.Dialog", {
  extend: qx.ui.window.Window,
  include: [qx.ui.core.MExecutable],
  events: {
    /**
     * Emmited when the dialog is closed with `accepted` or `rejected`.
     * By default calling `getData()` on this event returns `undefined`.
     * Set a function to the property `onDone` to return something meaningful.
     *
     */
    "finished": "qx.event.type.Data",

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
    "rejected": "qx.event.type.Data",

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
    /**
     * Callback function when the dialog is accepted.
     *
     */
    onAccepted: {
      check: "Function",
      init: () => {
        return;
      },
      nullable: false
    },

    /**
     * Callback function when the dialog is rejected.
     *
     */
    onRejected: {
      check: "Function",
      init: () => {
        return;
      },
      nullable: false
    },

    /**
     * Callback function when the dialog is closed.
     *
     */
    onDone: {
      check: "Function",
      init: () => {
        return;
      },
      nullable: false
    },

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
    centerOnAppear: {
      refine: true,
      init: true
    },

    centerOnContainerResize: {
      refine: true,
      init: true
    },

    visibility: {
      refine: true,
      init: "hidden"
    },

    allowClose: {
      refine: true,
      init: false
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
    showClose: {
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

  construct: function (sButtons = [], parent) {
    this.base(arguments);

    const dockLayout = new qx.ui.layout.Dock();
    dockLayout.setSort("x");
    this.getChildrenContainer().setLayout(dockLayout);

    // initialize the blocked item. If none is passed, the default
    // is the application root.
    this.initParent(parent || qx.core.Init.getApplication().getRoot());
    const blocker = (this.__blocker = new qx.ui.core.Blocker(this.getParent()));

    const bBox = this.getButtonBox();
    bBox.addStandardButtons(sButtons);
    this.add(bBox, {edge: this.__buttonBoxPosition()});

    const content = this.getContentPane();
    this.add(content, {edge: "north"});

    this.__escCommand = new qx.ui.command.Command("Esc");
    this.__escCommand.addListener("execute", this.reject, this);

    this.__enterCommand = new qx.ui.command.Command("Enter");
    this.__enterCommand.addListener("execute", this.handleEnter, this);

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
    __escCommand: null,
    __enterCommand: null,

    __defaultButton: null,

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

      bBox.setDefault(defaulBtn);
      this.__defaultButton = defaultBtn;
    },

    handleEnter: function () {
      const defaultButton = this.getButtonBox().getDefault();

      if (defaultButton) {
        defaultButton.execute();
      }
    },

    done: function (result) {
      this.close();
      this.setResult(result);
      this.fireDataEvent("finished", result);

      if (qxDialogs.Dialog.returnCode.ACCEPTED === result) {
        this.fireEvent("accepted");
      } else if (qxDialogs.Dialog.returnCode.REJECTED === result) {
        this.fireEvent("rejected");
      }
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

    _refreshButtonBoxPosition: function () {
      const bBox = this.getButtonBox();
      this.remove(bBox);
      this.add(bBox, {edge: this.__buttonBoxPosition()});
    },

    __block: function () {
      if (this.getModal()) {
        this.__blocker.block();
      }
    },

    __unblock: function () {
      this.__blocker.unblock();
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
    },

  }
});
