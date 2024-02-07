use dep::std;

fn main(senderInitialBalance: Field, senderFinalBalance: Field, fees: Field, receiverInitialBalance: Field, receiverFinalBalance: pub Field, transferAmount: Field) {
  assert(senderInitialBalance as u64 > transferAmount as u64);
  assert(senderInitialBalance as u64 == (std::wrapping_add(senderFinalBalance as u64, transferAmount as u64) + fees as u64));
  assert(std::wrapping_sub(receiverFinalBalance as u64, receiverInitialBalance as u64) == transferAmount as u64);
}