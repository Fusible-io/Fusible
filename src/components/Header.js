import React from 'react';
import { Badge,Image,Nav,Navbar ,Button,ButtonGroup} from 'react-bootstrap';

import logo from '../assets/fuse.svg';
import wallet from '../assets/ETH.svg';
import '../bootstrap.min.css';

export const Header = (props) => (
 
   <header >
<Navbar  fixed='top'  collapseOnSelect expand="lg" variant="light" >
  <Navbar.Brand  clasName="text-white" href="/">

  <p className="text-white h2">    
        <img width="40" height="30" alt="fusible-logo"  src={logo}/>
        fusible.io
  </p>
      
  </Navbar.Brand>
  <Nav>
      <Nav.Link>
      {props.web3State?
      <ButtonGroup  >
      <Button className="text-white" variant="outline-light">
        <Image  src={wallet} />
      </Button>
            <Button className="text-white" variant="outline-light" className="text-truncate text-white" onClick={(e)=> window.open('https://rinkeby.etherscan.io/address/'+props.web3State.address, '_blank')} >
              {props.web3State.address.substring(0,5)}</Button>
            
            <Button className="text-white" variant="outline-light" onClick={props.logout} >logout</Button>

            </ButtonGroup>
      :<Button variant="outline-light" onClick={props.onConnect}>
      Connect Wallet</Button>
      }
      
    </Nav.Link>

    </Nav>

</Navbar>
</header>

 
);