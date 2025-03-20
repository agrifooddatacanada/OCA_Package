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
  extensions: {
    adc: {
      EDDBSQuhzsJtE9ksQxpWYVBblWwHhhtNxemYFeEFY1qX: [
        {
          ordering_overlay: {
            type: 'ordering',
            attribute_ordering: ['book.title', 'book.pages', 'book.languages'],
            entry_code_ordering: {
              'book.languages': { 'book.languages': ['nb', 'b'] },
            },
          },
        },
      ],
      EKNGowNlfUGdnAiQ_2PdmzqUB705QgaWxvrYCwovlWqc: [
        {
          ordering_overlay: {
            type: 'ordering',
            attribute_ordering: ['page.number', 'opened'],
            entry_code_ordering: {},
          },
        },
      ],
    },
  },
};

const oca_bundle = {
  v: 'OCAA11JSON000637_',
  bundle: {
    v: 'OCAS11JSON000425_',
    d: 'EDDBSQuhzsJtE9ksQxpWYVBblWwHhhtNxemYFeEFY1qX',
    capture_base: {
      d: 'ELdpxPMcAE_-DsvUpkmjcM3OQ8QyHNlH1q6xJb-5Dih9',
      type: 'spec/capture_base/1.1',
      attributes: {
        'book.languages': 'Text',
        'book.pages': 'refs:EKNGowNlfUGdnAiQ_2PdmzqUB705QgaWxvrYCwovlWqc',
        'book.title': 'Text',
      },
      classification: '',
      flagged_attributes: [],
    },
    overlays: {
      entry: [
        {
          d: 'EE1bnxtnlylwYS7rxuMXdoLw1_zWtcQV6qic7S2dBoPD',
          capture_base: 'ELdpxPMcAE_-DsvUpkmjcM3OQ8QyHNlH1q6xJb-5Dih9',
          type: 'spec/overlays/entry/1.1',
          language: 'eng',
          attribute_entries: {
            'book.languages': {
              b: 'bilingual',
              nb: 'non-bilingual',
            },
          },
        },
      ],
      entry_code: {
        d: 'EEdyjFBfM8YWXXsWmM0ojxSqU3fTCEUYSUTP9rlC_D5_',
        capture_base: 'ELdpxPMcAE_-DsvUpkmjcM3OQ8QyHNlH1q6xJb-5Dih9',
        type: 'spec/overlays/entry_code/1.1',
        attribute_entry_codes: {
          'book.languages': ['b', 'nb'],
        },
      },
      meta: [
        {
          d: 'EPiuBpZGvOlDSPr6nm7L3W-LnkY_F-ykLqMyNyBdm7Kx',
          capture_base: 'ELdpxPMcAE_-DsvUpkmjcM3OQ8QyHNlH1q6xJb-5Dih9',
          type: 'spec/overlays/meta/1.1',
          language: 'eng',
          description: 'Book Description',
          name: 'Book of Interest',
        },
      ],
    },
  },
  dependencies: [
    {
      v: 'OCAS11JSON00020d_',
      d: 'EKNGowNlfUGdnAiQ_2PdmzqUB705QgaWxvrYCwovlWqc',
      capture_base: {
        d: 'ELauJG9lo9hBOPrxGasmTSleHfh8X8TQE_dUDzUMCuJW',
        type: 'spec/capture_base/1.1',
        attributes: {
          opened: 'Boolean',
          'page.number': 'Numeric',
        },
        classification: '',
        flagged_attributes: [],
      },
      overlays: {
        meta: [
          {
            d: 'EFFOiK0t_EDxVABcUGIwQxpDD3Pwgd1gKpITUlipNcB3',
            capture_base: 'ELauJG9lo9hBOPrxGasmTSleHfh8X8TQE_dUDzUMCuJW',
            type: 'spec/overlays/meta/1.1',
            language: 'eng',
            description: 'Page Status',
            name: 'Current Page in the Book',
          },
        ],
      },
    },
  ],
};

const oca_package = new OcaPackage(extension, oca_bundle);
expect(JSON.parse(oca_package.GenerateOcaPackage()).d).toBe('EG5L9MmzrvRdscWysJKw7tfwutGD0MSkFNsbULms3AmV');
```
