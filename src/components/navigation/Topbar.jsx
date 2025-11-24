import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import useAuth from '../../hooks/useAuth';
import '../../styles/layouts.css';

const Topbar = ({ title }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const initials = user?.email?.[0]?.toUpperCase() ?? 'A';

  return (
    <Navbar bg="light" expand="lg" className="border-bottom topbar" style={{ margin: 0, top: 0 }}>
      <Container fluid className="px-4">
        <div>
          <Navbar.Brand className="topbar__title mb-0 fw-bold">{title}</Navbar.Brand>
        </div>

        <Nav className="ms-auto">
          <Nav.Item>
            <button
              type="button"
              className="topbar__avatar btn btn-light rounded-circle d-flex align-items-center justify-content-center"
              onClick={() => navigate('/profile')}
              aria-label="Open profile"
            >
              {initials}
            </button>
          </Nav.Item>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default Topbar;


