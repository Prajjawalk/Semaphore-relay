import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"
import { generateProof } from "@semaphore-protocol/proof"
import { BigNumber, utils } from "ethers"
import getNextConfig from "next/config"
import { useRouter } from "next/router"
import random from 'random-bigint'
import { useCallback, useContext, useEffect, useState } from "react"
import Feedback from "../../contract-artifacts/Feedback.json"
import Stepper from "../components/Stepper"
import LogsContext from "../context/LogsContext"
import SemaphoreContext from "../context/SemaphoreContext"


const { publicRuntimeConfig: env } = getNextConfig()

// let counter = 0
const userProof1 = "1eb53d11555e9b6e5e30170270c5f3dc2f2397af862e7e88f2ccfbcdf54f866a2fa8eb0754ef77c6345b3fd9c8cb96c9fea6803970251d0245c690cf53222071194f9ed042a292a546cb3883cf2a1837f9c38c5217aef397154a4ebc12d8d62017edbf6fd6e51fffca231b8c3cade71251360c297375c87eac1fd5ee6481d05f0b5939b95b38557709658c4ea5b9ea929d06f889fe9463c086d5281771d6af5523e20418c0b19df064a7bc59640a9b658a93535901aa2badbd33e00092b91a5b001d6e1198b4f62a0e587539de522459745377f10a9e1d76b4956707e43d68801562f8ce2676db14efaf45a582c82f45aa1171da218e83452e957aac874b20771c00f6073d328eaa5a436d3a4fda1fb943402aae65af1bd8260a3305f27ce6df088bbf35239da5462b8eb1d9343d1fc3fbd1270e1d3d2e4931f97091884b78da2b3ef3259246dabb7b44e33d91e9bd6b733534dcc66ce2199e033fe67e7a90c20a13f0e5a9d7c0f6b3679f3d0fcd01a23ef8069a391bed1da5657818ab82311b2c54fac665ceb644a6f931d57497c4eaa6d9a407d66c24b63d7cbca1f451406a2a70b789ed1ad3fd993eb3ee29208c7add4b115ab78d30e05df8df601bc271112551daa78f11050c20d454bd8111fb347b38b7b2125504abacc04fc7628369e81fb7d4dcd5bde35163f7d804b0182fb0d61dd77d175c5966a1a2b2336a70f0992b41adfa52f03eeee5cd7cb184bfc4f374ca4b77c49d0ee54cf8579bed687775007b8eb9c60b15ca64ef03d284183d9a5a14ca87fd082ca555a528264ac2d17c0999470507b3f0ae7b489b6e45f63dbc17625d1398caa3f9066d1a95d91671062b419409e860e3898f13bdb1fdadab34099955fe29028c41d2b9243df8fba1322a6511880b647a3fa58e38d9181f3dc3deb621f55283a56960d8a3b63def3d0a2fd2acf84ece29caa5795faf16e0a40663611d17200e497f678ea74f18b44db012990b62c1637c2ca09a920335596ea1399787fffdc5f49d002cec939dbe62132cbb6ad30d4d5b569d83fff2b5013b22a6bf9ae96da51192c3270f265925e4182c41037d22fd0d859ba7adf8a72dd1ee81ac38e7cb1ca227033bc0c02669e5001727bb0aa32d3b8d3c44a8c000d69b9e62e5d25010c199d6fc1d5f82f6e83819250353a069270a4596602528368b28744f18d68cc7e8fc5f98aaa1eeab56f82a2e2df0d9d8431bd655e8e091a0f4b9847780eca815ecda2e436989a7c33a0d5e0cbf52d5297f09192286d5c5bec49702948283070a9304ec81c3757864a8fa1f2f5cb035b5686711d025c0e09bc29ff506969352febea98347c54f7986065bd21a3f5aa4b16fd8b9c6c5b900bd013b060f59adf7a738847cb3efb89b99ce71301abce19dae675fbbae73123ddd42c20710206b331bac5f5368acef6a66bfa6d62aa4ad456214e5536b8fa0b7ee1d3c18d94c1afeca5b7a1557ceddd2e27e1f7420e44b1ab5592e1bdc68990744900e8574a3e696e93aafa5e538d4ba2f7eab6506dd54195d29e39b916afe0adc082c7b8079a5217d5ed15e8e46d0506d0ffc991fa07c0365412d0f5988e6e07f32e87d98fd9d8546d80145b01ea1a18b1db908257cc53d9f4e1feb5de9c55a73cdebf560f2ba4967641f95488cd5581384d5c115bc55e4c4c67661bb0b3c870d6cfccd47d48d422d6f9d4bbd55ce6280d06b0b02a4ae595a1bca92efafeb616394f19e3df18b0cdff0b5a1d0a5949d79cb219a03e0f81ef2bee53381a2813303deebe6cb07977c7709fd1daee50a7c278b01fe2597ed85030c3e1d29025b9322f39fdd35798e2fcb01c81c4d8bb220c807d75525ab886f221f6d743ce8132feb5333484c31d5b6e58abb3c68dfe9a1684710df031980d7335b0664f6be3102c89a28290512d4120986ca51fe10cb739a7dc8210d195ca3ee35a04fd7a2d749dc4f1464b56d4c5b075ae8bd77c29dcb5a83eb6818132aadfc3598095e00eb44068b4eb52160028c39c3d74fbc870977a0d6de6211cf56345e6440c9dff822b0f7cad22d67a6d0492ab92892233fac6fe6e5c9cf2126032d4ce5623ba025300d70f7d956317d3b0b33c19aed86294951b117302e0e01d6f368ecec102b59a86be53efca8bffdd3744b11a050cab8617f56adeb510b35a0177db2dbbbd9092bd95672bd14be1d7661aad4e7df9e874a17835ab3621289e7697be60f13f8ea09609681e39d876c5ae1d3eb2529d62ada7a3e88fc9f0999b911e357de3a9c4be12c35ec61a49cc2c0ccc28cf8ebde50be50ad2cca110b7fe3c62bdc65eaaf46d145e1e172726a1de6d3bcc2a78da18a8ef84b3bf8e7109f75b032b8c3fb8b7503a6c6245f067d4909291a4a192b54756e1841cb64e322530b39f8f24bb299b4571fc8b436f011773cb05021015dcc6000d61632e2920ad9ebcfc96c0e134fce655d7f1dffa5921cbdf5046bf8ff9bd1b638b8dee8cd02fe581a21faaf6a701bb063814c53cf141a07defab086cf622fa042d9c3a8c3012d682f19c97d9ceebbb391153ad3d5cde689b8850d5bb7b9ed429ce5dc554620e76e0e867ccf296c47a0807bb7985784ffef1e13a8f7aeac9d2f7eca5461f40046ae5e2f0fdc3b682273f646ef4314e8e2e0a64d63e4c9e2d8a91ac453a38e00b1a231717ac0e0d6343c051ad2ffe362bfbc85f50cc337f9cc3025448dff560607cd72a9271b3cab2ac73ede814ec1faab6f0282264fedad782ba1419dc28b119cd2f340f6444d300002d4e4dc758359b5aacafb8f7a2bec1ee4287dd2421b1bf97b4482ece6c791c84529cef95916a6163306398f4c2ae0f9a094912bfaab289ab6113d3721a2b00572fa07ea324ea45d60bf1aeed46ca17540c0d4c957b31d62f1cd85144c8a459a5a8c26d12f3f580c6dd0a30440f43ba8fb8d2731c92e055064adec86b94e3628b746c53364361ff1fbbc715c400841832fdf27c1e2bd1a69c5383f397502e8d63994eff45d4fce5575a63c561f8bba3e04d8147eada2" // user proof
const root1 = ["0x0000000000000000000000000000000000000000000000000000000000000027", "0x00000000000000000000000000000000000000000000000000000000000000b2", "0x0000000000000000000000000000000000000000000000000000000000000012", "0x0000000000000000000000000000000000000000000000000000000000000032", "0x000000000000000000000000000000000000000000000000000000000000007f", "0x00000000000000000000000000000000000000000000000000000000000000f0", "0x0000000000000000000000000000000000000000000000000000000000000054", "0x00000000000000000000000000000000000000000000000000000000000000a8", "0x00000000000000000000000000000000000000000000000000000000000000ce", "0x0000000000000000000000000000000000000000000000000000000000000004", "0x0000000000000000000000000000000000000000000000000000000000000072", "0x00000000000000000000000000000000000000000000000000000000000000b8", "0x00000000000000000000000000000000000000000000000000000000000000d1", "0x0000000000000000000000000000000000000000000000000000000000000049", "0x0000000000000000000000000000000000000000000000000000000000000007", "0x0000000000000000000000000000000000000000000000000000000000000046", "0x00000000000000000000000000000000000000000000000000000000000000d5", "0x00000000000000000000000000000000000000000000000000000000000000ce", "0x00000000000000000000000000000000000000000000000000000000000000f4", "0x0000000000000000000000000000000000000000000000000000000000000079", "0x0000000000000000000000000000000000000000000000000000000000000079", "0x0000000000000000000000000000000000000000000000000000000000000006", "0x0000000000000000000000000000000000000000000000000000000000000083", "0x0000000000000000000000000000000000000000000000000000000000000026", "0x0000000000000000000000000000000000000000000000000000000000000079", "0x0000000000000000000000000000000000000000000000000000000000000054", "0x000000000000000000000000000000000000000000000000000000000000006f", "0x00000000000000000000000000000000000000000000000000000000000000d9", "0x00000000000000000000000000000000000000000000000000000000000000f0", "0x000000000000000000000000000000000000000000000000000000000000003a", "0x0000000000000000000000000000000000000000000000000000000000000026", "0x0000000000000000000000000000000000000000000000000000000000000072"]
const  spend_limit1 = "0x000000000000000000000000000000000000000000000000000000000000003c"

