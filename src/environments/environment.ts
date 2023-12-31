import {Network} from "../app/models/enums/Network";

export const environment = {
    production: true,
    iconRpcUrl: "https://ctz.solidwallet.io/api/v3",
    ommRestApi: "https://api.omm.finance/api/v1",
    iconDebugRpcUrl: "https://ctz.solidwallet.io/api/v3d",
    BALANCED_DEX_SCORE: "cxa0af3165c08318e988cb30993b3048335b94af6c",
    ledgerBip32Path: "44'/4801368'/0'/0'",
    GOVERNANCE_ADDRESS: "cx0000000000000000000000000000000000000001",
    IISS_API: "cx0000000000000000000000000000000000000000",
    NID: 1,
    SHOW_BANNER: true,
    NETWORK: Network.MAINNET,
    ICX_TOKEN: "cx1111111111111111111111111111111111111111",
    OMM_TOKEN: "cx1a29259a59f463a67bb2ef84398b30ca56b5830a",
    SICX_TOKEN: "cx2609b924e33ef00b648a409245c7ea394c467824",
    ADDRESS_PROVIDER_SCORE: "cx3beb2fa9b7cfa3684f6db1413897dfcf6cc1b04c",
    trackerUrl: "https://tracker.icon.community",
};

