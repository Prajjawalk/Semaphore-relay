use dep::std;

fn main(
    spendLimitIRON: Field,
    fee: Field,
    amountToSpend: pub Field,
    asset: pub str<42>,
    feePriceIRON: Field,
    assetPriceIRON: Field
) {
    assert(
        spendLimitIRON as u64 >= std::wrapping_add(
            std::wrapping_mul(fee as u64, feePriceIRON as u64),
            std::wrapping_mul(amountToSpend as u64, assetPriceIRON as u64)
        )
    );
}
