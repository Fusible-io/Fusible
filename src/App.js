import React, { useCallback, useEffect, useState } from "react";
import { Switch, Route } from "wouter";
import './App.css';
import { Header } from './components/Header';
import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { Home } from "./components/Home";
import { Row,Col,Jumbotron,InputGroup,FormControl,Button} from "react-bootstrap";
import { DragDropContainer, DropTarget } from 'react-drag-drop-container';
import StepWizard from 'react-step-wizard';
import {abiFuse,abiNFT,WETH,contractFuse,contractNFT,abiWETH} from './components/Constants';

// Chosen wallet provider given by the dialog window


function App() {
  const [state, setState] = useState()
  const [_step,setStep] = useState(0)
  const [_fusERCAddr,setfusERCAddr] = useState('')
  const [fuseContract,setFuse]= useState()
  const [nftContract,setNFT]= useState()
  const [NFTConAddr, setNFTAddr] = useState('')
  const [TknID,setTknId] = useState(0)
  const  [_weth,setWETH] = useState(0)
  const [fuseName,setFuseName]=useState('')
  const [fuseSupply,setFuseSupply]=useState(0)
  const [fusAddr,setfusAddr]=useState('')


  
  async function init () {
    
    console.log('starting up');
    //console.log("WalletConnectProvider is", WalletConnectProvider);
    //console.log("Fortmatic is", Fortmatic);
    
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider, // required
        options: {
          infuraId: "5b6b8cd2731e4a26a526dc505322712d" // required
        }
      },
      metamask:{}
};
 
   const web3Modal = new Web3Modal({
      //network: "mainnet", // optional
      cacheProvider: false, // optional
      //disableInjectedProvider: false,
      providerOptions,
      theme:'dark'// required
    });
 
    const provider = await web3Modal.connect();
    console.log(provider)

    
    const web3 = new Web3(provider);;
    //console.log(modal)

    
    const accounts = await web3.eth.getAccounts();
    const address = accounts[0];
    const networkId = await web3.eth.net.getId();
    if(networkId !== 4) {
      alert("Switch to Rinkeby network");
      web3Modal.clearCachedProvider()
      web3Modal.resetState()
      return;
    }
    const balance = await web3.eth.getBalance(address);
    console.log(address)
    console.log(balance)
  //  console.log(networkId)
    setState({
      web3,
      provider,
      connected: true,
      address,
      web3Modal,
      networkId
    });
    await subscribeProvider(provider)
  }
 
  const subscribeProvider = async (provider) => {
    if (!provider.on) {
      return;
    }
    // provider.on("close", () => this.resetApp());
    provider.on("accountsChanged", async (accounts) => {
      setState({ address: accounts[0] });
    });
    provider.on("chainChanged", async (chainId) => {
      const { web3 } = this.state;
      const networkId = await web3.eth.net.getId();
      setState({ chainId, networkId });
    });
    provider.on("networkChanged", async (networkId) => {
      const { web3 } = this.state;
      const chainId = await web3.eth.chainId();
      await this.setState({ chainId, networkId });
    });
    provider.on("open", () => {
      console.log("open");
    });
    
    // Subscribe to session disconnection/close
    provider.on("close", (code, reason) => {
      console.log(code, reason);
    });

  };
  const onConnect = async () => {
    
    try {
      await init();
      
  } catch (err) {
      console.log(err)
      alert('failed to connect')
  }

    /*
    const provider = await state.web3Modal.connect();
    await subscribeProvider(provider);
    const web3 = new Web3(provider)
    const accounts = await web3.eth.getAccounts();
    const address = accounts[0];
    const networkId = await web3.eth.net.getId();
    setState({
      web3,
      provider,
      connected: true,
      address,
      networkId
    });*/
  };
  const description = 'dear oh dear!';
  const logout = async () => {
   
    setTimeout(() => {
      window.location.reload();
    }, 1);
  };

  let contractAddr = "0x81c597C530BF2EeCe4A3EF955Fe89D738ac6Fe52";
  var conExpDate;
  const onCont = async ()=>{
    const provider = await state.web3Modal.connect();
    const web3 = new Web3(provider)
   //window.contract = new web3.eth.Contract(abi,contractAddr) 
  //window.contract = new Accounts.Contract(contractAddr, abi, provider);
    console.log(window.contract);
  }
  /* Step 1 Approve NFT token to be deposited to contract */
  const approveNFTDeposit = async() =>{
    const web3 = new Web3(state.provider)
    window.contract = new web3.eth.Contract(abiNFT,contractNFT) 
   //window.contract = new Accounts.Contract(contractAddr, abi, provider);
     console.log(window.contract);
     //contract.method.approve

  }
  const depositNFT = async()=>{
    const web3 = new Web3(state.provider)
    let conNFT = new web3.eth.Contract(abiNFT,contractNFT) 
    setNFT(conNFT);
    let conFuse = new web3.eth.Contract(abiFuse,contractFuse) 
    setFuse(conFuse);
   //window.contract = new Accounts.Contract(contractAddr, abi, provider);
     console.log(window.contract);
     conNFT.methods.approve(contractFuse,TknID).send({from: state.address})
     .on('transactionHash', function(hash){
         
     })
     .on('receipt', function(receipt){
         
     })
     .on('confirmation', function(confirmationNumber, receipt){
      //console.log(confirmationNumber);
      if(confirmationNumber == 1){
        conFuse.methods.newContract(contractFuse,NFTConAddr,TknID).send({from: state.address})
        .on('transactionHash', function(hash){
            
        })
        .on('receipt', function(receipt){
            
        })
        .on('confirmation', function(confirmationNumber, receipt){
          //  console.log(confirmationNumber);
        })
        .on('error', console.error);
        
      }
     })
     .on('error', console.error);


     
  }

  const depositWETH = async()=>{

    const weiValue = Web3.utils.toWei(_weth, 'ether')
    
    let conWETH = new state.web3.eth.Contract(abiWETH,WETH) 
    let conFuse = new state.web3.eth.Contract(abiFuse,contractFuse) 
    conWETH.methods.approve(contractFuse,Web3.utils.toWei('3', 'ether')).send({from: state.address})
    .on('transactionHash', function(hash){
        
    })
    .on('receipt', function(receipt){
        
    })
    .on('confirmation', function(confirmationNumber, receipt){
     //console.log(confirmationNumber);
     if(confirmationNumber == 1){
        conFuse.methods.createFUSERC20(weiValue).send({from: state.address})
        .on('transactionHash', function(hash){
            
        })
        .on('receipt', function(receipt){
            
        })
        .on('confirmation', function(confirmationNumber, receipt){
          //  console.log(confirmationNumber);
        })
        .on('error', console.error);
        
      }
    })
    .on('error', console.error);



  }
  const mintFuse = async()=>{
    //alert(typeof(fuseSupply))
    let conFuse = new state.web3.eth.Contract(abiFuse,contractFuse) 
    conFuse.methods.createER20(fuseName,'FUSE-V0',fuseSupply).send({from: state.address})
    .on('transactionHash', function(hash){
        
    })
    .on('receipt', function(receipt){
        
    })
    .on('confirmation', function(confirmationNumber, receipt){
      //  console.log(confirmationNumber);
    })
    .on('error', console.error);
  }
  const createLP = async()=>{

    let conFuse = new state.web3.eth.Contract(abiFuse,contractFuse) 
    conFuse.methods.approveContractForFUSERCRoute(fusAddr).send({from: state.address})
    .on('transactionHash', function(hash){
        
    })
    .on('receipt', function(receipt){
        
    })
    .on('confirmation', function(confirmationNumber, receipt){
      //  console.log(confirmationNumber);
      if(confirmationNumber == 1){
      conFuse.methods.approveContractForFUSERCRoute(WETH).send({from: state.address})
      .on('transactionHash', function(hash){
          
      })
      .on('receipt', function(receipt){
          
      })
      .on('confirmation', function(confirmationNumber, receipt){
        //  console.log(confirmationNumber);
        if(confirmationNumber == 1){
        conFuse.methods.createUNIPair(fusAddr,WETH).send({from: state.address})
      .on('transactionHash', function(hash){
          
      })
      .on('receipt', function(receipt){
          
      })
      .on('confirmation', function(confirmationNumber, receipt){
        //  console.log(confirmationNumber);
      })
      .on('error', console.error);
      
      }
      })
      .on('error', console.error);
      
      }
    })
    .on('error', console.error);



    

  }
  const nftFaucet = async()=>{
    let to = '0xDf473a3c06DA07556F3AF3F8FfA96AaeA99A26E2'
     window.conNFT = new state.web3.eth.Contract(abiNFT,contractNFT) 
     window.conNFT.methods.awardItem(to, "RND TEXT").send({from: state.address})
     window.conNFT.methods.awardItem(state.address, "RND TEXT").send({from: state.address})


  }
  
  return (
    <>
    <Header  web3State={state?state:false} onConnect={onConnect} logout={logout} />
    
    <div className="App">
    <div className="App-header">
       <Switch>
          <Route path="/">
            <Home mint={nftFaucet}></Home>
                   </Route>
          <Route path="/demo">
          {state?
          <>
      <Jumbotron>
    <Row>
      <Col></Col>
      <Col>
      <Row>
      <h5>Step 1: Deposit NFT</h5>

      <InputGroup className="mb-3" onChange={event => setNFTAddr(event.target.value)}>
        <FormControl
          placeholder="Enter ERC721/NFT Contract address"
          aria-label="Recipient's username"
          aria-describedby="basic-addon2"
        />
        <InputGroup.Append>
          
        </InputGroup.Append>
        </InputGroup>
        
        <InputGroup className="mb-3" onChange={event => setTknId(event.target.value)}>
        <FormControl
          placeholder="Enter your NFT Token Id"
          aria-label="Recipient's username"
          aria-describedby="basic-addon2"
        />
        <InputGroup.Append>
          
          <Button variant="primary" onClick={depositNFT}>Deposit NFT</Button>
        </InputGroup.Append>
        </InputGroup>
      </Row>

      <Row>
      <h5>Step 2:Deposit WETH</h5>

        
        <InputGroup className="mb-3" onChange={event => setWETH(event.target.value)}>
        <FormControl
          placeholder="Enter Amount of WETH to be deposited"
          aria-label="Recipient's username"
          aria-describedby="basic-addon2"
        />
        <InputGroup.Append>
          
          <Button variant="primary" onClick={depositWETH}>Deposit WETH</Button>
        </InputGroup.Append>
        </InputGroup>
      </Row>
      <Row>
      <h5>Step 3:Mint FusERC20 token</h5>

      <InputGroup className="mb-3" onChange={event => setFuseName(event.target.value)}>
    <InputGroup.Prepend>
      <InputGroup.Text>Name</InputGroup.Text>
      
    </InputGroup.Prepend>
    <FormControl
      placeholder="Enter Name for the ERC20 token"
      
    />
      <InputGroup className="mb-3" onChange={event => setFuseSupply(event.target.value)}>
    <InputGroup.Prepend>
      <InputGroup.Text>Supply</InputGroup.Text>

    </InputGroup.Prepend>
    <FormControl
      placeholder="Enter Supply for the ERC20 token"
    />
  </InputGroup>
  <Button variant="primary" onClick={mintFuse} block>MINT FusERC20</Button>
  </InputGroup>

      </Row>
      <Row>
      <h5>Step 4:Create LP pool</h5>

        
      <InputGroup className="mb-3" onChange={event => setfusAddr(event.target.value)}>
    <InputGroup.Prepend>
      <InputGroup.Text>FusERC20</InputGroup.Text>
      
    </InputGroup.Prepend>
    <FormControl
      placeholder="Enter Name for the FusERC20 address"
      
    />
      <InputGroup className="mb-3" >
    <InputGroup.Prepend>
      <InputGroup.Text>WETH Addr</InputGroup.Text>

    </InputGroup.Prepend>
    <FormControl 
      placeholder="Enter Supply for the WETH address"
      value={WETH}
    />
  </InputGroup>
  <Button variant="primary" onClick={createLP} block>CREATE UNI-LP</Button>
  </InputGroup>
      </Row>
  </Col>
  </Row>

      </Jumbotron>

          </>
          :
          'Please Connect to Metamask'}
          </Route>
     
        </Switch>
      </div>
      
      </div>
       </>
  );
}

export default App;
