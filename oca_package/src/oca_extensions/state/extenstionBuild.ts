// import Attribute from './attribute.js';
// import Separator from './overlays/separator.js';
// // import { NullOverlayError, InvalidOverlayError } from '../errors.js';
// import { OverlayType } from '../state/overlay.js';

// type ExtensionOverlayType = Separator | null;

// interface IExtensionObject {
//   separators: OverlayType.Separator | null;
// }

// interface IExtensions {
//   extensions: ExtensionOverlayType[];
// }

// class Extensions implements IExtensions {
//   #extensions: ExtensionOverlayType[];

//   constructor(extension_obj: IExtensionObject[]) {
//     this.#extensions = this.buildExtensions(extension_obj);
//   }

//   private buildExtensions(extension_obj: IExtensionObject[]): ExtensionOverlayType[] {
//     const extensions: ExtensionOverlayType[] = [];

//     for (const ext of extension_obj) {
//       if (ext.separators) {
//         extensions.push(new Separator(ext.separators));
//       } else {
//         extensions.push(null);
//       }
//     }

//     return extensions;
//   }

//   public get extensions(): ExtensionOverlayType[] {
//     // Implementing the required property
//     return this.#extensions;
//   }

//   public get extension(): ExtensionOverlayType[] {
//     return this.#extensions;
//   }
// }

// interface IExtensionContainer {
//   attributes: { [key: string]: Attribute };
// }

// class ExtenstionContainer extends Extensions implements IExtensionContainer {
//   #attributes: { [key: string]: Attribute };

//   constructor() {
//     super([]);
//     this.#attributes = {} as { [key: string]: Attribute };
//   }

//   public get attributes(): { [key: string]: Attribute } {
//     return this.#attributes;
//   }

//   public addAttribute(attribute: Attribute): void {
//     this.#attributes[attribute.name] = attribute;
//   }

//   //   public generate_extension(): string {}

//   public generate_extension_overlays(): Extensions {
//     return new Extensions([]);
//   }
// }

// export default ExtenstionContainer;
