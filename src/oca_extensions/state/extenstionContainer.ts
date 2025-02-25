// Todo: To generate extension container, we need to iterate the extensions json input,
// and create an extension object for each

import Extension from '../extensions.js';
import { ExtensionInputJson } from '../extensions.js';

export interface IExtensionContainer {
  extensionsContainer: string[];
}

class ExtensionContainer implements IExtensionContainer {
  public extensionsContainer: string[];

  constructor() {
    this.extensionsContainer = [];
  }

  // Currently, this method only generate extension overlay for a single layered oca bundle
  public generate_extensions(extension_obj: ExtensionInputJson, oca_bundle: any): string[] {
    try {
      if (extension_obj) {
        const extension = new Extension((extension_obj as any)['extensions'][0], oca_bundle);

        this.extensionsContainer.push(JSON.parse(extension.generateExtension()));
      }
    } catch (error) {
      throw new Error(`Failed to generate extension overlay: ${error}`);
    }
    return this.extensionsContainer;
  }
}

export default ExtensionContainer;
