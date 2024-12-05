// digest(said) type
export type Said = string;

// oca_bundle_capture_base
export interface OcaBundleCaptureBase {
  d: Said;
  type: string;
  classification: string;
  attributes: { [key: string]: string };
  flagged_attributes: string[];
}

// overlay types
export enum OverlayTypes {
  Separator = 'separator',
  Example = 'example',
}

// separator overlay types and interfaces
export type SeparatorValues = {
  delimiter: string;
  escape: string;
};

export interface SeparatorOverlayInput {
  type: string;
  dataset_separator: SeparatorValues;
  attribute_separators: { [key: string]: SeparatorValues };
}
