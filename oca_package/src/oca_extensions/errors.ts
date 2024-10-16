enum ErrorTypes {
  NullOverlay = 'NullOverlay',
  InvalidOverlay = 'InvalidOverlay',
  NullExtensionObject = 'NullExtensionObject',
}

export class CustomError extends Error {
  public type: ErrorTypes;

  constructor(type: ErrorTypes, message: string) {
    super(message);
    this.type = type;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NullOverlayError extends CustomError {
  constructor() {
    super(ErrorTypes.NullOverlay, 'Overlay cannot be null.');
  }
}

export class InvalidOverlayError<T> extends CustomError {
  constructor(unknownOverlay: T) {
    super(ErrorTypes.InvalidOverlay, `Overlay type ${unknownOverlay} is not valid.`);
  }
}

export class NUllExtensionObject extends CustomError {
  constructor() {
    super(ErrorTypes.NullExtensionObject, 'Extension object cannot be null.');
  }
}
