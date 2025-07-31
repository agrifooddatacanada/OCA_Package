import { verify, SAIDDex, Serials } from 'saidify';

/**
 * Verifies the OCA package against a digest.
 * @param oca_package - The OCA package to verify.
 * @param digest - The digest to verify against.
 * @returns {boolean} - Returns true if the verification is successful, otherwise false.
 */
export function VerifyOcaPackage(oca_package: any, digest: string): boolean {
  const label = 'd';
  // prefixed is set to true this avoid d = '' to be considered as a valid self-addressing data
  return verify(oca_package, digest, label, SAIDDex.Blake3_256, Serials.JSON, true);
}
