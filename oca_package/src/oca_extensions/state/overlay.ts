export interface Overlay {
  // language?(): string;
  attributes(): object[];
  saidifying(): string;
}

export enum OverlayType {
  Separator = 'separator',
  Example = 'example',
}
