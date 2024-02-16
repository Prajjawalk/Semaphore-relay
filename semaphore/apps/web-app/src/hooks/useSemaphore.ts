import { SemaphoreEthers } from "@semaphore-protocol/data"
import { BigNumber, ethers, utils } from "ethers"
import getNextConfig from "next/config"
import { Group } from "@semaphore-protocol/group"
import random from 'random-bigint'
import { generateProof } from "@semaphore-protocol/proof"
import { Identity } from "@semaphore-protocol/identity"
import { useCallback, useState } from "react"
import { SemaphoreContextType } from "../context/SemaphoreContext"

const { publicRuntimeConfig: env } = getNextConfig()

const chainlinkABI = require("./ChainLinkABI.json")

const ethereumNetwork = env.DEFAULT_NETWORK === "scroll-sepolia" ? "https://sepolia-rpc.scroll.io" : env.DEFAULT_NETWORK

export default function useSemaphore(): SemaphoreContextType {
    const [_users, setUsers] = useState<any[]>([])
    const [_feedback, setFeedback] = useState<string[]>([])

    const refreshUsers = useCallback(async (): Promise<void> => {
        const semaphore = new SemaphoreEthers(ethereumNetwork, {
            address: env.SEMAPHORE_CONTRACT_ADDRESS,
            startBlock: 2974700
        })

        const members = await semaphore.getGroupMembers(env.GROUP_ID)

        setUsers(members)
    }, [])

    const addUser = useCallback(
        (user: any) => {
            setUsers([..._users, user])
        },
        [_users]
    )

    const refreshFeedback = useCallback(async (): Promise<void> => {
        const semaphore = new SemaphoreEthers(ethereumNetwork, {
            address: env.SEMAPHORE_CONTRACT_ADDRESS,
            startBlock: 2974700
        })

        const proofs = await semaphore.getGroupVerifiedProofs(env.GROUP_ID)
        const feedbackList = proofs.map(async ({ signal }: any) => {
            let dataHex
            try {
                dataHex = utils.parseBytes32String(BigNumber.from(signal).toHexString())
            } catch(e) {
                dataHex = BigNumber.from(signal).toHexString().slice(2)
            }

            try {
                const resp = await fetch(`http://localhost:3080/get-data?hex=${ dataHex}`, {
                    method: "get",
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    }
                })
                const output = await resp.json()
                if (output.message == null) {
                    return dataHex
                }
                return output.message
            } catch(e) {
                return dataHex
            }
        })

        const feedbackInputs = await Promise.all(feedbackList)
        const botRequests = feedbackInputs.filter((i) => i.slice(0, 4) === "/bot")
        const botRequestFulfilled = feedbackInputs.filter((i) => i.slice(0, 5) === "/sent")
        const unfulfilledBotRequests = botRequests.slice(botRequestFulfilled.length)

        const provider = new ethers.providers.JsonRpcProvider(env.RPC_URL);
        const signer = new ethers.Wallet(`0x${env.RELAYER_PRIVATE_KEY}`, provider);
        const identityString = localStorage.getItem("identity")
        const botIdentity = new Identity(String(identityString))
        console.log(unfulfilledBotRequests)
        unfulfilledBotRequests.map(async (i) => {
            const infoArr = i.split(" ")
            infoArr.map((j: any) => {

                console.log(j)
            })
            const amount = infoArr[2]
            const asset = infoArr[3]
            const toAddress = infoArr[4]
            // const userProof = infoArr[5]
            // const userRoot = infoArr[6]
            // const spendLimit = infoArr[7]

            if (asset === "ETH") {
                const relayEthTransaction = {
                    from: env.RELAYER_ADDRESS,
                    to: toAddress,
                    value: amount.toString(),
                    gasPrice: "7000000000", // 7 gwei
                    nonce: await provider.getTransactionCount(env.RELAYER_ADDRESS),
                    chainId: 534351,
                }

                const relayEthSignedTransaction = await signer.populateTransaction(relayEthTransaction);
                const relayEthSignedTransactionResponse = await signer.sendTransaction(relayEthSignedTransaction);
                if (relayEthSignedTransactionResponse.confirmations > 1) {
                    try {
                        const feedback = `/sent ${amount} ${asset} ${toAddress} ${relayEthSignedTransactionResponse.hash}`
                        const group = new Group(env.GROUP_ID)
                        let signal

                        try {
                            const resp = await fetch(`${env.HELIA_NODE_URL  }/upload-data?message=${  feedback}`, {
                                method: "GET",
                                headers: {
                                    "Content-Type": "application/json",
                                    "Access-Control-Allow-Origin": "*"
                                }
                            })
                            const output = await resp.json()
                            signal = BigNumber.from(`0x${output.message}`).toString()
                        } catch(e) {
                            console.log(e)
                            signal = BigNumber.from(utils.formatBytes32String(feedback)).toString()
                        }

                        group.addMembers(_users)
                        // counter += 1;
                        const random_external_nullifier = random(128);
                        const { proof, merkleTreeRoot, nullifierHash, externalNullifier } = await generateProof(
                            botIdentity,
                            group,
                            random_external_nullifier,
                            signal
                        )

                        const response = await fetch("api/feedback", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                feedback: signal,
                                merkleTreeRoot,
                                nullifierHash,
                                externalNullifier,
                                proof
                            })
                        })


                        if (response.status === 200) {
                            feedbackInputs.push(feedback)
                        }
                    } catch (error) {
                        console.error(error)
                    }
                }
            } else {
                const chainlinkContract = new ethers.Contract("0x7273ebbB21F8D8AcF2bC12E71a08937712E9E40c", chainlinkABI, signer)
                const relayLinkTransaction = {
                    from: env.RELAYER_ADDRESS,
                    to: toAddress,
                    value: 0,
                    gasPrice: 7000000000, // 7 gwei
                    nonce: await provider.getTransactionCount(env.RELAYER_ADDRESS),
                    chainId: 534351,
                    data: chainlinkContract.interface.encodeFunctionData("transfer", [toAddress, amount.toString()])
                }

                const relayLinkSignedTransaction = await signer.populateTransaction(relayLinkTransaction);
                const relayLinkSignedTransactionResponse = await signer.sendTransaction(relayLinkSignedTransaction);
                let txReceipt = await relayLinkSignedTransactionResponse.wait()
                console.log(relayLinkSignedTransactionResponse)
                if (txReceipt.status == 1) {
                    try {
                        const feedback = `/sent ${amount} ${asset} ${toAddress} ${relayLinkSignedTransactionResponse.hash}`
                        const group = new Group(env.GROUP_ID)
                        let signal

                        try {
                            const resp = await fetch(`${env.HELIA_NODE_URL  }/upload-data?message=${  feedback}`, {
                                method: "GET",
                                headers: {
                                    "Content-Type": "application/json",
                                    "Access-Control-Allow-Origin": "*"
                                }
                            })
                            const output = await resp.json()
                            signal = BigNumber.from(`0x${output.message}`).toString()
                        } catch(e) {
                            console.log(e)
                            signal = BigNumber.from(utils.formatBytes32String(feedback)).toString()
                        }

                        group.addMembers(_users)
                        // counter += 1;
                        const random_external_nullifier = random(128);
                        const { proof, merkleTreeRoot, nullifierHash, externalNullifier } = await generateProof(
                            botIdentity,
                            group,
                            random_external_nullifier,
                            signal
                        )

                        const response = await fetch("api/feedback", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                feedback: signal,
                                merkleTreeRoot,
                                nullifierHash,
                                externalNullifier,
                                proof
                            })
                        })


                        if (response.status === 200) {
                            feedbackInputs.push(feedback)
                        }
                    } catch (error) {
                        console.error(error)
                    }
                }
            }



        })
        console.log(unfulfilledBotRequests)
        setFeedback(feedbackInputs)
    }, [])

    const addFeedback = useCallback(
        (feedback: string) => {
            setFeedback([..._feedback, feedback])
        },
        [_feedback]
    )

    return {
        _users,
        _feedback,
        refreshUsers,
        addUser,
        refreshFeedback,
        addFeedback
    }
}
