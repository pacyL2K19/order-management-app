# Order Processing System for E-commerce

## Table of Contents

1. [Introduction](#introduction)
2. [System Overview](#system-overview)
3. [Microservice 1 - Order Management Service](#microservice-1---order-management-service)
    1. [Responsibilities](#responsibilities)
    2. [Interactions](#interactions)
4. [Microservice 2 - Inventory Service](#microservice-2---inventory-service)
    1. [Responsibilities](#responsibilities-1)
    2. [Interactions](#interactions-1)
5. [System Workflow](#system-workflow)
6. [Use Cases](#use-cases)
    3. [Order Processing](#order-processing)
7. [API Documentation](#api-documentation)
8. [Deployment and Scalability](#deployment-and-scalability)
9. [API Documentation](#api-documentation)
    1. [Microservice 1 - Order Management Service](#microservice-1---order-management)
        1. [Endpoints](#endpoints)
    2. [Microservice 2 - Inventory Service](#microservice-2---inventory)
10. [Conclusion](#conclusion)

## Getting started

### Prerequisites

- Java 8 or later
- Node.js 16 or later
- Docker
- Docker Compose

### Running the application

1. From the root directory, build the docker images for the two microservices running the following command:

    ```bash
    docker-compose build -t order-processing-system .
    ```

2. Run the application using the following command:

    ```bash
    docker-compose up
    ```

3. The application will be running on `http://localhost:8080`

## Introduction

The Order Processing System for E-commerce is designed to facilitate seamless order creation, modification, and processing for an e-commerce platform. This documentation provides an in-depth understanding of how the system functions, the roles of the two microservices involved, and key use cases.

## System Overview

The system consists of two microservices:

1. Microservice 1 - Order Management Service
2. Microservice 2 - Inventory Service

### Microservice 1 - Order Management Service

#### Responsibilities

- Handle order creation, modification, and processing.
- Communicate with the inventory service.

#### Interactions

- Expose RESTful APIs for order creation and management.
- Publish order events to Kafka for downstream processing.

### Microservice 2 - Inventory Service

#### Responsibilities

- Manage inventory levels and product availability.
- Communicate with the order management service

#### Interactions

- Consume order events from Kafka for inventory updates.
- Publish inventory events to kafka if inventory levels are low, or if products are out of stock
- Publish inventory events to the OMS when updates are made to inventory levels

## System Workflow

### User Perspective

1. Customers place orders through the e-commerce platform - through a web application, mobile app, or other means (authentication and authorization services are not covered in this documentation)
2. Microservice 1 creates orders and publishes order events the inventory service through Kafka
3. Microservice 2 listens for order events, updates inventory, and coordinates communicate with the order management service - when inventory levels are low, or if products are out of stock, inventory events are published to Kafka - when the inventory updates are complete, inventory events are published to the order management service so order statuses can be updated - notification services are not covered in this documentation
4. Microservice 1 receives inventory events and updates order statuses accordingly
5. Each service has internal opertations that don't trigger events - for example, Microservice 1 may update order statuses when payment is processed, or Microservice 2 may update inventory levels when new products are added to the system
6. Product service, authentication / user service, and notification service are not covered in this documentation
7. Inter-service communication is handled through Kafka if the business logic requires it we can add an SSL encryption layer to the Kafka cluster to ensure data security

### Technical Perspective

1. Microservice 1 receives order requests and creates orders.
2. Order events are published to Kafka for downstream processing.
3. Microservice 2 consumes order events, manages inventory, and coordinates back with Microservice 1.
4. Microservices can run, be sca, and be deployed independently

## Use Cases

### Order Processing

1. A customer selects products and initiates an order - Note that in a single order, we can have multiple products, and each product can have multiple quantities - we check and update orderItem status for each product upon order creation and inventory updates - default status is `PENDING` can be `CANCELED` if the inventory update fails or `EXECUTED` if the inventory update is successful
2. Microservice 1 creates an order and publishes an order event to Kafka.
3. Microservice 2 updates inventory levels.
4. Microservice 2 publishes inventory events to Kafka.
5. Microservice 1 receives inventory events and updates order statuses accordingly.

## API Documentation

Detailed API documentation for Microservice 1 and Microservice 2 can be found in separate documents. These APIs cover order creation, modification, retrieval and inventory management

## Deployment and Scalability

The system can be deployed in a containerized environment with orchestration (e.g., Docker and Kubernetes) to ensure scalability and high availability. Microservices can be replicated horizontally to handle increased loads.

## API DOCUMENTATION

### Microservice 1 - Order Management

#### Endpoints

- `POST oms/orders` - Create a new order
  - Body
    - `userId` - ID of the customer who placed the order
    - `orderItems` - List of order items
      - `productId` - ID of the product
      - `quantity` - Quantity of the product
  - Response
    - success - `true` if the order was created successfully
    - data - the order object
    - error - error message if the order creation failed
- `GET oms/orders/{orderId}` - Get an order by order ID
- `PUT oms/orders/{orderId}` - Update an order by order ID - can be used to update order status
  - Body
    - `status` - new status of the order
    - (optional) `orderItems` - list of order items to be updated
      - `productId` - ID of the product
      - `quantity` - Quantity of the product
      - `status` - new status of the order item
  - Response
    - success - `true` if the order was updated successfully
    - data - the order object
    - error - error message if the order update failed

### Microservice 2 - Inventory

> Listens to order events from Kafka and updates inventory levels accordingly

## Conclusion

The Order Processing System for E-commerce provides a robust solution for efficient order management and processing. The collaboration between Microservice 1 and Microservice 2 enables seamless order handling and inventory management

This documentation serves as a comprehensive guide to understanding the system's architecture, functionalities, and key use cases, demonstrating how the two microservices work together to deliver a reliable and responsive e-commerce order processing system.