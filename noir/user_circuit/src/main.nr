use dep::std;

// A seperate merkle tree for each account will be created which interacts with vault address
// and it will contain transaction information common to both vault and user - tx hash and amount.
// The leaves will be added to tree on IRON deposit by user to vault and also token withdrawal.
// Leaf hash will constitute of - transaction hash, transferred amount, claim eligilility
// Public inputs - root, sender claim eligibility
fn main(
    index: Field,
    hash_path: [[u8; 32]; 1],
    spend_limit: pub Field,
    transferAmount: Field,
    transactionHash: str<66>,
    root: pub [u8; 32]
) {
    let mut sha256_input: [u8] = [0; 0];
    for i in transactionHash.as_bytes() {
        sha256_input = sha256_input.push_back(i);
    }

    let mut spend_limit_sha_inp: [u8] = [0; 0];
    let sl: [u8] = spend_limit.to_be_bytes(8);
    for i in 0..8 {
        spend_limit_sha_inp = spend_limit_sha_inp.push_front(sl[i]);
    }
    let spend_limit_inp = std::hash::sha256(spend_limit_sha_inp);

    let mut transfer_amount_sha_inp: [u8] = [0; 0];
    let ta: [u8] = transferAmount.to_be_bytes(8);
    for i in 0..8 {
        transfer_amount_sha_inp = transfer_amount_sha_inp.push_front(ta[i]);
    }
    let transaction_amount_inp = std::hash::sha256(transfer_amount_sha_inp);

    for i in transaction_amount_inp {
        sha256_input = sha256_input.push_back(i);
    }
    for i in spend_limit_inp {
        sha256_input = sha256_input.push_back(i);
    }
    let note_commitment = std::hash::sha256(sha256_input);

    let check_root = compute_merkle_root(note_commitment, index, hash_path);
    assert(root == check_root);
}

// Returns the merkle root of the tree from the provided leaf, path indices, siblings with sha256 hash.
pub fn compute_merkle_root<N>(leaf: [u8; 32], index: Field, hash_path: [[u8; 32]; N]) -> [u8; 32] {
    let n = hash_path.len();
    let index_bits = index.to_le_bits(n as u32);
    let mut current = leaf;
    for i in 0..n {
        let path_bit = index_bits[i] as bool;
        let (hash_left, hash_right) = if path_bit {
            (hash_path[i], current)
        } else {
            (current, hash_path[i])
        };

        let mut input: [u8] = [0; 0];
        for i in hash_left {
            input = input.push_back(i);
        }

        for i in hash_right {
            input = input.push_back(i);
        }
        current = std::hash::sha256(input);
    }
    current
}

#[test]
fn test_compute_merkle_root() {
    let commitment_0 = std::hash::sha256([1]);
    let commitment_1 = std::hash::sha256([2]);
    let commitment_2 = std::hash::sha256([3]);
    let commitment_3 = std::hash::sha256([4]);

    let mut left_branch_input: [u8] = [0; 0];
    for i in commitment_0 {
        left_branch_input = left_branch_input.push_back(i);
    }
    for i in commitment_1 {
        left_branch_input = left_branch_input.push_back(i);
    }

    let mut right_branch_input: [u8] = [0; 0];
    for i in commitment_2 {
        right_branch_input = right_branch_input.push_back(i);
    }
    for i in commitment_3 {
        right_branch_input = right_branch_input.push_back(i);
    }

    let left_branch = std::hash::sha256(left_branch_input);
    let right_branch = std::hash::sha256(right_branch_input);

    let mut root_input: [u8] = [0; 0];
    for i in left_branch {
        root_input = root_input.push_back(i);
    }
    for i in right_branch {
        root_input = root_input.push_back(i);
    }

    let root = std::hash::sha256(root_input);

    std::println("Merkle Tree:");
    std::println([root]);
    std::println([left_branch, right_branch]);
    std::println([commitment_0, commitment_1, commitment_2, commitment_3]);

    let computed_root = compute_merkle_root(commitment_0, 0, [commitment_1, right_branch]);
    assert(root == computed_root);
}

#[test]
fn test_valid_spend_limit() {
    let commitment_0 = std::hash::sha256([0x01, 10, 10]);
    let commitment_1 = std::hash::sha256([0x02, 20, 30]);

    let mut commitment_2_input: [u8] = [0; 0];
    let txHash = ("0x2c027c86fd5f26783f3bb1b1743515d9ff2d64433c3d627f9dffdef06e30cbc5").as_bytes();
    for i in txHash {
        commitment_2_input = commitment_2_input.push_back(i);
    }

    let spend_limit = 60;
    let transferAmount = 30;

    let mut spend_limit_sha_inp: [u8] = [0; 0];
    let sl: [u8] = spend_limit.to_be_bytes(8);
    for i in 0..8 {
        spend_limit_sha_inp = spend_limit_sha_inp.push_front(sl[i]);
    }
    let spend_limit_inp = std::hash::sha256(spend_limit_sha_inp);

    let mut transfer_amount_sha_inp: [u8] = [0; 0];
    let ta: [u8] = transferAmount.to_be_bytes(8);
    for i in 0..8 {
        transfer_amount_sha_inp = transfer_amount_sha_inp.push_front(ta[i]);
    }
    let transaction_amount_inp = std::hash::sha256(transfer_amount_sha_inp);

    for i in transaction_amount_inp {
        commitment_2_input = commitment_2_input.push_back(i);
    }
    for i in spend_limit_inp {
        commitment_2_input = commitment_2_input.push_back(i);
    }
    let commitment_2 = std::hash::sha256(commitment_2_input);

    let lvl1 = std::hash::sha256(commitment_0);

    let mut lvl2_input: [u8] = [0; 0];
    for i in commitment_1 {
        lvl2_input = lvl2_input.push_back(i);
    }
    for i in lvl1 {
        lvl2_input = lvl2_input.push_back(i);
    }
    let lvl2 = std::hash::sha256(lvl2_input);

    let mut root_input: [u8] = [0; 0];
    for i in commitment_2 {
        root_input = root_input.push_back(i);
    }
    for i in lvl2 {
        root_input = root_input.push_back(i);
    }
    let root = std::hash::sha256(root_input);

    std::println("Merkle Tree:");
    std::println([root]);
    std::println([commitment_2, lvl2]);
    std::println([commitment_1, lvl1]);
    std::println([commitment_0]);

    let computed_root = compute_merkle_root(commitment_2, 0, [lvl2]);
    assert(computed_root == root);

    main(
        0,
        [lvl2],
        spend_limit,
        transferAmount,
        "0x2c027c86fd5f26783f3bb1b1743515d9ff2d64433c3d627f9dffdef06e30cbc5",
        root
    );
}
