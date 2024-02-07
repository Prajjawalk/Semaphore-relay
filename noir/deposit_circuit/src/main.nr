use dep::std;

fn main(depositorAssetInitialBalance: Field, depositorWIronInitialBalance: Field, depositorAssetFinalBalance: Field, depositorWIronFinalBalance: Field, vaultAssetInitialBalance: Field, vaultWIronInitialBalance: Field, vaultAssetFinalBalance: pub Field, vaultWIronFinalBalance: pub Field, asset: str<42>, assetPriceUSD: Field, wIronPriceUSD: Field) {
    assert(std::wrapping_sub(depositorAssetInitialBalance, depositorAssetFinalBalance) == std::wrapping_sub(vaultAssetFinalBalance, vaultAssetInitialBalance));
    assert(std::wrapping_sub(depositorWIronInitialBalance, depositorWIronFinalBalance) == std::wrapping_sub(vaultWIronFinalBalance, vaultWIronInitialBalance));
    assert(((depositorAssetInitialBalance - depositorAssetFinalBalance) * assetPriceUSD) == ((depositorWIronFinalBalance - depositorWIronInitialBalance) * wIronPriceUSD)); 
    assert(asset != "0x0000000000000000000000000000000000000000");
}

