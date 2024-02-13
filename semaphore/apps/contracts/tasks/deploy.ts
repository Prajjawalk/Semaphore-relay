import { task, types } from "hardhat/config"

task("deploy", "Deploy a Feedback contract")
    .addOptionalParam("semaphore", "Semaphore contract address", "0x4674c14e6e0B8DeEC39b9328EdC7f75A4AA3eD92", types.string)
    .addOptionalParam("group", "Group id", "42", types.string)
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
    .setAction(async ({ethers}) => {
        const UserVerifier = await ethers.getContractFactory("userCircuitVerifierSol:UserUltraVerifier")

        const userVerifier = await UserVerifier.deploy()

        return userVerifier
    })

task("deploy-relay-verifier")
    .setAction(async ({ethers}) => {
        const RelayVerifier = await ethers.getContractFactory("relayCircuitVerifierSol:RelayUltraVerifier")

        const relayVerifier = await RelayVerifier.deploy()

        return relayVerifier
    })

task("deployvault", "Deploy a relayer Bot Vault")
    .addParam("wiron", "wIron Address", undefined, types.string, false)
    .addParam("userVerifier", "User proofs verifier contract", undefined, types.string, false)
    .addParam("relayVerifier", "Relay proof verifiers", undefined, types.string, false)
    .addParam("ironPrice", "Iron token price", undefined, types.string, false)
    .addParam("decimals", "Decimals for iron token price", 4, types.int, true)
    .addParam("ironDecimals", "Decimals for iron token price", 18, types.int, true)
    .setAction(async ({wiron: wIronAddress, userVerifier, relayVerifier, iron_price: ironPrice, decimals: ironPriceDecimals, ironDecimals}, { ethers }) => {

        const RelayVaultFactory = await ethers.getContractFactory("RelayVault")

        const relayVaultContract = await RelayVaultFactory.deploy(
            wIronAddress, userVerifier, relayVerifier, ironPrice, ironPriceDecimals, ironDecimals
        )

        return relayVaultContract
    })

