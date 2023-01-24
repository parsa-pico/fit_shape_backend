const USBRelay = require("@josephdadams/usbrelay");
const relay = new USBRelay(); //gets the first connected relay

class Gate {
  static rotate180deg() {
    relay.setState(1, true);
    setTimeout(() => {
      relay.setState(1, false);
    }, 445);
  }
  static getState() {
    return relay.getState(1);
  }
}
module.exports = Gate;
