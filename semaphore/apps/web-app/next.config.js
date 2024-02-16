/** @type {import('next').NextConfig} */

const fs = require("fs")
const withPWA = require("next-pwa")

if (!fs.existsSync("./.env")) {
    // eslint-disable-next-line global-require
    require("dotenv").config({ path: "../../.env" })
}

const nextConfig = withPWA({
    dest: "public",
    disable: process.env.NODE_ENV === "development"
})({
    eslint: {
        ignoreDuringBuilds: true
    },
    reactStrictMode: true,
    swcMinify: true,
    env: {
        DEFAULT_NETWORK: process.env.DEFAULT_NETWORK,
        INFURA_API_KEY: process.env.INFURA_API_KEY,
        ETHEREUM_PRIVATE_KEY: process.env.ETHEREUM_PRIVATE_KEY,
        FEEDBACK_CONTRACT_ADDRESS: process.env.FEEDBACK_CONTRACT_ADDRESS,
        SEMAPHORE_CONTRACT_ADDRESS: process.env.SEMAPHORE_CONTRACT_ADDRESS,
        HELIA_NODE_URL: process.env.HELIA_NODE_URL,
        RELAY_BOT_IRONFISH_ADDRESS: process.env.RELAY_BOT_IRONFISH_ADDRESS,
        RELAYER_PRIVATE_KEY: process.env.RELAYER_PRIVATE_KEY,
        RELAYER_ADDRESS: process.env.RELAYER_ADDRESS,
        RPC_URL: process.env.RPC_URL
    },
    publicRuntimeConfig: {
        DEFAULT_NETWORK: process.env.DEFAULT_NETWORK,
        FEEDBACK_CONTRACT_ADDRESS: process.env.FEEDBACK_CONTRACT_ADDRESS,
        SEMAPHORE_CONTRACT_ADDRESS: process.env.SEMAPHORE_CONTRACT_ADDRESS,
        OPENZEPPELIN_AUTOTASK_WEBHOOK: process.env.OPENZEPPELIN_AUTOTASK_WEBHOOK,
        GROUP_ID: process.env.GROUP_ID,
        HELIA_NODE_URL: process.env.HELIA_NODE_URL,
        RELAY_BOT_IRONFISH_ADDRESS: process.env.RELAY_BOT_IRONFISH_ADDRESS,
        RELAYER_PRIVATE_KEY: process.env.RELAYER_PRIVATE_KEY,
        RELAYER_ADDRESS: process.env.RELAYER_ADDRESS,
        RPC_URL: process.env.RPC_URL
    },
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                fs: "empty"
            }
        }

        return config
    }
})

module.exports = nextConfig
