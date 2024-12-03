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
