import { task, types } from "hardhat/config"

task("deploy", "Deploy a Feedback contract")
    .addOptionalParam("semaphore", "Semaphore contract address", "0x4674c14e6e0B8DeEC39b9328EdC7f75A4AA3eD92", types.string)
    .addOptionalParam("group", "Group id", "43", types.string)
    .addOptionalParam("logs", "Print the logs", true, types.boolean)
    .setAction(async ({ logs, semaphore: semaphoreAddress, group: groupId }, { ethers, run }) => {
        if (!semaphoreAddress) {
            const { semaphore } = await run("deploy:semaphore", {
                logs
            })

            semaphoreAddress = await semaphore.address
        }

        if (!groupId) {
            groupId = process.env.GROUP_ID
        }

        const FeedbackFactory = await ethers.getContractFactory("Feedback")

        const feedbackContract = await FeedbackFactory.deploy(semaphoreAddress, groupId)

        if (logs) {
            console.info(`Feedback contract has been deployed to: ${await feedbackContract.address}`)
        }

        return feedbackContract
    })

task("deploy-user-verifier")
    .setAction(async ({}, {ethers}) => {
        const UserVerifier = await ethers.getContractFactory("UserUltraVerifier")

        const userVerifier = await UserVerifier.deploy()

        console.info(`User proof verifier contract has been deployed to: ${await userVerifier.address}`)
        return userVerifier
    })

task("deploy-relay-verifier")
    .setAction(async ({},{ethers}) => {
        const RelayVerifier = await ethers.getContractFactory("RelayUltraVerifier")

        const relayVerifier = await RelayVerifier.deploy()

        console.info(`Relay proof verifier contract has been deployed to: ${await relayVerifier.address}`)

        return relayVerifier
    })

task("deploy-vault", "Deploy a relayer Bot Vault")
    .addParam("wiron", "wIron Address", "0xf1526523eE3cFF80Fcc5A0e307a534C3E72D3F9c", types.string, true)
    .addParam("userVerifier", "User proofs verifier contract", "0xE26C9EAf17D1C7F3A6Fe4E34055B45BaE4b0916b", types.string, true)
    .addParam("relayVerifier", "Relay proof verifiers", "0x73BC9763E23AF864ABF513b859Fb543b9012eCB5", types.string, true)
    .addParam("ironprice", "Iron token price", 17800, types.int, true)
    .addParam("decimals", "Decimals for iron token price", 4, types.int, true)
    .addParam("ironDecimals", "Decimals for iron token price", 18, types.int, true)
    .setAction(async ({wiron: wIronAddress, userVerifier, relayVerifier, ironprice: ironPrice, decimals: ironPriceDecimals, ironDecimals}, { ethers }) => {

        const RelayVaultFactory = await ethers.getContractFactory("RelayVault")

        const relayVaultContract = await RelayVaultFactory.deploy(
            wIronAddress, userVerifier, relayVerifier, BigInt(ironPrice), ironPriceDecimals, ironDecimals
        )

        console.info(`Relay Vault contract has been deployed to: ${await relayVaultContract.address}`)
        return relayVaultContract
    })

