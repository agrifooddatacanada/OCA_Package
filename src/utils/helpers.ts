// Validate if the attribute exists in the OCA bundle capture base
export const isPresent = (attribute: string, oca_bundle: any): boolean => {
  try {
    if (!oca_bundle) {
      throw new Error('OCA bundle is undefined or null.');
    }
    if (!oca_bundle.bundle) {
      throw new Error('OCA bundle does not contain a bundle property.');
    }
    if (!oca_bundle.bundle.capture_base) {
      throw new Error('OCA bundle does not contain a capture_base property.');
    }
    if (!oca_bundle.bundle.capture_base.attributes) {
      throw new Error('OCA bundle capture_base does not contain attributes.');
    }
    return attribute in oca_bundle.bundle.capture_base.attributes;
  } catch (error) {
    console.error('Error in validation:', error);
    throw new Error(`Failed to check if the attribute is present in the capture base: ${error.message}`);
  }
};
