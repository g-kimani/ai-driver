class EventHandler {
  constructor() {
    this.events = {};
  }
  subscribe(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [callback];
    } else {
      this.events[event].push(callback);
    }
  }

  trigger(event, data) {
    if (!this.events[event]) {
      console.warn(`No events registered for event: ${event}`);
      return;
    }
    for (let callback of this.events[event]) {
      callback(data);
    }
  }
}
