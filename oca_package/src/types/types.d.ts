// extensions overlay types
export declare interface IExtensionsInputJSON {
  separator_ov: SeparatorsInput;
  examples_ov: ExampleInput[];
}

// separator overlay types
export declare interface SeparatorsInput {
  type: string;
  dataset_separator?: SeparatorsFields;
  attribute_separators?: {
    [key: string]: SeparatorsFields;
  };
}

export declare interface ISeparatorOverlay {
  said?: string;
  type: OverlayType.Separator;
  capture_base: OcaBundleCaptureBase;
  dataset_separator?: SeparatorsInput['dataset_separator'];
  attribute_separators?: SeparatorsInput['attribute_separators'];
}

export declare interface SeparatorsFields {
  delimiter: string;
  escape: string;
}

// example overlay types
declare type ExamplesFields<T> = { [key: string]: T[] };

export type ExampleInput = {
  type: string;
  language: string;
  attribute_examples: ExamplesFields<string>;
};

export declare interface IExampleOverlay {
  said?: string;
  language: string;
  type: OverlayType.Example;
  capture_base: OcaBundleCaptureBase;
  attribute_examples?: ExamplesFields<string>;
}

// oca package types
export declare interface OcaBundleCaptureBase {
  d: string;
  type: string;
  classification: string;
  attributes: { [key: string]: string };
  flagged_attributes: string[];
}

export declare interface IOcaPackage {
  oca_bundle: string;
  extensions: Extensions;
}

// overlay types
export declare interface Overlay {
  // language?(): string;
  attributes(): object[];
  saidifying(): string;
}

export declare enum OverlayType {
  Separator = 'separator',
  Example = 'example',
}
