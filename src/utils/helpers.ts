import { Said, OcaBundleCaptureBase } from '../types/types.js';

// Get capture base from the OCA bundle
export const getCaptureBase = (oca_bundle: any): OcaBundleCaptureBase => {
  try {
    if (!oca_bundle) {
      throw new Error('OCA bundle is undefined or null.');
    }
    if (!oca_bundle.bundle && oca_bundle.capture_base) {
      return oca_bundle.capture_base;
    }
    return oca_bundle.bundle.capture_base;
  } catch (error: any) {
    console.error('Error in getting capture base:', error);
    throw new Error(`Failed to get the capture base from the OCA bundle: ${error.message}`);
  }
};

// Validate if the attribute exists in the OCA bundle capture base
export const isPresent = (attribute: string, oca_bundle: any): boolean => {
  try {
    const capture_base = getCaptureBase(oca_bundle);
    if (!capture_base.attributes) {
      throw new Error('OCA bundle capture_base does not contain attributes.');
    }
    return attribute in capture_base.attributes;
  } catch (error: any) {
    console.error('Error in validation:', error);
    throw new Error(`Failed to check if the attribute is present in the capture base: ${error.message}`);
  }
};

// Get the said (digest) from the OCA bundle capture base
export const getDigest = (oca_bundle: any): Said => {
  try {
    const capture_base = getCaptureBase(oca_bundle);
    return capture_base.d;
  } catch (error: any) {
    console.error('Error in getting said:', error);
    throw new Error(`Failed to get the said from the capture base: ${error.message}`);
  }
};

// Get oca bundle digest
export const ocabundleDigest = (oca_bundle: any): string => {
  try {
    const oca_bundle_d = oca_bundle.bundle?.d !== undefined ? oca_bundle.bundle.d : oca_bundle.d;
    return oca_bundle_d;
  } catch (error: any) {
    console.error('Error in getting oca bundle digest:', error);
    throw new Error(`Failed to get the oca bundle digest: ${error.message}`);
  }
};

export const isSaid = (value: any): value is Said => {
  return typeof value === 'string' && value.length == 44;
};

// Handling oca bundle with dependencies
export const isOcaBundleWithDeps = (oca_bundle: any): boolean => {
  try {
    if (!oca_bundle) {
      throw new Error('OCA bundle is undefined or null.');
    }

    if (!oca_bundle.dependencies || oca_bundle.dependencies.length === 0) {
      return false;
    }
    return true;
  } catch (error: any) {
    console.error('Error in checking oca bundle with dependencies:', error);
    throw new Error(`Failed to check if the OCA bundle has dependencies: ${error.message}`);
  }
};

// Get corresponding oca bundle from oca bundle with dependencies
export const getOcaBundleFromDeps = (oca_bundle: any, digest: Said): any => {
  try {
    if (!isOcaBundleWithDeps(oca_bundle)) {
      throw new Error('OCA bundle does not have dependencies.');
    }

    const dependencies = oca_bundle['dependencies'];

    for (const dep in dependencies) {
      if (isSaid(digest) && dependencies[dep].d === digest) {
        return dependencies[dep];
      }
    }
  } catch (error: any) {
    console.error('Error in getting oca bundle from dependencies:', error);
    throw new Error(`Failed to get the OCA bundle from dependencies: ${error.message}`);
  }
};
