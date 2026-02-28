import { useState } from 'react';
import { Card, Form, Row, Col, Button, Accordion } from 'react-bootstrap';

const SearchFilters = ({ onFilterChange, onReset }) => {
  const [filters, setFilters] = useState({
    city: '',
    state: '',
    property_type: '',
    min_price: '',
    max_price: '',
    bedrooms: '',
    bathrooms: '',
    sort_by: 'created_at',
    sort_order: 'desc'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const handleApplyFilters = () => {
    onFilterChange(filters);
  };

  const handleClearFilters = () => {
    const resetFilters = {
      city: '',
      state: '',
      property_type: '',
      min_price: '',
      max_price: '',
      bedrooms: '',
      bathrooms: '',
      sort_by: 'created_at',
      sort_order: 'desc'
    };
    setFilters(resetFilters);
    onReset(resetFilters);
  };

  return (
    <Card className="card-custom mb-4">
      <Card.Body>
        <Accordion defaultActiveKey="0">
          <Accordion.Item eventKey="0">
            <Accordion.Header>
              <i className="bi bi-funnel me-2"></i>
              <strong>Search Filters</strong>
            </Accordion.Header>
            <Accordion.Body>
              <Form onSubmit={(e) => e.preventDefault()}>
                {/* Location Filters */}
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold small">City</Form.Label>
                      <Form.Control
                        type="text"
                        name="city"
                        value={filters.city}
                        onChange={handleChange}
                        placeholder="e.g., New York"
                        className="form-control-custom"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold small">State</Form.Label>
                      <Form.Control
                        type="text"
                        name="state"
                        value={filters.state}
                        onChange={handleChange}
                        placeholder="e.g., NY"
                        className="form-control-custom"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Property Type */}
                <Row className="mb-3">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label className="fw-semibold small">Property Type</Form.Label>
                      <Form.Select
                        name="property_type"
                        value={filters.property_type}
                        onChange={handleChange}
                        className="form-control-custom"
                      >
                        <option value="">All Types</option>
                        <option value="apartment">Apartment</option>
                        <option value="house">House</option>
                        <option value="condo">Condo</option>
                        <option value="studio">Studio</option>
                        <option value="villa">Villa</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Price Range */}
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold small">Min Price ($)</Form.Label>
                      <Form.Control
                        type="number"
                        name="min_price"
                        value={filters.min_price}
                        onChange={handleChange}
                        placeholder="Min"
                        className="form-control-custom"
                        min="0"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold small">Max Price ($)</Form.Label>
                      <Form.Control
                        type="number"
                        name="max_price"
                        value={filters.max_price}
                        onChange={handleChange}
                        placeholder="Max"
                        className="form-control-custom"
                        min="0"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Bedrooms & Bathrooms */}
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold small">Min Bedrooms</Form.Label>
                      <Form.Select
                        name="bedrooms"
                        value={filters.bedrooms}
                        onChange={handleChange}
                        className="form-control-custom"
                      >
                        <option value="">Any</option>
                        <option value="1">1+</option>
                        <option value="2">2+</option>
                        <option value="3">3+</option>
                        <option value="4">4+</option>
                        <option value="5">5+</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold small">Min Bathrooms</Form.Label>
                      <Form.Select
                        name="bathrooms"
                        value={filters.bathrooms}
                        onChange={handleChange}
                        className="form-control-custom"
                      >
                        <option value="">Any</option>
                        <option value="1">1+</option>
                        <option value="2">2+</option>
                        <option value="3">3+</option>
                        <option value="4">4+</option>
                        <option value="5">5+</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Sort Options */}
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold small">Sort By</Form.Label>
                      <Form.Select
                        name="sort_by"
                        value={filters.sort_by}
                        onChange={handleChange}
                        className="form-control-custom"
                      >
                        <option value="created_at">Date Added</option>
                        <option value="rent_price">Price</option>
                        <option value="bedrooms">Bedrooms</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold small">Order</Form.Label>
                      <Form.Select
                        name="sort_order"
                        value={filters.sort_order}
                        onChange={handleChange}
                        className="form-control-custom"
                      >
                        <option value="desc">Descending</option>
                        <option value="asc">Ascending</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Actions */}
                <div className="d-flex gap-2 mt-4">
                  <Button
                    variant="primary"
                    onClick={handleApplyFilters}
                    className="flex-fill"
                  >
                    <i className="bi bi-search me-1"></i>
                    Apply Filters
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={handleClearFilters}
                    className="flex-fill"
                  >
                    <i className="bi bi-x-circle me-1"></i>
                    Clear Filters
                  </Button>
                </div>
              </Form>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </Card.Body>
    </Card>
  );
};

export default SearchFilters;
