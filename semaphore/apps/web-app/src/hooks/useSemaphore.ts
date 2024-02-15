import { SemaphoreEthers } from "@semaphore-protocol/data"
import { BigNumber, utils } from "ethers"
import getNextConfig from "next/config"
import { useCallback, useState } from "react"
import { SemaphoreContextType } from "../context/SemaphoreContext"

const { publicRuntimeConfig: env } = getNextConfig()

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
        botRequests.map((i) => {
            const infoArr = i.split(" ")
            infoArr.map((i: any) => console.log(i))
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
