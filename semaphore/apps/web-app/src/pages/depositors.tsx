import { Identity } from "@semaphore-protocol/identity"
import getNextConfig from "next/config"
import { useRouter } from "next/router"
import { useCallback, useContext, useEffect, useState } from "react"
import {ethers} from "ethers"
import Feedback from "../../contract-artifacts/Feedback.json"
import Stepper from "../components/Stepper"
import LogsContext from "../context/LogsContext"
import SemaphoreContext from "../context/SemaphoreContext"

const { publicRuntimeConfig: env } = getNextConfig()

export default function FundsPage() {
    const router = useRouter()
    const { setLogs } = useContext(LogsContext)
    const [_identity, setIdentity] = useState<Identity>()
    const [connected, setConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState("");

    // Function to connect/disconnect the wallet
    async function connectWallet() {
        if (!connected) {
            // Connect the wallet using ethers.js
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = await provider.getSigner();
            const _walletAddress = await signer.getAddress();
            setConnected(true);
            setWalletAddress(_walletAddress);
        } else {
            // Disconnect the wallet
            // window.ethereum.selectedAddress = null;
            setConnected(false);
            setWalletAddress("");
        }
    }


    useEffect(() => {
        const identityString = localStorage.getItem("identity")

        if (!identityString) {
            router.push("/")
            return
        }

        setIdentity(new Identity(identityString))
    }, [])

    useEffect(() => {
        setLogs(`Deposit Assets to get wIRON`)
        // eslint-disable-next-line radix
    })

    return (
        <>
            <h2>Deposit Assets and get wIRON</h2>

            <p>
                The depositors can deposit assets in vault in return for wIron in scroll network. This will ensure positive asset supply in vault for relay transfers and depositors can get more yield in terms of wIron.
            </p>

            <div>
                WIRON address: 0x3dE166740d64d522AbFDa77D9d878dfedfDEEEDE
            </div>

            <div className="divider"></div>
            <label htmlFor="assets">Choose an asset:</label>

            <select name="assets" id="assets">
                <option value="ETH">ETH</option>
                <option value="USDC">USDC</option>
            </select>

            <button className="button" onClick={connectWallet}>
                {connected ? "Disconnect Wallet" : "Connect Wallet"}
            </button>

            {connected?
            <div>
                <input className="box" placeholder="Enter Amount"></input>
                <button className="button">
                    Deposit Asset
                </button>
            </div>:<div></div>}
            <div className="divider"></div>

            <Stepper
                step={5}
                onPrevClick={() => router.push("/proofs")}
            />
        </>
    )
}
