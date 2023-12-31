/* ==========================================================================
    Formats
========================================================================== */

// declare wNumb

import {Irc2Token} from "../models/classes/Irc2Token";

declare var wNumb: any;

// %
export const normalFormat = wNumb({
  decimals: 0,
  thousand: ',',
});

// 000,000.00
export const usLocale = wNumb({
  decimals: 2,
  thousand: ',',
});

// %
export const percentageFormat = wNumb({
  decimals: 0,
  suffix: '%'
});

// + .00
export const prefixPlusFormat = wNumb({
  decimals: 2,
  thousand: ',',
  prefix: ' + '
});

export function assetFormat(token: Irc2Token): any {
    return wNumb({
      decimals: 2,
      thousand: ',',
      suffix: ` ${token.symbol}`
    });
}

export function assetPrefixApproxFormat(token: Irc2Token): any {
  return wNumb({
    decimals: 2,
    thousand: ',',
    prefix: ' ~ ',
    suffix: ` ${token.symbol}`
  });
}

// + ICX .00
// export function assetPrefixPlusFormat(assetTag: AssetTag | CollateralAssetTag): any {
//   return wNumb({
//     decimals: 2,
//     thousand: ',',
//     prefix: ' + ',
//     suffix: ` ${assetTag.toString()}`
//   });
// }

// - ICX .00
// export function assetPrefixMinusFormat(assetTag: AssetTag | CollateralAssetTag): any {
//   return wNumb({
//     decimals: 2,
//     thousand: ',',
//     prefix: ' - ',
//     suffix: ` ${assetTag.toString()}`
//   });
// }

// OMM .00
export const ommPrefixFormat = wNumb({
  decimals: 2,
  thousand: ',',
  suffix: ' OMM'
});

// ICD
export const icdFormat = wNumb({
  decimals: 0,
  thousand: ',',
  suffix: ' ICD'
});

// $
export const usdFormat = wNumb({
  decimals: 0,
  thousand: ',',
  prefix: '$'
});

// $ .00
export const usdTwoDecimalFormat = wNumb({
  decimals: 2,
  thousand: ',',
  prefix: '$'
});

// +$ .00
export const usdTwoDecimalPlusFormat = wNumb({
  decimals: 2,
  thousand: ',',
  prefix: '+ $'
});

// -$ .00
export const usdTwoDecimalMinusFormat = wNumb({
  decimals: 2,
  thousand: ',',
  prefix: '- $'
});
