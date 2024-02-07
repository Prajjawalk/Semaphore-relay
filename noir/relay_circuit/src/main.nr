use dep::std;

fn main(spendingBucketUSD: Field, fee: Field, amountToSpend: pub Field, asset: pub str<42>, feePriceUSD: Field, assetPriceUSD: Field) {
  assert(spendingBucketUSD as u64 >= std::wrapping_add(std::wrapping_mul(fee as u64, feePriceUSD as u64), std::wrapping_mul(amountToSpend as u64, assetPriceUSD as u64)));
  assert(asset != "0x0000000000000000000000000000000000000000");
}