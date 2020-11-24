import React from 'react';
import { Badge,Image,Nav,Container ,Button,ButtonGroup,Col,Row} from 'react-bootstrap';

import logo from '../assets/fuse.svg';
import wallet from '../assets/ETH.svg';
import '../bootstrap.min.css';

export const Home = (props) => (
    <>
    
    <Row>

    <Col  >
    <Container>
    <Image className="jam-head" src={logo} alt="jam-logo" onClick={props.mint}/>

    <p className='mt-2 mb-10 justify-content-md-center'>Liquify NFTs into FusERC20<span role="img" aria-label="fruit"></span> </p>
    </Container>
    </Col>
    <Col >
    <Button variant="outline-primary" size="lg" active block>
        <a  className="link-node" href="/demo">DEMO</a>
    </Button>
    </Col>
    
    

    </Row>
   
    </>
 
);