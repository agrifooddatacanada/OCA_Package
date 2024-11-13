type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];
type JsonValue = string | number | boolean | null | JsonObject | JsonArray;

const canonicalize = (object: JsonValue): string => {
  let buffer = '';
  serialize(object);
  return buffer;

  function serialize(object: JsonValue): void {
    if (object === null || typeof object !== 'object' || typeof (object as JsonObject).toJSON === 'function') {
      // Primitive type or toJSON - Use ES6/JSON
      buffer += JSON.stringify(object);
    } else if (Array.isArray(object)) {
      // Array - Maintain element order
      buffer += '[';
      let next = false;
      object.forEach(element => {
        if (next) {
          buffer += ',';
        }
        next = true;
        // Array element - Recursive expansion
        serialize(element);
      });
      buffer += ']';
    } else {
      // Object - Sort properties before serializing
      buffer += '{';
      let next = false;
      Object.keys(object)
        .sort()
        .forEach(property => {
          if (next) {
            buffer += ',';
          }
          next = true;
          // Property names are strings - Use ES6/JSON
          buffer += JSON.stringify(property);
          buffer += ':';
          // Property value - Recursive expansion
          serialize(object[property]);
        });
      buffer += '}';
    }
  }
};

export default canonicalize;
