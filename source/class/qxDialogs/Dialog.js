qx.Class.define("qxDialogs.Dialog", {
  extend: qx.ui.window.Window,

  properties: {
    useBlocker: {
      check: "Boolean",
    },

    blockerColor: {
      init: "qxDialogs.blocker",
      nullable: false,
      event: "changeBlockerColor",
    },

    blockerOpacity: {
      check: "Number",
      init: 0.2,
      nullable: false,
      event: "changeBlockerOpacity",
    },

    blockedItem: {
      check: "qx.ui.core.LayoutItem",
      nullable: false,
      deferredInit: true,
    },

    // overrides
    visibility: {
      refine: true,
      init: "hidden",
    },

    allowClose: {
      refine: true,
      init: false,
    },

    allowMinimize: {
      refine: true,
      init: false,
    },

    allowMaximize: {
      refine: true,
      init: false,
    },

    alwaysOnTop: {
      refine: true,
      init: true,
    },

    modal: {
      refine: true,
      init: true,
    },

    resizableTop: {
      refine: true,
      init: false,
    },

    resizableLeft: {
      refine: true,
      init: false,
    },

    resizableRight: {
      refine: true,
      init: false,
    },

    resizableBottom: {
      refine: true,
      init: false,
    },
    showClose: {
      refine: true,
      init: false,
    },

    showMaximize: {
      refine: true,
      init: false,
    },

    showMinimize: {
      refine: true,
      init: false,
    },

    showStatusbar: {
      refine: true,
      init: false,
    },
  },

  construct: function (content, blockedItem) {
    this.base(arguments);

    // initialize the blocked item. If none is passed, the default
    // is the application root.
    this.initBlockedItem(
      blockedItem || qx.core.Init.getApplication().getRoot()
    );
    const blocker = (this.__blocker = new qx.ui.core.Blocker(
      this.getBlockedItem()
    ));

    this.bind("blockerColor", this.__blocker, "color");
    this.bind("blockerOpacity", this.__blocker, "opacity");

    this.addListener("appear", this.__block, this);
    this.addListener("close", this.__unblock, this);

    this.addListener("appear", this.center, this);
  },

  members: {
    __blocker: null,

    /**
     * Centers the dialog to the blocked widget
     *
     */
    center: function () {
      const {
        height: targetHeight,
        width: targetWidth,
      } = this.getBlockedItem().getBounds();

      const { height: dialogHeight, width: dialogWidth } = this.getSizeHint(
        true
      );

      const left = Math.round((targetWidth - dialogWidth) / 2);
      const top = Math.round((targetHeight - dialogHeight) / 2);
      this.moveTo(left, top);
    },

    __block: function () {
      if (this.getModal()) {
        this.__blocker.block();
      }
    },


    __unblock: function () {
      this.__blocker.unblock();
    },
  },
});
