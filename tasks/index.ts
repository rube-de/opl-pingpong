import { task, subtask } from "hardhat/config";

task('deploy-pingpong')
  .addOptionalParam("hostNetwork", "Network to deploy the Host contract on", "bsc-testnet")
  .addOptionalParam("hostMainChain", "Main chain of the host network", "bsc")
  .addOptionalParam("enclaveNetwork", "Network to deploy the Enclave contract on", "sapphire-testnet")
  .setAction(async ({hostNetwork, hostMainChain, enclaveNetwork}, hre) => {
    // Ensure contracts are compiled before proceeding
    await hre.run('compile');
    console.log("Start deployment of PingPong...");

    console.log("===========================");
    const calculatedPongAddr = await hre.run('nextAddress', { onNetwork: enclaveNetwork });
    console.log(`Calculated Pong address: ${calculatedPongAddr}`);
    console.log("===========================");
    const pingAddr = await hre.run("deployPing", {
        hostNetwork,
        calculatedPongAddr
    });
    console.log("===========================");
    const pongAddr = await hre.run("deployPong", {
        enclaveNetwork,
        pingAddr,
        hostMainChain
    });
  });

subtask("deployPing")
  .addParam("hostNetwork")
  .addParam("calculatedPongAddr")
  .setAction(async ({hostNetwork, calculatedPongAddr}, hre) => {
    await hre.switchNetwork(hostNetwork);
    console.log(`Deploying on ${hre.network.name}...`);
    const Ping = await hre.ethers.getContractFactory("Ping");    
    const ping = await Ping.deploy(calculatedPongAddr);
    const pingAddr = await ping.waitForDeployment();
    console.log(`Ping deployed at: ${pingAddr.target}`);
    return pingAddr.target;
})

subtask("deployPong")
  .addParam("enclaveNetwork")
  .addParam("pingAddr")
  .addParam("hostMainChain")
  .setAction(async ({enclaveNetwork, pingAddr, hostMainChain}, hre) => {
    await hre.switchNetwork(enclaveNetwork);
    console.log(`Deploying on ${hre.network.name}...`);
    const Pong = await hre.ethers.getContractFactory("Pong");
    const pong = await Pong.deploy(pingAddr, hre.ethers.encodeBytes32String(hostMainChain));
    const pongAddr = await pong.waitForDeployment();
    console.log(`Pong deployed at: ${pongAddr.target}`);
    return pongAddr.target;
})

subtask("nextAddress")
  .addParam("onNetwork")
  .setAction(async ({onNetwork}, hre) => {
    const ethers = hre.ethers;
    await hre.switchNetwork(onNetwork);
    console.log(`Calculating next address on ${hre.network.name}...`);
    const signer = await hre.ethers.provider.getSigner();
    const signerAddr = await signer.getAddress();
    const nonce = await ethers.provider.getTransactionCount(signerAddr);
    return ethers.getCreateAddress({ from: signerAddr, nonce });
  })
