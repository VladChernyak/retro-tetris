type Constructable<T> = { new (...args: any[]): T };

type Matrix = (1 | 0)[][];

interface IControlsListenerParams<Event> {
  eventName: Event;
  handler: (
    event: Event extends "keydown"
      ? KeyboardEvent
      : Event extends "touchend"
      ? TouchEvent
      : Event extends "click"
      ? MouseEvent
      : never
  ) => any;
}
