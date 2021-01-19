qx.Class.define("qxDialogs.MessageBox", {
  extend: qxDialogs.Dialog,

  properties: {
    message: {
      check: "String",
      nullable: true,
      event: "changMessage"
    },

    text: {
      check: "String",
      nullable: true,
      event: "changeText"
    },

    dialogIcon: {
      nullable: true,
      event: "changeDialogIcon"
    }
  },

  /**
   * Text is the informative text
   * Message is the informative message
   * Buttons is an array of default buttons
   */
  construct: function ({message: msg, text: txt}, sButtons = [], parent) {
    this.base(arguments, sButtons, parent);
    this.setMessage(msg);
    this.setText(txt);

    // content
    const message = (this.__msgLabel = new qx.ui.basic.Label());
    message.setAppearance("qxdialogs-messagebox-message");
    this.bind("message", message, "value");

    this.bind("message", this, "caption");

    const text = (this.__msgText = new qx.ui.basic.Label());
    this.bind("text", text, "value");

    const icon = (this.__dlgIcon = new qx.ui.basic.Image());
    this.bind("dialogIcon", icon, "source");

    const content = this.getContentPane();
    content.setLayout(new qx.ui.layout.Atom());
    content.setAppearance("qxdialogs-messagebox-content");

    const strings = new qx.ui.container.Composite(new qx.ui.layout.VBox());
    strings.add(message);
    strings.add(text);
    content.add(strings);

    // buttons
    const bBox = this.getButtonBox();
    bBox.set({
      center: true
    });

    bBox.addListener("clicked", this.__onClicked, this);
  },

  members: {
    __msgLabel: null,
    __txtLabel: null,
    __dlgIcon: null,


    __onClicked: function(evt) {
      const button = evt.getData();
      console.log(`You clicked ${button.getLabel()}`);
    }
  },

  destruct: function () {
    this._disposeObjects("__msgLabel", "__txtLabel", "__dlgIcon");
  }
});
