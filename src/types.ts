// oca bundle capture base types
export declare interface OcaBundleCaptureBase {
  d: string;
  type: string;
  classification: string;
  attributes: { [key: string]: string };
  flagged_attributes: string[];
}
