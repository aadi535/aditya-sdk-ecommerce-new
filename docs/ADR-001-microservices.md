# ADR-001: Use of Microservices Architecture

## Status
Accepted

## Context
The project required building an e-commerce system with multiple independent services.

## Decision
The system was implemented using a microservices architecture consisting of:

- Users Service (Python + FastAPI)
- Orders Service (Java + Spring Boot)
- Products Service (PHP + Slim Framework)

## Reason
Using microservices allows each service to handle a specific responsibility:

- Authentication and users
- Order management
- Product catalog

This improves modularity and makes the system easier to extend.

## Consequences
Benefits:
- Clear separation of responsibilities
- Independent services
- Easy scaling and maintenance