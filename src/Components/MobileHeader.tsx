import React, { useState } from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import Verticalnavigation from "../Components/Verticalnavigation";
import "./MobileHeader.css";
import { useLocation } from "react-router-dom";

export default function MobileHeader() {
  const [expanded, setExpanded] = useState(false);
  const location = useLocation()
  let name = "";
  switch (location.pathname) {
    case "/admin/user-management":
      name = "User Management";
      break;
    case "/admin/user-reports":
      name = "User Management Reports";
      break;
    case "/admin/gst-users":
      name = "GST User Management"
      break;
    case "/admin/gst-reports":
      name = "GST User Reports";
      break;
    case "/admin/emergency":
      name = "Emergency Management";
      break;
    case "/admin/moniter-compaign":
      name = "AD Management";
      break;
    case "/admin/edit-profile":
      name = "Edit Profile";
      break;
    default:
      name = "Dashboard";
  }
  return (
    <Navbar
      expand="lg"
      className="d-block d-md-none custom-navbar navigation-conatainer"
      expanded={expanded} 
    >
      <Container fluid style={{padding:'10px'}}>
        <Navbar.Brand href="#" className="navbar-brand-medium text-white">
        {name}
        </Navbar.Brand>
        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          className="custom-navbar-toggler"
          style={{ filter: "invert(1)",background:'#0000003b'}}

          onClick={() => setExpanded(expanded ? false : true)}
        />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Verticalnavigation closeNav={() => setExpanded(false)} />
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