interface Proof {
    proof: string,
    root: string[],
    spendLimit: string
}

export default function ProofsPage() {
    const router = useRouter()
    const { setLogs } = useContext(LogsContext)
    const { _users, _feedback, refreshFeedback, addFeedback } = useContext(SemaphoreContext)
    const [_loading, setLoading] = useState(false)
    const [_identity, setIdentity] = useState<Identity>()
    const [askRelay, setAskRelay] = useState(false)
    const [ask, setAsk] = useState(false)
    // const [userProof, setUserProof] = useState<Proof>()

    useEffect(() => {
        const identityString = localStorage.getItem("identity")

        if (!identityString) {
            router.push("/")
            return
        }

        setIdentity(new Identity(identityString))
    }, [])

    useEffect(() => {
        if (_feedback.length > 0) {
            setLogs(`${_feedback.length} feedback retrieved from the group 🤙🏽`)
        }
    }, [_feedback])

    const sendFeedback = useCallback(async () => {
        if (!_identity) {
            return
        }

        const feedback = prompt("Please enter your feedback:")

        if (feedback && _users) {
            setLoading(true)

            setLogs(`Posting your anonymous feedback...`)

            try {

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
                    _identity,
                    group,
                    random_external_nullifier,
                    signal
                )

                let response: any

                if (env.OPENZEPPELIN_AUTOTASK_WEBHOOK) {
                    response = await fetch(env.OPENZEPPELIN_AUTOTASK_WEBHOOK, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            abi: Feedback.abi,
                            address: env.FEEDBACK_CONTRACT_ADDRESS,
                            functionName: "sendFeedback",
                            functionParameters: [signal, merkleTreeRoot, nullifierHash, proof]
                        })
                    })
                } else {
                    response = await fetch("api/feedback", {
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
                }

                if (response.status === 200) {
                    addFeedback(feedback)

                    setLogs(`Your feedback was posted 🎉`)
                } else {
                    setLogs("Some error occurred, please try again!")
                }
            } catch (error) {
                console.error(error)

                setLogs("Some error occurred, please try again!")
            } finally {
                setLoading(false)
            }
        }
    }, [_identity])

    return (
        <>
            <h2>Proofs</h2>

            <p>
                Semaphore members can anonymously{" "}
                <a
                    href="https://semaphore.pse.dev/docs/guides/proofs"
                    target="_blank"
                    rel="noreferrer noopener nofollow"
                >
                    prove
                </a>{" "}
                that they are part of a group and that they are generating their own signals. Signals could be anonymous
                votes, leaks, reviews, or feedback.
            </p>

            <div className="divider"></div>

            <div className="text-top">
                <h3>Feedback signals ({_feedback.length})</h3>
                <button className="button-link" onClick={refreshFeedback}>
                    Refresh
                </button>
            </div>

            <div>
                <button className="button" onClick={sendFeedback} disabled={_loading}>
                    <span>Send Feedback</span>
                    {_loading && <div className="loader"></div>}
                </button>
            </div>

            <div>
                <button className="button" onClick={() => setAskRelay(true)}>
                    <span>Ask Relay</span>
                </button>
            </div>

            {askRelay?<div>
                <div className="divider"></div>
                <div>
                    User Proof:
                </div>
                <div>
                    <input className="box box-text"/>
                </div>
                <div>
                    User merkle root:
                </div>
                <input className="box box-text"/>
                <div>
                    User spend limit:
                </div>
                <input className="box box-text"/>
                <div>
                    To address:
                </div>
                <input className="box box-text"/>
                <div>
                    Asset: (only ETH and LINK are currently supported)
                </div>
                <input className="box box-text"/>

                <button className="button" onClick={() => setAsk(true)}>
                    Generate ask text
                </button>
                {ask?<div>
                    <div  className="proof-box proof-box-text">
                        /bot send 1 LINK 0x7B4fd15B495b5700aF2C193f52D830e51C049366 {userProof1}  {userProof1} ["0x0000000000000000000000000000000000000000000000000000000000000027","0x00000000000000000000000000000000000000000000000000000000000000b2","0x0000000000000000000000000000000000000000000000000000000000000012","0x0000000000000000000000000000000000000000000000000000000000000032","0x000000000000000000000000000000000000000000000000000000000000007f","0x00000000000000000000000000000000000000000000000000000000000000f0","0x0000000000000000000000000000000000000000000000000000000000000054","0x00000000000000000000000000000000000000000000000000000000000000a8","0x00000000000000000000000000000000000000000000000000000000000000ce","0x0000000000000000000000000000000000000000000000000000000000000004","0x0000000000000000000000000000000000000000000000000000000000000072","0x00000000000000000000000000000000000000000000000000000000000000b8","0x00000000000000000000000000000000000000000000000000000000000000d1","0x0000000000000000000000000000000000000000000000000000000000000049","0x0000000000000000000000000000000000000000000000000000000000000007","0x0000000000000000000000000000000000000000000000000000000000000046","0x00000000000000000000000000000000000000000000000000000000000000d5","0x00000000000000000000000000000000000000000000000000000000000000ce","0x00000000000000000000000000000000000000000000000000000000000000f4","0x0000000000000000000000000000000000000000000000000000000000000079","0x0000000000000000000000000000000000000000000000000000000000000079","0x0000000000000000000000000000000000000000000000000000000000000006","0x0000000000000000000000000000000000000000000000000000000000000083","0x0000000000000000000000000000000000000000000000000000000000000026","0x0000000000000000000000000000000000000000000000000000000000000079","0x0000000000000000000000000000000000000000000000000000000000000054","0x000000000000000000000000000000000000000000000000000000000000006f","0x00000000000000000000000000000000000000000000000000000000000000d9","0x00000000000000000000000000000000000000000000000000000000000000f0","0x000000000000000000000000000000000000000000000000000000000000003a","0x0000000000000000000000000000000000000000000000000000000000000026","0x0000000000000000000000000000000000000000000000000000000000000072"] "0x000000000000000000000000000000000000000000000000000000000000003c"
                    </div>
                    <div>
                        Copy this text and send to chat!
                    </div>
                </div>:<div></div>}
                <div className="divider"></div>
            </div>:<div></div>}

            {_feedback.length > 0 && (
                <div>
                    {_feedback.map((f, i) => (
                        <div key={i}>
                            <p className="box box-text">{f}</p>
                        </div>
                    ))}
                </div>
            )}

            <div className="divider"></div>

            <Stepper step={4} onPrevClick={() => router.push("/fund")} onNextClick={_identity ? () => router.push("/depositors") : undefined} />
        </>
    )
}
