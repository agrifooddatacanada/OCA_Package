# OCA_Package

[![npm version](https://badge.fury.io/js/oca_package.svg)](https://badge.fury.io/js/oca_package)

Generate oca_package from oca_bundle and extensions

For extended documentation refer to [oca_package_standard](https://github.com/agrifooddatacanada/OCA_package_standard?tab=readme-ov-file)

## Usage

```bash
npm i oca_package
```

```typescript
import { OcaPackage } from 'oca_package';
import { except } from 'vitest'; // make sure to install vitest or use any other testing library

const extension = {
  extensions: [
    {
      ordering_overlay: {
        type: 'ordering',
        ordering_attributes: ['i', 'd'],
        ordering_entry_codes: {
          i: ['Google', 'ISNI', 'ORCiD', 'ResearcherID', 'Scopus'],
          d: ['001', '002', '003', '004', '005'],
        },
      },
    },
  ],
};

const oca_bundle = {
  v: 'OCAA11JSON0008bc_',
  bundle: {
    v: 'OCAS11JSON00089f_',
    d: 'ECpSix7tE3wyQM5jH5oaqdizR77rWdQ_BDP3AJn-Jykz',
    capture_base: {
      d: 'EBnF9U9XW1EqteIW0ucAR4CsTUqojvfIWkeifsLRuOUW',
      type: 'spec/capture_base/1.0',
      attributes: {
        d: 'Text',
        i: 'Text',
        passed: 'Boolean',
      },
      classification: '',
      flagged_attributes: [],
    },
    overlays: {
      character_encoding: {
        d: 'ED6Eio9KG2jHdFg3gXQpc0PX2xEI7aHnGDOpjU6VBfjs',
        capture_base: 'EBnF9U9XW1EqteIW0ucAR4CsTUqojvfIWkeifsLRuOUW',
        type: 'spec/overlays/character_encoding/1.0',
        attribute_character_encoding: {
          d: 'utf-8',
          i: 'utf-8',
          passed: 'utf-8',
        },
      },
      conformance: {
        d: 'EJSRe8DnLonKf6GVT_bC1QHoY0lQOG6-ldqxu7pqVCU8',
        capture_base: 'EBnF9U9XW1EqteIW0ucAR4CsTUqojvfIWkeifsLRuOUW',
        type: 'spec/overlays/conformance/1.0',
        attribute_conformance: {
          d: 'M',
          i: 'M',
          passed: 'M',
        },
      },
      entry: [
        {
          d: 'EDQVwDAmYssKbGCcLYjYB_Kg5LPOgCTdT3ODzvXqKc1A',
          capture_base: 'EBnF9U9XW1EqteIW0ucAR4CsTUqojvfIWkeifsLRuOUW',
          type: 'spec/overlays/entry/1.0',
          language: 'eng',
          attribute_entries: {
            d: {
              '001': 'code1',
              '002': 'code2',
              '003': 'code3',
              '004': 'code4',
              '005': 'code5',
            },
            i: {
              G: 'Google',
              I: 'ISNI',
              O: 'ORCiD',
              R: 'ResearcherID',
              S: 'Scopus',
            },
          },
        },
      ],
      entry_code: {
        d: 'EHrwr6xT_k3PHwd0y8RbIPGe0hDaELjJbjrKs_o8LfGY',
        capture_base: 'EBnF9U9XW1EqteIW0ucAR4CsTUqojvfIWkeifsLRuOUW',
        type: 'spec/overlays/entry_code/1.0',
        attribute_entry_codes: {
          d: ['001', '002', '003', '004', '005'],
          i: ['G', 'I', 'O', 'R', 'S'],
        },
      },
      information: [
        {
          d: 'EIBXpVvka3_4lheeajtitiafIP78Ig8LDMVX9dXpCC2l',
          capture_base: 'EBnF9U9XW1EqteIW0ucAR4CsTUqojvfIWkeifsLRuOUW',
          type: 'spec/overlays/information/1.0',
          language: 'eng',
          attribute_information: {
            d: 'Schema digest',
            i: 'Credential Issuee',
            passed: 'Enables or disables passing',
          },
        },
      ],
      label: [
        {
          d: 'ECZc26INzjxVbNo7-hln6xN3HW3e1r6NGDmA5ogRo6ef',
          capture_base: 'EBnF9U9XW1EqteIW0ucAR4CsTUqojvfIWkeifsLRuOUW',
          type: 'spec/overlays/label/1.0',
          language: 'eng',
          attribute_categories: [],
          attribute_labels: {
            d: 'Schema digest',
            i: 'Credential Issuee',
            passed: 'Passed',
          },
          category_labels: {},
        },
      ],
      meta: [
        {
          d: 'EOxvie-zslkGmFzVqYAzTVtO7RyFXAG8aCqE0OougnGV',
          capture_base: 'EBnF9U9XW1EqteIW0ucAR4CsTUqojvfIWkeifsLRuOUW',
          type: 'spec/overlays/meta/1.0',
          language: 'eng',
          description: 'Entrance credential',
          name: 'Entrance credential',
        },
      ],
    },
  },
  dependencies: [],
};

const oca_package = new OcaPackage(extension, oca_bundle);
expect(JSON.parse(oca_package.generateOcaPackage()).d).toBe('EEuopafp8gTROTWi7FTmzwJfP4QHitmQMY-s971y43Lc');
```
