const USBRelay = require("@josephdadams/usbrelay");
let relay;
if (process.env.USE_GATE == 1) {
  console.log("initialzing usb relay");
  relay = new USBRelay();
} //gets the first connected relay

class Gate {
  static rotate180deg() {
    if (process.env.USE_GATE == 1) {
      relay.setState(1, true);
      setTimeout(() => {
        relay.setState(1, false);
      }, 450);
    }
  }
  static getState() {
    if (process.env.USE_GATE == 1) return relay.getState(1);
    else return false;
  }
  static on() {
    if (process.env.USE_GATE == 1) relay.setState(1, true);
  }
  static off() {
    if (process.env.USE_GATE == 1) relay.setState(1, false);
  }
}
module.exports = Gate;
